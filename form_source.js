// ============================================================
// 状态管理
// 所有业务状态集中管理，通过 updateUI() 触发页面重新渲染
// ============================================================

const _customState = {
  // ========== 项目信息 ==========
  projectId: '',                    // 项目ID，从URL参数获取
  projectName: '',                  // 项目名称
  projectWorkDomain: '',            // 项目所属领域
  projectManager: '',               // 项目负责人
  projectManagerId: '',             // 项目负责人用户ID
  archiveManager: '',               // 档案员名称
  projectFormInstId: '',            // 项目表单实例ID

  // ========== 目录树相关 ==========
  treeData: [],                     // 目录树数据
  loading: false,                   // 目录加载状态
  expandedKeys: [],                 // 已展开的目录节点key列表
  selectedKey: null,                // 当前选中的目录节点key
  selectedCatalogId: '',            // 当前选中的目录ID
  hoveredKey: null,                 // 鼠标悬停的节点key

  // ========== 表单ID配置 ==========
  formUuid: 'FORM-0BA136D2631B4B80ABA3EBA917B1B7E8D428',        // 目录表单ID
  projectFormUuid: 'FORM-7EBA24DD6DA44E5B96D233FD1C0D1CA1PP71', // 项目表单ID
  projectAppType: 'APP_ECWTG5P1EFDJ02MTH0IO',                  // 项目应用类型
  archiveFormUuid: 'FORM-82636FC6E1414BE080ACE340E9E0E11AEU3D', // 档案表单ID

  // ========== 档案列表相关 ==========
  archiveList: [],                  // 档案数据列表
  archiveLoading: false,            // 档案加载状态
  archiveTotal: 0,                  // 档案总数
  currentPage: 1,                   // 当前页码
  pageSize: 10,                     // 每页显示条数
  timestamp: 0,                     // 用于触发UI更新的时间戳
  selectedArchiveKeys: [],          // 已选中的档案ID列表
  archiveFilter: 'all',             // 归档状态筛选：'all' | 'pending' | 'archived'

  // ========== 筛选条件 ==========
  archiveNameFilter: '',            // 档案名筛选条件
  archiveDateRangeKey: 0,           // 日期区间组件key，用于强制重新渲染
  archiveDateRangeValue: null,      // 日期区间组件值
  archiveDateRange: {},             // 日期区间对象 {start: timestamp, end: timestamp}

  // ========== 录入档案相关 ==========
  showArchiveModal: false,          // 是否显示录入档案模态框
  showArchiveBoxModal: false,      // 是否显示新增档案盒模态框
  archiveForm: {                    // 档案表单数据
    textField_lts9tgtv: '',         // 档案题名
    textField_luuuddq0: '',         // 编号
    radioField_lu6kb8ha: '',        // 保管期限
    textField_ltzfvwhh: '',         // 档案ID
    checkboxField_lv0lultz: [],     // 档案形式（电子/纸质/实物）
    textField_lv4jmlhc: '',         // 档案分类单选
    attachmentField_ltqiyj50: [],   // 电子档案（附件）
    radioField_m17gf5nj: '',        // 纸档类型（独立件/盒内件）
    numberField_ldgpj9uz: '',       // 数量
    textField_ltzfvwgg: '',         // 存放位置
    associationFormField_m17odran: [], // 所属档案盒
    numberField_m17gf5nk: '',       // 盒内序号
    radioField_ltzfvwhf: '',        // 涉密属性
    // 隐藏字段
    textField_lv4krwac: '',         // 项目工作领域
    textField_lynoqlcc: '',         // 项目名
    textField_lv4krwad: '',         // 档案分类的selectField_lu2247qr值
    textField_lx4e0znj: '',         // 项目名
    textField_lymmvp5d: '',         // 项目ID
    textField_m17odram: ''          // 档案盒ID
  },
  archiveCategoryOptions: [],       // 档案分类选项
  archiveBoxOptions: [],            // 档案盒选项
  secretDeptOptions: [],            // 涉密档案允许查阅部门选项
  editingArchive: null,             // 正在编辑的档案
  expandedArchiveIds: [],           // 展开附件列表的档案ID
  sortField: '',                    // 排序字段
  sortOrder: '',                    // 排序方向：'asc' | 'desc'

  // ========== 档案员任命相关 ==========
  editingManager: false,            // 是否正在编辑档案员
  managerSelected: [],              // 已选中的档案员
  rawManagerData: [],               // 原始档案员数据
  employeeFieldValue: [],           // 员工选择组件的值

  // ========== 目录管理相关状态 ==========
  showCatalogModal: false,          // 是否显示目录编辑模态框
  catalogModalType: 'add',          // 目录模态框类型：'add' | 'edit' | 'addSub'
  editingNode: null,                // 正在编辑的目录节点
  catalogForm: {                    // 目录表单数据
    textField_luw1rfyq: '',         // 目录名
    textField_lyz8ywto: '',         // 文件范围说明
    numberField_lyz8ywtn: 0         // 序号
  },

  // ========== 拖拽相关状态 ==========
  dragNode: null,                   // 正在拖拽的目录节点
  dragOverNode: null,               // 拖拽悬停的目标节点
  dragPosition: null,               // 拖拽位置：'before' | 'after' | 'inside'
  dragArchive: null,                // 正在拖拽的档案数据
  dragOverCatalogKey: null,         // 档案拖拽悬停的目录key
  autoExpandTimer: null,            // 自动展开定时器

  // ========== 隐藏功能状态 ==========
  showFixOrderButton: false,        // 是否显示修复序号按钮
  ctrlKeyPressCount: 0,             // Ctrl键按下次数
  lastCtrlKeyTime: 0,               // 上次按下Ctrl键的时间
  isCtrlKeyDown: false              // Ctrl键是否已按下（防止长按重复计数）
};

/**
 * 根据表单实例ID在目录树中查找节点
 * @param {Array} tree - 目录树数据
 * @param {string} formInstId - 表单实例ID
 * @returns {Object|null} 找到的节点或null
 */
