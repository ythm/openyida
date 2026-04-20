/**
 * auth-tools.ts — 认证与环境相关 MCP Tools
 *
 * 工具列表：
 *   yida_env          — 检测当前环境和登录态
 *   yida_login_status — 查看登录状态
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAuth, isLoggedIn } from "../auth.js";

export function registerAuthTools(server: McpServer): void {
  // Tool: yida_login_status
  server.tool(
    "yida_login_status",
    {},
    async () => {
      const loggedIn = isLoggedIn();
      if (!loggedIn) {
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify({
                loggedIn: false,
                message: "Not logged in. Run 'openyida login' to authenticate.",
              }),
            },
          ],
        };
      }

      const auth = getAuth();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                loggedIn: true,
                baseUrl: auth.baseUrl,
                userId: auth.userId,
                corpId: auth.corpId,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Tool: yida_env
  server.tool(
    "yida_env",
    {},
    async () => {
      const { execSync } = await import("node:child_process");
      try {
        const output = execSync("openyida env", { encoding: "utf-8", timeout: 10000 });
        return { content: [{ type: "text" as const, text: output }] };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    },
  );

  // Tool: yida_login (trigger login flow)
  server.tool(
    "yida_login",
    {
      method: z
        .enum(["auto", "qr"])
        .default("auto")
        .describe("Login method: 'auto' for default, 'qr' for QR code scanning"),
    },
    async ({ method }) => {
      const { execSync } = await import("node:child_process");
      const qrFlag = method === "qr" ? " --qr" : "";
      try {
        const output = execSync(`openyida login${qrFlag}`, {
          encoding: "utf-8",
          timeout: 120000,
        });
        return { content: [{ type: "text" as const, text: output }] };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Login failed: ${errorMessage}` }],
          isError: true,
        };
      }
    },
  );
}
