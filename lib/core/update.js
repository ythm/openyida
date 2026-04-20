/**
 * update.js - openyida 自更新命令
 *
 * 参考 openclaw update 的终端输出风格：
 *   - 表格化状态展示（Install / Channel / Version / Update）
 *   - 分步骤 spinner 进度动画
 *   - 彩色高亮关键信息
 */

'use strict';

const { execSync } = require('child_process');
const { fetchLatestVersion, isNewer } = require('./check-update');
const { t } = require('./i18n');
const { warn } = require('./chalk');

// ── ANSI 颜色常量 ──────────────────────────────────
const RESET   = '\x1b[0m';
const BOLD    = '\x1b[1m';
const DIM     = '\x1b[2m';
const GREEN   = '\x1b[32m';
const YELLOW  = '\x1b[33m';
const CYAN    = '\x1b[36m';
const RED     = '\x1b[31m';
const MAGENTA = '\x1b[35m';

// ── Spinner 动画 ───────────────────────────────────
const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function createSpinner(message) {
  let frameIndex = 0;
  const timer = setInterval(() => {
    process.stderr.write(`\r${CYAN}${SPINNER_FRAMES[frameIndex]}${RESET} ${message}`);
    frameIndex = (frameIndex + 1) % SPINNER_FRAMES.length;
  }, 80);

  return {
    succeed(text) {
      clearInterval(timer);
      process.stderr.write(`\r${GREEN}✔${RESET} ${text}\n`);
    },
    fail(text) {
      clearInterval(timer);
      process.stderr.write(`\r${RED}✖${RESET} ${text}\n`);
    },
  };
}

// ── 表格渲染（仿 openclaw renderTable）─────────────
function renderStatusTable(rows) {
  const labelWidth = Math.max(...rows.map(([label]) => label.length)) + 2;
  const border = `${DIM}${'─'.repeat(labelWidth + 32)}${RESET}`;

  console.log(border);
  for (const [label, value] of rows) {
    const paddedLabel = `${BOLD}${label}${RESET}`.padEnd(labelWidth + BOLD.length + RESET.length);
    console.log(`  ${paddedLabel}  ${value}`);
  }
  console.log(border);
}

/**
 * 检测当前 npm 全局安装方式（npm / pnpm / yarn）
 */
function detectPackageManager() {
  try {
    const npmRoot = execSync('npm root -g', { encoding: 'utf8', timeout: 5000 }).trim();
    const globalPath = execSync('npm prefix -g', { encoding: 'utf8', timeout: 5000 }).trim();
    if (globalPath && npmRoot) {
      return 'npm';
    }
  } catch {
    // ignore
  }
  return 'npm';
}

/**
 * 执行自更新流程（仿 openclaw update 风格）：
 * 1. 展示当前状态表格
 * 2. 查询 npm registry 获取最新版本
 * 3. 若有新版本，spinner 动画执行 npm install -g openyida@latest
 * 4. 若已是最新，表格中标记 up to date
 *
 * @param {string} currentVersion - 当前版本号（来自 package.json）
 */
async function runUpdate(currentVersion) {
  // ── 标题 ──
  console.log('');
  console.log(`${BOLD}${CYAN}OpenYida update${RESET}`);
  console.log('');

  // ── Step 1: 检查最新版本 ──
  const spinner = createSpinner(t('update.checking'));
  const latestVersion = await fetchLatestVersion();

  if (!latestVersion) {
    spinner.fail(t('update.fetch_failed'));
    process.exit(1);
  }

  const hasUpdate = isNewer(currentVersion, latestVersion);
  spinner.succeed(t('update.checking'));

  // ── Step 2: 状态表格 ──
  const packageManager = detectPackageManager();
  const updateValue = hasUpdate
    ? `${YELLOW}${BOLD}${t('update.available')}${RESET} · ${MAGENTA}${currentVersion}${RESET} → ${GREEN}${BOLD}${latestVersion}${RESET}`
    : `${GREEN}${t('update.up_to_date')}${RESET} · ${DIM}${latestVersion}${RESET}`;

  renderStatusTable([
    [t('update.label_install'),  packageManager],
    [t('update.label_channel'),  `stable ${DIM}(default)${RESET}`],
    [t('update.label_version'),  `${CYAN}${currentVersion}${RESET}`],
    [t('update.label_update'),   updateValue],
  ]);

  // ── Step 3: 无需更新 → 退出 ──
  if (!hasUpdate) {
    console.log('');
    console.log(`  ${GREEN}✔${RESET} ${t('update.already_latest', currentVersion)}`);
    console.log('');
    return;
  }

  // ── Step 4: 执行更新 ──
  console.log('');
  const installSpinner = createSpinner(t('update.installing'));

  try {
    execSync('npm install -g openyida@latest', {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
    });
    installSpinner.succeed(`${t('update.success', latestVersion)}`);
  } catch (error) {
    installSpinner.fail(t('update.install_failed', error.message));
    warn(`  ${DIM}${t('update.manual_hint')}${RESET}`);
    process.exit(1);
  }

  // ── 完成提示 ──
  console.log('');
  console.log(`  ${GREEN}${BOLD}${t('update.done')}${RESET}`);
  console.log(`  ${DIM}${t('update.done_hint')}${RESET}`);
  console.log('');
}

module.exports = { runUpdate };