function findNodeByKey(tree, formInstId) {
  for (var i = 0; i < tree.length; i++) {
    if (tree[i].formInstId === formInstId) return tree[i];
    if (tree[i].children) {
      var found = findNodeByKey(tree[i].children, formInstId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * 递归排序目录树的子节点（按序号排序）
 * @param {Object} node - 目录节点
 */
function sortChildren(node) {
  node.children.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  node.children.forEach(sortChildren);
}

/**
 * 触发UI更新
 * 通过更新timestamp状态值来触发React重新渲染
 * @param {Object} self - 当前组件实例
 */
function updateUI(self) {
  self.setState({ timestamp: new Date().getTime() });
}

// ============================================================
// 生命周期
// ============================================================

// ============================================================
// 生命周期函数
// ============================================================

/**
 * 页面加载完成时调用
 * 功能：初始化数据、绑定键盘事件
 * - 从URL参数获取projectId
 * - 加载项目信息、目录树、档案列表
 * - 绑定Ctrl键连续按3次显示/隐藏修复序号按钮
 */
export function didMount() {
  var urlParams = this.state.urlParams || {};
  var projectId = urlParams.projectId || '';
  _customState.projectId = projectId;
  if (projectId) {
    this.loadProjectInfo();
    this.loadTreeData();
    this.loadArchiveList();
  } else {
    this.utils.toast({ title: '请传入 projectId 参数', type: 'warn' });
  }
  
  // 监听键盘事件，连续点击3次ctrl键显示修复序号按钮
  var self = this;
  _customState._handleKeyDown = function(e) {
    if (e.key === 'Control' && !_customState.isCtrlKeyDown) {
      _customState.isCtrlKeyDown = true;
      var now = Date.now();
      if (now - _customState.lastCtrlKeyTime < 500) {
        _customState.ctrlKeyPressCount++;
      } else {
        _customState.ctrlKeyPressCount = 1;
      }
      _customState.lastCtrlKeyTime = now;
      
      if (_customState.ctrlKeyPressCount >= 3) {
        _customState.showFixOrderButton = !_customState.showFixOrderButton;
        _customState.ctrlKeyPressCount = 0;
        updateUI(self);
        if (_customState.showFixOrderButton) {
          self.utils.toast({ title: '已显示修复序号按钮', type: 'success' });
        } else {
          self.utils.toast({ title: '已隐藏修复序号按钮', type: 'success' });
        }
      }
    }
  };
  _customState._handleKeyUp = function(e) {
    if (e.key === 'Control') {
      _customState.isCtrlKeyDown = false;
    }
  };
  document.addEventListener('keydown', _customState._handleKeyDown);
  document.addEventListener('keyup', _customState._handleKeyUp);
}

/**
 * 页面卸载时调用
 * 功能：清理事件监听器
 */
export function didUnmount() {
  if (_customState._handleKeyDown) {
    document.removeEventListener('keydown', _customState._handleKeyDown);
  }
  if (_customState._handleKeyUp) {
    document.removeEventListener('keyup', _customState._handleKeyUp);
  }
}

// ============================================================
// 加载项目信息
// 通过跨应用查询获取项目详情，包括项目名称、负责人、档案员等
// ============================================================

/**
 * 加载项目信息
 * 从项目表单中查询项目详情，并设置到状态中
 * 项目负责人ID从employeeField_lphy7qdq字段获取（取value/workNo/userId）
 */
export function loadProjectInfo() {
  this.utils.yida.searchFormDatas({
    formUuid: _customState.projectFormUuid,
    appType: _customState.projectAppType,
    searchFieldJson: JSON.stringify({ textField_dde732y: _customState.projectId }),
    currentPage: 1,
    pageSize: 1
  }).then(function(res) {
    if (res.data && res.data.length > 0) {
      var d = res.data[0].formData;
      _customState.projectFormInstId = res.data[0].formInstId || '';
      _customState.projectName = d.textField_cj9rcur || _customState.projectId;
      _customState.projectWorkDomain = d.radioField_zjzspk8 || '';
      _customState.projectManager = d.employeeField_lphy7qdq ? (Array.isArray(d.employeeField_lphy7qdq) ? d.employeeField_lphy7qdq.join(', ') : d.employeeField_lphy7qdq) : '';
      
      // 获取项目负责人userid - 使用_id后缀字段
      var managerIds = d.employeeField_lphy7qdq_id;
      if (managerIds && Array.isArray(managerIds) && managerIds.length > 0) {
        _customState.projectManagerId = String(managerIds[0]);
      } else if (typeof managerIds === 'string') {
        _customState.projectManagerId = managerIds;
      } else {
        _customState.projectManagerId = '';
      }
      
      var mgrNames = d.employeeField_ltz87lbw;
      var mgrIds = d.employeeField_ltz87lbw_id;
      if (mgrNames && Array.isArray(mgrNames)) {
        _customState.rawManagerData = [];
        for (var i = 0; i < mgrNames.length; i++) {
          if (mgrNames[i]) {
            var cleanName = String(mgrNames[i]).replace(/\(.*?\)/g, '').trim();
            if (cleanName) {
              _customState.rawManagerData.push({
                name: cleanName,
                userId: Array.isArray(mgrIds) ? String(mgrIds[i] || '') : ''
              });
            }
          }
        }
        _customState.archiveManager = _customState.rawManagerData.map(function(m) { return m.name; }).join(', ');
      } else if (mgrNames && typeof mgrNames === 'string' && mgrNames.trim()) {
        _customState.archiveManager = mgrNames;
        var idStr = Array.isArray(mgrIds) ? mgrIds.join(',') : String(mgrIds || '');
        _customState.rawManagerData = [];
        var nameArr = mgrNames.split(',');
        for (var j = 0; j < nameArr.length; j++) {
          if (nameArr[j].trim()) {
            _customState.rawManagerData.push({
              name: nameArr[j].trim(),
              userId: idStr.split(',')[j] ? idStr.split(',')[j].trim() : ''
            });
          }
        }
      } else {
        _customState.archiveManager = '';
        _customState.rawManagerData = [];
      }
    } else {
      _customState.projectName = _customState.projectId;
    }
    updateUI(this);
  }.bind(this)).catch(function() {
    _customState.projectName = _customState.projectId;
    updateUI(this);
  }.bind(this));
}

// ============================================================
// 录入档案
// 支持新建档案，自动关联当前项目和选中的目录
// ============================================================

/**
 * 生成随机档案ID
 * 格式：FILE-{时间戳}-{6位随机码}
 * @returns {string} 生成的档案ID
 */
function generateArchiveId() {
  var timestamp = Date.now();
  var random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return 'FILE-' + timestamp + '-' + random;
}

/**
 * 打开录入档案模态框
 */
export function openArchiveModal() {
  var userId = window.loginUser ? window.loginUser.userId : '';
  var workDomain = _customState.projectWorkDomain || '';
  var archiveId = generateArchiveId();
  
  _customState.showArchiveModal = true;
  _customState.archiveForm = {
    textField_lts9tgtv: '',
    textField_luuuddq0: '',
    radioField_lu6kb8ha: 'Y',
    textField_ltzfvwhh: archiveId,
    checkboxField_lv0lultz: ['电子'],
    textField_lv4jmlhc: '',
    attachmentField_ltqiyj50: [],
    radioField_m17gf5nj: '独立件',
    numberField_ldgpj9uz: '',
    textField_ltzfvwgg: '',
    associationFormField_m17odran: [],
    numberField_m17gf5nk: '',
    radioField_ltzfvwhf: '企业内部',
    // 涉密相关字段
    multiSelectField_ltzfvwhg: [],
    employeeField_ltzfvwhh: [],
    // 隐藏字段自动填充
    textField_lv4krwac: workDomain,
    textField_lynoqlcc: _customState.projectName,
    textField_lv4krwad: '',
    textField_lx4e0znj: _customState.projectName,
    textField_lymmvp5d: _customState.projectId,
    textField_m17odram: ''
  };
  
  // 加载档案分类选项
  this.loadArchiveCategoryOptions(workDomain);
  // 加载档案盒选项
  this.loadArchiveBoxOptions();
  // 加载涉密档案允许查阅部门选项
  this.loadSecretDeptOptions();
  
  updateUI(this);
}

/**
 * 加载档案分类选项
 * 从APP_ECWTG5P1EFDJ02MTH0IO应用的FORM-1E5867594AD240B0A79EDA71D228D62FOKRG表单获取
 * @param {string} workDomain - 项目工作领域
 */
export function loadArchiveCategoryOptions(workDomain) {
  var self = this;
  var searchJson = {};
  if (workDomain) {
    searchJson.selectField_lu1zh73l = workDomain;
  }
  
  this.utils.yida.searchFormDatas({
    formUuid: 'FORM-1E5867594AD240B0A79EDA71D228D62FOKRG',
    appType: 'APP_ECWTG5P1EFDJ02MTH0IO',
    searchFieldJson: JSON.stringify(searchJson),
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    console.log('archiveCategoryOptions response:', res);
    _customState.archiveCategoryOptions = (res.data || []).map(function(item) {
      var formData = item.formData || {};
      console.log('category item:', formData);
      return {
        value: formData.textField_ltpgulki || '',
        label: formData.textField_ltpgulki || '',
        department: formData.selectField_lu2247qr || ''  // 归口部门
      };
    }).filter(function(opt) { return opt.value; });
    
    console.log('archiveCategoryOptions:', _customState.archiveCategoryOptions);
    
    // 默认选中首项
    if (_customState.archiveCategoryOptions.length > 0 && !_customState.archiveForm.textField_lv4jmlhc) {
      var firstOption = _customState.archiveCategoryOptions[0];
      _customState.archiveForm.textField_lv4jmlhc = firstOption.value;
      _customState.archiveForm.textField_lv4krwad = firstOption.department;
      console.log('Default category:', firstOption);
    }
    
    updateUI(self);
  }).catch(function() {
    _customState.archiveCategoryOptions = [];
  });
}

/**
 * 加载档案盒选项
 * 从APP_HBX0O0II1A22ZT14XYYI应用的FORM-C9E034C6600642CEB6312F8F28648E4DX6X0表单获取
 * 按当前项目ID筛选
 */
export function loadArchiveBoxOptions() {
  var self = this;
  
  this.utils.yida.searchFormDatas({
    formUuid: 'FORM-C9E034C6600642CEB6312F8F28648E4DX6X0',
    searchFieldJson: JSON.stringify({ textField_lymmvp5d: _customState.projectId }),
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    console.log('loadArchiveBoxOptions response:', res);
    _customState.archiveBoxOptions = (res.data || []).map(function(item) {
      var formData = item.formData || {};
      console.log('archive box item:', JSON.stringify(formData));
      var boxTitle = formData.textField_lts9tgtv || formData.textField_m2k8bx77 || item.formInstId || '';
      var boxId = formData.textField_ltzfvwhh || '';
      return {
        value: item.formInstId,
        label: boxTitle,
        formInstId: item.formInstId,
        title: boxTitle,
        textField_lts9tgtv: formData.textField_lts9tgtv || '',
        textField_ltzfvwhh: boxId,
        textField_ltzfvwgg: formData.textField_ltzfvwgg || '',
        textField_mbk5f5i6: formData.textField_mbk5f5i6 || '',
        textField_m2k8bx77: formData.textField_m2k8bx77 || '',
        textField_m17odram: formData.textField_m17odram || '',
        radioField_lu6kb8ha: formData.radioField_lu6kb8ha || '',
        radioField_ltzfvwhf: formData.radioField_ltzfvwhf || '',
        multiSelectField_ltzfvwhg: formData.multiSelectField_ltzfvwhg || [],
        employeeField_ltzfvwhh: formData.employeeField_ltzfvwhh || []
      };
    });
    console.log('archiveBoxOptions:', _customState.archiveBoxOptions);
    updateUI(self);
  }).catch(function(err) {
    console.log('loadArchiveBoxOptions error:', err);
    _customState.archiveBoxOptions = [];
  });
}

/**
 * 加载涉密档案允许查阅部门选项
 * 从APP_ECWTG5P1EFDJ02MTH0IO应用的FORM-8B8E503E493142B59B51101016E4EFE47AVB表单获取
 */
export function loadSecretDeptOptions() {
  var self = this;
  
  this.utils.yida.searchFormDatas({
    formUuid: 'FORM-8B8E503E493142B59B51101016E4EFE47AVB',
    appType: 'APP_ECWTG5P1EFDJ02MTH0IO',
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    console.log('loadSecretDeptOptions response:', res);
    _customState.secretDeptOptions = (res.data || []).map(function(item) {
      var formData = item.formData || {};
      console.log('secret dept item:', formData);
      var deptName = formData.textField_kn2qpa2 || '';
      return {
        value: deptName,
        label: deptName
      };
    }).filter(function(opt) { return opt.value && opt.label; });
    console.log('secretDeptOptions:', _customState.secretDeptOptions);
    updateUI(self);
  }).catch(function() {
    _customState.secretDeptOptions = [];
  });
}

/**
 * 关闭录入档案模态框
 */
export function closeArchiveModal() {
  _customState.showArchiveModal = false;
  _customState.editingArchive = null;
  updateUI(this);
}

/**
 * 处理档案表单变更
 * @param {string} field - 字段ID
 * @param {any} value - 字段值
 */
export function handleArchiveFormChange(field, value) {
  _customState.archiveForm[field] = value;
  updateUI(this);
}

// ============================================================
// 档案编辑、删除
// ============================================================

/**
 * 打开编辑档案模态框
 * @param {Object} archive - 档案数据
 */
export function openEditArchiveModal(archive) {
  var d = archive.formData || {};
  var workDomain = _customState.projectWorkDomain || '';
  
  console.log('Editing archive data:', d);
  console.log('radioField_lu6kb8ha:', d.radioField_lu6kb8ha, 'type:', typeof d.radioField_lu6kb8ha);
  console.log('radioField_m17gf5nj:', d.radioField_m17gf5nj, 'type:', typeof d.radioField_m17gf5nj);
  console.log('radioField_ltzfvwhf:', d.radioField_ltzfvwhf, 'type:', typeof d.radioField_ltzfvwhf);
  
  // 保管期限值提取
  var retentionValue = 'Y';
  if (d.radioField_lu6kb8ha) {
    if (typeof d.radioField_lu6kb8ha === 'string') {
      retentionValue = d.radioField_lu6kb8ha;
    } else if (typeof d.radioField_lu6kb8ha === 'object') {
      retentionValue = d.radioField_lu6kb8ha.value || d.radioField_lu6kb8ha.label || 'Y';
    }
  }
  
  // 纸档类型值提取
  var paperTypeValue = '独立件';
  if (d.radioField_m17gf5nj) {
    if (typeof d.radioField_m17gf5nj === 'string') {
      paperTypeValue = d.radioField_m17gf5nj;
    } else if (typeof d.radioField_m17gf5nj === 'object') {
      paperTypeValue = d.radioField_m17gf5nj.value || d.radioField_m17gf5nj.label || '独立件';
    }
  }
  
  // 涉密属性值提取
  var secretValue = '企业内部';
  if (d.radioField_ltzfvwhf) {
    if (typeof d.radioField_ltzfvwhf === 'string') {
      secretValue = d.radioField_ltzfvwhf;
    } else if (typeof d.radioField_ltzfvwhf === 'object') {
      secretValue = d.radioField_ltzfvwhf.value || d.radioField_ltzfvwhf.label || '企业内部';
    }
  }
  
  console.log('Extracted values:', { retentionValue, paperTypeValue, secretValue });
  console.log('Editing archive d:', d);
  console.log('attachmentField:', d.attachmentField_ltqiyj50);
  console.log('associationFormField:', d.associationFormField_m17odran);
  console.log('employeeField_ltzgxlbg:', d.employeeField_ltzgxlbg);
  
  // 解析附件数据
  var attachmentList = [];
  if (d.attachmentField_ltqiyj50) {
    try {
      var attachStr = typeof d.attachmentField_ltqiyj50 === 'string' ? d.attachmentField_ltqiyj50 : JSON.stringify(d.attachmentField_ltqiyj50);
      attachmentList = JSON.parse(attachStr);
    } catch (e) {
      attachmentList = [];
    }
  }
  
  // 解析关联表单数据
  var boxInstanceId = '';
  var boxId = d.textField_m17odram || '';
  console.log('boxId from textField_m17odram:', boxId);
  // 等待 archiveBoxOptions 加载完成后匹配
  _customState.archiveBoxOptions.forEach(function(opt) {
    if (opt.textField_ltzfvwhh === boxId) {
      boxInstanceId = opt.formInstId;
      console.log('Matched boxInstanceId:', boxInstanceId);
    }
  });
  
  // 处理成员字段 - 转换为对象数组
  var empList = [];
  if (d.employeeField_ltzgxlbg && Array.isArray(d.employeeField_ltzgxlbg)) {
    empList = d.employeeField_ltzgxlbg.map(function(name, idx) {
      var empId = d.employeeField_ltzgxlbg_id && d.employeeField_ltzgxlbg_id[idx] ? d.employeeField_ltzgxlbg_id[idx] : '';
      return { name: name, emplId: empId, value: empId, label: name };
    });
  }
  
  _customState.editingArchive = archive;
  _customState.showArchiveModal = true;
  _customState.archiveForm = {
    textField_lts9tgtv: d.textField_lts9tgtv || '',
    textField_luuuddq0: d.textField_luuuddq0 || '',
    radioField_lu6kb8ha: retentionValue === '10年' ? 'D10' : (retentionValue === '30年' ? 'D30' : (retentionValue === '15年' ? 'D15' : (retentionValue === '5年' ? 'D5' : retentionValue))),
    textField_ltzfvwhh: d.textField_ltzfvwhh || '',
    checkboxField_lv0lultz: d.checkboxField_lv0lultz || ['电子'],
    textField_lv4jmlhc: d.textField_lv4jmlhc || '',
    attachmentField_ltqiyj50: attachmentList,
    radioField_m17gf5nj: paperTypeValue,
    numberField_ldgpj9uz: d.numberField_ldgpj9uz || '',
    textField_ltzfvwgg: d.textField_ltzfvwgg || '',
    associationFormField_m17odran: '', // 先设为空，加载完档案盒选项后再匹配
    numberField_m17gf5nk: d.numberField_m17gf5nk || '',
    radioField_ltzfvwhf: secretValue,
    multiSelectField_ltzfvwhg: d.multiSelectField_lu7z4rht || [],
    employeeField_ltzfvwhh: empList,
    // 隐藏字段
    textField_lv4krwac: d.textField_lv4krwac || workDomain,
    textField_lynoqlcc: d.textField_lynoqlcc || _customState.projectName,
    textField_lv4krwad: d.textField_lv4krwad || '',
    textField_lx4e0znj: d.textField_lx4e0znj || _customState.projectName,
    textField_lymmvp5d: d.textField_lymmvp5d || _customState.projectId,
    textField_m17odram: d.textField_m17odram || ''
  };
  
  // 加载档案分类选项
  this.loadArchiveCategoryOptions(workDomain);
  // 加载档案盒选项，并在加载完成后自动匹配
  var self = this;
  var targetBoxId = d.textField_m17odram || '';
  this.utils.yida.searchFormDatas({
    formUuid: 'FORM-C9E034C6600642CEB6312F8F28648E4DX6X0',
    searchFieldJson: JSON.stringify({ textField_lymmvp5d: _customState.projectId }),
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    _customState.archiveBoxOptions = (res.data || []).map(function(item) {
      var formData = item.formData || {};
      var boxTitle = formData.textField_lts9tgtv || formData.textField_m2k8bx77 || item.formInstId || '';
      var boxId = formData.textField_ltzfvwhh || '';
      return {
        value: item.formInstId,
        label: boxTitle,
        formInstId: item.formInstId,
        title: boxTitle,
        textField_lts9tgtv: formData.textField_lts9tgtv || '',
        textField_ltzfvwhh: boxId,
        textField_ltzfvwgg: formData.textField_ltzfvwgg || '',
        textField_mbk5f5i6: formData.textField_mbk5f5i6 || '',
        textField_m2k8bx77: formData.textField_m2k8bx77 || '',
        textField_m17odram: formData.textField_m17odram || '',
        radioField_lu6kb8ha: formData.radioField_lu6kb8ha || '',
        radioField_ltzfvwhf: formData.radioField_ltzfvwhf || '',
        multiSelectField_ltzfvwhg: formData.multiSelectField_ltzfvwhg || [],
        employeeField_ltzfvwhh: formData.employeeField_ltzfvwhh || []
      };
    });
    // 自动匹配档案盒
    if (targetBoxId) {
      var matchedBox = _customState.archiveBoxOptions.find(function(opt) { return opt.textField_ltzfvwhh === targetBoxId; });
      if (matchedBox) {
        _customState.archiveForm.associationFormField_m17odran = matchedBox.formInstId;
        _customState.archiveForm.textField_ltzfvwgg = matchedBox.textField_mbk5f5i6 || matchedBox.textField_ltzfvwgg || '';
        var boxRetention = matchedBox.radioField_lu6kb8ha || '';
        var retentionMap = { '永久': 'Y', '30年': 'D30', '15年': 'D15', '10年': 'D10', '5年': 'D5' };
        _customState.archiveForm.radioField_lu6kb8ha = retentionMap[boxRetention] || boxRetention || 'Y';
      }
    }
    updateUI(self);
  }).catch(function(err) {
    _customState.archiveBoxOptions = [];
  });
}

/**
 * 更新档案
 */
export function updateArchive() {
  var self = this;
  var form = _customState.archiveForm;
  var archive = _customState.editingArchive;
  
  if (!form.textField_lts9tgtv || !form.textField_lts9tgtv.trim()) {
    this.utils.toast({ title: '请输入档案题名', type: 'warn' });
    return;
  }
  
  if (!archive) {
    this.utils.toast({ title: '未找到档案数据', type: 'error' });
    return;
  }
  
  // 格式化附件数据
  var attachmentData = [];
  if (form.attachmentField_ltqiyj50 && Array.isArray(form.attachmentField_ltqiyj50)) {
    attachmentData = form.attachmentField_ltqiyj50.map(function(file) {
      return {
        downloadUrl: file.downloadUrl || file.url || '',
        name: file.name || '',
        previewUrl: file.previewUrl || file.url || '',
        url: file.url || file.downloadUrl || '',
        ext: file.ext || ''
      };
    });
  }
  
  // 确保单选字段只保存value值
  var retentionValue = typeof form.radioField_lu6kb8ha === 'object' ? (form.radioField_lu6kb8ha.value || 'Y') : (form.radioField_lu6kb8ha || 'Y');
  var paperTypeValue = typeof form.radioField_m17gf5nj === 'object' ? (form.radioField_m17gf5nj.value || '独立件') : (form.radioField_m17gf5nj || '独立件');
  var secretValue = typeof form.radioField_ltzfvwhf === 'object' ? (form.radioField_ltzfvwhf.value || '企业内部') : (form.radioField_ltzfvwhf || '企业内部');
  var categoryValue = typeof form.textField_lv4jmlhc === 'object' ? (form.textField_lv4jmlhc.value || '') : (form.textField_lv4jmlhc || '');
  
  var updateData = {
    textField_lts9tgtv: form.textField_lts9tgtv.trim(),
    textField_luuuddq0: form.textField_luuuddq0 || '',
    radioField_lu6kb8ha: retentionValue,
    textField_ltzfvwhh: form.textField_ltzfvwhh || '',
    checkboxField_lv0lultz: form.checkboxField_lv0lultz || ['电子'],
    textField_lv4jmlhc: categoryValue,
    attachmentField_ltqiyj50: attachmentData,
    radioField_m17gf5nj: paperTypeValue,
    numberField_ldgpj9uz: form.numberField_ldgpj9uz || '',
    textField_ltzfvwgg: form.textField_ltzfvwgg || '',
    associationFormField_m17odran: form.associationFormField_m17odran ? [{
      appType: 'APP_HBX0O0II1A22ZT14XYYI',
      formType: 'receipt',
      formUuid: 'FORM-C9E034C6600642CEB6312F8F28648E4DX6X0',
      instanceId: form.associationFormField_m17odran,
      title: (function() {
        var box = _customState.archiveBoxOptions.find(function(opt) { return opt.formInstId === form.associationFormField_m17odran; });
        return box ? box.title : '';
      })()
    }] : [],
    numberField_m17gf5nk: form.numberField_m17gf5nk || '',
    radioField_ltzfvwhf: secretValue,
    multiSelectField_lu7z4rht: form.multiSelectField_ltzfvwhg || [],
    multiSelectField_lu7z4rht_id: form.multiSelectField_ltzfvwhg || [],
    employeeField_ltzgxlbg: (function() {
      var empList = form.employeeField_ltzfvwhh || [];
      return empList.map(function(emp) {
        return emp.emplId || emp.value || emp.userId || emp;
      });
    })(),
    employeeField_ltzgxlbg_id: (function() {
      var empList = form.employeeField_ltzfvwhh || [];
      return empList.map(function(emp) {
        return emp.emplId || emp.value || emp.userId || emp;
      });
    })(),
    textField_lv4krwad: form.textField_lv4krwad || '',
    textField_m17odram: (function() {
      var box = _customState.archiveBoxOptions.find(function(opt) { return opt.formInstId === form.associationFormField_m17odran; });
      return box ? box.textField_ltzfvwhh : '';
    })()
  };

  this.utils.yida.updateFormData({
    formUuid: _customState.archiveFormUuid,
    formInstId: archive.formInstId,
    updateFormDataJson: JSON.stringify(updateData)
  }).then(function() {
    self.utils.toast({ title: '档案已更新', type: 'success' });
    self.closeArchiveModal();
    self.loadArchiveList();
  }).catch(function() {
    self.utils.toast({ title: '更新失败', type: 'error' });
  });
}

/**
 * 删除档案
 * @param {Object} archive - 档案数据
 */
export function deleteArchive(archive) {
  var self = this;
  
  if (window.confirm('确定要删除档案 "' + (archive.formData.textField_lts9tgtv || '') + '" 吗？')) {
    this.utils.yida.deleteFormData({
      formUuid: _customState.archiveFormUuid,
      formInstId: archive.formInstId
    }).then(function() {
      self.utils.toast({ title: '档案已删除', type: 'success' });
      self.loadArchiveList();
    }).catch(function() {
      self.utils.toast({ title: '删除失败', type: 'error' });
    });
  }
}

/**
 * 解锁档案（将已归档变为待归档）
 * @param {Object} archive - 档案数据
 */
export function unlockArchive(archive) {
  var self = this;
  var archiveName = (archive.formData || {}).textField_lts9tgtv || '';
  
  if (window.confirm('确定要解锁档案 "' + archiveName + '" 吗？解锁后状态将变更为"待归档"。')) {
    this.utils.yida.updateFormData({
      formUuid: _customState.archiveFormUuid,
      formInstId: archive.formInstId,
      updateFormDataJson: JSON.stringify({
        radioField_ltqu54no: '待归档'
      })
    }).then(function() {
      self.utils.toast({ title: '档案已解锁', type: 'success' });
      self.loadArchiveList();
    }).catch(function() {
      self.utils.toast({ title: '解锁失败', type: 'error' });
    });
  }
}

/**
 * 切换附件列表展开/收起
 * @param {string} formInstId - 档案实例ID
 */
export function toggleArchiveAttachments(formInstId) {
  var index = _customState.expandedArchiveIds.indexOf(formInstId);
  if (index >= 0) {
    _customState.expandedArchiveIds.splice(index, 1);
  } else {
    _customState.expandedArchiveIds.push(formInstId);
  }
  updateUI(this);
}

/**
 * 保存档案（新增或编辑）
 * 创建新档案记录，关联当前项目和选中的目录
 */
export function saveArchive() {
  if (_customState.editingArchive) {
    this.updateArchive();
  } else {
    this.createArchive();
  }
}

/**
 * 创建新档案
 */
export function createArchive() {
  var self = this;
  var form = _customState.archiveForm;
  
  if (!form.textField_lts9tgtv || !form.textField_lts9tgtv.trim()) {
    this.utils.toast({ title: '请输入档案题名', type: 'warn' });
    return;
  }
  
  // 获取当前选中的目录路径
  var catalogPath = [];
  if (_customState.selectedCatalogId) {
    function findPath(nodes, targetId, path) {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var newPath = path.concat([{ catalogId: node.catalogId, title: node.title }]);
        if (node.catalogId === targetId) {
          catalogPath = newPath;
          return true;
        }
        if (node.children && findPath(node.children, targetId, newPath)) {
          return true;
        }
      }
      return false;
    }
    findPath(_customState.treeData, _customState.selectedCatalogId, []);
  }
  
  var userId = window.loginUser ? window.loginUser.userId : '';
  var catalogData = catalogPath.map(function(c) {
    return {
      textField_m3pa3hdx: c.title,
      textField_m3pa3hdy: c.catalogId
    };
  });
  
  // 格式化附件数据
  var attachmentData = [];
  if (form.attachmentField_ltqiyj50 && Array.isArray(form.attachmentField_ltqiyj50)) {
    attachmentData = form.attachmentField_ltqiyj50.map(function(file) {
      return {
        downloadUrl: file.downloadUrl || file.url || '',
        name: file.name || '',
        previewUrl: file.previewUrl || file.url || '',
        url: file.url || file.downloadUrl || '',
        ext: file.ext || ''
      };
    });
  }
  
  // 构建保存数据
  console.log('Saving archive form:', form);
  
  // 确保单选字段只保存value值
  var retentionValue = typeof form.radioField_lu6kb8ha === 'object' ? (form.radioField_lu6kb8ha.value || 'Y') : (form.radioField_lu6kb8ha || 'Y');
  var paperTypeValue = typeof form.radioField_m17gf5nj === 'object' ? (form.radioField_m17gf5nj.value || '独立件') : (form.radioField_m17gf5nj || '独立件');
  var secretValue = typeof form.radioField_ltzfvwhf === 'object' ? (form.radioField_ltzfvwhf.value || '企业内部') : (form.radioField_ltzfvwhf || '企业内部');
  var categoryValue = typeof form.textField_lv4jmlhc === 'object' ? (form.textField_lv4jmlhc.value || '') : (form.textField_lv4jmlhc || '');
  
  var saveData = {
    textField_lts9tgtv: form.textField_lts9tgtv.trim(),
    textField_luuuddq0: form.textField_luuuddq0 || '',
    radioField_lu6kb8ha: retentionValue,
    textField_ltzfvwhh: form.textField_ltzfvwhh || '',
    textField_lts9tgue: _customState.projectId,
    radioField_ltqu54no: '待归档',
    employeeField_ltqu54nv: [userId],
    dateField_lu7z4rhs: new Date().getTime(),
    tableField_m3pa3hdv: catalogData,
    // 档案形式相关字段
    checkboxField_lv0lultz: form.checkboxField_lv0lultz || ['电子'],
    textField_lv4jmlhc: categoryValue,
    attachmentField_ltqiyj50: attachmentData,
    radioField_m17gf5nj: paperTypeValue,
    numberField_ldgpj9uz: form.numberField_ldgpj9uz || '',
    textField_ltzfvwgg: form.textField_ltzfvwgg || '',
    associationFormField_m17odran: form.associationFormField_m17odran ? [{
      appType: 'APP_HBX0O0II1A22ZT14XYYI',
      formType: 'receipt',
      formUuid: 'FORM-C9E034C6600642CEB6312F8F28648E4DX6X0',
      instanceId: form.associationFormField_m17odran,
      title: (function() {
        var box = _customState.archiveBoxOptions.find(function(opt) { return opt.formInstId === form.associationFormField_m17odran; });
        return box ? box.title : '';
      })()
    }] : [],
    numberField_m17gf5nk: form.numberField_m17gf5nk || '',
    radioField_ltzfvwhf: secretValue,
    multiSelectField_lu7z4rht: form.multiSelectField_ltzfvwhg || [],
    multiSelectField_lu7z4rht_id: form.multiSelectField_ltzfvwhg || [],
    employeeField_ltzgxlbg: (function() {
      var empList = form.employeeField_ltzfvwhh || [];
      return empList.map(function(emp) {
        return emp.emplId || emp.value || emp.userId || emp;
      });
    })(),
    employeeField_ltzgxlbg_id: (function() {
      var empList = form.employeeField_ltzfvwhh || [];
      return empList.map(function(emp) {
        return emp.emplId || emp.value || emp.userId || emp;
      });
    })(),
    // 隐藏字段
    textField_lv4krwac: form.textField_lv4krwac || '',
    textField_lynoqlcc: form.textField_lynoqlcc || '',
    textField_lv4krwad: form.textField_lv4krwad || '',  // 归口部门
    textField_lx4e0znj: form.textField_lx4e0znj || '',
    textField_lymmvp5d: form.textField_lymmvp5d || '',
    textField_m17odram: (function() {
      var box = _customState.archiveBoxOptions.find(function(opt) { return opt.formInstId === form.associationFormField_m17odran; });
      console.log('DEBUG box:', box);
      return box ? box.textField_ltzfvwhh : '';
    })()
  };
  console.log('saveData:', saveData);
  
  // 调试：确保checkboxField_lv0lultz是数组
  if (!Array.isArray(saveData.checkboxField_lv0lultz)) {
    console.error('checkboxField_lv0lultz is not array:', saveData.checkboxField_lv0lultz);
    saveData.checkboxField_lv0lultz = ['电子'];
  }
  
  var formDataJson = JSON.stringify(saveData);
  console.log('formDataJson:', formDataJson);
  
  this.utils.yida.saveFormData({
    formUuid: _customState.archiveFormUuid,
    appType: window.pageConfig.appType,
    formDataJson: formDataJson
  }).then(function(res) {
    console.log('Archive created successfully:', res);
    self.utils.toast({ title: '档案已创建', type: 'success' });
    self.closeArchiveModal();
    self.loadArchiveList();
  }).catch(function(err) {
    console.error('Create archive error:', err);
    self.utils.toast({ title: '创建失败: ' + (err.message || JSON.stringify(err)), type: 'error' });
  });
}

// ============================================================
// 档案员任命
// ============================================================

export function startEditManager() {
  _customState.editingManager = true;
  _customState.employeeFieldValue = _customState.rawManagerData.map(function(emp) {
    var cleanName = emp.name ? emp.name.replace(/\(.*?\)/g, '').trim() : '';
    return { name: cleanName, emplId: emp.userId, value: emp.userId, label: cleanName, displayName: cleanName };
  });
  updateUI(this);
}

export function cancelEditManager() {
  _customState.editingManager = false;
  updateUI(this);
}

export function confirmInlinePick() {
  var self = this;
  var selected = _customState.employeeFieldValue;
  var names = [];
  var ids = [];

  if (!_customState.projectFormInstId) {
    this.utils.toast({ title: '未找到项目记录，无法更新档案员', type: 'error' });
    return;
  }

  if (Array.isArray(selected)) {
    selected.forEach(function(emp) {
      if (emp && typeof emp === 'object') {
        var n = (emp.name || emp.label || emp.displayName || '').replace(/\(.*?\)/g, '').trim();
        var id = emp.emplId || emp.value || emp.workId || '';
        if (n) { names.push(n); ids.push(id); }
      }
    });
  }

  if (ids.length === 0) {
    this.utils.toast({ title: '请选择至少一名档案员', type: 'warn' });
    return;
  }

  this.utils.yida.updateFormData({
    formUuid: _customState.projectFormUuid,
    appType: _customState.projectAppType,
    formInstId: _customState.projectFormInstId,
    updateFormDataJson: JSON.stringify({
      employeeField_ltz87lbw: ids
    })
  }).then(function() {
    _customState.archiveManager = names.join(', ');
    _customState.rawManagerData = names.map(function(name, i) {
      return { name: name, userId: ids[i] || '' };
    });
    _customState.editingManager = false;
    self.utils.toast({ title: '档案员已更新', type: 'success' });
    updateUI(self);
  }).catch(function(err) {
    self.utils.toast({ title: '更新失败: ' + (err.message || '请重试'), type: 'error' });
  });
}

export function closeEmployeeModal() {
  _customState.showEmployeeModal = false;
  updateUI(this);
}

export function removeManager(index) {
  _customState.managerSelected.splice(index, 1);
  updateUI(this);
}

export function saveManager() {
  if (!_customState.projectFormInstId) {
    this.utils.toast({ title: '未找到项目记录', type: 'error' });
    return;
  }
  var selected = _customState.managerSelected;
  if (!selected || selected.length === 0) {
    _customState.editingManager = false;
    updateUI(this);
    return;
  }
  var names = selected.map(function(m) { return m.name; });
  var ids = selected.map(function(m) { return m.userId; });
  var self = this;
  this.utils.yida.updateFormData({
    formUuid: _customState.projectFormUuid,
    formInstId: _customState.projectFormInstId,
    updateFormDataJson: JSON.stringify({
      employeeField_ltz87lbw: names,
      employeeField_ltz87lbw_id: ids
    })
  }).then(function() {
    _customState.archiveManager = names.join(', ');
    _customState.editingManager = false;
    _customState.managerSelected = [];
    self.utils.toast({ title: '档案员已更新', type: 'success' });
    updateUI(self);
  }).catch(function() {
    self.utils.toast({ title: '更新失败', type: 'error' });
  });
}

// ============================================================
// 目录树相关
// 支持无限层级的目录树结构，通过递归构建和渲染
// ============================================================

/**
 * 加载目录树数据
 * 从目录表单中查询当前项目的所有目录，然后构建树形结构
 */
export function loadTreeData() {
  _customState.loading = true;
  updateUI(this);

  this.utils.yida.searchFormDatas({
    formUuid: _customState.formUuid,
    searchFieldJson: JSON.stringify({ textField_lywlvwhp: _customState.projectId }),
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    _customState.loading = false;
    console.log('Loaded catalog data:', res.data ? res.data.length : 0, 'total:', res.totalCount);
    if (res.data && res.data.length > 0) {
      _customState.treeData = this.buildTree(res.data);
    } else {
      _customState.treeData = [];
    }
    updateUI(this);
  }.bind(this)).catch(function() {
    _customState.loading = false;
    updateUI(this);
    this.utils.toast({ title: '加载目录失败', type: 'error' });
  }.bind(this));
}

/**
 * 构建目录树
 * 将扁平的目录数据转换为树形结构
 * @param {Array} dataList - 扁平的目录数据列表
 * @returns {Array} 树形结构的目录数据
 */
export function buildTree(dataList) {
  var mapByInstId = {};
  var roots = [];
  dataList.forEach(function(item) {
    var data = item.formData;
    mapByInstId[item.formInstId] = {
      key: item.formInstId,
      catalogId: data.textField_luw1rfzb || '',
      title: data.textField_luw1rfyq || '未命名',
      level: data.numberField_mmvs0ssc || 1,
      parentCatalogId: data.textField_mmvs0sse || '',
      order: data.numberField_lyz8ywtn || 0,
      formInstId: item.formInstId,
      data: data,
      children: []
    };
  });
  Object.keys(mapByInstId).forEach(function(instId) {
    var node = mapByInstId[instId];
    if (node.level === 1) {
      roots.push(node);
    } else if (node.parentCatalogId) {
      for (var pid in mapByInstId) {
        if (mapByInstId[pid].catalogId === node.parentCatalogId) {
          mapByInstId[pid].children.push(node);
          break;
        }
      }
    }
  });
  roots.forEach(sortChildren);
  roots.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
  return roots;
}

// ============================================================
// 档案列表相关
// 支持分页、筛选、批量选择、拖拽移动等功能
// ============================================================

/**
 * 加载档案列表
 * 根据当前筛选条件加载档案数据
 * 筛选条件包括：项目ID、目录ID、归档状态、档案名、录入日期
 */
export function loadArchiveList() {
  _customState.archiveLoading = true;
  updateUI(this);

  var searchJson = { textField_lts9tgue: _customState.projectId };
  if (_customState.selectedCatalogId) {
    searchJson.tableField_m3pa3hdv = _customState.selectedCatalogId;
  }
  if (_customState.archiveFilter && _customState.archiveFilter !== 'all') {
    searchJson.radioField_ltqu54no = _customState.archiveFilter === 'archived' ? '已归档' : '待归档';
  }
  
  // 档案名筛选
  if (_customState.archiveNameFilter) {
    searchJson.textField_lts9tgtv = _customState.archiveNameFilter;
  }

  var searchParams = {
    formUuid: _customState.archiveFormUuid,
    searchFieldJson: JSON.stringify(searchJson),
    currentPage: _customState.currentPage,
    pageSize: _customState.pageSize
  };
  
  // 录入日期筛选 - CascadeDateField返回的是{start: timestamp, end: timestamp}
  if (_customState.archiveDateRange && typeof _customState.archiveDateRange === 'object') {
    var startTime = _customState.archiveDateRange.start;
    var endTime = _customState.archiveDateRange.end;
    if (startTime) {
      var fromDate = new Date(startTime);
      searchParams.createFrom = fromDate.getFullYear() + '-' + String(fromDate.getMonth() + 1).padStart(2, '0') + '-' + String(fromDate.getDate()).padStart(2, '0');
    }
    if (endTime) {
      var toDate = new Date(endTime);
      searchParams.createTo = toDate.getFullYear() + '-' + String(toDate.getMonth() + 1).padStart(2, '0') + '-' + String(toDate.getDate()).padStart(2, '0');
    }
  }

  this.utils.yida.searchFormDatas(searchParams).then(function(res) {
    _customState.archiveLoading = false;
    _customState.archiveList = res.data || [];
    _customState.archiveTotal = res.totalCount || 0;
    updateUI(this);
  }.bind(this)).catch(function() {
    _customState.archiveLoading = false;
    updateUI(this);
    this.utils.toast({ title: '加载档案列表失败', type: 'error' });
  }.bind(this));
}

/**
 * 切换目录
 * 选中目录后刷新档案列表，清空已选中的档案
 * @param {string} catalogId - 目录ID，空字符串表示显示全部档案
 */
export function selectDirectory(catalogId) {
  _customState.selectedCatalogId = catalogId || '';
  _customState.currentPage = 1;
  _customState.selectedArchiveKeys = [];
  this.loadArchiveList();
}

/**
 * 切换每页显示条数
 * @param {Event} e - 选择框变更事件
 */
export function changePageSize(e) {
  _customState.pageSize = parseInt(e.target.value);
  _customState.currentPage = 1;
  this.loadArchiveList();
}

/**
 * 跳转到指定页
 * @param {number} page - 目标页码
 */
export function goToPage(page) {
  _customState.currentPage = page;
  this.loadArchiveList();
}

// ============================================================
// 批量选择（支持跨页）
// 全选时只添加当前页未选中的项，取消全选时只移除当前页的项
// ============================================================

/**
 * 全选/取消全选当前页的档案
 * 全选：将当前页未选中的档案添加到selectedArchiveKeys
 * 取消全选：将当前页已选中的档案从selectedArchiveKeys移除
 */
export function toggleSelectAll() {
  var list = _customState.archiveList;
  var selectedKeys = _customState.selectedArchiveKeys.slice();
  var allSelected = list.length > 0 && list.every(function(item) { return selectedKeys.indexOf(item.formInstId) >= 0; });
  
  if (allSelected) {
    // 取消全选：只移除当前页的项
    list.forEach(function(item) {
      var idx = selectedKeys.indexOf(item.formInstId);
      if (idx >= 0) { selectedKeys.splice(idx, 1); }
    });
  } else {
    // 全选：添加当前页未选中的项（最多100条）
    list.forEach(function(item) {
      if (selectedKeys.indexOf(item.formInstId) < 0 && selectedKeys.length < 100) {
        selectedKeys.push(item.formInstId);
      }
    });
  }
  _customState.selectedArchiveKeys = selectedKeys;
  updateUI(this);
}

/**
 * 切换单个档案的选中状态
 * @param {string} formInstId - 档案表单实例ID
 */
export function toggleSelectItem(formInstId) {
  var selectedKeys = _customState.selectedArchiveKeys.slice();
  var index = selectedKeys.indexOf(formInstId);
  if (index >= 0) {
    selectedKeys.splice(index, 1);
  } else {
    if (selectedKeys.length >= 100) {
      this.utils.toast({ title: '最多只能选择100条档案', type: 'warn' });
      return;
    }
    selectedKeys.push(formInstId);
  }
  _customState.selectedArchiveKeys = selectedKeys;
  updateUI(this);
}

/**
 * 清空所有选中的档案
 */
export function clearSelection() {
  _customState.selectedArchiveKeys = [];
  updateUI(this);
}

// ============================================================
// 展开/收起
// ============================================================

export function toggleExpand(key) {
  var keys = _customState.expandedKeys.slice();
  var index = keys.indexOf(key);
  if (index >= 0) { keys.splice(index, 1); } else { keys.push(key); }
  _customState.expandedKeys = keys;
  updateUI(this);
}

export function expandAll() {
  var allKeys = [];
  function collect(nodes) {
    nodes.forEach(function(n) {
      allKeys.push(n.key);
      if (n.children) collect(n.children);
    });
  }
  collect(_customState.treeData);
  _customState.expandedKeys = allKeys;
  updateUI(this);
}

export function collapseAll() {
  _customState.expandedKeys = [];
  updateUI(this);
}

// ============================================================
// 目录增删改
// 支持新增顶级目录、新增下级目录、编辑目录、删除目录
// ============================================================

/**
 * 生成随机catalogId
 * 格式：CLASS-{时间戳}-{随机字符串}
 * @returns {string} 生成的目录ID
 */
function generateCatalogId() {
  return 'CLASS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
}

// 打开新增顶级目录模态框
export function openAddCatalogModal() {
  _customState.showCatalogModal = true;
  _customState.catalogModalType = 'add';
  _customState.editingNode = null;
  _customState.catalogForm = {
    textField_luw1rfyq: '',
    textField_lyz8ywto: '',
    numberField_lyz8ywtn: 0
  };
  updateUI(this);
}

// 打开新增下级目录模态框
export function openAddSubCatalogModal(node) {
  _customState.showCatalogModal = true;
  _customState.catalogModalType = 'addSub';
  _customState.editingNode = node;
  _customState.catalogForm = {
    textField_luw1rfyq: '',
    textField_lyz8ywto: '',
    numberField_lyz8ywtn: 0
  };
  updateUI(this);
}

// 打开编辑目录模态框
export function openEditCatalogModal(node) {
  _customState.showCatalogModal = true;
  _customState.catalogModalType = 'edit';
  _customState.editingNode = node;
  _customState.catalogForm = {
    textField_luw1rfyq: node.title || '',
    textField_lyz8ywto: node.data ? (node.data.textField_lyz8ywto || '') : '',
    numberField_lyz8ywtn: node.order || 0
  };
  updateUI(this);
}

// 关闭目录模态框
export function closeCatalogModal() {
  _customState.showCatalogModal = false;
  _customState.editingNode = null;
  updateUI(this);
}

// 处理目录表单变更
export function handleCatalogFormChange(field, value) {
  _customState.catalogForm[field] = value;
  updateUI(this);
}

/**
 * 保存目录（新增或编辑）
 * - 编辑模式：更新现有目录的名称、文件范围说明、序号
 * - 新增模式：先检查目录防重校验，然后创建新目录
 * 目录防重校验字段：SYSCLASS+目录名+项目ID
 * 创建时设置提交人、序号（同级最大序号+1）等字段
 */
export function saveCatalog() {
  var self = this;
  var form = _customState.catalogForm;
  
  if (!form.textField_luw1rfyq || !form.textField_luw1rfyq.trim()) {
    this.utils.toast({ title: '请输入目录名称', type: 'warn' });
    return;
  }
  
  var catalogName = form.textField_luw1rfyq.trim();
  // 目录防重校验：SYSCLASS+目录名+项目ID
  var validateCode = 'SYSCLASS' + catalogName + _customState.projectId;
  
  if (_customState.catalogModalType === 'edit') {
    // 编辑模式：更新现有目录
    var node = _customState.editingNode;
    this.utils.yida.updateFormData({
      formUuid: _customState.formUuid,
      formInstId: node.formInstId,
      updateFormDataJson: JSON.stringify({
        textField_luw1rfyq: catalogName,
        textField_lyz8ywto: form.textField_lyz8ywto || '',
        numberField_lyz8ywtn: form.numberField_lyz8ywtn || 0,
        textField_lw1qqnnd: validateCode
      })
    }).then(function() {
      self.utils.toast({ title: '目录已更新', type: 'success' });
      self.closeCatalogModal();
      self.loadTreeData();
    }).catch(function() {
      self.utils.toast({ title: '更新失败', type: 'error' });
    });
  } else {
    // 新增模式：先检查是否已存在同名目录
    this.utils.yida.searchFormDatas({
      formUuid: _customState.formUuid,
      searchFieldJson: JSON.stringify({ 
        textField_lw1qqnnd: validateCode,
        textField_lywlvwhp: _customState.projectId
      }),
      currentPage: 1,
      pageSize: 1
    }).then(function(res) {
      if (res.data && res.data.length > 0) {
        // 已存在同名目录
        self.utils.toast({ title: '目录 "' + catalogName + '" 已存在，请勿重复创建', type: 'warn' });
        return;
      }
      
      // 不存在同名目录，继续创建
      var parentCatalogId = '';
      var level = 1;
      var parentChildren = _customState.treeData;
      
      if (_customState.catalogModalType === 'addSub' && _customState.editingNode) {
        parentCatalogId = _customState.editingNode.catalogId;
        level = (_customState.editingNode.level || 1) + 1;
        parentChildren = _customState.editingNode.children || [];
      }
      
      // 计算序号：当前同级目录中的最大序号+1
      var maxOrder = 0;
      parentChildren.forEach(function(child) {
        if ((child.order || 0) > maxOrder) {
          maxOrder = child.order;
        }
      });
      var newOrder = maxOrder + 1;
      
      // 获取当前用户ID
      var userId = window.loginUser ? window.loginUser.userId : '';
      
      self.utils.yida.saveFormData({
        formUuid: _customState.formUuid,
        appType: window.pageConfig.appType,
        formDataJson: JSON.stringify({
          textField_luw1rfyq: catalogName,
          textField_lyz8ywto: form.textField_lyz8ywto || '',
          numberField_lyz8ywtn: newOrder,
          textField_lywlvwhp: _customState.projectId,
          textField_lyz5so4p: _customState.projectName,
          numberField_mmvs0ssc: level,
          textField_mmvs0sse: parentCatalogId,
          radioField_m8pq3j2w: '自定义',
          textField_luw1rfzb: generateCatalogId(),
          textField_lw1qqnnd: validateCode,
          employeeField_mmx9jfvr: [userId]
        })
      }).then(function() {
        self.utils.toast({ title: '目录已创建', type: 'success' });
        self.closeCatalogModal();
        self.loadTreeData();
      }).catch(function() {
        self.utils.toast({ title: '创建失败', type: 'error' });
      });
    }).catch(function() {
      self.utils.toast({ title: '校验失败，请重试', type: 'error' });
    });
  }
}

/**
 * 删除目录（确认后执行）
 * 如果目录包含子目录，会提示用户确认删除
 * @param {Object} node - 要删除的目录节点
 */
export function deleteCatalog(node) {
  var self = this;
  
  // 检查是否有子目录
  var message = '';
  if (node.children && node.children.length > 0) {
    message = '该目录包含 ' + node.children.length + ' 个子目录，删除后子目录也将被删除，确定要删除吗？';
  } else {
    message = '确定要删除目录 "' + node.title + '" 吗？';
  }
  
  if (window.confirm(message)) {
    self.doDeleteCatalog(node);
  }
}

/**
 * 执行删除目录（递归删除子目录）
 * 收集所有需要删除的节点（包括子目录），逐个调用删除API
 * @param {Object} node - 要删除的目录节点
 */
export function doDeleteCatalog(node) {
  var self = this;
  
  // 递归收集所有需要删除的节点
  var nodesToDelete = [];
  function collectNodes(n) {
    nodesToDelete.push(n);
    if (n.children) {
      n.children.forEach(collectNodes);
    }
  }
  collectNodes(node);
  
  self.utils.toast({ title: '正在删除...', type: 'loading' });
  
  // 逐个删除
  var completed = 0;
  var failed = 0;
  var total = nodesToDelete.length;
  
  nodesToDelete.forEach(function(n) {
    self.utils.yida.deleteFormData({
      formUuid: _customState.formUuid,
      formInstId: n.formInstId
    }).then(function() {
      completed++;
      if (completed + failed === total) {
        finishDelete();
      }
    }).catch(function() {
      failed++;
      if (completed + failed === total) {
        finishDelete();
      }
    });
  });
  
  function finishDelete() {
    if (failed === 0) {
      self.utils.toast({ title: '目录已删除', type: 'success' });
    } else {
      self.utils.toast({ title: '删除完成：成功 ' + completed + ' 个，失败 ' + failed + ' 个', type: 'warn' });
    }
    if (_customState.selectedCatalogId === node.catalogId) {
      _customState.selectedCatalogId = '';
    }
    self.loadTreeData();
  }
}

// ============================================================
// 目录拖拽排序
// 支持同级拖拽（调整顺序）和跨级拖拽（移动到其他目录内部）
// ============================================================

/**
 * 目录拖拽开始
 * @param {DragEvent} e - 拖拽事件
 * @param {Object} node - 被拖拽的目录节点
 */
export function handleDragStart(e, node) {
  _customState.dragNode = node;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', node.key);
}

export function handleDragOver(e, node) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';
  
  if (_customState.dragNode && _customState.dragNode.key !== node.key) {
    var rect = e.currentTarget.getBoundingClientRect();
    var y = e.clientY - rect.top;
    var height = rect.height;
    
    if (y < height * 0.3) {
      _customState.dragOverNode = node;
      _customState.dragPosition = 'before';
    } else if (y > height * 0.7) {
      _customState.dragOverNode = node;
      _customState.dragPosition = 'after';
    } else {
      _customState.dragOverNode = node;
      _customState.dragPosition = 'inside';
    }
    updateUI(this);
  }
}

export function handleDragLeave(e) {
  var rect = e.currentTarget.getBoundingClientRect();
  var x = e.clientX;
  var y = e.clientY;
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    _customState.dragOverNode = null;
    _customState.dragPosition = null;
    updateUI(this);
  }
}

export function handleDrop(e, targetNode) {
  e.preventDefault();
  e.stopPropagation();
  var self = this;
  var dragNode = _customState.dragNode;
  var position = _customState.dragPosition;
  
  console.log('handleDrop called', { dragNode: dragNode, targetNode: targetNode, position: position });
  
  if (!dragNode || !position || dragNode.key === targetNode.key) {
    this.resetDragState();
    return;
  }
  
  // 不能拖到自己的子节点
  function isDescendant(parent, childKey) {
    if (!parent.children) return false;
    for (var i = 0; i < parent.children.length; i++) {
      if (parent.children[i].key === childKey) return true;
      if (isDescendant(parent.children[i], childKey)) return true;
    }
    return false;
  }
  
  if (isDescendant(dragNode, targetNode.key)) {
    self.utils.toast({ title: '不能移动到子目录下', type: 'warn' });
    this.resetDragState();
    return;
  }
  
  var isCrossLevel = position === 'inside';
  var isSameParent = dragNode.parentCatalogId === targetNode.parentCatalogId;
  
  // 收集需要更新的节点
  var updates = [];
  
  if (isCrossLevel) {
    // 拖动到目录内部：成为目标目录的子目录
    var newLevel = (targetNode.level || 1) + 1;
    var targetChildren = targetNode.children || [];
    
    // 新序号 = 子目录数量 + 1
    var newOrder = targetChildren.length + 1;
    
    // 更新被拖动节点
    updates.push({
      formInstId: dragNode.formInstId,
      data: {
        textField_mmvs0sse: targetNode.catalogId,
        numberField_mmvs0ssc: newLevel,
        numberField_lyz8ywtn: newOrder
      }
    });
    
    // 目标位置后的节点序号+1
    targetChildren.forEach(function(child) {
      if ((child.order || 0) >= newOrder) {
        updates.push({
          formInstId: child.formInstId,
          data: { numberField_lyz8ywtn: child.order + 1 }
        });
      }
    });
    
    console.log('Cross-level drag', {
      newParent: targetNode.catalogId,
      newLevel: newLevel,
      newOrder: newOrder
    });
  } else if (!isSameParent) {
    // 同级拖拽但父目录不同
    var newParent = findParentNode(_customState.treeData, targetNode.key);
    var newLevel2 = targetNode.level || 1;
    var newSiblings = newParent ? (newParent.children || []) : _customState.treeData;
    var targetOrder = targetNode.order || 0;
    var newOrder2 = position === 'before' ? targetOrder : targetOrder + 1;
    
    // 更新被拖动节点
    updates.push({
      formInstId: dragNode.formInstId,
      data: {
        textField_mmvs0sse: newParent ? newParent.catalogId : '',
        numberField_mmvs0ssc: newLevel2,
        numberField_lyz8ywtn: newOrder2
      }
    });
    
    // 目标位置后的节点序号+1
    newSiblings.forEach(function(sibling) {
      if (sibling.key !== dragNode.key && (sibling.order || 0) >= newOrder2) {
        updates.push({
          formInstId: sibling.formInstId,
          data: { numberField_lyz8ywtn: sibling.order + 1 }
        });
      }
    });
    
    console.log('Cross-parent same-level drag', {
      newParent: newParent ? newParent.catalogId : '',
      newLevel: newLevel2,
      newOrder: newOrder2
    });
  } else {
    // 同级同父目录拖拽
    var parent = findParentNode(_customState.treeData, dragNode.key);
    var siblings = parent ? (parent.children || []) : _customState.treeData;
    var dragOrder = dragNode.order || 0;
    var targetOrder2 = targetNode.order || 0;
    
    // 计算新序号
    var newOrder3 = position === 'before' ? targetOrder2 : targetOrder2 + 1;
    
    // 更新被拖动节点
    updates.push({
      formInstId: dragNode.formInstId,
      data: { numberField_lyz8ywtn: newOrder3 }
    });
    
    // 同级拖动：只有目标位置与源位置之间的节点需要修改序号
    if (dragOrder < newOrder3) {
      // 向下拖：dragOrder+1到newOrder之间的节点-1
      siblings.forEach(function(sibling) {
        if (sibling.key !== dragNode.key) {
          var sibOrder = sibling.order || 0;
          if (sibOrder > dragOrder && sibOrder <= newOrder3) {
            updates.push({
              formInstId: sibling.formInstId,
              data: { numberField_lyz8ywtn: sibOrder - 1 }
            });
          }
        }
      });
    } else if (dragOrder > newOrder3) {
      // 向上拖：newOrder到dragOrder-1之间的节点+1
      siblings.forEach(function(sibling) {
        if (sibling.key !== dragNode.key) {
          var sibOrder = sibling.order || 0;
          if (sibOrder >= newOrder3 && sibOrder < dragOrder) {
            updates.push({
              formInstId: sibling.formInstId,
              data: { numberField_lyz8ywtn: sibOrder + 1 }
            });
          }
        }
      });
    }
    
    console.log('Same-level drag', {
      dragOrder: dragOrder,
      targetOrder: targetOrder2,
      position: position,
      newOrder: newOrder3
    });
  }
  
  console.log('Updates:', updates);
  
  // 执行更新
  var completed = 0;
  var failed = 0;
  var total = updates.length;
  
  updates.forEach(function(update) {
    self.utils.yida.updateFormData({
      formUuid: _customState.formUuid,
      formInstId: update.formInstId,
      updateFormDataJson: JSON.stringify(update.data)
    }).then(function() {
      completed++;
      if (completed + failed === total) {
        finishDrag();
      }
    }).catch(function(err) {
      console.error('Update failed for', update.formInstId, err);
      failed++;
      if (completed + failed === total) {
        finishDrag();
      }
    });
  });
  
  function finishDrag() {
    console.log('Drag completed:', { completed: completed, failed: failed });
    if (failed > 0) {
      self.utils.toast({ title: '移动失败', type: 'error' });
    } else {
      // 更新本地目录树状态
      self.updateLocalTreeAfterDrag(dragNode, targetNode, position);
    }
    self.resetDragState();
  }
}

// 更新本地目录树状态
export function updateLocalTreeAfterDrag(dragNode, targetNode, position) {
  var self = this;
  
  // 查找节点
  function findNodeByKey(nodes, key) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) return nodes[i];
      if (nodes[i].children) {
        var found = findNodeByKey(nodes[i].children, key);
        if (found) return found;
      }
    }
    return null;
  }
  
  // 查找节点的父节点数组
  function findParentArray(nodes, key) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) return nodes;
      if (nodes[i].children) {
        var found = findParentArray(nodes[i].children, key);
        if (found) return found;
      }
    }
    return null;
  }
  
  // 从树中移除节点
  function removeFromTree(nodes, key) {
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].key === key) {
        return nodes.splice(i, 1)[0];
      }
      if (nodes[i].children) {
        var removed = removeFromTree(nodes[i].children, key);
        if (removed) return removed;
      }
    }
    return null;
  }
  
  // 深拷贝被拖动的节点
  var draggedNode = JSON.parse(JSON.stringify(dragNode));
  draggedNode.children = dragNode.children ? JSON.parse(JSON.stringify(dragNode.children)) : [];
  
  // 先找到目标节点（在移除之前）
  var targetNodeInTree = findNodeByKey(_customState.treeData, targetNode.key);
  
  // 从原位置移除
  removeFromTree(_customState.treeData, dragNode.key);
  
  if (position === 'inside') {
    // 拖动到目录内部：成为目标目录的子目录
    if (targetNodeInTree) {
      draggedNode.parentCatalogId = targetNode.catalogId;
      draggedNode.level = (targetNode.level || 1) + 1;
      draggedNode.order = (targetNodeInTree.children ? targetNodeInTree.children.length : 0) + 1;
      if (!targetNodeInTree.children) targetNodeInTree.children = [];
      targetNodeInTree.children.push(draggedNode);
      
      console.log('Cross-level drag local update:', {
        parentCatalogId: draggedNode.parentCatalogId,
        level: draggedNode.level,
        order: draggedNode.order
      });
    }
  } else {
    // 同级拖动
    var isSameParent = dragNode.parentCatalogId === targetNode.parentCatalogId;
    
    // 找到目标节点的父数组
    var targetParentArray = findParentArray(_customState.treeData, targetNode.key);
    
    if (targetParentArray) {
      var targetIndex = -1;
      for (var i = 0; i < targetParentArray.length; i++) {
        if (targetParentArray[i].key === targetNode.key) {
          targetIndex = i;
          break;
        }
      }
      
      if (targetIndex >= 0) {
        var insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        
        if (!isSameParent) {
          // 不同父目录：更新父目录和层级
          var newParent = null;
          for (var i = 0; i < _customState.treeData.length; i++) {
            if (_customState.treeData[i].children) {
              for (var j = 0; j < _customState.treeData[i].children.length; j++) {
                if (_customState.treeData[i].children[j].key === targetNode.key) {
                  newParent = _customState.treeData[i];
                  break;
                }
              }
              if (newParent) break;
            }
          }
          
          if (newParent) {
            draggedNode.parentCatalogId = newParent.catalogId;
            draggedNode.level = newParent.level + 1;
          }
        }
        
        draggedNode.order = targetNode.order;
        targetParentArray.splice(insertIndex, 0, draggedNode);
        
        // 更新序号
        targetParentArray.forEach(function(node, index) {
          node.order = index + 1;
        });
        
        console.log('Same-level drag local update:', {
          parentCatalogId: draggedNode.parentCatalogId,
          level: draggedNode.level,
          order: draggedNode.order,
          insertIndex: insertIndex
        });
      }
    }
  }
  
  // 触发UI更新
  updateUI(this);
}

