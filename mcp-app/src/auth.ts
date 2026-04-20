/**
 * auth.ts — 认证适配层
 *
 * 桥接 MCP App Server 与 OpenYida 的 CommonJS 登录态模块（lib/core/utils.js）。
 * 通过 createRequire 在 ESM 中加载 CJS 模块。
 *
 * 路径解析策略（按优先级）：
 *   1. 同仓库开发模式：../lib/ 相对路径（monorepo 内直接引用）
 *   2. npm 安装模式：通过 require.resolve('openyida/package.json') 定位 openyida 包的 lib/
 */

import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);

/**
 * 定位 openyida 的 lib/ 目录。
 * 优先使用同仓库相对路径（开发模式），否则从 node_modules 中查找。
 */
function resolveLibRoot(): string {
  // 策略 1：同仓库开发模式（mcp-app/dist/ → lib/）
  const monorepoLib = path.resolve(import.meta.dirname, "..", "..", "lib");
  if (fs.existsSync(path.join(monorepoLib, "core", "utils.js"))) {
    return monorepoLib;
  }

  // 策略 2：npm 安装模式（从 node_modules/openyida/ 定位）
  try {
    const openyidaPkg = require.resolve("openyida/package.json");
    return path.join(path.dirname(openyidaPkg), "lib");
  } catch {
    // 策略 3：全局安装模式（openyida 全局安装）
    try {
      const { execSync } = require("node:child_process");
      const globalPrefix = execSync("npm prefix -g", { encoding: "utf-8" }).trim();
      const globalLib = path.join(globalPrefix, "lib", "node_modules", "openyida", "lib");
      if (fs.existsSync(path.join(globalLib, "core", "utils.js"))) {
        return globalLib;
      }
    } catch {
      // ignore
    }
  }

  throw new Error(
    "Cannot locate openyida lib/. Please install openyida: npm install -g openyida",
  );
}

const LIB_ROOT = resolveLibRoot();
const utils = require(path.join(LIB_ROOT, "core", "utils.js"));

export interface AuthContext {
  baseUrl: string;
  cookies: Array<{ name: string; value: string; domain?: string }>;
  csrfToken: string;
  userId: string;
  corpId: string;
}

/**
 * 获取当前登录态。若未登录则触发登录流程。
 */
export function getAuth(): AuthContext {
  let cookieData = utils.loadCookieData();
  if (!cookieData || !cookieData.cookies) {
    cookieData = utils.triggerLogin();
  }

  const baseUrl: string = utils.resolveBaseUrl(cookieData);
  const info = utils.extractInfoFromCookies(cookieData.cookies);

  return {
    baseUrl,
    cookies: cookieData.cookies,
    csrfToken: info.csrfToken || cookieData.csrf_token || "",
    userId: info.userId || "",
    corpId: info.corpId || "",
  };
}

/**
 * 检查是否已登录（不触发登录流程）
 */
export function isLoggedIn(): boolean {
  const cookieData = utils.loadCookieData();
  return !!(cookieData && cookieData.cookies && cookieData.cookies.length > 0);
}

/**
 * 暴露底层 HTTP 工具，供 tools 层直接调用宜搭 API
 */
export const httpGet: typeof utils.httpGet = utils.httpGet;
export const httpPost: typeof utils.httpPost = utils.httpPost;
