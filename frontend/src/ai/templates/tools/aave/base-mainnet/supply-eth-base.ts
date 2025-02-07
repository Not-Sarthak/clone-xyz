import { ToolConfig } from "../../index";
import { parseEther } from "viem";
import { publicClient } from "../../../client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import {
  BASE_SEPOLIA_POOL,
  BASE_SEPOLIA_WETH_GATEWAY_ADDRESS,
} from "@/lib/fuel-bae/constants";
import { PrismaClient } from "@prisma/client";
import { getSessionAddress } from "@/lib/sessions";

const prisma = new PrismaClient();

const WETH_GATEWAY_ABI = [
  {
    name: "depositETH",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "pool", type: "address" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
  },
] as const;

type AaveDepositArgs = {
  amount: string;
};

export const aaveBaseDepositTool: ToolConfig = {
  definition: {
    type: "function",
    function: {
      name: "supply_eth_aave_base",
      description: "Deposit ETH into Aave V3 on Base",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "string",
            description: 'Amount of ETH to deposit (e.g. "0.1", "1.5")',
          },
        },
        required: ["amount"],
      },
    },
  },
  handler: async (args: AaveDepositArgs) => {
    try {
      const userAddress = await getSessionAddress();
      console.log('User address:', userAddress);
      
      if (!userAddress) {
        throw new Error('No authenticated session found. Please connect your wallet.');
      }

      const wallet = await prisma.wallet.findFirst({
        where: { userAddress }
      });

      console.log('Wallet:', wallet);
      
      if (!wallet) {
        throw new Error('No wallet found. Please generate a wallet first.');
      }

      const account = privateKeyToAccount(wallet.privateKey as `0x${string}`);

      const walletClient = createWalletClient({
        account,
        chain: base,
        transport: http(),
      });

      const wethGateway = {
        address: BASE_SEPOLIA_WETH_GATEWAY_ADDRESS,
        abi: WETH_GATEWAY_ABI,
      } as const;

      const hash = await walletClient.writeContract({
        ...wethGateway,
        functionName: "depositETH",
        args: [BASE_SEPOLIA_POOL, account.address, 0],
        value: parseEther(args.amount),
      });

      const receipt = await publicClient[1].waitForTransactionReceipt({ hash });
      return `Successfully deposited ${args.amount} ETH into Aave V3 on Base. Transaction hash: ${receipt.transactionHash}`;
    } catch (error) {
      console.error("Aave deposit error:", error);
      return "Failed to deposit ETH into Aave V3. Please verify your wallet is connected and try again.";
    }
  },
};
