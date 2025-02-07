import { http, createPublicClient } from "viem";
import { mainnet, sepolia, base, baseSepolia } from "viem/chains";

// Define RPCs from environment variables
const ETH_SEPOLIA_RPC = process.env.ETH_SEPOLIA_RPC;
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC;

if (!ETH_SEPOLIA_RPC || !BASE_SEPOLIA_RPC) {
  throw new Error("Missing required RPC endpoints in environment variables");
}

export const publicClient = [
  createPublicClient({
    chain: mainnet,
    transport: http(), // You can add mainnet RPC when needed
  }),
  createPublicClient({
    chain: sepolia,
    transport: http(ETH_SEPOLIA_RPC),
    batch: {
      multicall: true,
    },
  }),
  createPublicClient({
    chain: base,
    transport: http(), // You can add Base mainnet RPC when needed
  }),
  createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_SEPOLIA_RPC),
    batch: {
      multicall: true,
    },
  }),
] as const;

// Type-safe way to access clients
export const enum ChainIndex {
  MAINNET = 0,
  SEPOLIA = 1,
  BASE = 2,
  BASE_SEPOLIA = 3,
}