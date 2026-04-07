---
name: yida-density
description: 宜搭自定义页面信息密度设计规范。提供紧凑、舒适、宽松三种密度模式的样式模板，支持密度切换和响应式降级，帮助 AI 生成符合场景需求的页面布局。不适用于：非列表/表格类页面（单卡片、表单提交页无需密度设计），或原生报表页面（密度由报表组件自身控制）。
---

# 宜搭自定义页面信息密度设计规范

## 严格禁止 (NEVER DO)

- 不要在移动端页面提供密度切换 UI，移动端固定使用 `spacious`
- 不要在固定展示的报表/大屏页面提供密度切换，直接用 `spacious`
- 不要在表单填写页提供密度切换，固定使用 `comfortable`
- 不要硬编码像素值而不使用 `DENSITY_CONFIG` 变量，否则密度切换失效

## 严格要求 (MUST DO)

- 每次生成自定义页面时都必须考虑密度，无需用户明确提及
- 列表/表格类页面必须默认提供密度切换 UI
- 在 `didMount` 中必须检测移动端并自动降级为 `spacious`
- 所有间距、字体、行高必须从 `DENSITY_CONFIG[density]` 读取，不得硬编码
- **本技能不读写 memory**：密度配置作为页面代码的一部分写入宜搭平台，不依赖跨会话的 memory 状态

## 写操作安全守卫

本技能生成的代码最终会写入宜搭平台，必须遵循以下安全机制：

| 操作阶段 | 安全守卫 | 说明 |
|---------|---------|------|
| **生成前** | 确认页面类型 | 必须先确认是列表/表格/单卡片/表单，再选择合适密度 |
| **生成中** | 代码预览 | 生成代码后必须先展示给用户预览，等待用户确认后再执行发布 |
| **发布前** | 用户确认 | 执行 `yida-publish-page` 前必须明确告知用户"即将发布到宜搭平台"，获得用户同意 |
| **发布后** | 结果验证 | 发布后必须提供页面访问链接，引导用户验证效果 |

**强制规则**：
- 禁止在用户未确认的情况下直接发布页面
- 禁止跳过代码预览步骤
- 生成的代码必须完整展示 `DENSITY_CONFIG` 配置和关键渲染逻辑，不得省略

## 适用场景

| 用户意图 | 触发条件 |
|---------|---------|
| 生成任何自定义页面 | 自动应用（无需用户提及） |
| 用户说"紧凑/密集/更多信息" | 使用 `compact` 模式 |
| 用户说"宽松/舒适/大字体" | 使用 `spacious` 模式 |
| 列表/表格类页面 | 默认提供密度切换 UI |
| 移动端页面 | 固定 `spacious`，不提供切换 |

## 触发条件

**正向触发**（生成自定义页面时自动应用，无需用户提及）：
- 生成任何列表/表格类自定义页面时
- 用户说"紧凑/密集/更多信息" → 使用 `compact` 模式
- 用户说"宽松/舒适/大字体" → 使用 `spacious` 模式

**不适用场景（不要触发）**：
- 单卡片、表单提交页 → 无需密度设计，固定使用 `comfortable`
- 原生报表页面 → 密度由报表组件自身控制
- 移动端页面 → 固定 `spacious`，不提供切换 UI

## 异常处理

| 异常场景 | 处理方式 |
|---------|----------|
| 密度切换后样式未更新 | 确认所有间距/字体从 `DENSITY_CONFIG[density]` 读取，不得硬编码像素值 |
| 移动端显示密度切换 UI | 在 `didMount` 中检测移动端并自动降级为 `spacious`，隐藏切换 UI |
| 报表/大屏页面提供密度切换 | 固定展示的报表/大屏不提供密度切换，直接使用 `spacious` |

## Agent 错误处理策略

当 Agent 执行本技能遇到错误时，必须遵循以下默认行为：

