---
name: yida-table-form
description: 宜搭自定义页面表格形式批量表单提交技能。支持动态增删行、行内多字段编辑、行内验证、Excel 粘贴导入、草稿暂存（localStorage）、批量调用 saveFormData 提交。不适用于：单条表单提交（应使用 yida-custom-page 普通表单），或查询/展示已有数据（应使用 yida-data-management）。
---

# 宜搭自定义页面表格表单提交技能

## 严格禁止 (NEVER DO)

- 不要在前端做批量提交时使用串行（逐条等待），必须用 `Promise.all` 并发提交
- 不要在提交前跳过行验证，必须先 `validateRow` 再提交
- 不要硬编码 `FORM_UUID`，必须从 `project/config.json` 或用户提供的信息中获取
- 不要在提交成功后保留草稿，必须调用 `clearDraft()` 清除 localStorage
- 不要忽略提交失败的行，必须在 UI 上标红并提示用户修正后重新提交

## 严格要求 (MUST DO)

- **批量提交前必须确认**：执行批量提交前，必须向用户展示待提交数据的摘要（行数、关键字段），获得用户明确同意后再执行
- 必须在 `COLUMNS` 配置区定义所有列，字段 ID 从表单 Schema 中提取
- 必须实现草稿自动保存（`localStorage`），防止用户刷新丢失数据
- 必须在提交结果中区分成功/失败数量，失败行保留可编辑状态
- 批量提交必须使用 `Promise.all` 并发，不得串行等待

## 适用场景

| 用户意图 | 触发条件 |
|---------|---------|
| 批量录入同类数据 | "批量添加"、"批量录入"、"Excel 导入" |
| 行内编辑 + 批量保存 | "表格形式填写"、"多行同时编辑" |
| Excel 粘贴导入 | "从 Excel 粘贴"、"复制粘贴数据" |

## 触发条件

**正向触发**：
- "批量添加"、"批量录入"、"Excel 导入"
- "表格形式填写"、"多行同时编辑"
- "从 Excel 粘贴"、"复制粘贴数据"

**不适用场景（不要触发）**：
- 单条表单提交 → `yida-custom-page` 普通表单
- 查询/展示已有数据 → `yida-data-management`
- 批量更新已有记录 → `yida-data-management` 的 update 接口
- 移动端页面 → 表格表单在移动端体验差，建议使用标准表单

**与相邻技能的边界**：
| 场景 | 使用技能 |
|------|---------|
| 批量录入同类数据（Excel 式编辑） | **本技能** |
| 单条数据录入（标准表单） | 标准表单页面或 `yida-custom-page` |
| 需要审批的流程表单 | `yida-create-process` |
| 数据查询和展示 | `yida-data-management` 或 `yida-report` |

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 批量提交部分失败 | 失败行在 UI 上标红，保留可编辑状态，提示用户修正后重新提交 |
| 提交前未验证 | 必须先 `validateRow` 验证所有行，再执行批量提交 |
| 提交成功后草稿未清除 | 必须调用 `clearDraft()` 清除 localStorage |
| 串行提交导致超时 | 必须使用 `Promise.all` 并发提交，不得串行等待 |
| FORM_UUID 硬编码 | 必须从 `project/config.json` 或用户提供的信息中获取，不得硬编码 |
| fieldId 不存在 | 先执行 `yida-get-schema` 获取真实 fieldId |
| 草稿恢复失败 | 提示用户 localStorage 可能被清空，重新录入数据 |
| 接口超时 | 减少单次提交条数（建议 ≤50 条），分批提交 |
| 数据量过大 | 建议分批录入，每批不超过 100 条 |

## Agent 错误处理策略

