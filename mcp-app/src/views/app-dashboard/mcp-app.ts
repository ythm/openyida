/**
 * app-dashboard View — 应用列表卡片仪表盘
 *
 * 接收 yida_list_apps Tool 返回的应用列表数据，
 * 渲染为可交互的卡片网格。
 */

import { App } from "@modelcontextprotocol/ext-apps";

interface AppInfo {
  appName: string;
  appType: string;
  systemLink: string;
  icon?: string;
  iconColor?: string;
}

const COLORS = [
  "#3870EA", "#F5A623", "#7B68EE", "#E74C3C",
  "#2ECC71", "#E67E22", "#9B59B6", "#1ABC9C",
];

function getColor(index: number): string {
  return COLORS[index % COLORS.length];
}

function getIconEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("crm") || lower.includes("客户")) return "👥";
  if (lower.includes("hr") || lower.includes("人事") || lower.includes("员工")) return "🧑‍💼";
  if (lower.includes("报表") || lower.includes("report")) return "📊";
  if (lower.includes("审批") || lower.includes("流程")) return "✅";
  if (lower.includes("项目") || lower.includes("project")) return "📋";
  if (lower.includes("财务") || lower.includes("费用")) return "💰";
  return "📱";
}

function render(apps: AppInfo[]): void {
  const root = document.getElementById("root")!;

  if (!apps || apps.length === 0) {
    root.innerHTML = `<div class="empty">No applications found.</div>`;
    return;
  }

  const header = `
    <div class="header">
      <h2>🚀 Yida Applications</h2>
      <span class="badge">${apps.length}</span>
    </div>
  `;

  const cards = apps
    .map(
      (app, index) => `
    <div class="card" onclick="window.open('${app.systemLink}', '_blank')">
      <div class="card-header">
        <div class="icon-circle" style="background:${app.iconColor || getColor(index)}">
          ${getIconEmoji(app.appName)}
        </div>
        <div>
          <div class="app-name">${escapeHtml(app.appName)}</div>
          <div class="app-type">${escapeHtml(app.appType)}</div>
        </div>
      </div>
      ${app.systemLink ? `<a class="app-link" href="${app.systemLink}" target="_blank">Open →</a>` : ""}
    </div>
  `,
    )
    .join("");

  root.innerHTML = `${header}<div class="grid">${cards}</div>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── MCP App 生命周期 ──

const app = new App({ name: "app-dashboard", version: "1.0.0" });

app.ontoolresult = (result) => {
  try {
    const textContent = result.content?.find(
      (c: { type: string }) => c.type === "text",
    );
    if (textContent && "text" in textContent) {
      const apps: AppInfo[] = JSON.parse(textContent.text as string);
      render(apps);
    }
  } catch (error) {
    const root = document.getElementById("root")!;
    root.innerHTML = `<div class="empty">Failed to parse app data: ${error}</div>`;
  }
};

app.ontoolinput = () => {
  const root = document.getElementById("root")!;
  root.innerHTML = `<div class="loading">Fetching applications...</div>`;
};

app.onteardown = async () => ({ state: {} });

app.connect();
