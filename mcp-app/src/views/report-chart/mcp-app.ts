/**
 * report-chart View — ECharts 交互式图表
 *
 * 接收 yida_query_report Tool 返回的数据，
 * 使用 Canvas 渲染简易图表（无外部依赖，MCP App 沙箱友好）。
 */

import { App } from "@modelcontextprotocol/ext-apps";

interface ReportData {
  chartType: string;
  title: string;
  data: Array<Record<string, unknown>>;
  appType: string;
  formUuid: string;
}

type ChartType = "bar" | "line" | "pie" | "scatter";

let currentData: ReportData | null = null;
// Active chart type is managed via renderChart's parameter

// ── Canvas 图表渲染 ──

function renderChart(data: ReportData, chartType: ChartType): void {
  const root = document.getElementById("root")!;

  if (!data.data || data.data.length === 0) {
    root.innerHTML = `<div class="loading">No data available for chart.</div>`;
    return;
  }

  // 提取数据：取第一个数值字段作为 Y 轴
  const records = data.data;
  const sampleRecord = records[0];
  const fieldKeys = Object.keys(sampleRecord).filter(
    (key) => !key.startsWith("_") && key !== "formInstId" && key !== "gmtCreate" && key !== "gmtModified",
  );

  const numericField = fieldKeys.find((key) => typeof sampleRecord[key] === "number") || fieldKeys[0];
  const labelField = fieldKeys.find((key) => key !== numericField && typeof sampleRecord[key] === "string") || fieldKeys[0];

  const labels = records.map((record, index) => String(record[labelField] || `#${index + 1}`));
  const values = records.map((record) => Number(record[numericField]) || 0);

  const maxValue = Math.max(...values, 1);

  // 渲染 HTML
  root.innerHTML = `
    <div class="header">
      <h2>📊 ${escapeHtml(data.title)}</h2>
      <div class="chart-type-selector">
        ${(["bar", "line", "pie"] as ChartType[])
          .map(
            (type) =>
              `<button class="chart-type-btn ${type === chartType ? "active" : ""}" data-type="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</button>`,
          )
          .join("")}
      </div>
    </div>
    <canvas id="chart-canvas" width="800" height="360"></canvas>
    <div class="data-summary">${records.length} records · ${data.appType} / ${data.formUuid}</div>
  `;

  // 绑定切换事件
  document.querySelectorAll(".chart-type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentData) {
        renderChart(currentData, (btn as HTMLElement).dataset.type as ChartType);
      }
    });
  });

  // Canvas 绘图
  const canvas = document.getElementById("chart-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 20, right: 20, bottom: 60, left: 60 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--mcp-bg").trim() || "#fff";
  ctx.fillRect(0, 0, width, height);

  const colors = ["#3870EA", "#F5A623", "#7B68EE", "#E74C3C", "#2ECC71", "#E67E22", "#9B59B6", "#1ABC9C"];

  if (chartType === "bar") {
    drawBarChart(ctx, labels, values, maxValue, padding, chartWidth, chartHeight, colors);
  } else if (chartType === "line") {
    drawLineChart(ctx, labels, values, maxValue, padding, chartWidth, chartHeight);
  } else if (chartType === "pie") {
    drawPieChart(ctx, labels, values, width, height, colors);
  }
}

function drawBarChart(
  ctx: CanvasRenderingContext2D,
  labels: string[],
  values: number[],
  maxValue: number,
  padding: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  chartHeight: number,
  colors: string[],
): void {
  const barWidth = Math.min(40, chartWidth / labels.length - 8);

  // Y axis
  ctx.strokeStyle = "#ddd";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + chartHeight - (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
    ctx.fillStyle = "#999";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(String(Math.round((maxValue / 5) * i)), padding.left - 8, y + 4);
  }

  // Bars
  values.forEach((value, index) => {
    const barHeight = (value / maxValue) * chartHeight;
    const x = padding.left + (chartWidth / labels.length) * index + (chartWidth / labels.length - barWidth) / 2;
    const y = padding.top + chartHeight - barHeight;

    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
    ctx.fill();

    // Label
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const labelText = labels[index].length > 8 ? labels[index].slice(0, 8) + "…" : labels[index];
    ctx.fillText(labelText, x + barWidth / 2, padding.top + chartHeight + 16);
  });
}

function drawLineChart(
  ctx: CanvasRenderingContext2D,
  labels: string[],
  values: number[],
  maxValue: number,
  padding: { top: number; right: number; bottom: number; left: number },
  chartWidth: number,
  chartHeight: number,
): void {
  const points = values.map((value, index) => ({
    x: padding.left + (chartWidth / (labels.length - 1 || 1)) * index,
    y: padding.top + chartHeight - (value / maxValue) * chartHeight,
  }));

  // Grid
  ctx.strokeStyle = "#eee";
  for (let i = 0; i <= 5; i++) {
    const y = padding.top + chartHeight - (chartHeight / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(padding.left + chartWidth, y);
    ctx.stroke();
  }

  // Line
  ctx.strokeStyle = "#3870EA";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.stroke();

  // Dots
  points.forEach((point) => {
    ctx.fillStyle = "#3870EA";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPieChart(
  ctx: CanvasRenderingContext2D,
  labels: string[],
  values: number[],
  width: number,
  height: number,
  colors: string[],
): void {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total === 0) return;

  const centerX = width / 2 - 60;
  const centerY = height / 2;
  const radius = Math.min(centerX, centerY) - 30;
  let startAngle = -Math.PI / 2;

  values.forEach((value, index) => {
    const sliceAngle = (value / total) * Math.PI * 2;
    ctx.fillStyle = colors[index % colors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    startAngle += sliceAngle;
  });

  // Legend
  const legendX = width / 2 + 40;
  labels.forEach((label, index) => {
    const legendY = 30 + index * 22;
    ctx.fillStyle = colors[index % colors.length];
    ctx.fillRect(legendX, legendY, 12, 12);
    ctx.fillStyle = "#666";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "left";
    const percentage = ((values[index] / total) * 100).toFixed(1);
    const displayLabel = label.length > 10 ? label.slice(0, 10) + "…" : label;
    ctx.fillText(`${displayLabel} (${percentage}%)`, legendX + 18, legendY + 10);
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── MCP App 生命周期 ──

const app = new App({ name: "report-chart", version: "1.0.0" });

app.ontoolresult = (result) => {
  try {
    const textContent = result.content?.find(
      (c: { type: string }) => c.type === "text",
    );
    if (textContent && "text" in textContent) {
      currentData = JSON.parse(textContent.text as string) as ReportData;
      renderChart(currentData, (currentData.chartType as ChartType) || "bar");
    }
  } catch (error) {
    const root = document.getElementById("root")!;
    root.innerHTML = `<div class="loading">Failed to parse chart data: ${error}</div>`;
  }
};

app.ontoolinput = () => {
  const root = document.getElementById("root")!;
  root.innerHTML = `<div class="loading">Fetching report data...</div>`;
};

app.onteardown = async () => ({ state: {} });

app.connect();
