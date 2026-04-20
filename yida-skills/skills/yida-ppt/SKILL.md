---
name: yida-ppt
description: >
  【已废弃】此技能已合并到 yida-ppt-slider。
  请使用 yida-ppt-slider 技能，并选择 dark-tech 主题。
license: MIT
compatibility:
  - opencode
  - claude-code
  - qoder
  - wukong
metadata:
  audience: developers
  workflow: yida-development
  version: 1.0.0
  tags:
    - yida
    - ppt
    - slides
    - presentation
    - canvas
    - animation
---

> ⚠️ **此技能已废弃（Deprecated）**
> `dark-tech` 主题已合并到 `yida-ppt-slider` 技能中。
> 请使用 `yida-ppt-slider` 技能，并在生成时选择 `dark-tech` 主题。
> 详见：`skills/yida-ppt-slider/SKILL.md` → `## 主题选择（Theme）`

# 宜搭 PPT / 演示文稿开发技能（已废弃）

## ⚡ 首要步骤：先询问用户选择方案

**当用户提到"PPT"、"幻灯片"、"演示文稿"等关键词时，必须先展示以下两种方案，让用户选择后再执行，不要直接开始生成。**

向用户说：

> 我可以用两种方式帮你做 PPT，请选择：
>
> **方案 A · 宜搭 PPT**（本技能）
> 部署到宜搭平台，深色科技风 + Canvas粒子 + 电影级转场，可调用宜搭实时数据，适合嵌入钉钉生态
> 需要：宜搭账号 + `openyida publish` 发布
>
> **方案 B · 独立 HTML 演示文稿**（report-slides 技能）
> 生成一个 HTML 文件，浏览器直接打开，11 种企业级风格可选（Apple / Google / Fluent / Ant Design 等），适合直接发送分享
> 需要：无，生成即用

用户选择 A → 继续执行本技能（yida-ppt）
用户选择 B → 切换到 report-slides 技能

---

## 两种方案对比

| 维度 | 方案 A · 宜搭 PPT | 方案 B · 独立 HTML |
|------|------------------|-------------------|
| **产出物** | 宜搭自定义页面（需发布） | 单个 `.html` 文件 |
| **运行环境** | 宜搭/钉钉平台 | 浏览器直接打开 |
| **设计风格** | 深色科技风（固定） | 11 种风格自选 |
| **数据集成** | ✅ 可调用宜搭实时数据 | ❌ 静态内容 |
| **分享方式** | 宜搭链接 | 发送 HTML 文件 |
| **前提条件** | 需要宜搭账号 | 无 |
| **适合场景** | 企业培训、产品发布、钉钉生态 | 汇报、复盘、直接分享 |

---

## 概述

本技能用于在宜搭自定义页面上开发**全屏幻灯片演示应用**，设计体系来源于 `wukong-openyida-training-v2.js` 实战案例。

**设计体系：深色科技风 + Canvas粒子 + 电影级转场 + 玻璃态卡片**

---

## 文件结构

```
project/pages/src/<页面名>.js   ← JSX 源码（本技能的产出物）
```

编译发布使用 `yida-publish-page` 技能：
```bash
openyida publish project/pages/src/<页面名>.js <appType> <pageId>
```

---

## 设计体系速查

### 颜色主题（深色科技风）

| 角色 | 颜色值 | 用途 |
|------|--------|------|
| 主色蓝 | `#3b82f6` / `rgba(59,130,246,x)` | 主要强调、粒子、进度条 |
| 主色紫 | `#a855f7` / `rgba(139,92,246,x)` | 章节高亮、光晕 |
| 主色绿 | `#10b981` / `rgba(16,185,129,x)` | 正向指标、成功状态 |
| 主色粉 | `#ec4899` / `rgba(236,72,153,x)` | 渐变点缀 |
| 背景色 | `#0B0F19` | 全局背景（最深黑） |
| 文字主色 | `#fff` / `#e5e7eb` | 标题 / 正文 |
| 文字次色 | `#9ca3af` | 副标题、描述 |
| 文字弱色 | `#6b7280` | 时间、标签 |

### 字体

