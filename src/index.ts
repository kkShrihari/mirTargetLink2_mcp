// // src/index.ts
// import { FastMCP } from "fastmcp";
// import { z } from "zod";
// import { runMiRTargetLink } from "./tools/miRTargetLinkTool.js";

// // --- We track breadcrumbs per session dynamically ---
// const breadcrumbsMap = new WeakMap<any, any[]>();

// // === Initialize FastMCP Server ===
// const server = new FastMCP({
//   name: "miRTargetLink2_MCP",
//   version: "1.0.0",

//   // ⚙️ TypeScript’s types are broken here — cast to `any` to fix
//   createContext: (async (session: any) => {
//     breadcrumbsMap.set(session, []);
//     return session;
//   } as any);
// });

// // === miRTargetLink Tool ===
// const miRTargetLinkParams = z.object({
//   query: z
//     .string()
//     .describe("miRNA, gene, or pathway name (e.g. 'TP53', 'hsa-miR-21-5p')"),
//   mode: z.enum(["validated", "predicted"]).default("validated"),
// });

// server.addTool({
//   name: "run_mirtargetlink",
//   description:
//     "Fetch validated or predicted miRNA–target interactions via miRTargetLink 2.0.",
//   parameters: miRTargetLinkParams,
//   execute: (async (args: any, context: any) => {
//     const { query, mode } = miRTargetLinkParams.parse(args);
//     console.log(`🔬 Running miRTargetLink for ${query} (${mode})`);

//     const result = await runMiRTargetLink({ query, mode });

//     const crumbs = breadcrumbsMap.get(context.session) || [];
//     crumbs.push({
//       time: new Date().toISOString(),
//       tool: "run_mirtargetlink",
//       input: args,
//       output: result,
//     });
//     breadcrumbsMap.set(context.session, crumbs);

//     return {
//       type: "text",
//       text: JSON.stringify(
//         {
//           success: true,
//           query,
//           mode,
//           message: `miRTargetLink 2.0 analysis completed successfully.`,
//         },
//         null,
//         2
//       ),
//     };
//   }) as any,
// });

// // === Breadcrumbs Tool ===
// server.addTool({
//   name: "get_breadcrumbs",
//   description: "Return previous tool invocations for this session.",
//   parameters: z.object({}),
//   execute: (async (_args: any, context: any) => {
//     const crumbs = breadcrumbsMap.get(context.session) || [];
//     return {
//       type: "text",
//       text: JSON.stringify(crumbs, null, 2),
//     };
//   }) as any,
// });

// // === Ping Tool ===
// server.addTool({
//   name: "ping",
//   description: "Ping tool for connectivity testing.",
//   parameters: z.object({ msg: z.string().default("hello") }),
//   execute: (async (args: any) => ({
//     type: "text",
//     text: `pong: ${args.msg}`,
//   })) as any,
// });

// // === Start MCP Server ===
// server.start({ transportType: "stdio" });
// console.log("🚀 miRTargetLink2_MCP server initialized and ready.");

// src/index.ts
import { FastMCP } from "fastmcp";
import { z } from "zod";
import { runMiRTargetLink } from "./tools/miRTargetLinkTool.js";

// Track breadcrumbs per session
const breadcrumbsMap = new WeakMap<any, any[]>();

// === Initialize FastMCP server ===
const server = new FastMCP({
  name: "miRTargetLink2_MCP",
  version: "1.0.0",
} as any); // 👈 Cast the config to any to silence ServerOptions type guard

// === Add createContext manually (since TS types omit it but runtime supports it)
(server as any).createContext = async (session: any) => {
  breadcrumbsMap.set(session, []);
  return session;
};

// === miRTargetLink Tool ===
const miRTargetLinkParams = z.object({
  query: z
    .string()
    .describe("miRNA, gene, or pathway name (e.g. 'TP53', 'hsa-miR-21-5p')"),
  mode: z.enum(["validated", "predicted"]).default("validated"),
});

server.addTool({
  name: "run_mirtargetlink",
  description:
    "Fetch validated or predicted miRNA–target interactions via miRTargetLink 2.0.",
  parameters: miRTargetLinkParams,
  execute: async (args: any, context: any) => {
    const { query, mode } = miRTargetLinkParams.parse(args);
    console.log(`🔬 Running miRTargetLink for ${query} (${mode})`);

    const result = await runMiRTargetLink({ query, mode });

    const crumbs = breadcrumbsMap.get(context.session) || [];
    crumbs.push({
      time: new Date().toISOString(),
      tool: "run_mirtargetlink",
      input: args,
      output: result,
    });
    breadcrumbsMap.set(context.session, crumbs);

    return {
      type: "text",
      text: JSON.stringify(
        {
          success: true,
          query,
          mode,
          message: `miRTargetLink 2.0 analysis completed successfully.`,
        },
        null,
        2
      ),
    };
  },
});

// === Breadcrumbs Tool ===
server.addTool({
  name: "get_breadcrumbs",
  description: "Return previous tool invocations for this session.",
  parameters: z.object({}),
  execute: async (_args: any, context: any) => {
    const crumbs = breadcrumbsMap.get(context.session) || [];
    return {
      type: "text",
      text: JSON.stringify(crumbs, null, 2),
    };
  },
});

// === Ping Tool ===
server.addTool({
  name: "ping",
  description: "Ping tool for connectivity testing.",
  parameters: z.object({ msg: z.string().default("hello") }),
  execute: async (args: any) => ({
    type: "text",
    text: `pong: ${args.msg}`,
  }),
});

// === Start MCP Server ===
server.start({ transportType: "stdio" });
console.log("🚀 miRTargetLink2_MCP server initialized and ready.");
