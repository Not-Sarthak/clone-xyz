import { ToolConfig } from "../index";
import { parseEther } from "viem";
import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia, baseSepolia } from "viem/chains";
import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { getSessionAddress } from "@/lib/sessions";

const prisma = new PrismaClient();

const NETWORKS = {
  SEPOLIA: {
    id: 11155111,
    apiId: 901,
    chainId: 901,
    chain: sepolia,
    rpcUrl:
      process.env.ETH_SEPOLIA_RPC ||
      "https://ethereum-sepolia-rpc.publicnode.com",
  },
  BASE_SEPOLIA: {
    id: 84532,
    apiId: 902,
    chainId: 902,
    chain: baseSepolia,
    rpcUrl:
      process.env.BASE_SEPOLIA_RPC || "https://base-sepolia-rpc.publicnode.com",
  },
} as const;

const GATEWAY_CONTRACTS: Record<keyof typeof NETWORKS, `0x${string}`> = {
  SEPOLIA: "0x58A6a7d6b16b2c7A276d7901AB65596A1BEaa25B",
  BASE_SEPOLIA: "0xf011B7B9e72CD1C530BaA6e583aa19e6E43Dc1Be",
};

const BRIDGE_ABI = [
  {
    inputs: [
      { internalType: "uint32", name: "destinationChainId", type: "uint32" },
      { internalType: "bytes32", name: "inputToken", type: "bytes32" },
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bytes32", name: "destinationAddress", type: "bytes32" },
      { internalType: "bytes32", name: "outputToken", type: "bytes32" },
    ],
    name: "bridge",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

interface BridgeArgs {
  amount: string;
  network: keyof typeof NETWORKS;
  toNetwork: keyof typeof NETWORKS;
  receiver: `0x${string}`;
}

const evmAddressToBytes32 = (address: `0x${string}`): `0x${string}` => {
  console.log("[DEBUG] Converting address:", address);
  const result = `0x000000000000000000000000${address.slice(
    2
  )}` as `0x${string}`;
  console.log("[DEBUG] Converted address result:", result);
  return result;
};

// Helper function to serialize BigInt
const serializeBigInt = (obj: any): any => {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  if (obj && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
    );
  }
  return obj;
};

export const bridgeTool: ToolConfig = {
  definition: {
    type: "function",
    function: {
      name: "bridge_tokens",
      description: "Bridge tokens between Sepolia networks",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "string",
            description: "Amount to bridge in ETH",
          },
          network: {
            type: "string",
            enum: ["SEPOLIA", "BASE_SEPOLIA"],
            description: "Source network",
          },
          toNetwork: {
            type: "string",
            enum: ["SEPOLIA", "BASE_SEPOLIA"],
            description: "Destination network",
          },
          receiver: {
            type: "string",
            pattern: "^0x[a-fA-F0-9]{40}$",
            description: "Receiver address (0x...)",
          },
        },
        required: ["amount", "network", "toNetwork", "receiver"],
      },
    },
  },
  handler: async (args: BridgeArgs): Promise<string> => {
    try {
      console.log(
        "[DEBUG] Starting bridge with args:",
        JSON.stringify({
          amount: args.amount,
          network: args.network,
          toNetwork: args.toNetwork,
          receiver: args.receiver,
        })
      );

      const weiAmount = parseEther(args.amount);
      console.log("[DEBUG] Converted amount to Wei:", weiAmount.toString());

      const fromNetwork = NETWORKS[args.network];
      const destNetwork = NETWORKS[args.toNetwork];

      console.log("[DEBUG] Network config:", {
        from: args.network,
        to: args.toNetwork,
        sourceChainId: fromNetwork.chainId,
        destChainId: destNetwork.chainId,
      });

      let bridgeStatus = {
        step: "quote",
        details: null as any,
        error: null as string | null,
      };

      try {
        const quote = await axios.post(
          "https://gasyard-backendapi-v2-production-27d5.up.railway.app/api/quote",
          {
            inputNetwork: fromNetwork.apiId,
            outputNetwork: destNetwork.apiId,
            inputTokenAmount: weiAmount.toString(),
          }
        );
        bridgeStatus.details = { quote: quote.data };

        const userAddress = await getSessionAddress();
        console.log("User address:", userAddress);

        if (!userAddress) {
          throw new Error(
            "No authenticated session found. Please connect your wallet."
          );
        }

        const wallet = await prisma.wallet.findFirst({
          where: { userAddress },
        });

        console.log("Wallet:", wallet);

        if (!wallet) {
          throw new Error("No wallet found. Please generate a wallet first.");
        }

        const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);

        bridgeStatus.step = "transaction";
        const walletClient = createWalletClient({
          account,
          chain: fromNetwork.chain,
          transport: http(fromNetwork.rpcUrl),
        });

        const bridgeArgs = [
          destNetwork.chainId,
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          weiAmount,
          evmAddressToBytes32(args.receiver),
          "0x0000000000000000000000000000000000000000000000000000000000000000",
        ] as const;

        const hash = await walletClient.writeContract({
          address: GATEWAY_CONTRACTS[args.network],
          abi: BRIDGE_ABI,
          functionName: "bridge",
          args: bridgeArgs,
          value: weiAmount,
        });

        bridgeStatus.step = "confirmation";
        const provider = createPublicClient({
          chain: fromNetwork.chain,
          transport: http(fromNetwork.rpcUrl),
        });

        const receipt = await provider.waitForTransactionReceipt({ hash });
        bridgeStatus.details = {
          ...bridgeStatus.details,
          hash: receipt.transactionHash,
          status: receipt.status,
        };

        // Return a simplified success message
        return JSON.stringify({
          success: true,
          message: `Successfully bridged ${args.amount} ETH from ${args.network} to ${args.toNetwork}`,
          details: {
            amount: args.amount,
            from: args.network,
            to: args.toNetwork,
            receiver: args.receiver,
            hash: receipt.transactionHash,
            output: quote.data.outputValueInUSD,
            fees: quote.data.feesInUSD,
          },
        });
      } catch (innerError) {
        bridgeStatus.error =
          innerError instanceof Error ? innerError.message : String(innerError);
        throw new Error(
          `Bridge failed at ${bridgeStatus.step}: ${bridgeStatus.error}`
        );
      }
    } catch (error) {
      console.error("[DEBUG] Bridge error:", error);

      // Return a structured error response
      return JSON.stringify({
        success: false,
        message: axios.isAxiosError(error)
          ? `Bridge failed: ${error.response?.data?.message || error.message}`
          : `Bridge failed: ${
              error instanceof Error ? error.message : String(error)
            }`,
        error: true,
      });
    }
  },
};