```css
font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
```

引入方式：`@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap");`

---

## 核心代码模板

### 1. CSS 动画（必须完整复制）

```jsx
var CSS_ANIMATIONS = [
  '@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap");',
  '*{font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;box-sizing:border-box}',
  '#__lowcode_devtool_switch__,[id="__lowcode_devtool_switch__"]{display:none!important;visibility:hidden!important}',
  '@keyframes fadeIn{from{opacity:0;transform:scale(1.02)}to{opacity:1;transform:scale(1)}}',
  '@keyframes gridMove{0%{transform:translate(0,0)}100%{transform:translate(60px,60px)}}',
  '@keyframes glowPulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.8;transform:scale(1.1)}}',
  '@keyframes ip{0%{opacity:0;transform:scale(.85) translateY(8px)}100%{opacity:1;transform:scale(1) translateY(0)}}',
  '@keyframes fu{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}',
  '@keyframes df{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}',
  '@keyframes cineZoom{0%{opacity:0;transform:scale(1.4);filter:blur(30px) brightness(1.8)}40%{opacity:.7;transform:scale(1.08);filter:blur(8px) brightness(1.2)}100%{opacity:1;transform:scale(1);filter:blur(0) brightness(1)}}',
  '@keyframes cineParallax{0%{opacity:0;transform:translateX(-120px) scale(1.05);filter:blur(12px)}60%{opacity:.8;transform:translateX(10px) scale(1.01);filter:blur(2px)}100%{opacity:1;transform:translateX(0) scale(1);filter:blur(0)}}',
  '@keyframes cineRise{0%{opacity:0;transform:translateY(100px);filter:blur(10px)}60%{opacity:.85;transform:translateY(-5px);filter:blur(1px)}100%{opacity:1;transform:translateY(0);filter:blur(0)}}',
  '@keyframes cineGlitch{0%{opacity:0;transform:scale(1.06);filter:hue-rotate(90deg) saturate(3) blur(15px)}20%{transform:translate(-6px,3px) scale(1.02);filter:hue-rotate(-20deg) blur(2px)}50%{opacity:1;transform:translate(0) scale(1);filter:hue-rotate(0) saturate(1)}100%{opacity:1;transform:translate(0) scale(1);filter:none}}',
  '@keyframes cineIris{0%{opacity:0;clip-path:circle(0% at 50% 50%);filter:brightness(2)}60%{opacity:1;clip-path:circle(70% at 50% 50%);filter:brightness(1.1)}100%{opacity:1;clip-path:circle(100% at 50% 50%);filter:brightness(1)}}',
  '@keyframes cineGrand{0%{opacity:0;transform:scale(.7);filter:blur(20px) brightness(2)}50%{opacity:.8;transform:scale(1.02);filter:blur(3px) brightness(1.1)}100%{opacity:1;transform:scale(1);filter:blur(0) brightness(1)}}',
  '@keyframes chapterGlow{0%,100%{opacity:.4;transform:scale(1)}30%{opacity:.85;transform:scale(1.25)}60%{opacity:.5;transform:scale(1.1)}}',
  '@keyframes titleCinematic{0%{opacity:0;transform:translateY(50px);filter:blur(10px);letter-spacing:12px}60%{letter-spacing:-1px}100%{opacity:1;transform:translateY(0);filter:blur(0);letter-spacing:-2px}}',
  '@keyframes subtitleCinematic{0%{opacity:0;transform:translateY(35px);filter:blur(6px)}100%{opacity:1;transform:translateY(0);filter:blur(0)}}',
  '@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(139,92,246,.4)}50%{box-shadow:0 0 40px rgba(139,92,246,.8)}}',
  '@keyframes floatUp{0%{opacity:0;transform:translateY(40px)}100%{opacity:1;transform:translateY(0)}}',
  '@keyframes tagSlideIn{0%{opacity:0;transform:translateY(-25px) scale(.8);filter:blur(6px)}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}}',
  ':-webkit-full-screen{width:100vw!important;height:100vh!important}',
  ':fullscreen{width:100vw!important;height:100vh!important}'
].join('\n');
```