// ============================================================
// 档案拖拽功能
// 支持将档案拖拽到指定目录，拖拽时目录自动展开
// ============================================================

/**
 * 档案拖拽开始
 * 如果拖拽的档案在已选中列表中，则拖拽所有选中的档案
 * 否则只拖拽当前档案，并自动选中它
 * @param {DragEvent} e - 拖拽事件
 * @param {Object} archiveItem - 被拖拽的档案数据
 */
export function handleArchiveDragStart(e, archiveItem) {
  // 如果选中的档案包含当前拖拽的档案，则拖拽所有选中的档案
  if (_customState.selectedArchiveKeys.indexOf(archiveItem.formInstId) >= 0) {
    // 拖拽所有选中的档案
    var selectedArchives = _customState.archiveList.filter(function(item) {
      return _customState.selectedArchiveKeys.indexOf(item.formInstId) >= 0;
    });
    _customState.dragArchive = {
      isBatch: true,
      archives: selectedArchives
    };
  } else {
    // 只拖拽当前档案
    _customState.selectedArchiveKeys = [archiveItem.formInstId];
    _customState.dragArchive = {
      isBatch: false,
      archives: [archiveItem]
    };
  }
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', archiveItem.formInstId);
}

// 档案拖拽结束
export function handleArchiveDragEnd(e) {
  _customState.dragArchive = null;
  _customState.dragOverCatalogKey = null;
  if (_customState.autoExpandTimer) {
    clearTimeout(_customState.autoExpandTimer);
    _customState.autoExpandTimer = null;
  }
  updateUI(this);
}

