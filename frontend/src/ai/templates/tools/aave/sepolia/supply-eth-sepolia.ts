import { ToolConfig } from '../../index';
import { parseEther } from 'viem';
import { publicClient } from '../../../client';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { PrismaClient } from '@prisma/client';
import { getSessionAddress } from '@/lib/sessions';

// Constants
export const ETH_SEPOLIA_POOL = '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951';
export const ETH_SEPOLIA_WETH_GATEWAY_ADDRESS = '0x387d311e47e80b498169e6fb51d3193167d89F7D';

const prisma = new PrismaClient();

const WETH_GATEWAY_ABI = [{
  name: 'depositETH',
  type: 'function',
  stateMutability: 'payable', 
  inputs: [
    { name: 'pool', type: 'address' },
    { name: 'onBehalfOf', type: 'address' },
    { name: 'referralCode', type: 'uint16' }
  ],
  outputs: []
}] as const;

type AaveDepositArgs = {
  amount: string;
};

export const aaveDepositTool: ToolConfig = {
  definition: {
    type: 'function',
    function: {
      name: 'deposit_eth_aave',
      description: 'Deposit ETH into Aave V3 lending pool',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'string',
            description: 'Amount of ETH to deposit (e.g. "0.1", "1.5")'
          }
        },
        required: ['amount']
      }
    }
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
        chain: sepolia,
        transport: http()
      });

      const wethGateway = {
        address: ETH_SEPOLIA_WETH_GATEWAY_ADDRESS,
        abi: WETH_GATEWAY_ABI
      } as const;

      const hash = await walletClient.writeContract({
        ...wethGateway,
        functionName: 'depositETH',
        args: [
          ETH_SEPOLIA_POOL,
          account.address,
          0
        ],
        value: parseEther(args.amount)
      });

      const receipt = await publicClient[1].waitForTransactionReceipt({ hash });
      return `Successfully deposited ${args.amount} ETH into Aave V3. Transaction hash: ${receipt.transactionHash}`;
    } catch (error) {
      console.error('Aave deposit error:', error);
      if (error instanceof Error) {
        return `Failed to deposit ETH: ${error.message}`;
      }
      return 'Failed to deposit ETH into Aave V3. Please verify your wallet is connected and try again.';
    }
  }
};

export default aaveDepositTool;