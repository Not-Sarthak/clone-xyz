import { ToolConfig } from '../../index';
import { parseUnits } from 'viem';
import { publicClient } from '../../../client';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { AAVE_USDC_SEPOLIA, ETH_SEPOLIA_POOL } from '../../../constants';
import { getSessionAddress } from '@/lib/sessions';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POOL_ABI = [{
  name: 'supply',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'asset', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'onBehalfOf', type: 'address' },
    { name: 'referralCode', type: 'uint16' }
  ],
  outputs: []
}] as const;

type AaveSupplyArgs = {
  amount: string;
};

export const aaveSupplyUSDCTool: ToolConfig = {
  definition: {
    type: 'function',
    function: {
      name: 'supply_usdc_aave',
      description: 'Supply USDC into Aave V3 lending pool',
      parameters: {
        type: 'object',
        properties: {
          amount: {
            type: 'string',
            description: 'Amount of USDC to supply (e.g. "1", "100")'
          }
        },
        required: ['amount']
      }
    }
  },
  handler: async (args: AaveSupplyArgs) => {
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
        transport: http(process.env.ETH_SEPOLIA_RPC)
      });

      const pool = {
        address: ETH_SEPOLIA_POOL,
        abi: POOL_ABI
      } as const;

      const hash = await walletClient.writeContract({
        ...pool,
        functionName: 'supply',
        args: [
          AAVE_USDC_SEPOLIA,
          parseUnits(args.amount, 6),
          account.address,
          0
        ],
        gas: BigInt(500000)
      });

      const receipt = await publicClient[1].waitForTransactionReceipt({ hash });
      return `Successfully supplied ${args.amount} USDC to Aave V3. Transaction hash: ${receipt.transactionHash}`;
    } catch (error) {
      console.error('Aave supply error:', error);
      return 'Failed to supply USDC to Aave V3. Please verify your wallet is connected and try again.';
    }
  }
};