// 目录接收档案拖拽
export function handleCatalogDragOver(e, node) {
  e.preventDefault();
  e.stopPropagation();
  
  if (_customState.dragArchive) {
    e.dataTransfer.dropEffect = 'move';
    _customState.dragOverCatalogKey = node.key;
    
    // 自动展开目录
    if (node.children && node.children.length > 0 && _customState.expandedKeys.indexOf(node.key) < 0) {
      if (!_customState.autoExpandTimer) {
        _customState.autoExpandTimer = setTimeout(function() {
          if (_customState.dragOverCatalogKey === node.key && _customState.dragArchive) {
            var keys = _customState.expandedKeys.slice();
            if (keys.indexOf(node.key) < 0) {
              keys.push(node.key);
              _customState.expandedKeys = keys;
            }
            updateUI(this);
          }
          _customState.autoExpandTimer = null;
        }.bind(this), 500);
      }
    }
    
    updateUI(this);
  }
}

// 目录离开档案拖拽
export function handleCatalogDragLeave(e, node) {
  if (_customState.dragOverCatalogKey === node.key) {
    _customState.dragOverCatalogKey = null;
    if (_customState.autoExpandTimer) {
      clearTimeout(_customState.autoExpandTimer);
      _customState.autoExpandTimer = null;
    }
    updateUI(this);
  }
}