| 错误类型 | 默认处理策略 |
|---------|-------------|
| 密度配置缺失 | 使用 `comfortable` 模式作为默认值，不得报错中断 |
| 移动端检测失败 | 默认使用 `spacious` 模式，确保移动端可用性 |
| 样式变量未定义 | 停止执行，提示用户检查 `DENSITY_CONFIG` 配置是否完整 |
| 页面类型判断错误 | 询问用户确认页面类型（列表/表格/单卡片/表单），再选择合适密度 |
| 未知错误 | 停止执行，完整展示错误信息，建议用户反馈问题 |

---


## 概述

不同业务场景对信息展示密度有不同需求。本规范定义三种标准密度模式，AI 在生成自定义页面时应根据场景自动选择合适的密度，或在页面中提供密度切换能力。

---

## 何时使用

| 场景 | 推荐密度 | 典型示例 |
| --- | --- | --- |
| 数据量大、专业用户、需一屏展示更多信息 | **紧凑（compact）** | 运营后台、数据报表、审批列表 |
| 常规业务场景、平衡信息量与可读性 | **舒适（comfortable）** | 表单填写、任务管理、日常审批 |
| 重点突出、新手友好、强调视觉舒适度 | **宽松（spacious）** | 移动端、展示大屏、引导页 |

---

## 触发条件（Agent 自动应用规则）

> Agent 在生成自定义页面时，**无需用户明确提及密度**，应根据以下规则自动选择：

1. **每次生成自定义页面时都应考虑密度**（不是只有用户提到才考虑）
2. 根据「何时使用」表格中的场景自动选择默认密度
3. 列表/表格类页面默认提供密度切换 UI，让用户可以自选
4. 移动端页面始终使用 ，不提供切换

---

## 三种密度的样式规范

### 密度变量定义

```javascript
var DENSITY_CONFIG = {
  compact: {
    cardPadding: '8px 12px',
    cardMarginBottom: '8px',
    fontSize: '12px',
    lineHeight: '1.4',
    tableRowHeight: '32px',
    buttonHeight: '24px',
    buttonPadding: '0 8px',
    inputHeight: '24px',
    iconSize: '14px',
    sectionGap: '8px',
  },
  comfortable: {
    cardPadding: '16px 20px',
    cardMarginBottom: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    tableRowHeight: '48px',
    buttonHeight: '32px',
    buttonPadding: '0 16px',
    inputHeight: '32px',
    iconSize: '16px',
    sectionGap: '16px',
  },
  spacious: {
    cardPadding: '24px 28px',
    cardMarginBottom: '24px',
    fontSize: '16px',
    lineHeight: '1.8',
    tableRowHeight: '64px',
    buttonHeight: '40px',
    buttonPadding: '0 24px',
    inputHeight: '40px',
    iconSize: '20px',
    sectionGap: '24px',
  },
};
```

---

## 完整示例：带密度切换的页面

