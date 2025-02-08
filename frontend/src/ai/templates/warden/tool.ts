import { WardenAction } from "@wardenprotocol/warden-agent-kit-core";
import { z } from "zod";

const customTool: WardenAction<z.ZodObject<any, any, any, any>> = {
    name: "custom_tool",
    description: "This is a custom tool",
    schema: z.object({}), 
    function: async () => {
        return "This is a custom tool"; 
    },
};

export { customTool };