// 目录放下档案
export function handleCatalogDrop(e, node) {
  e.preventDefault();
  e.stopPropagation();
  
  var self = this;
  var dragData = _customState.dragArchive;
  
  if (!dragData || !dragData.archives || dragData.archives.length === 0) {
    this.resetArchiveDragState();
    return;
  }
  
  var archives = dragData.archives;
  
  // 获取目标目录的完整路径
  var catalogPath = [];
  function findPath(nodes, targetId, path) {
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var newPath = path.concat([{ catalogId: n.catalogId, title: n.title }]);
      if (n.catalogId === node.catalogId) {
        catalogPath = newPath;
        return true;
      }
      if (n.children && findPath(n.children, targetId, newPath)) {
        return true;
      }
    }
    return false;
  }
  findPath(_customState.treeData, node.catalogId, []);
  
  if (catalogPath.length === 0) {
    this.utils.toast({ title: '未找到目标目录', type: 'error' });
    this.resetArchiveDragState();
    return;
  }
  
  // 构建目录数据
  var catalogNames = catalogPath.map(function(c) { return c.title; });
  var catalogIds = catalogPath.map(function(c) { return c.catalogId; });
  var catalogData = catalogNames.map(function(name, idx) {
    return {
      textField_m3pa3hdx: name,
      textField_m3pa3hdy: catalogIds[idx]
    };
  });
  
  // 批量更新档案
  var completed = 0;
  var failed = 0;
  var total = archives.length;
  var successIds = [];
  
  archives.forEach(function(archive) {
    self.utils.yida.updateFormData({
      formUuid: _customState.archiveFormUuid,
      formInstId: archive.formInstId,
      updateFormDataJson: JSON.stringify({
        tableField_m3pa3hdv: catalogData
      })
    }).then(function() {
      completed++;
      successIds.push(archive.formInstId);
      if (completed + failed === total) {
        finishBatchMove();
      }
    }).catch(function() {
      failed++;
      if (completed + failed === total) {
        finishBatchMove();
      }
    });
  });
  
  function finishBatchMove() {
    // 从当前档案列表中移除成功移动的档案
    _customState.archiveList = _customState.archiveList.filter(function(item) {
      return successIds.indexOf(item.formInstId) < 0;
    });
    _customState.archiveTotal = Math.max(0, _customState.archiveTotal - completed);
    _customState.selectedArchiveKeys = [];
    
    if (failed > 0) {
      self.utils.toast({ title: '移动完成：成功 ' + completed + ' 个，失败 ' + failed + ' 个', type: 'warn' });
    }
    
    updateUI(self);
    self.resetArchiveDragState();
  }
}

// 重置档案拖拽状态
export function resetArchiveDragState() {
  _customState.dragArchive = null;
  _customState.dragOverCatalogKey = null;
  if (_customState.autoExpandTimer) {
    clearTimeout(_customState.autoExpandTimer);
    _customState.autoExpandTimer = null;
  }
  updateUI(this);
}

// ============================================================
// 批量归档
// 对选中的"待归档"档案发起归档审批流程
// ============================================================

/**
 * 批量归档（确认）
 * 弹出确认对话框，确认后执行归档
 */
export function batchArchive() {
  var self = this;
  
  if (window.confirm('归档后，档案将处于不可编辑的锁定状态，确定要归档吗？')) {
    this.doBatchArchive();
  }
}

/**
 * 执行批量归档
 * 调用startProcessInstance发起归档审批流程
 * 流程表单ID：FORM-21B4EB1AAF2A45D39D8845BA17C99EC1DLE9
 * 流程编码：TPROC--KP666NB1MF7UWI2FF5L4HBDIGF0O2541A5Y8M2
 */