当 Agent 执行本技能遇到错误时，必须遵循以下默认行为：

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 代码生成失败 | 停止执行，向用户展示错误信息，询问是否重试或调整需求 |
| 参数缺失（FORM_UUID/字段 ID 等） | 主动询问用户补充，或引导用户使用 `yida-get-schema` 获取 |
| 权限不足 / 登录态失效 | 停止执行，提示用户执行 `openyida auth status` 检查登录态 |
| 批量提交部分失败 | 展示失败行详情，保留可编辑状态，引导用户修正后重试 |
| 字段类型不支持 | 停止执行，提示用户该字段类型暂不支持，建议调整表单设计 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

---


## 概述

在批量录入同类数据（如批量添加商品、批量录入考勤、批量创建任务）的场景下，标准表单页面每次只能提交一条记录，效率低下。本技能提供表格形式的批量表单提交方案，支持行内编辑、验证和批量提交。

---

## 何时使用

- 批量录入同类数据（如：批量添加商品、批量录入考勤）
- Excel 式数据编辑体验
- 行内编辑 + 批量保存

---

## 核心数据结构

```javascript
// 每行数据结构
{
  id: 'temp_' + Date.now(),   // 临时行 ID（提交后替换为 formInstId）
  fieldA: '',                  // 各字段值
  fieldB: '',
  _status: 'valid',            // 'valid' | 'invalid' | 'submitting' | 'submitted'
  _errors: {},                 // { fieldA: '必填', fieldB: '格式错误' }
}
```

---

## 完整示例代码

以下示例实现一个支持动态增删行、行内验证、Excel 粘贴导入、草稿暂存、批量提交的表格表单页面。