### 2. 转场配置

```jsx
// 每张幻灯片的转场动画（key=幻灯片编号，value=动画名）
var slideTransitions = {
  1: 'cineZoom',      // 封面：缩放模糊入场
  2: 'cineParallax',  // 内容页：横向视差
  3: 'fadeIn',        // 普通淡入
  // 章节页推荐：cineGlitch / cineIris / cineRise / cineGrand
};

// 章节页编号（会额外渲染网格动画和光晕）
var chapterSlides = [1, 5, 10];

// 章节页背景图（Unsplash 科技风图片，可替换）
var chapterImages = {
  1: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1280&auto=format&fit=crop',
  5: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1280&auto=format&fit=crop',
};
```

**转场动画说明：**

| 动画名 | 效果 | 适用场景 |
|--------|------|----------|
| `cineZoom` | 缩放 + 模糊 + 亮度 | 封面、重要开场 |
| `cineParallax` | 横向视差滑入 | 内容页 |
| `cineRise` | 从下方升起 | 总结、结尾 |
| `cineGlitch` | 故障艺术 + 色相旋转 | 技术页、震撼转场 |
| `cineIris` | 圆形光圈展开 | 章节切换 |
| `cineGrand` | 宏大缩放 | 高潮页、大数据 |
| `fadeIn` | 普通淡入缩放 | 普通内容页 |

### 3. 公共样式预设（S 对象）

```jsx
var S = {
  // 大标题（封面用）
  st: { fontSize: '72px', fontWeight: 900, color: '#fff', marginBottom: '36px', letterSpacing: '-2px', lineHeight: 1.15, textShadow: '0 0 40px rgba(59,130,246,.5)' },
  // 章节标题
  stSts: { fontSize: '52px', fontWeight: 900, color: '#fff', marginBottom: '28px', letterSpacing: '-1px', lineHeight: 1.2, textShadow: '0 0 30px rgba(59,130,246,.4)' },
  // 副标题
  ss: { fontSize: '28px', fontWeight: 300, color: '#9ca3af', marginBottom: '44px', letterSpacing: '2px' },
  // 标签徽章（蓝色边框）
  tg: { display: 'inline-block', background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', borderRadius: '20px', padding: '8px 24px', fontSize: '18px', color: '#60a5fa', marginBottom: '28px', letterSpacing: '2px', fontWeight: 500 },
  // 渐变流动文字（彩虹标题）
  gt: { background: 'linear-gradient(90deg,#3b82f6,#a855f7,#10b981,#3b82f6)', backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'df 6s ease infinite' },
  // 玻璃态卡片（核心组件）
  cd: { background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '32px', textAlign: 'left' },
  // 卡片标题
  ct: { fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '10px' },
  // 卡片正文
  cx: { fontSize: '22px', color: '#9ca3af', lineHeight: 1.6 },
  // 高亮色（蓝/绿/紫/橙/粉）
  hl: { color: '#3b82f6', fontWeight: 700 },
  hs: { color: '#10b981', fontWeight: 700 },
  hp: { color: '#a855f7', fontWeight: 700 },
  hw: { color: '#f59e0b', fontWeight: 700 },
  hr: { color: '#ec4899', fontWeight: 700 },
};
```

### 4. Canvas 粒子系统

```jsx
export function initParticles() {
  var canvas = document.getElementById('ppt-particles');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var particles = [];
  var COUNT = 50;
  var DIST = 130;
  var colors = ['59,130,246', '147,51,234', '16,185,129'];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }

  function init() {
    resize();
    particles = [];
    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        c: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + p.c + ',.6)';
      ctx.fill();
    }
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(59,130,246,' + (0.08 * (1 - d / DIST)).toFixed(3) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    _customState._animFrame = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', function() { resize(); init(); });
  document.addEventListener('fullscreenchange', function() { setTimeout(function() { resize(); init(); }, 50); });
  document.addEventListener('webkitfullscreenchange', function() { setTimeout(function() { resize(); init(); }, 50); });
  init();
  draw();
}
```

### 5. 背景层渲染

