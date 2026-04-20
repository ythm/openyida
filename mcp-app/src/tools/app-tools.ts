/**
 * app-tools.ts — 应用管理相关 MCP Tools
 *
 * 工具列表：
 *   yida_list_apps   — 查询应用列表（带交互式仪表盘 UI）
 *   yida_create_app  — 创建宜搭应用
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
import { getAuth, httpGet, httpPost } from "../auth.js";

const DIST_VIEWS = path.join(import.meta.dirname, "..", "views");

// ── 宜搭 API 路径 ──

const APP_LIST_API = "/query/app/getAppList.json";

// ── 内部函数 ──

interface AppItem {
  appName: { zh_CN?: string; en_US?: string };
  appType: string;
  systemLink: string;
  icon?: string;
  iconColor?: string;
}

async function fetchAppListPage(
  auth: ReturnType<typeof getAuth>,
  pageIndex: number,
  pageSize: number,
) {
  const queryParams = {
    _api: "nattyFetch",
    _mock: "false",
    pageIndex: String(pageIndex),
    pageSize: String(pageSize),
    creator: auth.userId,
    _csrf_token: auth.csrfToken,
    _stamp: String(Date.now()),
  };
  return httpGet(auth.baseUrl, APP_LIST_API, queryParams, auth.cookies);
}

async function fetchAllApps(pageSize: number) {
  const auth = getAuth();
  const firstResult = await fetchAppListPage(auth, 1, pageSize);

  if (!firstResult.success) {
    throw new Error(firstResult.errorMsg || "Failed to fetch app list");
  }

  const { data: firstPageData, totalCount } = firstResult.content;
  const allApps: AppItem[] = [...firstPageData];

  const totalPages = Math.ceil(totalCount / pageSize);
  const remainingFetches = [];
  for (let pageIndex = 2; pageIndex <= totalPages; pageIndex++) {
    remainingFetches.push(fetchAppListPage(auth, pageIndex, pageSize));
  }

  const remainingResults = await Promise.all(remainingFetches);
  for (const result of remainingResults) {
    if (result.success && result.content?.data) {
      allApps.push(...result.content.data);
    }
  }

  return allApps.map((app) => ({
    appName: app.appName?.zh_CN || app.appName?.en_US || "",
    appType: app.appType || "",
    systemLink: app.systemLink || "",
    icon: app.icon || "",
    iconColor: app.iconColor || "",
  }));
}

// ── 注册 ──

export function registerAppTools(server: McpServer): void {
  const dashboardUri = "ui://yida/app-dashboard.html";

  // Tool: yida_list_apps（带 UI）
  registerAppTool(
    server,
    "yida_list_apps",
    {
      title: "List Yida Apps",
      description:
        "Query all Yida applications for the current account. Returns app names, appType identifiers, and access URLs. Renders an interactive dashboard card view.",
      inputSchema: {
        pageSize: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20)
          .describe("Number of apps per page"),
      },
      _meta: { ui: { resourceUri: dashboardUri } },
    },
    async ({ pageSize }) => {
      const apps = await fetchAllApps(pageSize);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(apps, null, 2),
          },
        ],
      };
    },
  );

  // Resource: app-dashboard UI
  registerAppResource(
    server,
    dashboardUri,
    dashboardUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(DIST_VIEWS, "app-dashboard.html");
      const html = await fs.readFile(htmlPath, "utf-8");
      return {
        contents: [{ uri: dashboardUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  // Tool: yida_create_app（纯数据，无 UI）
  server.tool(
    "yida_create_app",
    {
      name: z.string().min(1).describe("Application name"),
      description: z.string().optional().describe("Application description"),
      icon: z.string().optional().describe("Application icon identifier"),
      iconColor: z.string().optional().describe("Icon color hex code"),
    },
    async ({ name, description, icon, iconColor }) => {
      const auth = getAuth();
      const querystring = await import("node:querystring");
      const postData = querystring.stringify({
        _csrf_token: auth.csrfToken,
        name: JSON.stringify({ zh_CN: name, en_US: name, type: "i18n" }),
        description: description || "",
        icon: icon || "chart-pie",
        iconColor: iconColor || "#3870EA",
        colour: iconColor || "#3870EA",
        navTheme: "dark",
        layoutDirection: "horizontal",
      });

      const result = await httpPost(
        auth.baseUrl,
        "/dingtalk/web/APP_FAKE/query/app/createApp.json",
        postData,
        auth.cookies,
      );

      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.errorMsg || "Failed to create app"}` }],
          isError: true,
        };
      }

      const appType = result.content?.appType || "";
      const systemLink = `${auth.baseUrl}/${appType}/workbench`;

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ appType, systemLink, name }, null, 2),
          },
        ],
      };
    },
  );
}
