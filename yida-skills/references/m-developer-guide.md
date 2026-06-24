# 宜搭开发者手册核心参考文档

本文档汇总自 [宜搭开发者中心](https://docs.aliwork.com/docs/developer/learning) 官方文档，供 OpenYida CLI 开发时参考查阅。

---

## 一、核心概念体系

### 1.1 全局变量（State）

用于页面状态管理，类似于 React 的 state。

```
创建：通过数据源面板 - 添加变量
读取：this.state.xxx 或 state.xxx（变量绑定场景）
更新：this.setState({ xxx: value }) // 会触发页面重新渲染
```

**内置变量**：
- `urlParams`：获取页面 URL 参数，通过 `this.state.urlParams.xxx` 访问

### 1.2 远程 API（DataSource）

用于 HTTP 异步数据请求。

**创建**：通过数据源面板 - 添加远程 API

**配置项**：

| 配置项 | 说明 |
|-------|------|
| 名称 | 远程 API 唯一标识，需遵守 JS 变量命名规范 |
| 自动加载 | 开启后页面渲染前自动请求 |
| 加载方式 | 串行/并行 |
| 请求地址 | HTTP 接口地址 |
| 请求方式 | JSONP、GET、POST、PUT、DELETE |
| 请求参数 | 查询参数，支持静态或变量绑定 |
| 数据处理 | willFetch/fit/didFetch/onError 四阶段切片 |

**数据处理函数**：

```javascript
// 1. willFetch - 请求发送前修改参数
function willFetch(vars, config) {
  vars.data.a = 1;
  config.url = 'https://xxx.com';
}

// 2. fit - 响应数据适配
function fit(response) {
  return { content: response.content, success: true };
}

// 3. didFetch - 成功返回后处理
function didFetch(content) {
  return content;
}

// 4. onError - 错误处理
function onError(error) {
  console.log(error);
}
```

**API 调用**：

```javascript
// 手动加载
this.dataSourceMap.xxx.load({ pageSize: 10 }).then(res => {});

// 重新加载所有自动加载数据源
this.reloadDataSource();
```

### 1.3 页面生命周期

| 生命周期 | 说明 | 用途 |
|----------|------|------|
| didMount | 页面首次渲染完成后 | 初始化、绑定事件 |
| willUnmount | 页面卸载前 | 清理监听、解绑事件 |

```javascript
export function didMount() {
  window.addEventListener('resize', this.onResize);
}

export function willUnmount() {
  window.removeEventListener('resize', this.onResize);
}
```

### 1.4 事件处理

通过动作面板编写 JS 逻辑，几乎每个组件都提供动作绑定。

```javascript
export function onClick() {
  const value = this.$('textField_xxx').getValue();
  this.setState({ result: `Hello ${value}` });
}

// 获取动作参数
export function onClick() {
  const { name, age } = this.params;
}
```

### 1.5 条件渲染

通过「是否渲染」属性控制组件显隐。

```javascript
// 绑定变量
state.urlParams.showName  // 为 true 时渲染，为 false 时隐藏
```

### 1.6 循环渲染

通过「循环数据」属性实现列表渲染。

```javascript
// 循环上下文（通过 this.item 和 this.index 获取）
this.item      // 当前行数据
this.index    // 当前行索引（从 0 开始）

// 自定义变量名避免冲突
this.student  // 自定义迭代变量名
this.idx     // 自定义索引变量名
```

### 1.7 自定义样式

两种方式：可视面板配置或手工编码。

```css
/* 手工编码模式 */
.textClass:hover { color: blue; }
.textClass::before { content: "•"; }
```

### 1.8 表单校验

内置校验规则 + 自定义校验函数。

```javascript
// 常用校验规则
{ type: 'required' }
{ type: 'minLength', param: '2' }
{ type: 'maxLength', param: '10' }
{ type: 'email' }
{ type: 'mobile' }
{ type: 'url' }
{ type: 'minValue', param: '0' }
{ type: 'maxValue', param: '100' }

// 自定义校验
function validateRule(value) {
  return /^杭州/.test(value);  // 返回 boolean
}
```

---

## 二、宜搭 JS-API 完整参考

### 2.1 全局变量 API

```javascript
this.state.xxx              // 读取全局变量
this.setState({ xxx: val })  // 更新全局变量并触发渲染
```

### 2.2 远程数据 API

```javascript
this.dataSourceMap.xxx.load(params)  // 手动调用远程 API
this.reloadDataSource()            // 重新加载所有自动加载数据源
```

### 2.3 工具类 API

```javascript
// 对话框
this.utils.dialog({ type: 'confirm', title: '标题', content: '内容', onOk: () => {}, onCancel: () => {} })

// 格式化
this.utils.formatter('date', new Date(), 'YYYY-MM-DD')
this.utils.formatter('money', '10000', ',')
this.utils.formatter('cnmobile', '+8615652988282')
this.utils.formatter('card', '1565298828212233')

// 时间区间
this.utils.getDateTimeRange()              // 默认当天
this.utils.getDateTimeRange(new Date(), 'month')  // 指定日期和类型

// 用户信息
this.utils.getLocale()              // 获取当前语言环境
this.utils.getLoginUserId()         // 获取登录用户 ID
this.utils.getLoginUserName()       // 获取登录用户名称

// 环境判断
this.utils.isMobile()             // 是否移动端
this.utils.isSubmissionPage()    // 是否提交页
this.utils.isViewPage()        // 是否查看页

// 脚本加载
this.utils.loadScript('https://xxx.js').then(() => {})

// 页面跳转
this.utils.openPage('/workbench')

// 图片预览
this.utils.previewImage({ current: 'url' })

// 消息提醒
this.utils.toast({ type: 'success', title: '成功', duration: 3000 })
```

### 2.4 路由 API

```javascript
// 跳转
this.utils.router.push(path, params, blank, isUrl, type)
this.utils.router.replace(path, params)

// 参数获取
this.utils.router.getQuery(key)           // 获取 URL 参数
this.utils.router.stringifyQuery({ a: '1' })  // 序列化参数
```

### 2.5 组件通用 API

```javascript
// 获取属性
this.$(fieldId).get(prop)

// 设置属性
this.$(fieldId).set(prop, value)
```

### 2.6 表单组件 API

```javascript
// 获取组件实例
this.$(fieldId)

// 值操作
this.$(fieldId).getValue()
this.$(fieldId).setValue(value, { doNotValidate: false, formatted: false, triggerChange: true })
this.$(fieldId).reset(toDefault)

// 状态操作
this.$(fieldId).getBehavior()     // NORMAL | READONLY | DISABLED | HIDDEN
this.$(fieldId).setBehavior('DISABLED')
this.$(fieldId).resetBehavior()

// 校验操作
this.$(fieldId).validate((errors, values) => {})
this.$(fieldId).disableValid()
this.$(fieldId).enableValid(doValidate)
this.$(fieldId).setValidation([
  { type: 'required' },
  { type: 'maxLength', param: '10' },
  { type: 'customValidate', param: (value) => true, message: '错误提示' }
])
this.$(fieldId).resetValidation()
```

### 2.7 对话框组件 API

```javascript
this.$(fieldId).show(callback)
this.$(fieldId).hide()
```

---

## 三、跨应用数据源 API（OpenAPI）

### 3.1 请求路径格式

```
/dingtalk/web/{appType}/{接口路径}
```

例如：`/dingtalk/web/APP_XXX/v1/form/searchFormDatas.json`

### 3.2 表单相关 API

| API | 路径 | 方法 | 说明 |
|-----|------|------|------|
| 新建表单实例 | `/v1/form/saveFormData.json` | POST | 提交表单数据 |
| 更新表单 | `/v1/form/updateFormData.json` | POST | 更新指定实例 |
| 删除表单 | `/v1/form/deleteFormData.json` | POST | 删除指定实例 |
| 查询详情 | `/v1/form/getFormDataById.json` | GET | 获取单条详情 |
| 搜索 ID 列表 | `/v1/form/searchFormDataIds.json` | GET | 条件搜索 |
| 搜索详情列表 | `/v1/form/searchFormDatas.json` | GET | 条件搜索 |
| 获取表单定义 | `/v1/form/getFormComponentDefinationList.json` | GET | 获取字段定义 |
| 获取子表单 | `/v1/form/listTableDataByFormInstIdAndTableId.json` | GET | 获取子表数据 |

### 3.3 流程相关 API

| API | 路径 | 方法 | 说明 |
|-----|------|------|------|
| 发起流程 | `/v1/process/startInstance.json` | POST | 发起审批 |
| 搜索实例 | `/v1/process/getInstanceIds.json` | GET | 条件搜索 |
| 获取详情 | `/v1/process/getInstances.json` | GET | 获取详情列表 |
| 获取详情 | `/v1/process/getInstanceById.json` | GET | 获取单条详情 |
| 删除实例 | `/v1/process/deleteInstance.json` | POST | 删除流程 |
| 终止实例 | `/v1/process/terminateInstance.json` | POST | 终止流程 |
| 执行任务 | `/v1/task/executeTask.json` | POST | 审批任务 |
| 审批记录 | `/v1/process/getOperationRecords.json` | GET | 获取审批记录 |
| 更新实例 | `/v1/process/updateInstance.json` | POST | 更新数据 |

### 3.4 任务中心 API

| API | 路径 | 方法 | 说明 |
|-----|------|------|------|
| 已提交 | `/v1/process/getMySubmitInApp.json` | GET | 我提交的 |
| 待办 | `/v1/task/getTodoTasksInApp.json` | GET | 待处理任务 |
| 已完成 | `/v1/task/getDoneTasksInApp.json` | GET | 已处理任务 |
| 抄送 | `/v1/task/getNotifyMeTasksInApp.json` | GET | 抄送我的 |

### 3.5 数据格式示例

**保存/更新表单数据**：

```json
{
  "textField_xxx": "文本值",
  "numberField_xxx": 100,
  "radioField_xxx": "选项一",
  "checkboxField_xxx": ["选项一", "选项二"],
  "dateField_xxx": 1514736000000,
  "cascadeDate_xxx": ["1514736000000", "1517328000000"],
  "employeeField_xxx": ["workno1", "workno2"],
  "imageField_xxx": [{ "downloadUrl": "url", "name": "file.jpg" }],
  "tableField_xxx": [
    { "textField_xxx": "行1数据" },
    { "textField_xxx": "行2数据" }
  ]
}
```

**条件搜索**：

```json
{
  "textField_xxx": "关键词",          // 模糊搜索
  "numberField_xxx": ["1", "10"],    // 范围搜索
  "dateField_xxx": [1514736000000, 1517414399000],  // 时间范围
  "employeeField_xxx": ["workno1"]     // 精确匹配
}
```

---

## 四、设计器功能说明

### 4.1 总体框架

五个功能区域：

1. **顶部导航栏**：页面名称、预览、保存
2. **左侧工具栏**：大纲树、组件库、数据源、动作面板
3. **顶部工具栏**：国际化切换、PC/手机切换、历史记录
4. **可视编辑区**：拖拽式页面搭建
5. **右侧工具栏**：属性、样式、高级配置

### 4.2 高级属性配置

| 配置项 | 说明 |
|-------|------|
| 是否渲染 | 条件渲染，绑定布尔变量 |
| 循环数据 | 循环渲染，绑定数组 |
| 唯一标识 | 组件唯一 ID，类似 React key |

### 4.3 数据源面板

- **变量**：全局状态管理
- **远程 API**：HTTP 请求配置
- **多语言**：国际化文案配置

### 4.4 动作面板

- **生命周期**：didMount / willUnmount
- **动作处理函数**：onClick / onChange 等
- **公共函数**：复用函数定义

---

## 五、组件体系总览

### 5.1 布局组件

- 选项卡（TabsLayout）
- 布局容器（RegionalContainer）

### 5.2 基础组件

- 图标（Icon）
- 按钮（Button）
- 文本（Text）
- 图片（Image）
- 链接（Link）
- 链接块（LinkBlock）
- 对话框（Dialog）
- 抽屉（Drawer）
- 视频播放（Video）

### 5.3 表单组件

- 输入框（TextField）
- 多行输入框（TextareaField）
- 数字输入框（NumberField）
- 单选（RadioField）
- 多选（CheckboxField）
- 下拉选择（SelectField）
- 下拉多选（MultiSelectField）
- 日期选择（DateField）
- 日期区间（CascadeDateField）
- 上传图片（ImageField）
- 上传附件（AttachmentField）
- 人员搜索框（EmployeeField）
- 评分（RateField）
- 富文本编辑器（EditorField）
- 级联选择（CascadeSelectField）
- 明细（TableField）

### 5.4 高阶组件

- JSX
- HTML
- Iframe
- 底部通栏（BannerContainer）
- 表格（Table）
- 轮播图（Slider）
- 气泡提示（Balloon）
- 查询（Filter）
- 翻页器（Pagination）
- 树形控件（Tree）
- 菜单（Menu）
- 搜索（Search）
- 进度条（Progress）
- 时间轴（TimeLine）
- 步骤条（Steps）

---

## 六、调试方法

### 6.1 debugger 断点

```javascript
export function onClick() {
  debugger;  // 设置断点
  const value = this.$('textField_xxx').getValue();
}
```

### 6.2 自助调试面板

在 URL 中添加 `__showDevtools` 参数：

```
https://xxx?__showDevtools=true
```

功能：查看数据源变量、表单数据、错误请求、上报日志

### 6.3 Schema 工作台

在 URL 中添加 `__debug` 参数：

```
https://xxx?__debug
```

功能：导入/导出 Schema

### 6.4 移动端 vConsole

```javascript
const vConsole = 'https://g.alicdn.com/code/lib/vConsole/3.11.2/vconsole.min.js';
const js = document.createElement('script');
js.src = vConsole;
document.body.append(js);
js.onload = function() {
  window.vConsole = new window.VConsole();
};
```

---

## 七、常见自定义校验示例

### 7.1 银行卡号校验

```javascript
// Luhn 算法
function validateRule(value) {
  if (value && /^([0-9]{16}|[0-9]{19})$/.test(value)) {
    let total = 0;
    value.split('').reverse().forEach((item, idx) => {
      const num = parseInt(item, 10);
      total += idx % 2 ? 2 * num - (num > 4 ? 9 : 0) : num;
    });
    return total === 0 ? false : total % 10 === 0;
  }
  return false;
}
```

### 7.2 身份证号校验

```javascript
function validateRule(value) {
  if (value && value.length === 18) {
    const coeff = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const laststr = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
    let total = 0;
    for (let i = 0; i < 17; ++i) {
      total += parseInt(value[i], 10) * coeff[i];
    }
    return value[17] === laststr[total % 11];
  }
  return false;
}
```

---

## 八、低代码体系名词解释

| 名词 | 说明 |
|------|------|
| 全局变量 | 页面状态管理，类似 React state |
| 远程 API | HTTP 接口配置，用于数据请求 |
| Schema | 低代码协议，描述页面/组件结构 |
| 组件唯一标识 | 每个组件的全局唯一 ID（fieldId） |
| 页面 | 独立展示界面（表单/报表/自定义页面） |
| 物料 | 可复用的前端能力（组件、区块、模板） |
| 业务组件 | 特定业务域封装的组件 |
| 区块 | 组件组合，形成完整功能块 |
| 模板 | 垂直业务领域的页面模板 |

---

---

## 九、钉钉开放平台核心概念

### 9.1 应用形态

| 形态 | 说明 | 适用场景 |
|------|------|---------|
| H5 微应用 | Web 技术栈，WebView 加载 | 轻量级业务需求 |
| 钉钉小程序 | 独立运行环境，离线包能力 | 复杂交互应用 |
| 企业内部应用 | 仅供本企业使用 | 内部管理系统 |
| 第三方应用 | ISV 服务商开发 | 面向多企业服务 |

### 9.2 关键凭证

| 凭证 | 说明 |
|------|------|
| AppKey | 应用唯一标识（Client ID） |
| AppSecret | 应用安全密钥（Client Secret） |
| access_token | API 访问令牌，有效期 2 小时 |
| userid | 用户唯一标识 |
| agentid | 应用唯一标识 |
| corpId | 企业唯一标识 |
| processCode | 审批流程唯一标识 |

### 9.3 API 分类

**服务端 Open API**：
- 通讯录管理（用户、部门）
- 消息推送（工作通知、群消息）
- 审批管理（流程实例、任务）
- 考勤管理（打卡、排班）
- 日历管理（日程、会议室）

**前端 JSAPI**：
- 企业通讯录选择
- 文件上传下载
- 扫一扫
- 位置定位
- 分享
- 支付

### 9.4 钉钉 JS-API 调用

```javascript
// 1. 异步加载钉钉 JSAPI
export function didMount() {
  this.utils.loadScript('https://g.alicdn.com/dingding/dingtalk-jsapi/3.0.25/dingtalk.open.js');
}

// 2. 调用 JSAPI
export function isDingTalk() {
  return window.navigator && /dingtalk/i.test(window.navigator.userAgent);
}

export function dingAlert() {
  if (window.dd && this.isDingTalk()) {
    window.dd.device.notification.alert({
      message: "测试",
      title: "提示",
      buttonName: "收到",
      onSuccess: function() {},
      onFail: function(err) {}
    });
  }
}
```

---

## 十、宜搭页面 URL 规则

| 页面类型 | URL 格式 |
|---------|---------|
| 应用首页 | `{base}/{appType}/workbench` |
| 表单提交页 | `{base}/{appType}/submission/{formUuid}` |
| 自定义页面 | `{base}/{appType}/custom/{formUuid}` |
| 自定义页面（隐藏导航） | `{base}/{appType}/custom/{formUuid}?isRenderNav=false` |
| 表单详情页 | `{base}/{appType}/formDetail/{formUuid}?formInstId={formInstId}` |
| 表单编辑页 | `{base}/{appType}/formDetail/{formUuid}?formInstId={formInstId}&mode=edit` |

> 拼接 `&corpid={corpId}` 可自动切换组织

---

## 十一、常见问题速查

| 问题 | 解决方案 |
|------|---------|
| 发布时登录失效 | 重新执行 `openyida login` |
| 字段 ID 不确定 | 使用 `openyida get-schema` 获取 |
| 组件唯一标识修改 | 谨慎修改，会影响数据存储 |
| 免登页面无法调用 OpenAPI | 通过 FaaS 或自建服务中转 |
| 移动端调试 | 使用 vConsole 或 `__showDevtools` |

---

> 文档来源：
> - [宜搭开发者中心](https://docs.aliwork.com/docs/developer/learning)
> - [钉钉开放平台](https://open.dingtalk.com/document/development/development-basic-concepts)
> 最后更新：2025