```jsx
export function renderBgLayers(isChapter) {
  return (
    <div>
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 20% 30%,rgba(59,130,246,.15) 0%,transparent 50%),' +
                    'radial-gradient(ellipse at 80% 70%,rgba(139,92,246,.12) 0%,transparent 50%),' +
                    'radial-gradient(ellipse at 50% 50%,rgba(11,15,25,.8) 0%,rgba(0,0,0,1) 100%)'
      }} />
      {isChapter && <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(59,130,246,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,.03) 1px,transparent 1px)',
        backgroundSize: '60px 60px', animation: 'gridMove 20s linear infinite'
      }} />}
      {isChapter && <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none',
        background: 'radial-gradient(circle at 50% 50%,rgba(59,130,246,.08) 0%,transparent 70%)',
        animation: 'chapterGlow 6s ease-in-out infinite'
      }} />}
    </div>
  );
}
```

### 6. 幻灯片包装器（转场 + 布局）

```jsx
export function renderSlideWrapper(slideNum, content) {
  var cur = _customState.currentSlide;
  if (cur !== slideNum) return null;
  var isChapter = chapterSlides.indexOf(slideNum) >= 0;
  var tr = slideTransitions[slideNum] || 'fadeIn';
  var trStyle = { animation: tr + ' 1.2s cubic-bezier(.25,.46,.45,.94) both' };
  var bgImg = chapterImages[slideNum];
  return (
    <div style={Object.assign({
      width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center'
    }, trStyle)}>
      {this.renderBgLayers(isChapter)}
      {bgImg && <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        backgroundImage: 'url(' + bgImg + ')', backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: isChapter ? 0.15 : 0.1, zIndex: 0
      }} />}
      <div style={{
        position: 'relative', zIndex: 10, margin: 'auto', padding: '36px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', width: '100%', height: '100%', boxSizing: 'border-box'
      }}>
        {content}
      </div>
    </div>
  );
}
```

### 7. 通用内容页（带标签 + 标题 + 副标题 + 正文）

```jsx
export function renderGenericSlide(num, partTag, title, subtitle, bodyJsx) {
  return this.renderSlideWrapper(num,
    <div style={{ width: '100%' }}>
      {partTag && <div style={S.tg}>{partTag}</div>}
      <div style={S.stSts}>{title}</div>
      {subtitle && <div style={S.ss}>{subtitle}</div>}
      <div style={{ width: '100%', animation: 'fu 1.2s ease-out .8s both' }}>{bodyJsx}</div>
    </div>
  );
}
```

### 8. 状态管理

```jsx
var _customState = {
  currentSlide: 1,
  totalSlides: 10,  // 修改为实际幻灯片总数
  isFullscreen: false,
};

export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) { _customState[key] = newState[key]; });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}
```

### 9. 生命周期（didMount / didUnmount）

```jsx
export function didMount() {
  var self = this;
  _customState.totalSlides = 10; // 修改为实际总数

  // 隐藏宜搭顶部导航栏（全屏沉浸式）
  var hideNavStyle = document.createElement('style');
  hideNavStyle.textContent = [
    '.china-area-header { display: none !important; }',
    '.yida-china-area-header { display: none !important; }',
    '.header-area { display: none !important; }',
    '.aliwork-header { display: none !important; }',
    '.next-shell-header { display: none !important; }',
    '#china-area-header { display: none !important; }',
    '.yida-header { display: none !important; }',
    '.china-area-content { padding-top: 0 !important; }',
    '.yida-china-area-content { padding-top: 0 !important; }',
  ].join(' ');
  document.head.appendChild(hideNavStyle);

  // 键盘导航
  self._handleKeyDown = function(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault(); self.changeSlide(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault(); self.changeSlide(-1);
    } else if (e.key === 'Home') {
      e.preventDefault(); self.goToSlide(1);
    } else if (e.key === 'End') {
      e.preventDefault(); self.goToSlide(_customState.totalSlides);
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault(); self.toggleFullscreen();
    }
  };
  document.addEventListener('keydown', self._handleKeyDown);

  // 全屏状态同步
  self._handleFullscreenChange = function() {
    _customState.isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    self.forceUpdate();
  };
  document.addEventListener('fullscreenchange', self._handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', self._handleFullscreenChange);

  // 触摸滑动
  self._touchStartX = 0;
  self._handleTouchStart = function(e) { self._touchStartX = e.changedTouches[0].screenX; };
  self._handleTouchEnd = function(e) {
    var diff = self._touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) { self.changeSlide(diff > 0 ? 1 : -1); }
  };
  document.addEventListener('touchstart', self._handleTouchStart);
  document.addEventListener('touchend', self._handleTouchEnd);

  // 初始化粒子（延迟确保 DOM 就绪）
  setTimeout(function() { self.initParticles(); }, 500);
}

export function didUnmount() {
  document.removeEventListener('keydown', this._handleKeyDown);
  document.removeEventListener('touchstart', this._handleTouchStart);
  document.removeEventListener('touchend', this._handleTouchEnd);
  document.removeEventListener('fullscreenchange', this._handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', this._handleFullscreenChange);
  if (_customState._animFrame) cancelAnimationFrame(_customState._animFrame);
}
```

