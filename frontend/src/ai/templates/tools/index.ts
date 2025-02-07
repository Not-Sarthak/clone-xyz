import { aaveBaseDepositTool } from "./aave/base-mainnet/supply-eth-base";
import { aaveSupplyUSDCBaseTool } from "./aave/base-mainnet/supply-usdc-base";
import { aaveDepositTool } from "./aave/sepolia/supply-eth-sepolia";
import { aaveSupplyUSDCTool } from "./aave/sepolia/supply-usdc-sepolia";
import { bridgeTool } from "./gasyard-bridge/bridge-base-eth";
import { quoteTools } from "./gasyard-bridge/get-quotes";
import { thirdwebTool } from "./thirdweb-nebula/thirdweb-tool";
import { transferTool } from "./wallets/transfer";

export interface ToolConfig<T = any> {
    definition: {
        type: 'function';
        function: {
            name: string;
            description: string;
            parameters: {
                type: 'object';
                properties: Record<string, unknown>;
                required: string[];
            };
        };
    };
    handler: (args: T) => Promise<any>;
};

export const tools: Record<string, ToolConfig> = {

    // Export Tools Here
    // Aave Tools
    deposit_eth_aave: aaveDepositTool,
    supply_usdc_aave: aaveSupplyUSDCTool,
    supply_eth_aave_base: aaveBaseDepositTool,
    supply_usdc_aave_base: aaveSupplyUSDCBaseTool,

    // Gasyard Bridge Tools
    get_bridge_quote: quoteTools,
    bridge_tokens: bridgeTool,

    // Thirdweb Tools
    query_thirdweb: thirdwebTool,

    // Wallet Tools
    transfer_funds: transferTool
}