```javascript
var DENSITY_CONFIG = {
  compact: {
    cardPadding: '8px 12px',
    cardMarginBottom: '8px',
    fontSize: '12px',
    lineHeight: '1.4',
    tableRowHeight: '32px',
    buttonHeight: '24px',
    buttonPadding: '0 8px',
    inputHeight: '24px',
    iconSize: '14px',
    sectionGap: '8px',
  },
  comfortable: {
    cardPadding: '16px 20px',
    cardMarginBottom: '16px',
    fontSize: '14px',
    lineHeight: '1.6',
    tableRowHeight: '48px',
    buttonHeight: '32px',
    buttonPadding: '0 16px',
    inputHeight: '32px',
    iconSize: '16px',
    sectionGap: '16px',
  },
  spacious: {
    cardPadding: '24px 28px',
    cardMarginBottom: '24px',
    fontSize: '16px',
    lineHeight: '1.8',
    tableRowHeight: '64px',
    buttonHeight: '40px',
    buttonPadding: '0 24px',
    inputHeight: '40px',
    iconSize: '20px',
    sectionGap: '24px',
  },
};

var _customState = {
  // 默认舒适模式；移动端自动降级为 spacious
  density: 'comfortable',
  dataList: [],
};

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
  // 移动端自动降级为宽松模式
  if (this.utils.isMobile()) {
    _customState.density = 'spacious';
  }
  this.loadData();
}

export function loadData() {
  var self = this;
  this.utils.yida.searchFormDatas({
    formUuid: 'FORM-XXX',
    currentPage: 1,
    pageSize: 20,
  }).then(function (res) {
    _customState.dataList = res.data || [];
    self.forceUpdate();
  });
}

export function switchDensity(densityKey) {
  _customState.density = densityKey;
  this.forceUpdate();
}

export function renderDensityToggle(d) {
  var self = this;
  var options = [
    { key: 'compact', label: '紧凑' },
    { key: 'comfortable', label: '舒适' },
    { key: 'spacious', label: '宽松' },
  ];

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', color: '#999', marginRight: '4px' }}>密度：</span>
      {options.map(function (option) {
        var isActive = _customState.density === option.key;
        return (
          <button
            key={option.key}
            onClick={self.switchDensity.bind(self, option.key)}
            style={{
              height: '24px',
              padding: '0 10px',
              fontSize: '12px',
              border: '1px solid ' + (isActive ? '#1890ff' : '#d9d9d9'),
              borderRadius: '4px',
              background: isActive ? '#e6f7ff' : '#fff',
              color: isActive ? '#1890ff' : '#595959',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function renderDataCard(item, d) {
  return (
    <div
      key={item.formInstId}
      style={{
        padding: d.cardPadding,
        marginBottom: d.cardMarginBottom,
        background: '#fff',
        borderRadius: '6px',
        border: '1px solid #f0f0f0',
        fontSize: d.fontSize,
        lineHeight: d.lineHeight,
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: d.sectionGap }}>
        {item.formData.titleField_xxx || '无标题'}
      </div>
      <div style={{ color: '#8c8c8c' }}>
        {item.formData.descField_xxx || ''}
      </div>
    </div>
  );
}

export function renderJsx() {
  var self = this;
  var d = DENSITY_CONFIG[_customState.density] || DENSITY_CONFIG.comfortable;

  return (
    <div style={{ padding: d.cardPadding, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 工具栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: d.sectionGap,
        padding: d.cardPadding,
        background: '#fff',
        borderRadius: '6px',
      }}>
        <span style={{ fontSize: d.fontSize, fontWeight: 600 }}>数据列表</span>
        {self.renderDensityToggle.call(self, d)}
      </div>

      {/* 数据列表 */}
      {_customState.dataList.length === 0
        ? <div style={{ textAlign: 'center', padding: '40px', color: '#bfbfbf', fontSize: d.fontSize }}>暂无数据</div>
        : _customState.dataList.map(function (item) {
            return self.renderDataCard.call(self, item, d);
          })
      }
    </div>
  );
}
```

---

## 响应式降级规则

| 设备 | 默认密度 | 说明 |
| --- | --- | --- |
| PC 端 | comfortable | 平衡信息量与可读性 |
| 移动端 | spacious | 触控友好，避免误操作 |
| 大屏展示 | spacious | 字体更大，远距离可读 |

在 `didMount` 中自动检测并降级：

```javascript
export function didMount() {
  if (this.utils.isMobile()) {
    _customState.density = 'spacious';
  }
}
```

---

## 何时提供密度切换 UI

| 场景 | 是否提供切换 |
| --- | --- |
| 数据量大的列表/表格页 | ✅ 提供，让用户自选 |
| 固定展示的报表/大屏 | ❌ 不提供，直接用 spacious |
| 移动端页面 | ❌ 不提供，固定 spacious |
| 表单填写页 | ❌ 不提供，固定 comfortable |

---

## AI 生成页面时的决策规则

1. **用户未指定密度** → 根据场景自动选择（见「何时使用」表格）
2. **用户说"紧凑/密集/更多信息"** → 使用 `compact`
3. **用户说"宽松/舒适/大字体"** → 使用 `spacious`
4. **列表/表格类页面** → 默认提供密度切换 UI
5. **移动端页面** → 始终使用 `spacious`，不提供切换