### 10. 导航函数

```jsx
export function goToSlide(n) {
  if (n < 1 || n > _customState.totalSlides) return;
  _customState.currentSlide = n;
  this.forceUpdate();
}

export function changeSlide(dir) {
  var next = _customState.currentSlide + dir;
  if (next < 1) next = 1;
  if (next > _customState.totalSlides) next = _customState.totalSlides;
  this.goToSlide(next);
}

export function toggleFullscreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    var el = document.documentElement;
    if (el.requestFullscreen) { el.requestFullscreen(); }
    else if (el.webkitRequestFullscreen) { el.webkitRequestFullscreen(); }
  } else {
    if (document.exitFullscreen) { document.exitFullscreen(); }
    else if (document.webkitExitFullscreen) { document.webkitExitFullscreen(); }
  }
  var self = this;
  setTimeout(function() { self.forceUpdate(); }, 100);
}
```

### 11. 主渲染函数（renderJsx）

```jsx
export function renderJsx() {
  var self = this;
  var cur = _customState.currentSlide;
  var total = _customState.totalSlides;
  var isFull = _customState.isFullscreen;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0B0F19', overflow: 'hidden', margin: 0, padding: 0, borderRadius: 0 }}>
      <div style={{ display: 'none' }}>{this.state.timestamp}</div>
      <style dangerouslySetInnerHTML={{ __html: CSS_ANIMATIONS }} />
      <canvas id="ppt-particles" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none', opacity: 0.35 }} />
      <div style={{ position: 'relative', zIndex: 2, width: '100vw', height: '100vh' }}>
        {this.renderSlide1()}
        {this.renderSlide2()}
        {/* 按需添加更多幻灯片 */}
      </div>
      {/* 全屏按钮（右上角） */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 102, opacity: 0.3, transition: 'opacity .3s ease', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        onClick={function() { self.toggleFullscreen(); }}
        onMouseEnter={function(e) { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={function(e) { e.currentTarget.style.opacity = '0.3'; }}
        title={isFull ? '退出全屏 (F)' : '全屏 (F)'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d={isFull ? 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z' : 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'} /></svg>
      </div>
      {/* 底部导航栏 */}
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '50px', padding: '10px 25px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={function() { self.goToSlide(1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={function() { self.changeSlide(-1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /></svg>
        </div>
        <div style={{ width: '120px', height: '3px', background: 'rgba(255,255,255,.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)', borderRadius: '2px', width: (cur / total * 100) + '%', transition: 'width .5s ease' }} />
        </div>
        <div style={{ color: '#9ca3af', fontSize: '18px', minWidth: '60px', textAlign: 'center' }}>{cur} / {total}</div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={function() { self.changeSlide(1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" /></svg>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(255,255,255,.05)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={function() { self.goToSlide(total); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
        </div>
      </div>
      {/* 顶部全宽进度条 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: (cur / total * 100) + '%', height: '3px', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6,#ec4899)', transition: 'width 0.3s ease', boxShadow: '0 0 10px rgba(139,92,246,.5), 0 0 20px rgba(139,92,246,.3)', zIndex: 101 }} />
    </div>
  );
}
```

