#!/usr/bin/env node
/**
 * main.ts — OpenYida MCP App Server 入口
 *
 * 支持两种 transport：
 *   --stdio   本地客户端（Claude Desktop、Cursor 等）
 *   默认       Streamable HTTP（远程 Agent / Web 客户端）
 *
 * 用法：
 *   openyida-mcp --stdio          # stdio 模式
 *   openyida-mcp                  # HTTP 模式（默认端口 3001）
 *   PORT=8080 openyida-mcp        # 自定义端口
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Request, Response } from "express";
import { createServer } from "./server.js";

/**
 * 启动 Streamable HTTP transport（stateless 模式）
 */
async function startStreamableHTTPServer(
  serverFactory: () => McpServer,
): Promise<void> {
  const port = parseInt(process.env.PORT ?? "3001", 10);

  // 动态导入 express 和 cors（避免 stdio 模式下不必要的加载）
  const [{ default: express }, { default: cors }] = await Promise.all([
    import("express"),
    import("cors"),
  ]);

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.all("/mcp", async (req: Request, res: Response) => {
    const server = serverFactory();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close().catch(() => {});
      server.close().catch(() => {});
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: { code: -32603, message: "Internal server error" },
          id: null,
        });
      }
    }
  });

  // Health check endpoint
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", server: "openyida-mcp-app" });
  });

  const httpServer = app.listen(port, () => {
    console.log(`OpenYida MCP App Server listening on http://localhost:${port}/mcp`);
  });

  const shutdown = () => {
    console.log("\nShutting down...");
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

/**
 * 启动 stdio transport
 */
async function startStdioServer(
  serverFactory: () => McpServer,
): Promise<void> {
  const server = serverFactory();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// ── 入口 ──

async function main(): Promise<void> {
  if (process.argv.includes("--stdio")) {
    await startStdioServer(createServer);
  } else {
    await startStreamableHTTPServer(createServer);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
