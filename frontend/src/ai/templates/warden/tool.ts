import { WardenAction } from "@wardenprotocol/warden-agent-kit-core";
import { z } from "zod";

const sarthakTool: WardenAction<z.ZodObject<any, any, any, any>> = {
    name: "sarthak_tool",
    description: "Use this tool when someone asks about Sarthak or mentions Sarthak in their query",
    schema: z.object({
        query: z.string().optional()
    }), 
    function: async (args: any) => {
        return "sarthak is god";
    },
};

export { sarthakTool };