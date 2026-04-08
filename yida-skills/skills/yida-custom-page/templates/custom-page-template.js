/**
 * 宜搭自定义页面完整模板
 * 
 * 使用说明：
 * 1. 复制此模板到 project/pages/src/xxx.js
 * 2. 修改 _customState 初始状态
 * 3. 在 renderJsx 中编写页面 JSX
 * 4. 运行 openyida compile project/pages/src/xxx.js 验证语法
 * 5. 运行 openyida publish project/pages/src/xxx.js <appType> <formUuid> 发布
 * 
 * ⚠️ 重要约束：
 * - 必须使用 var 和 function，禁止使用 const/let/箭头函数
 * - 所有方法必须用 export function 定义
 * - 事件绑定必须用 (e) => { this.methodName(e); }
 * - 跳转页面用 this.utils.router.push('FORM-XXX', {}, false)
 */

// ============================================================
// 状态管理（全局变量，不是 export function）
// ============================================================
var _customState = {
  // 在此定义所有业务状态的初始值
  loading: false,
  data: [],
  inputValue: '',
  selectedId: null,
};

/**
 * 获取状态
 * @param {string} [key] - 传入 key 返回单个值，不传返回全部状态的浅拷贝
 */
export function getCustomState(key) {
  if (key) {
    return _customState[key];
  }
  return { ..._customState };
}

/**
 * 设置状态（合并更新，自动触发重新渲染）
 * @param {Object} newState - 需要更新的状态键值对
 */
export function setCustomState(newState) {
  Object.keys(newState).forEach(function(key) {
    _customState[key] = newState[key];
  });
  this.forceUpdate();
}

/**
 * 强制重新渲染（通过更新 timestamp 触发 React 重渲染）
 */
export function forceUpdate() {
  this.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 生命周期
// ============================================================

/**
 * 组件挂载到 DOM 后（等同于 componentDidMount）
 * 用于：初始化数据、启动定时器、绑定事件等
 */
export function didMount() {
  // 初始化逻辑
  // 示例：加载数据
  // this.loadData();
}

/**
 * 页面卸载时调用
 * 用于：清理定时器、解绑事件、释放资源等
 */
export function didUnmount() {
  // 清理逻辑
  // 示例：清理定时器
  // if (_customState.timer) {
  //   clearInterval(_customState.timer);
  // }
}

// ============================================================
// 业务方法（必须用 export function 定义）
// ============================================================

/**
 * 示例：加载表单数据
 */
export function loadData() {
  var self = this;
  self.setCustomState({ loading: true });
  
  self.utils.yida.searchFormDatas({
    formUuid: 'FORM-XXX',  // 替换为实际表单 ID
    pageSize: 20,
    currentPage: 1
  }).then(function(res) {
    if (res.success) {
      self.setCustomState({ 
        data: res.content.data,
        loading: false 
      });
    } else {
      self.utils.toast({ title: '加载失败', type: 'error' });
      self.setCustomState({ loading: false });
    }
  });
}

/**
 * 示例：跳转到表单页面
 */
export function openFormPage(formUuid) {
  this.utils.router.push(formUuid, {}, false);
}

/**
 * 示例：处理按钮点击
 */
export function handleButtonClick(e) {
  var value = this.getCustomState('inputValue');
  if (!value) {
    this.utils.toast({ title: '请输入内容', type: 'warning' });
    return;
  }
  // 业务逻辑
  this.setCustomState({ inputValue: '' });
  this.utils.toast({ title: '操作成功', type: 'success' });
}

/**
 * 示例：处理输入变化
 */
export function handleInputChange(e) {
  var value = e.target.value;
  this.setCustomState({ inputValue: value });
}

// ============================================================
// 样式定义（放在文件末尾）
// ============================================================
var styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  header: {
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 10px 0'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: '16px',
    marginBottom: '16px'
  },
  button: {
    backgroundColor: '#1677FF',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d9d9d9',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  }
};

// ============================================================
// 渲染（页面入口）
// ============================================================

/**
 * 页面渲染函数
 * ⚠️ 必须包含 <div style={{ display: 'none' }}>{this.state.timestamp}</div>
 */
export function renderJsx() {
  var state = this.getCustomState();
  
  return (
    <div style={styles.container}>
      {/* 必须保留：timestamp 用于触发 React 重新渲染 */}
      <div style={{ display: 'none' }}>{this.state.timestamp}</div>
      
      {/* 页面头部 */}
      <div style={styles.header}>
        <h1 style={styles.title}>页面标题</h1>
        <p style={{ color: '#666', margin: 0 }}>页面描述</p>
      </div>
      
      {/* 内容区域 */}
      <div style={styles.card}>
        {/* 输入框示例 */}
        <input
          style={styles.input}
          type="text"
          placeholder="请输入内容"
          value={state.inputValue}
          onChange={(e) => { this.handleInputChange(e); }}
        />
        
        {/* 按钮示例 */}
        <button 
          style={styles.button}
          onClick={(e) => { this.handleButtonClick(e); }}
        >
          提交
        </button>
      </div>
      
      {/* 数据列表示例 */}
      {state.loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>
      ) : (
        <div>
          {state.data.map(function(item, index) {
            return (
              <div key={index} style={styles.card}>
                <div>{item.formData.textField_xxx}</div>
                <button 
                  style={styles.button}
                  onClick={(e) => { this.openFormPage('FORM-XXX'); }}
                >
                  查看详情
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
