# yida-ppt-slider 使用示例

## 示例 1：创建产品路演幻灯片

### 输入

用户要求：在宜搭内创建一个产品路演 PPT，包含封面、目录、3 个功能介绍页和结束页。

### 执行步骤

```bash
# Step 1：检测环境
openyida env

# Step 2：创建应用（如已有应用则跳过）
openyida create-app "产品演示中心"
# 输出：appType = APP_DEMO123

# Step 3：创建自定义页面
openyida create-page APP_DEMO123 "产品路演2026"
# 输出：formUuid = FORM-PPT001

# Step 4：编写幻灯片代码（见下方代码示例）
# 输出到 project/pages/src/product-ppt.js

# Step 5：发布页面
openyida publish project/pages/src/product-ppt.js APP_DEMO123 FORM-PPT001
```

### 输出

```json
{
  "success": true,
  "pageUrl": "https://www.aliwork.com/APP_DEMO123/custom/FORM-PPT001"
}
```

---

## 示例 2：幻灯片页面核心代码

### 幻灯片数据定义

```javascript
// ── 幻灯片数据（必须定义为顶层常量，不能硬编码在 renderJsx 中）────
var SLIDES = [
  {
    type: 'cover',
    bg: '#ffffff',
    accent: '#0089ff',
    eyebrow: '2026 产品发布',
    title: 'OpenYida 2.0',
    subtitle: 'AI 驱动的低代码开发平台',
    tags: ['AI 原生', '低代码', '企业级'],
  },
  {
    type: 'toc',
    bg: '#ffffff',
    accent: '#0089ff',
    title: '目录',
    items: ['核心能力', '应用场景', '技术架构', '开始使用'],
  },
  {
    type: 'key-points',
    bg: '#ffffff',
    accent: '#0089ff',
    chapter: '01 核心能力',
    title: 'AI 对话驱动开发',
    subtitle: '一句话生成完整应用',
    points: [
      { icon: '🤖', title: 'AI 表单设计', desc: '描述需求，自动生成字段结构' },
      { icon: '⚡', title: '秒级发布', desc: '从需求到上线，最快 5 分钟' },
      { icon: '🔗', title: '全流程覆盖', desc: '创建→配置→发布→数据管理' },
    ],
  },
  {
    type: 'ending',
    bg: '#0089ff',
    accent: '#ffffff',
    title: '立即体验',
    subtitle: 'npm install -g openyida',
    quote: '让 AI 成为你的低代码开发伙伴',
  },
];

// ── 状态 ─────────────────────────────────────────────────────
var _customState = { currentIndex: 0 };
```

### 生命周期与事件绑定

```javascript
// ✅ 使用 didMount 注册键盘事件（由运行时映射到 React componentDidMount）
export function didMount() {
  var self = this;
  _customState.total = SLIDES.length;

  // 键盘翻页（支持演讲笔 PageDown/PageUp）
  this._handleKeyDown = function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') {
      if (_customState.currentIndex < SLIDES.length - 1) {
        _customState.currentIndex++;
        self.forceUpdate();
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      if (_customState.currentIndex > 0) {
        _customState.currentIndex--;
        self.forceUpdate();
      }
    }
  };
  document.addEventListener('keydown', this._handleKeyDown);
}

export function didUnmount() {
  document.removeEventListener('keydown', this._handleKeyDown);
}

export function getCustomState(key) { if (key) return _customState[key]; return Object.assign({}, _customState); }
export function setCustomState(newState) { Object.assign(_customState, newState); this.forceUpdate(); }
export function forceUpdate() { this.setState({ timestamp: new Date().getTime() }); }
```

### 渲染函数

```javascript
export function renderJsx() {
  var state = _customState;
  var slide = SLIDES[state.currentIndex];
  var isMobile = this.utils.isMobile();
  var self = this;

  var handlePrev = function() {
    if (state.currentIndex > 0) { state.currentIndex--; self.forceUpdate(); }
  };
  var handleNext = function() {
    if (state.currentIndex < SLIDES.length - 1) { state.currentIndex++; self.forceUpdate(); }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: slide.bg, overflow: 'hidden',
      padding: '0 !important', borderRadius: '0 !important',
    }}>
      <div style={{ display: 'none' }}>{this.state.timestamp}</div>

      {/* 幻灯片内容区 */}
      <div style={{ padding: isMobile ? '20px 16px' : '48px 80px', height: '100%' }}>
        <h1 style={{ fontSize: isMobile ? '28px' : '48px', color: '#1a1a2e', fontWeight: 800 }}>
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p style={{ fontSize: isMobile ? '16px' : '24px', color: 'rgba(26,26,46,0.7)', marginTop: '16px' }}>
            {slide.subtitle}
          </p>
        )}
      </div>

      {/* 导航按钮 */}
      <div style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button onClick={(e) => { handlePrev(); }} style={{ padding: '8px 20px', borderRadius: '20px', border: '1px solid #d9d9d9', cursor: 'pointer', background: '#fff' }}>
          ← 上一页
        </button>
        <span style={{ lineHeight: '36px', color: '#666' }}>{state.currentIndex + 1} / {SLIDES.length}</span>
        <button onClick={(e) => { handleNext(); }} style={{ padding: '8px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: slide.accent, color: '#fff' }}>
          下一页 →
        </button>
      </div>
    </div>
  );
}
```

### 注意事项

- 事件处理函数必须在 `renderJsx` 顶部定义，不要在 JSX 内部创建内联函数
- 必须在 `didUnmount` 中清理键盘事件监听，防止内存泄漏
- 使用 `position: fixed` 覆盖宜搭默认容器样式
- 图片使用 `objectFit: 'contain'` 确保完整显示
