/**
 * data-tools.ts — 数据管理相关 MCP Tools
 *
 * 工具列表：
 *   yida_query_data      — 查询表单数据
 *   yida_create_instance — 新增表单实例
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getAuth, httpPost } from "../auth.js";

// ── 内部函数 ──

async function queryFormInstances(
  appType: string,
  formUuid: string,
  pageNumber: number,
  pageSize: number,
  searchFieldJson?: string,
) {
  const auth = getAuth();
  const querystring = await import("node:querystring");
  const postData = querystring.stringify({
    _csrf_token: auth.csrfToken,
    appType,
    formUuid,
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
    ...(searchFieldJson ? { searchFieldJson } : {}),
  });

  return httpPost(
    auth.baseUrl,
    `/dingtalk/web/${appType}/query/pformdata/v2/listFormDataByPage.json`,
    postData,
    auth.cookies,
  );
}

async function createFormInstance(
  appType: string,
  formUuid: string,
  formDataJson: string,
  deptId?: string,
) {
  const auth = getAuth();
  const querystring = await import("node:querystring");
  const postData = querystring.stringify({
    _csrf_token: auth.csrfToken,
    appType,
    formUuid,
    formDataJson,
    ...(deptId ? { deptId } : {}),
  });

  return httpPost(
    auth.baseUrl,
    `/dingtalk/web/${appType}/query/pformdata/v2/createFormData.json`,
    postData,
    auth.cookies,
  );
}

// ── 注册 ──

export function registerDataTools(server: McpServer): void {
  // Tool: yida_query_data
  server.tool(
    "yida_query_data",
    {
      appType: z.string().min(1).describe("Application identifier"),
      formUuid: z.string().min(1).describe("Form UUID"),
      pageNumber: z.number().int().min(1).default(1).describe("Page number"),
      pageSize: z.number().int().min(1).max(100).default(10).describe("Page size"),
      searchFieldJson: z
        .string()
        .optional()
        .describe("Search conditions JSON (see query-condition-guide)"),
    },
    async ({ appType, formUuid, pageNumber, pageSize, searchFieldJson }) => {
      const result = await queryFormInstances(
        appType,
        formUuid,
        pageNumber,
        pageSize,
        searchFieldJson,
      );

      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.errorMsg || "Query failed"}` }],
          isError: true,
        };
      }

      const data = result.content || {};
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                totalCount: data.totalCount || 0,
                currentPage: data.currentPage || pageNumber,
                data: data.data || [],
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Tool: yida_create_instance
  server.tool(
    "yida_create_instance",
    {
      appType: z.string().min(1).describe("Application identifier"),
      formUuid: z.string().min(1).describe("Form UUID"),
      formDataJson: z
        .string()
        .describe('Form data as JSON string, e.g. {"textField_xxx":"value"}'),
      deptId: z.string().optional().describe("Department ID (optional)"),
    },
    async ({ appType, formUuid, formDataJson, deptId }) => {
      const result = await createFormInstance(appType, formUuid, formDataJson, deptId);

      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.errorMsg || "Create failed"}` }],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { formInstId: result.content, appType, formUuid },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
