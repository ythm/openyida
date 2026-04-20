/**
 * get-schema.js - 宜搭表单 Schema 获取命令
 *
 * 用法：openyida get-schema <appType> <formUuid>
 */

'use strict';

const {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpGet,
  requestWithAutoLogin,
} = require('../core/utils');
const { t } = require('../core/i18n');

// 需要在报表 fieldCode 中加 _value 后缀的字段类型
const FIELD_TYPES_NEEDING_VALUE_SUFFIX = new Set([
  'SelectField',
  'EmployeeField',
  'RadioField',
  'CheckboxField',
]);

/**
 * 从 Schema 中提取字段摘要，列出每个字段的真实 fieldId 和报表用 reportFieldCode。
 * @param {object} schemaResult - getFormSchema API 返回结果
 * @returns {Array<{label, componentName, fieldId, reportFieldCode}>}
 */
function extractFieldSummary(schemaResult) {
  const fields = [];
  const pages = schemaResult.content && schemaResult.content.pages;
  if (!pages || pages.length === 0) {
    return fields;
  }

  const FIELD_COMPONENT_NAMES = new Set([
    'TextField', 'TextareaField', 'SelectField', 'DateField', 'NumberField',
    'RadioField', 'CheckboxField', 'EmployeeField', 'PhoneField', 'EmailField',
    'CascadeSelectField', 'ImageField', 'AttachmentField', 'TableField',
  ]);

  function traverse(node) {
    if (!node) {
      return;
    }
    if (FIELD_COMPONENT_NAMES.has(node.componentName)) {
      const props = node.props || {};
      const labelRaw = props.label;
      const label = labelRaw
        ? (typeof labelRaw === 'object' ? (labelRaw.zh_CN || labelRaw.en_US || '') : String(labelRaw))
        : '';
      const fieldId = props.fieldId || '';
      const reportFieldCode = FIELD_TYPES_NEEDING_VALUE_SUFFIX.has(node.componentName)
        ? `${fieldId}_value`
        : fieldId;
      if (fieldId) {
        fields.push({ label, componentName: node.componentName, fieldId, reportFieldCode });
      }
    }
    if (node.children) {
      node.children.forEach(traverse);
    }
  }

  // 遍历所有页面，避免多页面表单遗漏字段
  for (const page of pages) {
    const tree = page.componentsTree && page.componentsTree[0];
    if (tree) {
      traverse(tree);
    }
  }

  return fields;
}

async function run(args) {
  if (args.length < 2) {
    const { error: chalkError } = require('../core/chalk');
    chalkError(t('get_schema.usage'), { hint: t('get_schema.example') });
  }

  const appType = args[0];
  const formUuid = args[1];

  const { c, banner, step, label, info, success: chalkSuccess, result: chalkResult, sep } = require('../core/chalk');

  banner(t('get_schema.title'));
  label('App', appType);
  label('Form', formUuid);

  // Step 1: 读取登录态
  step(1, t('common.step_login', 1));
  let cookieData = loadCookieData();
  if (!cookieData) {
    info(t('common.login_no_cache'));
    cookieData = triggerLogin();
  }

  const authRef = {
    csrfToken: cookieData.csrf_token,
    cookies: cookieData.cookies,
    baseUrl: resolveBaseUrl(cookieData),
    cookieData,
  };
  chalkSuccess(t('common.login_ready', authRef.baseUrl));

  // Step 2: 获取表单 Schema
  step(2, t('get_schema.step_get'));
  info(t('get_schema.sending'));

  const result = await requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/alibaba/web/${appType}/_view/query/formdesign/getFormSchema.json`,
      { formUuid, schemaVersion: 'V5' },
      auth.cookies
    );
  }, authRef);

  // 输出结果
  if (result && result.success !== false && !result.__needLogin && !result.__csrfExpired) {
    chalkSuccess(t('get_schema.success'));

    // 提取字段摘要，方便 AI 直接获取正确的 fieldId
    const fieldSummary = extractFieldSummary(result);
    if (fieldSummary.length > 0) {
      process.stderr.write(`\n  ${c.bold}${c.cyan}📋 字段摘要${c.reset} ${c.dim}（报表配置请使用 reportFieldCode）${c.reset}\n`);
      process.stderr.write(`  ${c.dim}${'─'.repeat(80)}${c.reset}\n`);
      process.stderr.write(
        `  ${c.bold}${'label'.padEnd(16)}${'componentName'.padEnd(20)}${'fieldId'.padEnd(28)}reportFieldCode${c.reset}\n`
      );
      process.stderr.write(`  ${c.dim}${'─'.repeat(80)}${c.reset}\n`);
      for (const field of fieldSummary) {
        process.stderr.write(
          `  ${c.green}${field.label.padEnd(16)}${c.reset}${c.dim}${field.componentName.padEnd(20)}${c.reset}${field.fieldId.padEnd(28)}${c.cyan}${field.reportFieldCode}${c.reset}\n`
        );
      }
      process.stderr.write(`  ${c.dim}${'─'.repeat(80)}${c.reset}\n`);
      process.stderr.write(`  ${c.dim}注：SelectField/EmployeeField 在报表中需加 _value 后缀${c.reset}\n\n`);
    }

    console.log(JSON.stringify(result, null, 2));
  } else {
    const errorMsg = result ? result.errorMsg || t('common.unknown_error') : t('common.request_failed');
    chalkResult(false, t('get_schema.failed', errorMsg));
    process.exit(1);
  }
}

module.exports = { run };
