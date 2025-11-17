// src/index.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { runMiRTargetLink } from "./tools/source.js";

// Global error handlers
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err.stack || err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
});

console.error("[INFO] Starting miRTargetLink2 MCP server...");

// === Initialize Server ===
const server = new McpServer({
  name: "miRTargetLink 2 MCP",
  version: "1.0.0",
  //description: "MCP server for miRTargetLink 2.0 analysis",
});

// === Main Analysis Tool ===
server.tool(
  "run_mirtargetlink",
  "Run miRTargetLink 2.0 Analysis",
  {
    query: z.string(),
    mode: z.string().optional(),
  },
  async ({ query, mode }: { query: string; mode?: string }) => {
    console.error(`[INFO] run_mirtargetlink invoked: query="${query}", mode="${mode}"`);

    try {
      const result = await runMiRTargetLink({ query, mode });
      console.error("[DEBUG] runMiRTargetLink returned successfully");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err: any) {
      console.error("[ERROR] Exception inside run_mirtargetlink:", err.stack || err.message);
      throw new Error(err.message || "Unknown error during analysis");
    }
  }
);

// === Connect transport ===
const transport = new StdioServerTransport();

async function startServer() {
  console.error("[INFO] Connecting server via stdio transport...");
  try {
    await server.connect(transport);
    console.error("[INFO] miRTargetLink 2 MCP server is live and ready.");
    setInterval(() => {}, 1000);
  } catch (err: any) {
    console.error("[FATAL] Server startup failed:", err.stack || err.message);
  }
}

startServer();
