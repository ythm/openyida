'use strict';

const { run } = require('../lib/core/query-data');

// ── 工具函数 mock ─────────────────────────────────────────────────────

jest.mock('../lib/core/utils', () => ({
  loadCookieData: jest.fn(),
  resolveBaseUrl: jest.fn(() => 'https://www.aliwork.com'),
  httpGet: jest.fn(),
  httpPost: jest.fn(),
  triggerLogin: jest.fn(),
  requestWithAutoLogin: jest.fn(),
}));

const utils = require('../lib/core/utils');

const mockCookieData = {
  cookies: [{ name: 'tianshu_csrf_token', value: 'tok123' }],
  csrf_token: 'tok123',
};

beforeEach(() => {
  jest.clearAllMocks();
  // 默认已登录
  utils.loadCookieData.mockReturnValue(mockCookieData);
});

// ── 参数校验 ──────────────────────────────────────────────────────────

describe('run() 参数校验', () => {
  test('参数不足时打印错误并以 exit code 1 退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['query'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('缺少必填参数'));

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  test('参数为空数组时打印错误并以 exit code 1 退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run([])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  test('未知 action/resource 组合时打印错误并退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['unknown', 'resource'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});

// ── 未登录场景 ────────────────────────────────────────────────────────

describe('run() 未登录场景', () => {
  test('loadCookieData 返回 null 时尝试 triggerLogin，仍失败则打印错误并退出', async () => {
    utils.loadCookieData.mockReturnValue(null);
    utils.triggerLogin.mockReturnValue(null);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['query', 'form', 'APP_XXX', 'FORM-XXX'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('无法获取有效登录态'));

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  test('loadCookieData 返回无 cookies 字段时尝试 triggerLogin，仍失败则退出', async () => {
    utils.loadCookieData.mockReturnValue({ csrf_token: 'tok' }); // 无 cookies 字段
    utils.triggerLogin.mockReturnValue(null);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['query', 'form', 'APP_XXX', 'FORM-XXX'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});

// ── query form 场景 ───────────────────────────────────────────────────

describe('run() query form', () => {
  test('查询成功时输出 JSON 结果', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: true,
      content: { totalCount: 5, data: [] },
    });

    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await run(['query', 'form', 'APP_XXX', 'FORM-XXX']);

    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('"success": true'));

    mockLog.mockRestore();
    mockError.mockRestore();
  });

  test('查询失败时打印错误并以 exit code 1 退出', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: false,
      errorMsg: '权限不足',
      errorCode: '403',
    });

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['query', 'form', 'APP_XXX', 'FORM-XXX'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('权限不足'));

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  test('传入 --page 和 --size 参数时正常执行', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: true,
      content: { totalCount: 0, data: [] },
    });

    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await run(['query', 'form', 'APP_XXX', 'FORM-XXX', '--page', '2', '--size', '50']);
    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);

    mockLog.mockRestore();
    mockError.mockRestore();
  });

  test('--size 超过 100 时被截断为 100', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: true,
      content: { totalCount: 0, data: [] },
    });

    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await run(['query', 'form', 'APP_XXX', 'FORM-XXX', '--size', '999']);
    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);

    mockLog.mockRestore();
    mockError.mockRestore();
  });

  test('传入 --search-json 参数时正常执行', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: true,
      content: { totalCount: 1, data: [] },
    });

    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await run(['query', 'form', 'APP_XXX', 'FORM-XXX', '--search-json', '{"field_1":"value"}']);
    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);

    mockLog.mockRestore();
    mockError.mockRestore();
  });

  test('--search-json 传入非法 JSON 时打印错误并退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      run(['query', 'form', 'APP_XXX', 'FORM-XXX', '--search-json', 'not-json'])
    ).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('JSON'));

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});

// ── get form（--inst-id）场景 ─────────────────────────────────────────

describe('run() get form', () => {
  test('传入 --inst-id 时调用实例详情接口并输出结果', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: true,
      content: { formInstId: 'INST-001', formData: {} },
    });

    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await run(['get', 'form', 'APP_XXX', '--inst-id', 'INST-001']);
    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('"success": true'));

    mockLog.mockRestore();
    mockError.mockRestore();
  });

  test('--inst-id 查询失败时打印错误并退出', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: false,
      errorMsg: '实例不存在',
      errorCode: '404',
    });

    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['get', 'form', 'APP_XXX', '--inst-id', 'INST-999'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('实例不存在'));

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  test('缺少 --inst-id 时打印错误并退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['get', 'form', 'APP_XXX'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});

// ── create form 场景 ──────────────────────────────────────────────────

describe('run() create form', () => {
  test('创建成功时输出 JSON 结果', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: true,
      content: { formInstId: 'INST-NEW' },
    });

    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await run(['create', 'form', 'APP_XXX', 'FORM-XXX', '--data-json', '{"textField_1":"hello"}']);
    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('"success": true'));

    mockLog.mockRestore();
    mockError.mockRestore();
  });

  test('缺少 --data-json 时打印错误并退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['create', 'form', 'APP_XXX', 'FORM-XXX'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});

// ── query tasks 场景 ──────────────────────────────────────────────────

describe('run() query tasks', () => {
  test('查询待办任务成功时输出结果', async () => {
    utils.requestWithAutoLogin.mockResolvedValue({
      success: true,
      content: { totalCount: 3, data: [] },
    });

    const mockLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await run(['query', 'tasks', 'APP_XXX', '--type', 'todo']);
    expect(utils.requestWithAutoLogin).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('"success": true'));

    mockLog.mockRestore();
    mockError.mockRestore();
  });

  test('--type 传入非法值时打印错误并退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['query', 'tasks', 'APP_XXX', '--type', 'invalid'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  test('缺少 --type 时打印错误并退出', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit(1)');
    });
    const mockError = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(run(['query', 'tasks', 'APP_XXX'])).rejects.toThrow('process.exit(1)');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});