export function doBatchArchive() {
  var self = this;
  var selectedKeys = _customState.selectedArchiveKeys;
  var userId = window.loginUser ? window.loginUser.userId : '';
  var userName = window.loginUser ? window.loginUser.userName : '';
  var now = new Date().getTime();
  
  // 获取选中的档案信息
  var selectedArchives = _customState.archiveList.filter(function(item) {
    return selectedKeys.indexOf(item.formInstId) >= 0;
  });
  
  // 构建关联表单数据
  var associationData = selectedArchives.map(function(archive) {
    var d = archive.formData || {};
    return {
      associationFormField_m8y63v41: [{
        appType: 'APP_HBX0O0II1A22ZT14XYYI',
        formType: 'receipt',
        formUuid: 'FORM-82636FC6E1414BE080ACE340E9E0E11AEU3D',
        instanceId: archive.formInstId,
        title: d.textField_lts9tgtv || ''
      }],
      textField_m8y63v54: d.textField_luuuddq0 || '',
      selectField_m8y63v56: self.getRetentionText(d.radioField_lu6kb8ha || ''),
      textField_m8y63v4s: d.textField_lts9tgtv || '',
      textField_m8y63v4t: d.textField_ltzfvwhh || ''
    };
  });
  
  // 创建流程数据
  var processData = {
    textField_m8y6r5p1: _customState.projectName,
    employeeField_m8y63v4v: [userId],
    employeeField_m8y6r5p3: [_customState.projectManagerId || userId],
    dateField_m8y63v50: now,
    textField_m8y63v4o: _customState.projectId,
    textField_m8y63v4x: userName,
    textField_m8y63v4y: userId,
    tableField_m8y63v4q: associationData
  };
  
  self.utils.toast({ title: '正在发起归档审批流程...', type: 'loading' });
  
  self.utils.yida.startProcessInstance({
    formUuid: 'FORM-21B4EB1AAF2A45D39D8845BA17C99EC1DLE9',
    processCode: 'TPROC--KP666NB1MF7UWI2FF5L4HBDIGF0O2541A5Y8M2',
    formDataJson: JSON.stringify(processData)
  }).then(function(res) {
    self.utils.toast({ title: '归档审批流程发起成功', type: 'success' });
    self.clearSelection();
    self.loadArchiveList();
  }).catch(function(err) {
    self.utils.toast({ title: '归档审批流程发起失败：' + (err.message || ''), type: 'error' });
  });
}

// ============================================================
// 修复目录序号
// 将所有目录序号重新排序，从1开始，后续依次+1
// ============================================================

/**
 * 修复目录序号
 * 重新加载目录数据，然后按层级和顺序重新分配序号
 */
export function fixCatalogOrder() {
  var self = this;
  
  self.utils.toast({ title: '正在修复序号...', type: 'loading' });
  
  // 先重新加载数据
  self.utils.yida.searchFormDatas({
    formUuid: _customState.formUuid,
    searchFieldJson: JSON.stringify({ textField_lywlvwhp: _customState.projectId }),
    currentPage: 1,
    pageSize: 100
  }).then(function(res) {
    if (!res.data || res.data.length === 0) {
      self.utils.toast({ title: '没有目录数据', type: 'info' });
      return;
    }
    
    var treeData = self.buildTree(res.data);
    var updates = [];
    
    // 递归收集所有需要修复的节点
    function collectNodes(nodes) {
      // 按当前序号排序
      var sorted = nodes.slice().sort(function(a, b) { return (a.order || 0) - (b.order || 0); });
      
      // 重新分配序号从1开始
      sorted.forEach(function(node, index) {
        var newOrder = index + 1;
        if (node.order !== newOrder) {
          updates.push({
            formInstId: node.formInstId,
            data: { numberField_lyz8ywtn: newOrder }
          });
        }
        // 递归处理子目录
        if (node.children && node.children.length > 0) {
          collectNodes(node.children);
        }
      });
    }
    
    collectNodes(treeData);
    
    if (updates.length === 0) {
      self.utils.toast({ title: '目录序号无需修复', type: 'info' });
      return;
    }
    
    console.log('Fixing order:', updates.length);
    
    var completed = 0;
    var failed = 0;
    var total = updates.length;
    
    updates.forEach(function(update) {
      self.utils.yida.updateFormData({
        formUuid: _customState.formUuid,
        formInstId: update.formInstId,
        updateFormDataJson: JSON.stringify(update.data)
      }).then(function() {
        completed++;
        if (completed + failed === total) {
          finishFix();
        }
      }).catch(function() {
        failed++;
        if (completed + failed === total) {
          finishFix();
        }
      });
    });
    
    function finishFix() {
      console.log('Fix completed:', { completed: completed, failed: failed });
      if (failed > 0) {
        self.utils.toast({ title: '修复完成：成功 ' + completed + ' 个，失败 ' + failed + ' 个', type: 'warn' });
      } else {
        self.utils.toast({ title: '序号修复完成，共修复 ' + completed + ' 个目录', type: 'success' });
      }
      self.loadTreeData();
    }
  }).catch(function() {
    self.utils.toast({ title: '修复失败', type: 'error' });
  });
}

export function findParentNode(nodes, childKey, parent) {
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].key === childKey) return parent;
    if (nodes[i].children) {
      var found = findParentNode(nodes[i].children, childKey, nodes[i]);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

export function handleDragEnd(e) {
  this.resetDragState();
}

export function resetDragState() {
  _customState.dragNode = null;
  _customState.dragOverNode = null;
  _customState.dragPosition = null;
  updateUI(this);
}

export function openDirManageModal() {
  _customState.showDirManageModal = true;
  updateUI(this);
}

export function closeDirManageModal() {
  _customState.showDirManageModal = false;
  this.loadTreeData();
}

// ============================================================
// 渲染目录树节点
// ============================================================

export function renderTreeNode(node, level) {
  var hasChildren = node.children && node.children.length > 0;
  var isExpanded = _customState.expandedKeys.indexOf(node.key) >= 0;
  var isSelected = _customState.selectedCatalogId === node.catalogId;
  var isDragOver = _customState.dragOverNode && _customState.dragOverNode.key === node.key;
  var dragPosition = isDragOver ? _customState.dragPosition : null;
  var isDragging = _customState.dragNode && _customState.dragNode.key === node.key;
  var isArchiveDragOver = _customState.dragOverCatalogKey === node.key;
  var hasArchiveDrag = _customState.dragArchive !== null;

  var nodeStyle = {
    display: 'flex', alignItems: 'center', padding: '6px 8px',
    backgroundColor: isArchiveDragOver ? '#e6f7ff' : (isSelected ? '#e6f4ff' : (_customState.hoveredKey === node.key ? '#f5f5f5' : '#fff')),
    border: isArchiveDragOver ? '2px dashed #1890ff' : (isSelected ? '1px solid #91caff' : '1px solid transparent'),
    borderRadius: '4px', marginLeft: (level * 16) + 'px',
    cursor: hasArchiveDrag ? 'copy' : 'grab', userSelect: 'none', fontSize: '13px',
    opacity: isDragging ? 0.5 : 1,
    borderTop: dragPosition === 'before' ? '2px solid #1890ff' : 'none',
    borderBottom: dragPosition === 'after' ? '2px solid #1890ff' : 'none'
  };

  return (
    <div key={node.key}>
      <div
        draggable={!hasArchiveDrag && this.canManageArchive()}
        onMouseEnter={() => { _customState.hoveredKey = node.key; updateUI(this); }}
        onMouseLeave={() => { _customState.hoveredKey = null; updateUI(this); }}
        onClick={() => { _customState.selectedKey = node.key; this.selectDirectory(node.catalogId); }}
        onDragStart={(e) => { if (!hasArchiveDrag) this.handleDragStart(e, node); }}
        onDragOver={(e) => {
          if (hasArchiveDrag) {
            this.handleCatalogDragOver(e, node);
          } else {
            this.handleDragOver(e, node);
          }
        }}
        onDragLeave={(e) => {
          if (hasArchiveDrag) {
            this.handleCatalogDragLeave(e, node);
          } else {
            this.handleDragLeave(e);
          }
        }}
        onDrop={(e) => {
          if (hasArchiveDrag) {
            this.handleCatalogDrop(e, node);
          } else {
            this.handleDrop(e, node);
          }
        }}
        onDragEnd={(e) => { this.handleDragEnd(e); }}
        style={nodeStyle}
      >
        <span style={{ marginRight: '4px', color: '#1890ff', fontSize: '10px', cursor: 'pointer' }}
          onClick={(e) => { e.stopPropagation(); this.toggleExpand(node.key); }}>
          {hasChildren ? (isExpanded ? '▼' : '▶') : '•'}
        </span>
        <span style={{ flex: 1, color: isSelected ? '#1890ff' : '#333', fontWeight: isSelected ? 'bold' : 'normal' }}>{node.title}</span>
        {!hasArchiveDrag && this.canManageArchive() && (
          <span style={{ display: 'flex', gap: '4px', marginLeft: '8px', opacity: _customState.hoveredKey === node.key ? 1 : 0, transition: 'opacity 0.2s' }}>
            <span title="编辑" style={{ cursor: 'pointer', color: '#1890ff', fontSize: '12px', padding: '2px 4px', borderRadius: '2px' }}
              onClick={(e) => { e.stopPropagation(); this.openEditCatalogModal(node); }}>✎</span>
            <span title="新增下级" style={{ cursor: 'pointer', color: '#52c41a', fontSize: '14px', padding: '2px 4px', borderRadius: '2px' }}
              onClick={(e) => { e.stopPropagation(); this.openAddSubCatalogModal(node); }}>＋</span>
            <span title="删除" style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '12px', padding: '2px 4px', borderRadius: '2px' }}
              onClick={(e) => { e.stopPropagation(); this.deleteCatalog(node); }}>✕</span>
          </span>
        )}
      </div>
      {hasChildren && isExpanded && node.children.map(function(child) {
        return this.renderTreeNode(child, level + 1);
      }.bind(this))}
    </div>
  );
}

// ============================================================
// 辅助函数
// 用于数据格式化和显示
// ============================================================

/**
 * 获取当前用户信息
 * @returns {Object} 用户信息 {userId, userName}
 */
export function getCurrentUser() {
  return {
    userId: window.loginUser ? window.loginUser.userId : '',
    userName: window.loginUser ? window.loginUser.userName : ''
  };
}

/**
 * 判断当前用户是否是项目负责人
 * @returns {boolean}
 */
export function isProjectManager() {
  var userId = this.getCurrentUser().userId;
  return !!(userId && _customState.projectManagerId && userId === _customState.projectManagerId);
}

/**
 * 判断当前用户是否是档案员
 * @returns {boolean}
 */
export function isArchiveManager() {
  var userId = this.getCurrentUser().userId;
  if (!userId || !_customState.rawManagerData) return false;
  return _customState.rawManagerData.some(function(m) {
    return m.userId === userId;
  });
}

/**
 * 判断当前用户是否可以管理档案（项目负责人或档案员）
 * @returns {boolean}
 */
export function canManageArchive() {
  return this.isProjectManager() || this.isArchiveManager();
}

/**
 * 判断当前用户是否可以录入档案（项目负责人、档案员、项目成员）
 * 项目成员判断：所有登录用户都可以录入
 * @returns {boolean}
 */
export function canCreateArchive() {
  var userId = this.getCurrentUser().userId;
  return !!userId; // 所有登录用户都可以录入档案
}

/**
 * 判断当前用户是否可以解锁档案（仅项目负责人）
 * @returns {boolean}
 */
export function canUnlockArchive() {
  return this.isProjectManager();
}

/**
 * 判断当前用户是否可以批量归档（项目负责人或档案员）
 * @returns {boolean}
 */
export function canBatchArchive() {
  return this.canManageArchive();
}

/**
 * 判断当前用户是否可以任命档案员（项目负责人或档案员）
 * @returns {boolean}
 */
export function canAppointManager() {
  return this.canManageArchive();
}

/**
 * 判断当前用户是否可以拖拽档案（项目负责人或档案员）
 * @returns {boolean}
 */
export function canDragArchive() {
  return this.canManageArchive();
}

/**
 * 获取档案字段值
 * 支持数组类型（用逗号连接）和普通类型
 * @param {Object} data - 档案表单数据
 * @param {string} fieldId - 字段ID
 * @returns {string} 字段值
 */
export function getArchiveField(data, fieldId) {
  var val = data[fieldId];
  if (Array.isArray(val)) return val.join(', ');
  return val || '';
}

/**
 * 获取保管期限的显示文本
 * @param {string} value - 保管期限值（Y/D30/D15/D10/D5）
 * @returns {string} 显示文本（永久/30年/15年/10年/5年）
 */
export function getRetentionText(value) {
  var map = { 'Y': '永久', 'D30': '30年', 'D15': '15年', 'D10': '10年', 'D5': '5年' };
  return map[value] || value || '';
}

/**
 * 格式化日期时间戳为字符串
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {string} 格式化后的日期字符串（YYYY-MM-DD）
 */