```javascript
// ── 配置区（根据实际表单修改）────────────────────────

var FORM_UUID = 'FORM-XXX';
var DRAFT_KEY = 'yida_table_form_draft_' + FORM_UUID;

// 列定义：label 显示名、field 字段 ID、type 字段类型、required 是否必填
var COLUMNS = [
  { label: '姓名', field: 'textField_name', type: 'text', required: true },
  { label: '部门', field: 'selectField_dept', type: 'select', required: true,
    options: ['研发部', '产品部', '运营部', '市场部'] },
  { label: '日期', field: 'dateField_date', type: 'date', required: true },
  { label: '备注', field: 'textField_remark', type: 'text', required: false },
];

// ── 状态 ─────────────────────────────────────────────

var _customState = {
  rows: [],           // 行数据列表
  submitting: false,  // 是否正在提交
  submitResult: null, // { success: number, failed: number }
};

// ── 工具函数 ─────────────────────────────────────────

function generateRowId() {
  return 'temp_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

function createEmptyRow() {
  var row = { id: generateRowId(), _status: 'valid', _errors: {} };
  COLUMNS.forEach(function (col) { row[col.field] = ''; });
  return row;
}

function validateRow(row) {
  var errors = {};
  COLUMNS.forEach(function (col) {
    if (col.required && !row[col.field]) {
      errors[col.field] = col.label + '不能为空';
    }
  });
  return errors;
}

function saveDraft(rows) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(rows));
  } catch (e) {
    // localStorage 不可用时静默忽略
  }
}

function loadDraft() {
  try {
    var saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch (e) {}
}

// ── 生命周期 ─────────────────────────────────────────

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function (key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

export function didMount() {
  // 恢复草稿
  var draft = loadDraft();
  if (draft && draft.length > 0) {
    _customState.rows = draft;
  } else {
    _customState.rows = [createEmptyRow(), createEmptyRow(), createEmptyRow()];
  }
  this.forceUpdate();
}

// ── 行操作 ───────────────────────────────────────────

export function addRow() {
  _customState.rows.push(createEmptyRow());
  saveDraft(_customState.rows);
  this.forceUpdate();
}

export function deleteRow(rowId) {
  _customState.rows = _customState.rows.filter(function (row) {
    return row.id !== rowId;
  });
  if (_customState.rows.length === 0) {
    _customState.rows.push(createEmptyRow());
  }
  saveDraft(_customState.rows);
  this.forceUpdate();
}

export function updateCell(rowId, field, value) {
  var row = _customState.rows.find(function (r) { return r.id === rowId; });
  if (!row) return;
  row[field] = value;
  // 清除该字段的错误
  if (row._errors[field]) {
    delete row._errors[field];
    row._status = Object.keys(row._errors).length === 0 ? 'valid' : 'invalid';
  }
  saveDraft(_customState.rows);
  this.forceUpdate();
}

// ── Excel 粘贴导入 ───────────────────────────────────

export function handlePaste(event) {
  var clipboardData = event.clipboardData || window.clipboardData;
  if (!clipboardData) return;
  var text = clipboardData.getData('text');
  if (!text) return;

  var lines = text.trim().split('\n');
  var newRows = lines.map(function (line) {
    var cells = line.split('\t');
    var row = createEmptyRow();
    COLUMNS.forEach(function (col, index) {
      if (cells[index] !== undefined) {
        row[col.field] = cells[index].trim();
      }
    });
    return row;
  });

  // 追加到现有行（过滤掉全空行）
  var nonEmptyExisting = _customState.rows.filter(function (row) {
    return COLUMNS.some(function (col) { return row[col.field]; });
  });
  _customState.rows = nonEmptyExisting.concat(newRows);
  saveDraft(_customState.rows);
  this.forceUpdate();

  this.utils.toast({ title: '已导入 ' + newRows.length + ' 行数据', type: 'success' });
}

// ── 批量提交 ─────────────────────────────────────────

export function submitAll() {
  var self = this;

  // 1. 验证所有行
  var hasError = false;
  _customState.rows.forEach(function (row) {
    var errors = validateRow(row);
    row._errors = errors;
    if (Object.keys(errors).length > 0) {
      row._status = 'invalid';
      hasError = true;
    }
  });

  if (hasError) {
    self.forceUpdate();
    self.utils.toast({ title: '请修正表格中的错误后再提交', type: 'error' });
    return;
  }

  // 2. 过滤掉全空行
  var rowsToSubmit = _customState.rows.filter(function (row) {
    return COLUMNS.some(function (col) { return row[col.field]; });
  });

  if (rowsToSubmit.length === 0) {
    self.utils.toast({ title: '请至少填写一行数据', type: 'error' });
    return;
  }

  _customState.submitting = true;
  _customState.submitResult = null;
  self.forceUpdate();

  // 3. 批量提交（并发）
  var appType = window.pageConfig && window.pageConfig.appType;
  var promises = rowsToSubmit.map(function (row) {
    var formDataJson = {};
    COLUMNS.forEach(function (col) { formDataJson[col.field] = row[col.field]; });

    row._status = 'submitting';

    return self.utils.yida.saveFormData({
      formUuid: FORM_UUID,
      appType: appType,
      formDataJson: JSON.stringify(formDataJson),
    }).then(function () {
      row._status = 'submitted';
    }).catch(function (err) {
      row._status = 'invalid';
      row._errors._submit = err.message || '提交失败';
    });
  });

  Promise.all(promises).then(function () {
    var successCount = rowsToSubmit.filter(function (r) { return r._status === 'submitted'; }).length;
    var failedCount = rowsToSubmit.filter(function (r) { return r._status === 'invalid'; }).length;

    _customState.submitting = false;
    _customState.submitResult = { success: successCount, failed: failedCount };

    if (failedCount === 0) {
      clearDraft();
      // 提交成功后重置表格
      _customState.rows = [createEmptyRow(), createEmptyRow(), createEmptyRow()];
      self.utils.toast({ title: '全部提交成功，共 ' + successCount + ' 条', type: 'success' });
    } else {
      self.utils.toast({
        title: '提交完成：' + successCount + ' 条成功，' + failedCount + ' 条失败',
        type: 'error',
      });
    }
    self.forceUpdate();
  });
}

// ── 渲染 ─────────────────────────────────────────────

export function renderCellInput(row, col) {
  var self = this;
  var value = row[col.field];
  var hasError = !!row._errors[col.field];
  var isSubmitted = row._status === 'submitted';

  var baseInputStyle = {
    width: '100%',
    height: '28px',
    padding: '0 6px',
    border: '1px solid ' + (hasError ? '#ff4d4f' : '#d9d9d9'),
    borderRadius: '4px',
    fontSize: '13px',
    outline: 'none',
    background: isSubmitted ? '#f6ffed' : '#fff',
  };

  if (col.type === 'select') {
    return (
      <select
        value={value}
        disabled={isSubmitted}
        onChange={function (e) { self.updateCell.call(self, row.id, col.field, e.target.value); }}
        style={baseInputStyle}
      >
        <option value="">请选择</option>
        {(col.options || []).map(function (opt) {
          return <option key={opt} value={opt}>{opt}</option>;
        })}
      </select>
    );
  }

  return (
    <input
      type={col.type === 'date' ? 'date' : 'text'}
      value={value}
      disabled={isSubmitted}
      placeholder={col.required ? col.label + '（必填）' : col.label}
      onChange={function (e) { self.updateCell.call(self, row.id, col.field, e.target.value); }}
      style={baseInputStyle}
    />
  );
}

export function renderJsx() {
  var self = this;

  return (
    <div style={{ padding: '16px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 标题栏 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '12px', padding: '12px 16px',
        background: '#fff', borderRadius: '6px',
      }}>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>批量录入</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={self.handlePaste.bind(self)}
            style={{
              height: '32px', padding: '0 12px', fontSize: '13px',
              border: '1px solid #d9d9d9', borderRadius: '4px',
              background: '#fff', cursor: 'pointer',
            }}
          >
            📋 粘贴 Excel 数据
          </button>
          <button
            onClick={self.addRow.bind(self)}
            style={{
              height: '32px', padding: '0 12px', fontSize: '13px',
              border: '1px solid #1890ff', borderRadius: '4px',
              background: '#fff', color: '#1890ff', cursor: 'pointer',
            }}
          >
            + 添加行
          </button>
          <button
            onClick={self.submitAll.bind(self)}
            disabled={_customState.submitting}
            style={{
              height: '32px', padding: '0 16px', fontSize: '13px',
              border: 'none', borderRadius: '4px',
              background: _customState.submitting ? '#bfbfbf' : '#1890ff',
              color: '#fff', cursor: _customState.submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {_customState.submitting ? '提交中...' : '✓ 提交全部'}
          </button>
        </div>
      </div>

      {/* 表格 */}
      <div style={{ background: '#fff', borderRadius: '6px', overflow: 'hidden' }}>
        {/* 表头 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: COLUMNS.map(function () { return '1fr'; }).join(' ') + ' 60px',
          background: '#fafafa', borderBottom: '1px solid #f0f0f0',
          padding: '8px 12px',
        }}>
          {COLUMNS.map(function (col) {
            return (
              <div key={col.field} style={{ fontSize: '13px', fontWeight: 600, color: '#595959' }}>
                {col.required && <span style={{ color: '#ff4d4f', marginRight: '2px' }}>*</span>}
                {col.label}
              </div>
            );
          })}
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#595959', textAlign: 'center' }}>操作</div>
        </div>

        {/* 数据行 */}
        {_customState.rows.map(function (row) {
          var rowBg = row._status === 'submitted' ? '#f6ffed'
            : row._status === 'invalid' ? '#fff2f0' : '#fff';

          return (
            <div
              key={row.id}
              style={{
                display: 'grid',
                gridTemplateColumns: COLUMNS.map(function () { return '1fr'; }).join(' ') + ' 60px',
                padding: '6px 12px', borderBottom: '1px solid #f0f0f0',
                background: rowBg, alignItems: 'start',
              }}
            >
              {COLUMNS.map(function (col) {
                return (
                  <div key={col.field} style={{ paddingRight: '8px' }}>
                    {self.renderCellInput.call(self, row, col)}
                    {row._errors[col.field] && (
                      <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '2px' }}>
                        {row._errors[col.field]}
                      </div>
                    )}
                    {row._errors._submit && col === COLUMNS[0] && (
                      <div style={{ fontSize: '11px', color: '#ff4d4f', marginTop: '2px' }}>
                        {row._errors._submit}
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ textAlign: 'center', paddingTop: '4px' }}>
                {row._status !== 'submitted' && (
                  <button
                    onClick={self.deleteRow.bind(self, row.id)}
                    style={{
                      border: 'none', background: 'none',
                      color: '#ff4d4f', cursor: 'pointer', fontSize: '16px',
                    }}
                    title="删除此行"
                  >
                    🗑
                  </button>
                )}
                {row._status === 'submitted' && (
                  <span style={{ color: '#52c41a', fontSize: '16px' }}>✓</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 提交结果 */}
      {_customState.submitResult && (
        <div style={{
          marginTop: '12px', padding: '12px 16px',
          background: _customState.submitResult.failed === 0 ? '#f6ffed' : '#fff2f0',
          border: '1px solid ' + (_customState.submitResult.failed === 0 ? '#b7eb8f' : '#ffccc7'),
          borderRadius: '6px', fontSize: '14px',
        }}>
          提交完成：
          <span style={{ color: '#52c41a', fontWeight: 600 }}>
            {_customState.submitResult.success} 条成功
          </span>
          {_customState.submitResult.failed > 0 && (
            <span style={{ color: '#ff4d4f', fontWeight: 600, marginLeft: '8px' }}>
              {_customState.submitResult.failed} 条失败（请修正红色行后重新提交）
            </span>
          )}
        </div>
      )}

      {/* 草稿提示 */}
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#bfbfbf', textAlign: 'right' }}>
        数据已自动保存为草稿，刷新页面后可继续编辑
      </div>
    </div>
  );
}
```