---

## 常用 UI 组件片段

### 玻璃态卡片

```jsx
// 基础玻璃态卡片
<div style={{ background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '16px', padding: '32px' }}>
  {/* 内容 */}
</div>

// 高亮玻璃态卡片（带顶部渐变边 + 光晕）
<div style={{ background: 'rgba(139,92,246,.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(139,92,246,.3)', borderRadius: '16px', padding: '32px', position: 'relative', overflow: 'hidden' }}>
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #a855f7, #ec4899, #3b82f6)', borderRadius: '16px 16px 0 0' }} />
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(180deg, rgba(168,85,247,.1), transparent)', pointerEvents: 'none' }} />
  {/* 内容 */}
</div>
```

### 渐变分隔线

```jsx
<div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,.3), rgba(59,130,246,.3), transparent)', margin: '20px 0' }} />
```

### 光晕分割线（标题下方）

```jsx
<div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg,#3b82f6,#a855f7,#ec4899)', borderRadius: '2px', margin: '0 auto 40px', boxShadow: '0 0 20px rgba(139,92,246,.4)', animation: 'glow 3s ease-in-out infinite' }} />
```

### 标签徽章

```jsx
// 蓝色标签
<div style={{ display: 'inline-block', background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', borderRadius: '20px', padding: '8px 24px', fontSize: '18px', color: '#60a5fa', letterSpacing: '2px', fontWeight: 500 }}>PART 01</div>

// 绿色标签
<div style={{ display: 'inline-block', background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', borderRadius: '20px', padding: '6px 18px', fontSize: '16px', color: '#34d399' }}>已完成</div>
```

### 渐变流动文字（彩虹标题）

```jsx
<span style={{ background: 'linear-gradient(90deg,#3b82f6,#a855f7,#10b981,#3b82f6)', backgroundSize: '300% 300%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'df 6s ease infinite' }}>
  标题文字
</span>
```

### 玻璃态图标按钮

```jsx
<a href="https://example.com" target="_blank" style={{ color: '#9ca3af', fontSize: '18px', textDecoration: 'none', background: 'rgba(255,255,255,.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,.1)', borderRadius: '24px', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
  链接文字
</a>
```

### 金句高亮条（左边框）

```jsx
<div style={{ background: 'rgba(139,92,246,.08)', border: '1px solid rgba(139,92,246,.25)', borderLeft: '3px solid #a855f7', borderRadius: '0 10px 10px 0', padding: '12px 20px' }}>
  <div style={{ fontSize: '16px', color: '#e2e8f0', lineHeight: 1.6 }}>金句内容</div>
</div>
```

### 数据指标卡

```jsx
<div style={{ textAlign: 'center', padding: '20px' }}>
  <div style={{ fontSize: '56px', fontWeight: 900, color: '#3b82f6', lineHeight: 1, marginBottom: '8px' }}>4000万+</div>
  <div style={{ fontSize: '18px', color: '#9ca3af' }}>指标说明</div>
</div>
```

### 三列网格卡片

```jsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', width: '100%' }}>
  {items.map(function(item, i) {
    return (
      <div key={i} style={{ background: 'rgba(255,255,255,.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '14px', padding: '24px 20px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', marginBottom: '10px' }}>{item.title}</div>
        <div style={{ fontSize: '16px', color: '#9ca3af', lineHeight: 1.6 }}>{item.desc}</div>
      </div>
    );
  })}
</div>
```

### 时间轴

```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
  {timeline.map(function(t, i) {
    return (
      <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px', flexShrink: 0, boxShadow: '0 0 10px rgba(59,130,246,.5)' }} />
        <div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>{t.period}</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{t.title}</div>
        </div>
      </div>
    );
  })}
</div>
```

---

## 封面页模板（renderSlide1）