export function formatDate(timestamp) {
  if (!timestamp) return '';
  var date = new Date(timestamp);
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

/**
 * 获取员工字段的姓名
 * 支持字符串、数组、对象等多种格式
 * @param {string|Array|Object} employeeField - 员工字段值
 * @returns {string} 员工姓名（多个用逗号分隔）
 */
export function getEmployeeName(employeeField) {
  if (!employeeField) return '';
  if (typeof employeeField === 'string') return employeeField;
  if (Array.isArray(employeeField)) {
    return employeeField.map(function(emp) {
      if (typeof emp === 'string') return emp;
      if (emp && emp.label) return emp.label;
      if (emp && emp.name) return emp.name;
      return '';
    }).filter(function(n) { return n; }).join(', ');
  }
  if (employeeField && employeeField.label) return employeeField.label;
  if (employeeField && employeeField.name) return employeeField.name;
  return '';
}

export function renderArchiveTable() {
  var list = _customState.archiveList;
  var total = _customState.archiveTotal;
  var currentPage = _customState.currentPage;
  var pageSize = _customState.pageSize;
  var totalPages = Math.ceil(total / pageSize) || 1;
  var selectedKeys = _customState.selectedArchiveKeys;
  var allSelected = list.length > 0 && list.every(function(item) { return selectedKeys.indexOf(item.formInstId) >= 0; });

  var thStyle = { padding: '8px 12px', textAlign: 'left', fontSize: '12px', color: '#666', backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8', fontWeight: 'bold', whiteSpace: 'nowrap' };
  var tdStyle = { padding: '8px 12px', fontSize: '12px', color: '#333', borderBottom: '1px solid #f0f0f0', maxWidth: '300px', wordBreak: 'break-all', whiteSpace: 'normal' };
  var checkboxStyle = { width: '16px', height: '16px', cursor: 'pointer', accentColor: '#1890ff' };

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: '4px', padding: '16px', flex: 1, minWidth: 0, overflow: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
          {_customState.selectedCatalogId ? '当前目录档案' : '全部档案'}
          <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>共 {total} 条</span>
          {selectedKeys.length > 0 && <span style={{ fontSize: '12px', color: '#1890ff', marginLeft: '8px' }}>已选 {selectedKeys.length} 项</span>}
          {this.canCreateArchive() && (
            <span
              title="录入档案"
              style={{ cursor: 'pointer', fontSize: '12px', color: '#52c41a', padding: '4px 10px', border: '1px solid #52c41a', borderRadius: '4px', marginLeft: '12px' }}
              onClick={() => { this.openArchiveModal(); }}
            >＋录入档案</span>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', border: '1px solid #1890ff', borderRadius: '4px', overflow: 'hidden', height: '28px' }}>
            <span
              style={{ cursor: 'pointer', fontSize: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', background: _customState.archiveFilter === 'all' ? '#1890ff' : '#fff', color: _customState.archiveFilter === 'all' ? '#fff' : '#1890ff' }}
              onClick={() => { _customState.archiveFilter = 'all'; _customState.currentPage = 1; _customState.selectedArchiveKeys = []; this.loadArchiveList(); }}
            >全部</span>
            <span
              style={{ cursor: 'pointer', fontSize: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', borderLeft: '1px solid #1890ff', background: _customState.archiveFilter === 'pending' ? '#1890ff' : '#fff', color: _customState.archiveFilter === 'pending' ? '#fff' : '#1890ff' }}
              onClick={() => { _customState.archiveFilter = 'pending'; _customState.currentPage = 1; _customState.selectedArchiveKeys = []; this.loadArchiveList(); }}
            >待归档</span>
            <span
              style={{ cursor: 'pointer', fontSize: '12px', padding: '0 10px', display: 'flex', alignItems: 'center', borderLeft: '1px solid #1890ff', background: _customState.archiveFilter === 'archived' ? '#1890ff' : '#fff', color: _customState.archiveFilter === 'archived' ? '#fff' : '#1890ff' }}
              onClick={() => { _customState.archiveFilter = 'archived'; _customState.currentPage = 1; _customState.selectedArchiveKeys = []; this.loadArchiveList(); }}
            >已归档</span>
          </span>
          <div style={{ width: '140px', height: '28px' }}>
            <TextField
              fieldId="archiveNameFilter"
              label=""
              size="small"
              placeholder="档案名"
              value={_customState.archiveNameFilter}
              onChange={(e) => { _customState.archiveNameFilter = e.value || ''; updateUI(this); }}
            />
          </div>
          <div style={{ width: '220px', height: '28px' }}>
            <CascadeDateField
              key={'dateRange_' + _customState.archiveDateRangeKey}
              fieldId="archiveDateRange"
              label=""
              size="small"
              placeholder="录入日期"
              format="YYYY-MM-DD"
              value={_customState.archiveDateRangeValue}
              onChange={(e) => {
                _customState.archiveDateRange = e.value || {};
                updateUI(this);
              }}
            />
          </div>
          <span
            style={{ cursor: 'pointer', fontSize: '12px', padding: '0 12px', background: '#1890ff', color: '#fff', borderRadius: '4px', height: '28px', display: 'flex', alignItems: 'center' }}
            onClick={() => { _customState.currentPage = 1; _customState.selectedArchiveKeys = []; this.loadArchiveList(); }}
          >筛选</span>
          <span
            style={{ cursor: 'pointer', fontSize: '12px', padding: '0 12px', background: '#fff', color: '#666', border: '1px solid #d9d9d9', borderRadius: '4px', height: '28px', display: 'flex', alignItems: 'center' }}
            onClick={() => {
              _customState.archiveNameFilter = '';
              _customState.archiveDateRangeKey = _customState.archiveDateRangeKey + 1;
              _customState.archiveDateRangeValue = null;
              _customState.archiveDateRange = {};
              _customState.currentPage = 1;
              _customState.selectedArchiveKeys = [];
              updateUI(this);
              this.loadArchiveList();
            }}
          >重置</span>
        </div>
      </div>

      {_customState.archiveLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>加载中...</div>
      ) : list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>暂无档案数据</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: '40px', textAlign: 'center' }}>
                  <input type="checkbox" style={checkboxStyle} checked={allSelected} onChange={() => { this.toggleSelectAll(); }} />
                </th>
                <th style={thStyle}>序号</th>
                <th style={thStyle}>档案题名</th>
                <th style={thStyle}>编号</th>
                <th style={thStyle}>归档状态</th>
                <th style={thStyle}>保管期限</th>
                <th style={thStyle}>录入日期</th>
                <th style={thStyle}>录入人</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {list.map(function(item, index) {
                var d = item.formData || {};
                var isSelected = selectedKeys.indexOf(item.formInstId) >= 0;
                var isDragging = _customState.dragArchive && _customState.dragArchive.archives && _customState.dragArchive.archives.some(function(a) { return a.formInstId === item.formInstId; });
                var isPending = (d.radioField_ltqu54no) === '待归档';
                var isExpanded = _customState.expandedArchiveIds.indexOf(item.formInstId) >= 0;
                
                // 附件数据可能是JSON字符串，需要解析
                var attachmentsRaw = d.attachmentField_ltqiyj50;
                var attachments = [];
                if (attachmentsRaw) {
                  if (typeof attachmentsRaw === 'string') {
                    try {
                      attachments = JSON.parse(attachmentsRaw);
                    } catch (e) {
                      attachments = [];
                    }
                  } else if (Array.isArray(attachmentsRaw)) {
                    attachments = attachmentsRaw;
                  }
                }
                var hasAttachments = attachments.length > 0;
                
                var rows = [];
                rows.push(
                  <tr key={item.formInstId}
                    draggable={this.canDragArchive()}
                    style={{ cursor: this.canDragArchive() ? 'grab' : 'default', backgroundColor: isSelected ? '#e6f4ff' : '#fff', opacity: isDragging ? 0.5 : 1 }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#f5f5f5'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = '#fff'; }}
                    onDragStart={(e) => { if (this.canDragArchive()) this.handleArchiveDragStart(e, item); }}
                    onDragEnd={(e) => { this.handleArchiveDragEnd(e); }}
                  >
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <input type="checkbox" style={checkboxStyle} checked={isSelected} onChange={() => { this.toggleSelectItem(item.formInstId); }} />
                    </td>
                    <td style={tdStyle}>{(currentPage - 1) * pageSize + index + 1}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{this.getArchiveField(d, 'textField_lts9tgtv')}</span>
                          {hasAttachments && (
                            <span
                              style={{ cursor: 'pointer', color: '#fff', fontSize: '12px', padding: '2px 8px', backgroundColor: '#1890ff', borderRadius: '4px', whiteSpace: 'nowrap' }}
                              onClick={() => { this.toggleArchiveAttachments(item.formInstId); }}
                            >
                              {isExpanded ? 'v ' + attachments.length + '附件' : '> ' + attachments.length + '附件'}
                            </span>
                          )}
                        </div>
                      </td>
                    <td style={tdStyle}>{this.getArchiveField(d, 'textField_luuuddq0')}</td>
                    <td style={tdStyle}>{this.getArchiveField(d, 'radioField_ltqu54no')}</td>
                    <td style={tdStyle}>{this.getRetentionText(this.getArchiveField(d, 'radioField_lu6kb8ha'))}</td>
                    <td style={tdStyle}>{this.formatDate(d.dateField_lu7z4rhs)}</td>
                    <td style={tdStyle}>{this.getEmployeeName(d.employeeField_ltqu54nv)}</td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          {isPending && this.canManageArchive() ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <span
                                style={{ cursor: 'pointer', color: '#1890ff', fontSize: '12px' }}
                                onClick={() => { this.openEditArchiveModal(item); }}
                                title="编辑"
                              >✎</span>
                              <span
                                style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '12px' }}
                                onClick={() => { this.deleteArchive(item); }}
                                title="删除"
                              >✕</span>
                            </div>
                          ) : (d.radioField_ltqu54no) === '已归档' && this.canUnlockArchive() ? (
                            <span
                              style={{ cursor: 'pointer', color: '#faad14', fontSize: '12px' }}
                              onClick={() => { this.unlockArchive(item); }}
                              title="解锁"
                            >🔓</span>
                          ) : null}
                        </div>
                      </td>
                  </tr>
                );
                
                if (isExpanded && hasAttachments) {
                  rows.push(
                    <tr key={item.formInstId + '_attachments'}>
                      <td colSpan={9} style={{ padding: '8px 12px', backgroundColor: '#f9f9f9' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {attachments.map(function(file, fileIdx) {
                            var fileName = file.name || '未命名文件';
                            var downloadUrl = file.downloadUrl || file.url || '';
                            var previewUrl = file.previewUrl || '';
                            // 修复预览URL：将type=download改为type=preview
                            if (previewUrl && previewUrl.indexOf('type=download') >= 0) {
                              previewUrl = previewUrl.replace('type=download', 'type=open');
                            }
                            return (
                              <div key={fileIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', backgroundColor: '#fff', border: '1px solid #e8e8e8', borderRadius: '4px' }}>
                                <span style={{ fontSize: '12px', color: '#333' }}>{fileName}</span>
                                {previewUrl && (
                                  <span
                                    style={{ cursor: 'pointer', color: '#1890ff', fontSize: '12px' }}
                                    onClick={() => { 
                                      window.open(previewUrl);
                                    }}
                                    title="预览"
                                  >预览</span>
                                )}
                                {downloadUrl && (
                                  <span
                                    style={{ cursor: 'pointer', color: '#1890ff', fontSize: '12px' }}
                                    onClick={() => { 
                                      var link = document.createElement('a');
                                      link.href = downloadUrl;
                                      link.download = fileName;
                                      link.target = '_blank';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    title="下载"
                                  >下载</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                }
                
                return rows;
              }.bind(this))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button disabled={currentPage <= 1} onClick={() => { this.goToPage(1); }} style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: currentPage <= 1 ? '#f5f5f5' : '#fff', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>首页</button>
          <button disabled={currentPage <= 1} onClick={() => { this.goToPage(currentPage - 1); }} style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: currentPage <= 1 ? '#f5f5f5' : '#fff', cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>上一页</button>
          <span style={{ fontSize: '12px', color: '#666' }}>第 {currentPage} / {totalPages} 页</span>
          <button disabled={currentPage >= totalPages} onClick={() => { this.goToPage(currentPage + 1); }} style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: currentPage >= totalPages ? '#f5f5f5' : '#fff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>下一页</button>
          <button disabled={currentPage >= totalPages} onClick={() => { this.goToPage(totalPages); }} style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: currentPage >= totalPages ? '#f5f5f5' : '#fff', cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', fontSize: '12px' }}>末页</button>
          <span style={{ fontSize: '12px', color: '#666' }}>每页</span>
          <select value={pageSize} onChange={(e) => { this.changePageSize(e); }} style={{ padding: '4px 8px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '12px' }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span style={{ fontSize: '12px', color: '#666' }}>条</span>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 渲染主页面
// ============================================================

export function renderJsx() {
  var treeData = _customState.treeData;
  var loading = _customState.loading;
  var projectName = _customState.projectName;
  var projectWorkDomain = _customState.projectWorkDomain;
  var projectManager = _customState.projectManager;
  var archiveManager = _customState.archiveManager;
  var selectedCatalogId = _customState.selectedCatalogId;
  var allSelected = !selectedCatalogId;

  var isAllExpanded = treeData.length > 0 && treeData.every(function(n) { return _customState.expandedKeys.indexOf(n.key) >= 0; });

  var containerStyle = { padding: '16px', paddingBottom: '80px', minHeight: '100vh', backgroundColor: '#f5f5f5' };
  var headerStyle = { marginBottom: '12px', padding: '16px', backgroundColor: '#fff', borderRadius: '4px' };
  var treeContainerStyle = { width: '240px', minWidth: '240px', backgroundColor: '#fff', borderRadius: '4px', padding: '12px', overflowY: 'auto', maxHeight: 'calc(100vh - 180px)', border: '1px solid #e8e8e8' };
  var defaultBtnStyle = { padding: '8px 20px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '14px' };
  var primaryBtnStyle = { padding: '8px 20px', border: 'none', borderRadius: '4px', backgroundColor: '#1890ff', color: '#fff', cursor: 'pointer', fontSize: '14px', marginLeft: '8px' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'none' }}>{this.state && this.state.timestamp}</div>

      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            {projectName && <span style={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}>{projectName}</span>}
            {projectWorkDomain && <span style={{ color: '#666', fontSize: '13px', backgroundColor: '#f0f0f0', padding: '2px 8px', borderRadius: '4px' }}>{projectWorkDomain}</span>}
            {projectManager && <span style={{ color: '#666', fontSize: '13px' }}>负责人：{projectManager}</span>}
            {_customState.editingManager ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', minWidth: '350px', maxWidth: '500px' }}>
                <span style={{ color: '#666', fontSize: '13px', whiteSpace: 'nowrap' }}>档案员：</span>
                <div style={{ flex: 1, minWidth: '280px', overflow: 'hidden' }}>
                  <EmployeeField
                    fieldId="employeeField_ltz87lbw"
                    label=""
                    multiple={true}
                    showEmplId={false}
                    placeholder="请选择档案员"
                    value={_customState.employeeFieldValue}
                    onChange={(e) => { _customState.employeeFieldValue = (e && e.value) || []; updateUI(this); }}
                  />
                </div>
                <span style={{ cursor: 'pointer', color: '#52c41a', fontSize: '16px', flexShrink: 0 }} title="确认" onClick={() => { this.confirmInlinePick(); }}>✓</span>
                <span style={{ cursor: 'pointer', color: '#ff4d4f', fontSize: '16px', flexShrink: 0 }} title="取消" onClick={() => { this.cancelEditManager(); }}>✕</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>档案员：{archiveManager || '未设置'}</span>
                {this.canAppointManager() && (
                  <span title="任命档案员" style={{ cursor: 'pointer', fontSize: '13px', color: '#1890ff', padding: '4px 10px', border: '1px solid #1890ff', borderRadius: '4px', flexShrink: 0 }}
                    onClick={() => { this.startEditManager(); }}>
                    👤 任命档案员
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span title="流程及权限说明" style={{ cursor: 'pointer', fontSize: '13px', color: '#1890ff', padding: '4px 10px', border: '1px solid #1890ff', borderRadius: '4px' }}
              onClick={() => { window.open('https://gzzsqs.aliwork.com/APP_HBX0O0II1A22ZT14XYYI/custom/FORM-DA469615A5B84CB2A442AFBF2D1561E2TN9K', '_blank'); }}>
              📋 流程及权限说明
            </span>
            <span title="使用手册" style={{ cursor: 'pointer', fontSize: '13px', color: '#1890ff', padding: '4px 10px', border: '1px solid #1890ff', borderRadius: '4px' }}
              onClick={() => { window.open('https://alidocs.dingtalk.com/i/nodes/6LeBq413JAzxqnD9hnP4v5YB8DOnGvpb?doc_type=wiki_doc&iframeQuery=utm_source=portal&utm_medium=portal_recent&rnd=0.6467538085743916', '_blank'); }}>
              📖 使用手册
            </span>
            <span title="档案统计" style={{ cursor: 'pointer', fontSize: '13px', color: '#1890ff', padding: '4px 10px', border: '1px solid #1890ff', borderRadius: '4px' }}
              onClick={() => { window.open('https://gzzsqs.aliwork.com/s/dagl-glxmda/REPORT-NNC669C145V3K2PYNK9K5DB6SE8W2J7IYXJMM2?proName=' + encodeURIComponent(projectName || ''), '_blank'); }}>
              📊 档案统计
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ width: '240px', minWidth: '240px' }}>
          <div>
            {this.canManageArchive() && (
              <div>
                <div
                  title="新增顶级目录"
                  style={{
                    cursor: 'pointer', fontSize: '13px', color: '#52c41a', padding: '8px',
                    border: '1px dashed #52c41a', borderRadius: '4px', marginBottom: '8px',
                    textAlign: 'center', backgroundColor: '#f6ffed'
                  }}
                  onClick={() => { this.openAddCatalogModal(); }}
                >
                  ＋ 新增目录
                </div>
                {_customState.showFixOrderButton && (
                  <div
                    title="修复目录序号"
                    style={{
                      cursor: 'pointer', fontSize: '13px', color: '#faad14', padding: '8px',
                      border: '1px dashed #faad14', borderRadius: '4px', marginBottom: '8px',
                      textAlign: 'center', backgroundColor: '#fffbe6'
                    }}
                    onClick={() => { this.fixCatalogOrder(); }}
                  >
                    🔧 修复序号
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={treeContainerStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#333' }}>
                目录
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span title={isAllExpanded ? '全部收起' : '全部展开'} style={{ cursor: 'pointer', fontSize: '14px', color: '#1890ff' }}
                onClick={() => { if (isAllExpanded) { this.collapseAll(); } else { this.expandAll(); } }}>
                {isAllExpanded ? '▼' : '▶'}
              </span>
              <span title="刷新" style={{ cursor: 'pointer', fontSize: '16px', color: '#1890ff' }}
                onClick={() => { this.loadTreeData(); }}>↻</span>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '12px' }}>加载中...</div>
          ) : (
            <div>
              <div
                onMouseEnter={() => { _customState.hoveredKey = '__all__'; updateUI(this); }}
                onMouseLeave={() => { _customState.hoveredKey = null; updateUI(this); }}
                onClick={() => { _customState.selectedKey = '__all__'; this.selectDirectory(''); }}
                style={{
                  display: 'flex', alignItems: 'center', padding: '6px 8px',
                  backgroundColor: allSelected ? '#e6f4ff' : (_customState.hoveredKey === '__all__' ? '#f5f5f5' : '#fff'),
                  border: allSelected ? '1px solid #91caff' : '1px solid transparent',
                  borderRadius: '4px', cursor: 'pointer', userSelect: 'none', fontSize: '13px', marginBottom: '4px'
                }}
              >
                <span style={{ marginRight: '4px', color: '#ccc', fontSize: '10px' }}>•</span>
                <span style={{ flex: 1, color: allSelected ? '#1890ff' : '#333', fontWeight: allSelected ? 'bold' : 'normal' }}>全部</span>
              </div>
              {treeData.map(function(node) {
                return this.renderTreeNode(node, 0);
              }.bind(this))}
            </div>
          )}
        </div>
      </div>

        {this.renderArchiveTable()}
      </div>

      {/* 底部操作栏 */}
      {_customState.selectedArchiveKeys.length > 0 ? (() => {
        // 检查选中的档案是否全部是"待归档"状态
        var selectedArchives = _customState.archiveList.filter(function(item) {
          return _customState.selectedArchiveKeys.indexOf(item.formInstId) >= 0;
        });
        var allPending = selectedArchives.length > 0 && selectedArchives.every(function(item) {
          return (item.formData && item.formData.radioField_ltqu54no) === '待归档';
        });
        
        return (
        <div
          style={{
            position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            background: '#fff', padding: '12px 24px',
            borderRadius: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            zIndex: 999, display: 'flex', alignItems: 'center', gap: '16px'
          }}
        >
          <span style={{ fontSize: '14px', color: '#666' }}>
            已选择 {_customState.selectedArchiveKeys.length} 项档案
          </span>
          {allPending && this.canBatchArchive() && (
            <span
              style={{
                background: '#52c41a', color: '#fff', padding: '8px 20px',
                borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
              }}
              onClick={() => { this.batchArchive(); }}
            >
              批量归档
            </span>
          )}
          <span
            style={{
              background: '#fff', color: '#666', padding: '8px 20px',
              border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
            }}
            onClick={() => { this.clearSelection(); }}
          >
            取消
          </span>
        </div>
        );
      })() : null}

      {/* 目录编辑模态框 */}
      {_customState.showCatalogModal ? (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={(e) => { if (e.target === e.currentTarget) this.closeCatalogModal(); }}>
          <div style={{
            width: '400px', backgroundColor: '#fff', borderRadius: '8px',
            overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa'
            }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>
                {_customState.catalogModalType === 'edit' ? '编辑目录' : 
                 _customState.catalogModalType === 'addSub' ? '新增下级目录' : '新增顶级目录'}
              </span>
              <span style={{ cursor: 'pointer', color: '#999', fontSize: '18px', lineHeight: '1' }}
                onClick={() => { this.closeCatalogModal(); }}>✕</span>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>目录名 *</label>
                <input
                  type="text"
                  value={_customState.catalogForm.textField_luw1rfyq}
                  onChange={(e) => { this.handleCatalogFormChange('textField_luw1rfyq', e.target.value); }}
                  placeholder="请输入目录名称"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>文件范围说明</label>
                <textarea
                  value={_customState.catalogForm.textField_lyz8ywto}
                  onChange={(e) => { this.handleCatalogFormChange('textField_lyz8ywto', e.target.value); }}
                  placeholder="请输入文件范围说明"
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <span
                  style={{ padding: '8px 16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#fff' }}
                  onClick={() => { this.closeCatalogModal(); }}
                >取消</span>
                <span
                  style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#1890ff', color: '#fff' }}
                  onClick={() => { this.saveCatalog(); }}
                >保存</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* 录入档案模态框 */}
      {_customState.showArchiveModal ? (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1001,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={(e) => { if (e.target === e.currentTarget) this.closeArchiveModal(); }}>
          <div style={{
            width: '750px', maxHeight: '80vh', backgroundColor: '#fff', borderRadius: '8px',
            overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa'
            }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>{_customState.editingArchive ? '编辑档案' : '录入档案'}</span>
              <span style={{ cursor: 'pointer', color: '#999', fontSize: '18px', lineHeight: '1' }}
                onClick={() => { this.closeArchiveModal(); }}>✕</span>
            </div>
            <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
              {/* 基本信息 */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>档案题名 <span style={{ color: '#ff4d4f' }}>*</span></label>
                  <input
                    type="text"
                    defaultValue={_customState.archiveForm.textField_lts9tgtv}
                    onChange={(e) => { _customState.archiveForm.textField_lts9tgtv = e.target.value; }}
                    placeholder="请输入档案题名"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>编号</label>
                  <input
                    type="text"
                    defaultValue={_customState.archiveForm.textField_luuuddq0}
                    onChange={(e) => { _customState.archiveForm.textField_luuuddq0 = e.target.value; }}
                    placeholder="请输入编号"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              
              {/* 档案形式 */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>档案形式 <span style={{ color: '#ff4d4f' }}>*</span></label>
                <CheckboxField
                  fieldId="checkboxField_lv0lultz"
                  label=""
                  dataSource={[
                    { text: '电子', value: '电子' },
                    { text: '纸质', value: '纸质' },
                    { text: '实物', value: '实物' }
                  ]}
                  value={_customState.archiveForm.checkboxField_lv0lultz}
                  onChange={(e) => {
                    var val = (e && e.value) || e || [];
                    _customState.archiveForm.checkboxField_lv0lultz = val;
                    updateUI(this);
                  }}
                />
              </div>
              
              {/* 电子档案 - 当档案形式包含电子时显示 */}
              {(_customState.archiveForm.checkboxField_lv0lultz && _customState.archiveForm.checkboxField_lv0lultz.includes('电子')) && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>电子档案 <span style={{ color: '#ff4d4f' }}>*</span></label>
                  <AttachmentField
                    fieldId="attachmentField_ltqiyj50"
                    label=""
                    multiple={true}
                    buttonText="上传电子文件"
                    value={_customState.archiveForm.attachmentField_ltqiyj50}
                    onChange={(e) => {
                      _customState.archiveForm.attachmentField_ltqiyj50 = e && e.value ? e.value : [];
                    }}
                  />
                </div>
              )}
              
              {/* 纸档信息 - 当档案形式包含纸质或实物时显示 */}
              {(_customState.archiveForm.checkboxField_lv0lultz && (_customState.archiveForm.checkboxField_lv0lultz.includes('纸质') || _customState.archiveForm.checkboxField_lv0lultz.includes('实物'))) && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>纸档类型 <span style={{ color: '#ff4d4f' }}>*</span></label>
                      <RadioField
                        fieldId="radioField_m17gf5nj"
                        label=""
                        dataSource={[
                          { text: '独立件', value: '独立件' },
                          { text: '盒内件', value: '盒内件' }
                        ]}
                        value={_customState.archiveForm.radioField_m17gf5nj}
                        onChange={(e) => {
                          var val = (e && e.value) || e || '';
                          _customState.archiveForm.radioField_m17gf5nj = val;
                          updateUI(this);
                        }}
                      />
                    </div>
                    {_customState.archiveForm.radioField_m17gf5nj === '盒内件' && (
                      <span
                        style={{ padding: '6px 12px', border: '1px solid #1890ff', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', color: '#1890ff', whiteSpace: 'nowrap' }}
                        onClick={() => { window.open('https://gzzsqs.aliwork.com/APP_HBX0O0II1A22ZT14XYYI/workbench/FORM-C9E034C6600642CEB6312F8F28648E4DX6X0?viewUuid=VIEW-3353A4F65CAF4003AA19C63D53CCD051', '_blank'); }}
                      >+ 新增档案盒</span>
                    )}
                  </div>
                  
                  {/* 独立件: 第一行无数量存放位置 */}
                  {_customState.archiveForm.radioField_m17gf5nj === '独立件' && (
                    <div style={{ marginBottom: '12px' }}>
                      {/* 数量 + 存放位置 - 下一行 */}
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>数量 <span style={{ color: '#ff4d4f' }}>*</span></label>
                          <NumberField
                            fieldId="numberField_ldgpj9uz"
                            label=""
                            placeholder="请输入"
                            min={1}
                            value={_customState.archiveForm.numberField_ldgpj9uz}
                            onChange={(e) => {
                              _customState.archiveForm.numberField_ldgpj9uz = e && e.value !== undefined ? e.value : '';
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>存放位置 <span style={{ color: '#ff4d4f' }}>*</span></label>
                          <input
                            type="text"
                            defaultValue={_customState.archiveForm.textField_ltzfvwgg}
                            onChange={(e) => { _customState.archiveForm.textField_ltzfvwgg = e.target.value; }}
                            placeholder="请输入"
                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 盒内件: 新增档案盒 + 所属档案盒 + 盒内序号 (第一行) */}
                  {_customState.archiveForm.radioField_m17gf5nj === '盒内件' && (
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 2 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>所属档案盒 <span style={{ color: '#ff4d4f' }}>*</span></label>
                          <SelectField
                            fieldId="associationFormField_m17odran"
                            label=""
                            placeholder="请选择档案盒"
                            dataSource={_customState.archiveBoxOptions.map(function(opt) {
                              return { text: opt.label, value: opt.value };
                            })}
                            value={_customState.archiveForm.associationFormField_m17odran}
                            onChange={(e) => {
                              var val = (e && (e.value !== undefined)) ? e.value : ((e && e.item) ? e.item.value : '');
                              _customState.archiveForm.associationFormField_m17odran = val;
                              var selectedBox = _customState.archiveBoxOptions.find(function(opt) {
                                return opt.value === val;
                              });
                              if (selectedBox) {
                                var location = selectedBox.textField_mbk5f5i6 || selectedBox.textField_ltzfvwgg || '';
                                _customState.archiveForm.textField_ltzfvwgg = location;
                                var boxRetention = selectedBox.radioField_lu6kb8ha || '';
                                var retentionMap = { '永久': 'Y', '30年': 'D30', '15年': 'D15', '10年': 'D10', '5年': 'D5' };
                                _customState.archiveForm.radioField_lu6kb8ha = retentionMap[boxRetention] || boxRetention || 'Y';
                              }
                              updateUI(this);
                            }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>盒内序号 <span style={{ color: '#ff4d4f' }}>*</span></label>
                          <NumberField
                            fieldId="numberField_m17gf5nk"
                            label=""
                            placeholder="请输入"
                            min={1}
                            value={_customState.archiveForm.numberField_m17gf5nk}
                            onChange={(e) => {
                              _customState.archiveForm.numberField_m17gf5nk = e && e.value !== undefined ? e.value : '';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* 盒内件: 数量 + 存放位置 (下一行) */}
                    {_customState.archiveForm.radioField_m17gf5nj === '盒内件' && (
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>数量 <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <NumberField
                          fieldId="numberField_ldgpj9uz"
                          label=""
                          placeholder="请输入"
                          min={1}
                          value={_customState.archiveForm.numberField_ldgpj9uz}
                          onChange={(e) => {
                            _customState.archiveForm.numberField_ldgpj9uz = e && e.value !== undefined ? e.value : '';
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>存放位置 <span style={{ color: '#ff4d4f' }}>*</span></label>
                        <input
                          type="text"
                          readOnly={!!_customState.archiveForm.associationFormField_m17odran}
                          defaultValue={_customState.archiveForm.textField_ltzfvwgg}
                          onChange={(e) => { _customState.archiveForm.textField_ltzfvwgg = e.target.value; }}
                          placeholder="请输入"
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: _customState.archiveForm.associationFormField_m17odran ? '#f5f5f5' : '#fff' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* 保管期限 */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>保管期限</label>
                <RadioField
                  fieldId="radioField_lu6kb8ha"
                  label=""
                  dataSource={[
                    { text: '永久', value: 'Y' },
                    { text: '30年', value: 'D30' },
                    { text: '15年', value: 'D15' },
                    { text: '10年', value: 'D10' },
                    { text: '5年', value: 'D5' }
                  ]}
                  value={_customState.archiveForm.radioField_lu6kb8ha}
                  onChange={(e) => {
                    var val = (e && e.value) || e || '';
                    _customState.archiveForm.radioField_lu6kb8ha = val;
                  }}
                />
              </div>
              
              {/* 涉密属性 */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>涉密属性</label>
                <RadioField
                  fieldId="radioField_ltzfvwhf"
                  label=""
                  dataSource={[
                    { text: '企业内部', value: '企业内部' },
                    { text: '对外公开', value: '对外公开' },
                    { text: '企业秘密', value: '企业秘密' },
                    { text: '企业机密', value: '企业机密' }
                  ]}
                  value={_customState.archiveForm.radioField_ltzfvwhf}
                  onChange={(e) => {
                    var val = (e && e.value) || e || '';
                    _customState.archiveForm.radioField_ltzfvwhf = val;
                    updateUI(this);
                  }}
                />
              </div>
              
              {/* 涉密档案允许查阅部门和人员 - 当涉密属性为企业秘密或企业机密时显示 */}
              {(_customState.archiveForm.radioField_ltzfvwhf === '企业秘密' || 
                _customState.archiveForm.radioField_ltzfvwhf === '企业机密') && (
                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>涉密档案允许查阅部门</label>
                    <MultiSelectField
                      fieldId="multiSelectField_ltzfvwhg"
                      label=""
                      placeholder="请选择允许查阅部门"
                      dataSource={_customState.secretDeptOptions.map(function(opt) {
                        return { text: opt.label, value: opt.value };
                      })}
                      value={_customState.archiveForm.multiSelectField_ltzfvwhg || []}
                      onChange={(e) => {
                        var val = (e && e.value) || e || [];
                        _customState.archiveForm.multiSelectField_ltzfvwhg = val;
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', color: '#333' }}>涉密档案允许查阅人员</label>
                    <EmployeeField
                      fieldId="employeeField_ltzfvwhh"
                      label=""
                      placeholder="请选择允许查阅人员"
                      multiple={true}
                      showEmplId={false}
                      closeOnSelect={false}
                      value={_customState.archiveForm.employeeField_ltzfvwhh}
                      onChange={(e) => {
                        _customState.archiveForm.employeeField_ltzfvwhh = e.value || [];
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <span
                  style={{ padding: '8px 16px', border: '1px solid #d9d9d9', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#fff' }}
                  onClick={() => { this.closeArchiveModal(); }}
                >取消</span>
                <span
                  style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', backgroundColor: '#1890ff', color: '#fff' }}
                  onClick={() => { this.saveArchive(); }}
                >保存</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {_customState.showDirManageModal ? (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={(e) => { if (e.target === e.currentTarget) this.closeDirManageModal(); }}>
          <div style={{
            width: '70vw', height: '70vh', backgroundColor: '#fff', borderRadius: '8px',
            overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #e8e8e8', backgroundColor: '#fafafa'
            }}>
              <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#333' }}>目录管理</span>
              <span style={{ cursor: 'pointer', color: '#999', fontSize: '18px', lineHeight: '1' }}
                onClick={() => { this.closeDirManageModal(); }}>✕</span>
            </div>
            <iframe
              src={'https://gzzsqs.aliwork.com/APP_HBX0O0II1A22ZT14XYYI/custom/FORM-0956C59E8D664A94AEC4D9ED80B1B671659R?projectId=' + _customState.projectId}
              style={{ flex: 1, border: 'none', width: '100%' }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