---

## 功能说明

### 动态增删行

- 点击「+ 添加行」在表格末尾新增空行
- 点击行末的 🗑 按钮删除该行（已提交成功的行不可删除）
- 表格始终保留至少一行

### Excel 粘贴导入

点击「📋 粘贴 Excel 数据」后，将从 Excel 复制的内容粘贴到剪贴板，系统自动按 Tab 分隔解析列，按换行分隔解析行，追加到现有数据后。

> **注意**：列顺序需与 `COLUMNS` 定义一致。

### 行内验证

提交前自动验证所有行：
- 必填字段为空 → 标红并显示错误信息
- 验证失败的行背景变为浅红色
- 全部通过后才发起提交请求

### 草稿暂存

每次修改单元格后自动将数据保存到 `localStorage`，key 为 `yida_table_form_draft_{formUuid}`。刷新页面后自动恢复草稿。提交全部成功后自动清除草稿。

### 批量提交

使用 `Promise.all` 并发提交所有行，每行独立调用 `saveFormData`：
- 提交中的行显示 loading 状态
- 提交成功的行背景变绿，显示 ✓
- 提交失败的行背景变红，显示错误信息，可修正后重新提交

---

## 自定义配置

修改文件顶部的配置区即可适配不同表单：

```javascript
var FORM_UUID = 'FORM-XXX';   // 替换为实际表单 UUID

var COLUMNS = [
  // type 支持：'text' | 'select' | 'date'
  { label: '字段名', field: 'fieldId_xxx', type: 'text', required: true },
  { label: '下拉字段', field: 'selectField_xxx', type: 'select', required: false,
    options: ['选项A', '选项B', '选项C'] },
];
```

---

## 注意事项

- **本技能不读写 memory**：表格表单的草稿数据通过 `localStorage` 在浏览器本地持久化，不依赖跨会话的 memory 状态

## 与其他技能配合

| 步骤 | 技能 | 说明 |
| --- | --- | --- |
| 1 | `yida-get-schema` | 获取表单字段 ID，填入 `COLUMNS` 配置 |
| 2 | **本技能** | 编写表格表单页面代码 |
| 3 | `yida-publish-page` | 发布自定义页面 |
