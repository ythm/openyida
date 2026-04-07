# yida-custom-page 使用示例

## 示例 1：创建员工信息查询页面

### 场景

在宜搭内创建一个自定义页面，支持按部门筛选员工信息，并展示员工列表。

### 执行步骤

```bash
# Step 1：获取表单 Schema，确认字段 ID
openyida get-schema APP_XXX FORM-EMPLOYEE > .cache/employee-schema.json 2>&1

# Step 2：创建自定义页面
openyida create-page APP_XXX "员工信息查询"
# 输出：formUuid = FORM-QUERY001

# Step 3：编写页面代码（见下方）
# 输出到 project/pages/src/employee-query.js

# Step 4：发布页面
openyida publish project/pages/src/employee-query.js APP_XXX FORM-QUERY001
```

### 输出

```json
{
  "success": true,
  "pageUrl": "https://www.aliwork.com/APP_XXX/custom/FORM-QUERY001"
}
```

---

## 示例 2：完整页面代码结构

```javascript
// ── 字段 ID 别名（从 get-schema 输出中提取）────────────────
var FIELDS = {
  name:       'textField_k8j2n3m4',    // 姓名
  department: 'selectField_a3b9c1d2',  // 部门
  joinDate:   'dateField_x7y2z5w1',    // 入职日期
  workNo:     'textField_p4q8r3s6',    // 工号
};

var FORM_UUID = 'FORM-EMPLOYEE';

// ── 状态管理 ─────────────────────────────────────────────────
var _customState = {
  loading: false,
  employees: [],
  selectedDept: '',
  timestamp: 0,
};

// ── 状态管理函数（必须用 export function）────────────────────
export function getCustomState(key) {
  if (key) return _customState[key];
  return Object.assign({}, _customState);
}

export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ── 生命周期 ─────────────────────────────────────────────────
export function didMount() {
  this.loadEmployees();
}

// ── 业务方法（需要 this 的必须用 export function）────────────
export function loadEmployees() {
  var self = this;
  var appType = window.pageConfig && window.pageConfig.appType;

  _customState.loading = true;
  self.forceUpdate();

  var searchFieldJson = {};
  if (_customState.selectedDept) {
    searchFieldJson[FIELDS.department] = _customState.selectedDept;
  }

  self.utils.yida.searchFormDatas({
    formUuid: FORM_UUID,
    appType: appType,
    searchFieldJson: JSON.stringify(searchFieldJson),
    currentPage: 1,
    pageSize: 50,
  }).then(function(result) {
    _customState.employees = result.data || [];
    _customState.loading = false;
    self.forceUpdate();
  }).catch(function(err) {
    self.utils.toast({ title: '加载失败：' + err.message, type: 'error' });
    _customState.loading = false;
    self.forceUpdate();
  });
}

export function onDeptChange(dept) {
  _customState.selectedDept = dept;
  this.loadEmployees();
}

// ── 渲染函数 ─────────────────────────────────────────────────
export function renderJsx() {
  var isMobile = this.utils.isMobile();
  var self = this;

  var containerStyle = {
    padding: isMobile ? '12px' : '16px',
    background: '#f5f5f5',
    minHeight: '100vh',
  };

  return (
    <div style={containerStyle}>
      {/* 必须保留：用于触发重新渲染 */}
      <div style={{ display: 'none' }}>{this.state.timestamp}</div>

      {/* 筛选区 */}
      <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
        <select
          defaultValue=""
          onChange={(e) => { this.onDeptChange(e.target.value); }}
          style={{ height: '32px', padding: '0 8px', border: '1px solid #d9d9d9', borderRadius: '4px' }}
        >
          <option value="">全部部门</option>
          <option value="研发部">研发部</option>
          <option value="产品部">产品部</option>
          <option value="运营部">运营部</option>
        </select>
      </div>

      {/* 列表区 */}
      <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        {_customState.loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>加载中...</div>
        ) : _customState.employees.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>暂无数据</div>
        ) : (
          _customState.employees.map((emp, idx) => (
            <div key={idx} style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontWeight: 600 }}>{emp.formData[FIELDS.name]}</span>
              <span style={{ color: '#666' }}>{emp.formData[FIELDS.department]}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### 关键规范

- **事件绑定必须用箭头函数**：`onClick={(e) => { this.方法名(e); }}`，禁止 `onClick={this.方法名}`
- **`.map()` 回调必须用箭头函数**：`arr.map((item) => ...)` ，禁止 `.map(function(item) {...})`
- **需要 `this` 的方法必须用 `export function`**，不能用 `const fn = () => {}`
- **`pageSize` 最大值为 100**，超过会导致接口报错
