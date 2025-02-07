import { ToolConfig } from "../index";
import { createWalletClient, http, parseEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { PrismaClient } from "@prisma/client";
import { ChainIndex, publicClient } from "../../client";
import { getSessionAddress } from "@/lib/sessions";

const prisma = new PrismaClient();

const NETWORK_CONFIG = {
  name: "Ethereum Sepolia",
  explorer: "https://sepolia.etherscan.io",
};

class TransferService {
  constructor() {
    console.log("[TransferService] Initialized");
  }

  async transfer(amount: string): Promise<string> {
    console.log("[TransferService] Starting transfer of", amount, "ETH");

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      return JSON.stringify({
        success: false,
        error: "Invalid amount. Please enter a valid positive ETH amount.",
      });
    }

    if (Number(amount) >= 0.5) {
      return JSON.stringify({
        success: false,
        error: "Transfer amount exceeds the limit of 0.5 ETH.",
      });
    }

    try {
      const userAddress = await getSessionAddress();
      if (!userAddress) {
        throw new Error("No authenticated session found");
      }

      const wallet = await prisma.wallet.findFirst({ where: { userAddress } });
      if (!wallet || !wallet.publicKey) {
        throw new Error("No wallet found for session");
      }

      const recipientAddress = wallet.publicKey;
      console.log("[TransferService] Using wallet address:", recipientAddress);

      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey || !privateKey.startsWith("0x")) {
        throw new Error("Invalid PRIVATE_KEY in environment variables");
      }

      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const walletClient = createWalletClient({
        account,
        chain: sepolia,
        transport: http(),
      });

      console.log(
        `[TransferService] Sending ${amount} ETH to ${recipientAddress}`
      );

      const hash = await walletClient.sendTransaction({
        // @ts-ignore
        to: recipientAddress,
        value: parseEther(amount),
      });

      console.log("[TransferService] Transaction sent! Hash:", hash);

      const receipt = await publicClient[
        ChainIndex.SEPOLIA
      ].waitForTransactionReceipt({
        hash,
      });
      console.log(
        "[TransferService] Transaction confirmed in block:",
        receipt.blockNumber
      );

      return JSON.stringify({
        success: true,
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        network: NETWORK_CONFIG.name,
        explorerUrl: `${NETWORK_CONFIG.explorer}/tx/${receipt.transactionHash}`,
        fromAddress: account.address,
        toAddress: recipientAddress,
      });
    } catch (error) {
      console.error("[TransferService] Transfer error:", error);

      return JSON.stringify({
        success: false,
        network: NETWORK_CONFIG.name,
        error: error instanceof Error ? error.message : "Transaction failed",
      });
    }
  }
}

const transferService = new TransferService();

export const transferTool: ToolConfig = {
  definition: {
    type: "function",
    function: {
      name: "transfer_funds",
      description:
        "Transfer ETH to the user's registered wallet on Sepolia. Don't ask for recipient address, the tool is enough to provide you with it.",
      parameters: {
        type: "object",
        properties: {
          amount: {
            type: "string",
            description: 'Amount of ETH to send (e.g. "0.1")',
          },
        },
        required: ["amount"],
      },
    },
  },
  handler: async (args: { amount: string }): Promise<string> => {
    console.log(`[TransferTool] Initiating transfer of ${args.amount} ETH`);
    return transferService.transfer(args.amount);
  },
};
