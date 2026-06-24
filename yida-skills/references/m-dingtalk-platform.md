# 钉钉开放平台核心参考文档

本文档汇总自钉钉开放平台官方文档，供开发时参考。

---

## 一、平台架构

### 1.1 应用类型

| 类型 | 说明 | 适用范围 |
|------|------|---------|
| 企业内部应用 | 企业管理员创建，仅供本企业 | 内部管理系统 |
| 第三方企业应用 | ISV 服务商开发，面向多企业 | SaaS 服务 |
| 第三方个人应用 | 个人开发者创建 | 轻量工具 |

### 1.2 应用形态

| 形态 | 技术栈 | 特点 |
|------|--------|------|
| H5 微应用 | Web (HTML/CSS/JS) | 快速开发，跨平台 |
| 钉钉小程序 | 专用开发框架 | 原生体验，离线包 |

---

## 二、关键概念

### 2.1 凭证体系

| 凭证 | 用途 | 有效期 |
|------|------|--------|
| AppKey | 应用唯一标识 | 长期 |
| AppSecret | 应用安全密钥 | 长期 |
| access_token | API 调用凭证 | 7200 秒（2小时） |
| jsapi_ticket | JSAPI 签名凭证 | 7200 秒 |

### 2.2 组织架构

| 概念 | 说明 |
|------|------|
| corpId | 企业唯一标识 |
| userid | 用户在企业中的唯一 ID |
| departmentId | 部门 ID |

### 2.3 审批相关

| 概念 | 说明 |
|------|------|
| processCode | 审批流程模板唯一标识 |
| processInstanceId | 审批实例唯一 ID |
| taskId | 审批任务 ID |

---

## 三、服务端 API

### 3.1 认证流程

```
1. 获取 appkey + appsecret
2. 调用 /gettoken 获取 access_token
3. 携带 access_token 调用目标 API
```

### 3.2 常用 API 分类

**通讯录**：
- `/user/list` - 获取部门用户列表
- `/user/get` - 获取用户详情
- `/department/list` - 获取部门列表

**消息**：
- `/message/send` - 发送工作通知
- `/robot/send` - 发送群消息

**审批**：
- `/processinstance/list` - 审批实例列表
- `/processinstance/get` - 审批实例详情

**考勤**：
- `/attendance/listRecord` - 打卡记录

**日历**：
- `/calendar/event/create` - 创建日程
- `/calendar/freebusy` - 查询闲忙

### 3.3 API 调用示例

```javascript
// 获取 access_token
const getTokenUrl = 'https://api.dingtalk.com/gettoken?appkey=xxx&appsecret=xxx';
const tokenRes = await fetch(getTokenUrl).then(r => r.json());
const accessToken = tokenRes.access_token;

// 调用 API
const apiUrl = 'https://api.dingtalk.com/topapi/user/list?access_token=' + accessToken;
const params = { dept_id: 1 };
```

---

## 四、前端 JSAPI

### 4.1 引入方式

```html
<script src="https://g.alicdn.com/dingding/dingtalk-jsapi/3.0.25/dingtalk.open.js"></script>
```

### 4.2 常用 API 分类

**设备能力**：
- `dd.device.notification.alert` - 弹框
- `dd.device.notification.confirm` - 确认框
- `dd.device.scan` - 扫一扫
- `dd.device.location.get` - 获取位置

**通讯录**：
- `dd.biz.contact.choose` - 选择联系人
- `dd.biz.contact.complexPicker` - 部门人员选择

**文件**：
- `dd.biz.util.uploadImage` - 上传图片
- `dd.biz.util.downloadFile` - 下载文件

**分享**：
- `dd.biz.share.share` - 分享

### 4.3 调用示例

```javascript
// 判断是否在钉钉端内
function isDingTalk() {
  return /dingtalk/i.test(navigator.userAgent);
}

// 弹框
dd.device.notification.alert({
  message: '内容',
  title: '标题',
  buttonName: '确定',
  onSuccess: () => {},
  onFail: () => {}
});

// 扫一扫
dd.device.scan({
  type: 'qrCode',
  onSuccess: function(data) {
    console.log(data.text);
  },
  onFail: function(err) {}
});

// 选择联系人
dd.biz.contact.choose({
  users: [],
  max: 10,
  onSuccess: function(data) {
    console.log(data);
  },
  onFail: function(err) {}
});
```

---

## 五、免登与鉴权

### 5.1 免登流程

1. 用户访问 H5 应用
2. 系统获取钉钉授权码
3. 服务端通过授权码换取用户身份
4. 返回用户信息完成登录

### 5.2 JSAPI 鉴权

```javascript
dd.config({
  agentId: agentId,
  corpId: corpId,
  timeStamp: timestamp,
  nonceStr: nonceStr,
  signature: signature,
  jsApiList: ['biz.contact.choose']
});
```

---

## 六、宜搭集成要点

### 6.1 宜搭 OpenAPI

宜搭通过 OpenAPI 提供表单、流程、任务等数据操作能力：

- 表单 CRUD：`/v1/form/saveFormData.json` 等
- 流程操作：`/v1/process/startInstance.json` 等
- 任务管理：`/v1/task/getTodoTasksInApp.json` 等

### 6.2 钉钉能力整合

宜搭天然整合钉钉能力：
- 钉钉消息通知
- 企业通讯录
- 审批流程
- 考勤数据
- 日程管理

---

> 文档来源：[钉钉开放平台](https://open.dingtalk.com/document/development/development-basic-concepts)
> 最后更新：2025