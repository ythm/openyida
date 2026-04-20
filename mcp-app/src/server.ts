/**
 * server.ts — McpServer 初始化 + 工具/资源注册总线
 *
 * 创建 McpServer 实例并注册所有 Tools 和 Resources。
 * 每次请求创建新实例（stateless 模式）。
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAppTools } from "./tools/app-tools.js";
import { registerFormTools } from "./tools/form-tools.js";
import { registerDataTools } from "./tools/data-tools.js";
import { registerReportTools } from "./tools/report-tools.js";
import { registerAuthTools } from "./tools/auth-tools.js";

const SERVER_NAME = "openyida-mcp-app";
const SERVER_VERSION = "1.0.0";

/**
 * 创建并返回一个完整注册了所有工具和资源的 McpServer 实例。
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // 注册所有工具组
  registerAuthTools(server);
  registerAppTools(server);
  registerFormTools(server);
  registerDataTools(server);
  registerReportTools(server);

  return server;
}
