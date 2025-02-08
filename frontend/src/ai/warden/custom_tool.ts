import { WardenAction } from "@wardenprotocol/warden-agent-kit-core";
import { z } from "zod";

const customTool: WardenAction<z.ZodObject<any, any, any, any>> = {
    name: "custom_tool",
    description: "This is a custom tool",
    schema: z.object({}), // Define schema if needed
    function: async () => {
        return "This is a custom tool"; // Implement the tool's logic
    },
};

export { customTool };