```jsx
export function renderSlide1() {
  return this.renderSlideWrapper(1,
    <div>
      <div style={{ fontSize: '18px', color: '#60a5fa', letterSpacing: '8px', marginBottom: '36px', fontWeight: 500 }}>YOUR BRAND · SUBTITLE</div>
      <div style={{ fontSize: '72px', fontWeight: 900, color: '#fff', marginBottom: '28px', letterSpacing: '-2px', lineHeight: 1.15, textShadow: '0 0 40px rgba(59,130,246,.5)', animation: 'titleCinematic 1.1s cubic-bezier(.25,.46,.45,.94) .35s both' }}>
        <span style={S.gt}>主标题</span>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 300, color: '#e5e7eb', marginBottom: '16px', animation: 'subtitleCinematic 1s cubic-bezier(.25,.46,.45,.94) .55s both' }}>副标题</div>
      <div style={{ fontSize: '24px', fontWeight: 300, color: '#9ca3af', marginBottom: '48px', letterSpacing: '2px', animation: 'subtitleCinematic 1s cubic-bezier(.25,.46,.45,.94) .65s both' }}>描述文字</div>
      <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg,#3b82f6,#a855f7,#ec4899)', borderRadius: '2px', margin: '0 auto 40px', boxShadow: '0 0 20px rgba(139,92,246,.4)', animation: 'glow 3s ease-in-out infinite' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fu 1.2s ease-out 1s both' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#fff', fontSize: '26px', fontWeight: 700 }}>讲师姓名</div>
          <div style={{ color: '#6b7280', fontSize: '20px', marginTop: '12px' }}>职位 / 单位</div>
        </div>
      </div>
    </div>
  );
}
```

---

## 动画入场时序规范

内容元素按层级依次入场，使用 `animation: 'fu 1.2s ease-out Xs both'` 控制延迟：

| 元素 | 延迟 | 说明 |
|------|------|------|
| 标签徽章 | `0s` | 最先出现 |
| 主标题 | `0.2s` | 使用 `titleCinematic` |
| 副标题 | `0.4s` | 使用 `subtitleCinematic` |
| 分割线 | `0.5s` | 使用 `fu` |
| 第一行卡片 | `0.6s` | 使用 `fu` |
| 第二行卡片 | `0.8s` | 使用 `fu` |
| 底部金句 | `1.0s` | 使用 `fu` |

---

## 注意事项

1. **🚨 禁止 import/require**：文件顶部不能有任何 `import` 或 `require` 语句（包括 `import { Component } from 'react'`），宜搭沙箱不支持，会导致 `require is not defined` 报错页面崩溃
2. **Canvas ID 唯一性**：`id="ppt-particles"` 在整个页面中必须唯一
3. **宜搭 JSX 限制**：使用 React 16 语法，不支持 hooks，状态通过 `_customState` 对象管理
4. **事件绑定用箭头函数**：JSX 中事件绑定必须用箭头函数 `onClick={() => { self.xxx(); }}`，不能用 `onClick={function() { self.xxx(); }}`
5. **禁止 ES6 计算属性名**：`{ [key]: value }` 宜搭 JS 引擎不支持，改用 `var obj = {}; obj[key] = value;`
6. **样式写法**：所有样式用 React 内联对象，`camelCase` 属性名（如 `backgroundColor`、`backdropFilter`）
7. **`WebkitBackdropFilter`**：Safari 兼容，必须与 `backdropFilter` 同时写
8. **`dangerouslySetInnerHTML`**：CSS 动画通过 `<style dangerouslySetInnerHTML={{ __html: CSS_ANIMATIONS }} />` 注入
9. **全屏适配**：`position: 'fixed'` + `top/left/right/bottom: 0` 确保全屏覆盖
10. **粒子初始化延迟**：`setTimeout(initParticles, 500)` 确保 Canvas DOM 已挂载
11. **编译发布**：源码编写完成后用 `openyida publish` 命令编译并发布到宜搭

---

## 参考案例

- **完整实现**：`project/pages/src/wukong-openyida-training-v2.js`（25页企业培训PPT，706KB）
  - 包含：Canvas粒子、6种电影级转场、玻璃态卡片、讲师备注面板、全屏支持、键盘/触摸导航
  - 设计体系：深色科技风，主色 #3b82f6 / #a855f7 / #10b981
