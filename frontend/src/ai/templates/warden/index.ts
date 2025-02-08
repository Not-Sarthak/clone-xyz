import { WardenAgentKit } from "@wardenprotocol/warden-agent-kit-core";
import { WardenToolkit, WardenTool } from "@wardenprotocol/warden-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { customTool } from "./custom_tool";

/**
 * Initialize the agent with Warden Agent Kit
 *
 * @returns Agent executor and config
 */
async function initializeAgent() {
    try {
        // Initialize LLM
        const llm = new ChatOpenAI({
            model: "gpt-4o-mini", // Specify the LLM model
        });

        // Configure Warden Agent Kit
        const config = {
            privateKeyOrAccount: process.env.PRIVATE_KEY as `0x${string}`,
        };

        // Initialize Warden Agent Kit
        const agentkit = new WardenAgentKit(config);

        // Initialize Warden Agent Kit Toolkit and get tools
        const wardenToolkit = new WardenToolkit(agentkit);
        const tools = wardenToolkit.getTools();

        // Add the custom tool
        const newTool = new WardenTool(
            customTool,
            agentkit
        );
        tools.push(newTool);

        // Store buffered conversation history in memory (optional)
        const memory = new MemorySaver();
        const agentConfig = {
            configurable: { thread_id: "Warden Agent Kit Custom Tool Example" },
        };

        // Create React Agent using the LLM and Warden Agent Kit tools
        const agent = createReactAgent({
            llm,
            tools,
            checkpointSaver: memory,
            messageModifier:
                "You're a helpful assistant that can help with a variety of tasks related to web3 transactions." +
                "You should only use the provided tools to carry out tasks, interpret the user's input" +
                "and select the correct tool to use for the required tasks or tasks.",
        });

        return { agent, config: agentConfig };
    } catch (error) {
        console.error("Failed to initialize agent:", error);
        throw error;
    }
}

export { initializeAgent };