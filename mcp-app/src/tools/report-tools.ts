/**
 * report-tools.ts — 报表管理相关 MCP Tools
 *
 * 工具列表：
 *   yida_create_report — 创建宜搭报表（带 ECharts 交互式图表 UI）
 *   yida_query_report  — 查询报表数据（带 ECharts UI）
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { getAuth } from "../auth.js";

const DIST_VIEWS = path.join(import.meta.dirname, "..", "views");

// ── 内部函数 ──

async function queryReportData(appType: string, formUuid: string) {
  const auth = getAuth();
  const apiPath = `/dingtalk/web/${appType}/query/pformdata/v2/listFormDataByPage.json`;
  const querystring = await import("node:querystring");
  const postData = querystring.stringify({
    _csrf_token: auth.csrfToken,
    appType,
    formUuid,
    pageNumber: "1",
    pageSize: "100",
  });

  return (await import("../auth.js")).httpPost(auth.baseUrl, apiPath, postData, auth.cookies);
}

// ── 注册 ──

export function registerReportTools(server: McpServer): void {
  const reportChartUri = "ui://yida/report-chart.html";

  // Tool: yida_query_report（带 ECharts UI）
  registerAppTool(
    server,
    "yida_query_report",
    {
      title: "Query Report Data",
      description:
        "Query form data for report visualization. Returns data and renders an interactive ECharts chart view.",
      inputSchema: {
        appType: z.string().min(1).describe("Application identifier"),
        formUuid: z.string().min(1).describe("Form UUID of the data source"),
        chartType: z
          .enum(["bar", "line", "pie", "scatter"])
          .default("bar")
          .describe("Chart type for visualization"),
        title: z.string().optional().describe("Chart title"),
      },
      _meta: { ui: { resourceUri: reportChartUri } },
    },
    async ({ appType, formUuid, chartType, title }) => {
      const result = await queryReportData(appType, formUuid);

      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.errorMsg || "Query failed"}` }],
          isError: true,
        };
      }

      const data = result.content?.data || [];
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ chartType, title: title || "Report", data, appType, formUuid }, null, 2),
          },
        ],
      };
    },
  );

  // Resource: report-chart UI
  registerAppResource(
    server,
    reportChartUri,
    reportChartUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(DIST_VIEWS, "report-chart.html");
      const html = await fs.readFile(htmlPath, "utf-8");
      return {
        contents: [{ uri: reportChartUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  // Tool: yida_create_report（纯数据，委托 CLI）
  server.tool(
    "yida_create_report",
    {
      appType: z.string().min(1).describe("Application identifier"),
      reportName: z.string().min(1).describe("Report name"),
      chartDefinition: z
        .string()
        .describe("Chart definition JSON (see yida-report skill for format)"),
    },
    async ({ appType, reportName, chartDefinition }) => {
      const { execSync } = await import("node:child_process");
      const escapedName = reportName.replace(/'/g, "'\\''");
      const escapedDef = chartDefinition.replace(/'/g, "'\\''");

      try {
        const output = execSync(
          `openyida create-report "${appType}" "${escapedName}" '${escapedDef}'`,
          { encoding: "utf-8", timeout: 30000 },
        );
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
}
