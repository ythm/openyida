/**
 * form-preview View — 表单 Schema 可视化预览
 *
 * 接收 yida_get_schema Tool 返回的表单 Schema，
 * 渲染为可视化的字段列表。
 */

import { App } from "@modelcontextprotocol/ext-apps";

interface FieldInfo {
  label: string;
  componentName: string;
  fieldId: string;
}

interface SchemaData {
  formUuid: string;
  appType: string;
  fields: FieldInfo[];
}

const FIELD_ICONS: Record<string, { emoji: string; color: string }> = {
  TextField: { emoji: "📝", color: "#E3F2FD" },
  TextareaField: { emoji: "📄", color: "#E8F5E9" },
  SelectField: { emoji: "📋", color: "#FFF3E0" },
  RadioField: { emoji: "🔘", color: "#FCE4EC" },
  CheckboxField: { emoji: "☑️", color: "#F3E5F5" },
  NumberField: { emoji: "🔢", color: "#E0F7FA" },
  DateField: { emoji: "📅", color: "#FFF8E1" },
  EmployeeField: { emoji: "👤", color: "#E8EAF6" },
  PhoneField: { emoji: "📱", color: "#E0F2F1" },
  EmailField: { emoji: "📧", color: "#EFEBE9" },
  ImageField: { emoji: "🖼️", color: "#FBE9E7" },
  AttachmentField: { emoji: "📎", color: "#ECEFF1" },
  TableField: { emoji: "📊", color: "#E1F5FE" },
  CascadeSelectField: { emoji: "🔗", color: "#F1F8E9" },
};

function getFieldVisual(componentName: string): { emoji: string; color: string } {
  return FIELD_ICONS[componentName] || { emoji: "📌", color: "#F5F5F5" };
}

function render(data: SchemaData): void {
  const root = document.getElementById("root")!;

  if (!data.fields || data.fields.length === 0) {
    root.innerHTML = `<div class="loading">No fields found in this form.</div>`;
    return;
  }

  const header = `
    <div class="header">
      <h2>📋 Form Schema Preview</h2>
    </div>
    <div class="meta">${escapeHtml(data.appType)} / ${escapeHtml(data.formUuid)} · ${data.fields.length} fields</div>
    <br/>
  `;

  const fieldCards = data.fields
    .map((field) => {
      const visual = getFieldVisual(field.componentName);
      return `
      <div class="field-card">
        <div class="field-icon" style="background:${visual.color}">${visual.emoji}</div>
        <div class="field-info">
          <div class="field-label">${escapeHtml(field.label || "(unnamed)")}</div>
          <div class="field-meta">${escapeHtml(field.fieldId)}</div>
        </div>
        <span class="field-type-badge">${escapeHtml(field.componentName)}</span>
      </div>
    `;
    })
    .join("");

  root.innerHTML = `${header}<div class="field-list">${fieldCards}</div>`;
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ── MCP App 生命周期 ──

const app = new App({ name: "form-preview", version: "1.0.0" });

app.ontoolresult = (result) => {
  try {
    const textContent = result.content?.find(
      (c: { type: string }) => c.type === "text",
    );
    if (textContent && "text" in textContent) {
      const data: SchemaData = JSON.parse(textContent.text as string);
      render(data);
    }
  } catch (error) {
    const root = document.getElementById("root")!;
    root.innerHTML = `<div class="loading">Failed to parse schema: ${error}</div>`;
  }
};

app.ontoolinput = () => {
  const root = document.getElementById("root")!;
  root.innerHTML = `<div class="loading">Fetching form schema...</div>`;
};

app.onteardown = async () => ({ state: {} });

app.connect();
