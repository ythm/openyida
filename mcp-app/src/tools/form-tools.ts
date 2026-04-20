/**
 * form-tools.ts — 表单管理相关 MCP Tools
 *
 * 工具列表：
 *   yida_get_schema    — 获取表单 Schema（带表单预览 UI）
 *   yida_create_form   — 创建表单
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
import { getAuth, httpGet } from "../auth.js";

const DIST_VIEWS = path.join(import.meta.dirname, "..", "views");

// ── 内部函数 ──

interface FieldSummary {
  label: string;
  componentName: string;
  fieldId: string;
}

const FIELD_COMPONENT_NAMES = new Set([
  "TextField", "TextareaField", "SelectField", "DateField", "NumberField",
  "RadioField", "CheckboxField", "EmployeeField", "PhoneField", "EmailField",
  "CascadeSelectField", "ImageField", "AttachmentField", "TableField",
]);

function extractFieldSummary(schemaResult: Record<string, unknown>): FieldSummary[] {
  const fields: FieldSummary[] = [];
  const content = schemaResult.content as Record<string, unknown> | undefined;
  const pages = content?.pages as Array<Record<string, unknown>> | undefined;
  if (!pages || pages.length === 0) return fields;

  function traverse(node: Record<string, unknown> | undefined) {
    if (!node) return;
    const componentName = node.componentName as string | undefined;
    if (componentName && FIELD_COMPONENT_NAMES.has(componentName)) {
      const props = (node.props || {}) as Record<string, unknown>;
      const labelRaw = props.label;
      const label = labelRaw
        ? typeof labelRaw === "object"
          ? ((labelRaw as Record<string, string>).zh_CN || (labelRaw as Record<string, string>).en_US || "")
          : String(labelRaw)
        : "";
      const fieldId = (props.fieldId as string) || "";
      if (fieldId) {
        fields.push({ label, componentName, fieldId });
      }
    }
    const children = node.children as Array<Record<string, unknown>> | undefined;
    if (children) children.forEach(traverse);
  }

  for (const page of pages) {
    const componentsTree = page.componentsTree as Array<Record<string, unknown>> | undefined;
    const tree = componentsTree?.[0];
    if (tree) traverse(tree);
  }

  return fields;
}

async function fetchSchema(appType: string, formUuid: string) {
  const auth = getAuth();
  const apiPath = `/dingtalk/web/${appType}/_view/query/formdesign/getFormSchema.json`;
  const queryParams = {
    _csrf_token: auth.csrfToken,
    formUuid,
    _stamp: String(Date.now()),
  };
  return httpGet(auth.baseUrl, apiPath, queryParams, auth.cookies);
}

// ── 注册 ──

export function registerFormTools(server: McpServer): void {
  const formPreviewUri = "ui://yida/form-preview.html";

  // Tool: yida_get_schema（带表单预览 UI）
  registerAppTool(
    server,
    "yida_get_schema",
    {
      title: "Get Form Schema",
      description:
        "Fetch the full schema of a Yida form, including field definitions, types, and IDs. Renders an interactive form structure preview.",
      inputSchema: {
        appType: z.string().min(1).describe("Application identifier (e.g. APP_XXX)"),
        formUuid: z.string().min(1).describe("Form UUID (e.g. FORM-XXX)"),
      },
      _meta: { ui: { resourceUri: formPreviewUri } },
    },
    async ({ appType, formUuid }) => {
      const result = await fetchSchema(appType, formUuid);

      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.errorMsg || "Failed to fetch schema"}` }],
          isError: true,
        };
      }

      const fieldSummary = extractFieldSummary(result);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                formUuid,
                appType,
                fields: fieldSummary,
                rawSchema: result.content,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // Resource: form-preview UI
  registerAppResource(
    server,
    formPreviewUri,
    formPreviewUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => {
      const htmlPath = path.join(DIST_VIEWS, "form-preview.html");
      const html = await fs.readFile(htmlPath, "utf-8");
      return {
        contents: [{ uri: formPreviewUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  // Tool: yida_create_form（纯数据，无 UI）
  server.tool(
    "yida_create_form",
    {
      appType: z.string().min(1).describe("Application identifier"),
      formTitle: z.string().min(1).describe("Form title"),
      fields: z
        .string()
        .describe(
          'JSON array of field definitions, e.g. [{"type":"TextField","label":"Name","required":true}]',
        ),
    },
    async ({ appType, formTitle, fields }) => {
      // Delegate to the CLI command via child_process for complex schema building
      const { execSync } = await import("node:child_process");
      const escapedFields = fields.replace(/'/g, "'\\''");
      const escapedTitle = formTitle.replace(/'/g, "'\\''");

      try {
        const output = execSync(
          `openyida create-form create "${appType}" "${escapedTitle}" '${escapedFields}'`,
          { encoding: "utf-8", timeout: 30000 },
        );
        return {
          content: [{ type: "text" as const, text: output }],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Error creating form: ${errorMessage}` }],
          isError: true,
        };
      }
    },
  );
}
