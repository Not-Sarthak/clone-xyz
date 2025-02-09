import { ToolConfig } from "../index"
import { 
  createPublicClient, 
  createWalletClient, 
  http,
  parseAbiItem,
  custom,
  Account,
  Address
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { flowTestnet } from "viem/chains"
import { FLOW_RANDOM_ABI } from "../../utils"

const PRIVATE_KEY = process.env.FLOW_KEY?.toString() || ""
console.log(PRIVATE_KEY)

const contractAddress = "0xbDe037993Fdc44EB8fbb7EBcB19f8b4B004aBeAe" as const

// Create the account from private key
const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`)

// Initialize custom transport with additional methods
const customTransport = custom({
  async request({ method, params }) {
    // Use fetch to make direct RPC calls
    const response = await fetch("https://testnet.evm.nodes.onflow.org", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params,
      }),
    })
    
    const json = await response.json()
    if (json.error) {
      throw new Error(json.error.message)
    }
    return json.result
  }
})

// Initialize the clients with custom transport
const publicClient = createPublicClient({
  chain: flowTestnet,
  transport: customTransport
})

const walletClient = createWalletClient({
  chain: flowTestnet,
  transport: customTransport,
  account
})

export const vrfTool: ToolConfig = {
  definition: {
    type: "function",
    function: {
      name: "query_vrf",
      description: "Query the VRF service to generate a random number between a range. [Give Transaction Hash]",
      parameters: {
        type: "object",
        properties: {
          min: {
            type: "number",
            description: "Minimum value of the range (e.g. 1)",
          },
          max: {
            type: "number",
            description: "Maximum value of the range (e.g. 100)",
          },
        },
        required: ["min", "max"],
      },
    },
  },
  handler: async (args: { min: number; max: number }): Promise<string> => {
    console.log(
      `[VRF Tool] Querying VRF service to generate a random number between ${args.min} and ${args.max}`,
    )
    return vrfService(args.min, args.max)
  },
}

async function vrfService(min: number, max: number): Promise<string> {
  try {
    console.log(`Generating random number between ${min} and ${max}...`)
    
    // Get the contract data for the function call
    const data = publicClient.buildContract({
      abi: FLOW_RANDOM_ABI,
      address: contractAddress,
      functionName: 'getRandomInRange',
      args: [BigInt(min), BigInt(max)]
    }).data

    // Get the current nonce for the account
    const nonce = await publicClient.getTransactionCount({
      address: account.address,
    })

    // Prepare transaction
    const tx = {
      from: account.address,
      to: contractAddress,
      data,
      nonce,
      chainId: flowTestnet.id,
      gasLimit: BigInt(500000)
    }

    // Sign transaction
    const signedTx = await account.signTransaction(tx)

    // Send raw transaction
    const hash = await customTransport.request({
      method: 'eth_sendRawTransaction',
      params: [signedTx]
    })
    
    console.log("Transaction Hash:", hash)
    console.log("View on Explorer:", `https://evm-testnet.flowscan.io/tx/${hash}`)
    
    // Wait for the transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log("Transaction confirmed in block:", receipt.blockNumber)
    
    // Find the RandomInRangeGenerated event
    const eventAbi = parseAbiItem('event RandomInRangeGenerated(uint256 randomNumber)')
    const logs = await publicClient.getLogs({
      address: contractAddress,
      event: eventAbi,
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber
    })

    if (logs.length > 0 && logs[0].args) {
      const randomNumber = logs[0].args.randomNumber
      console.log("Random number generated:", randomNumber?.toString())
      
      return JSON.stringify({
        randomNumber: randomNumber?.toString(),
        txHash: hash,
        blockNumber: receipt.blockNumber,
        min,
        max
      }, null, 2)
    }
    
    throw new Error("No RandomInRangeGenerated event found")
  } catch (error) {
    console.error("Error generating random number in range:", error)
    throw error
  }
}