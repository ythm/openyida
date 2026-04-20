/**
 * get-page-config.js - 宜搭页面公开访问/分享配置查询命令
 *
 * 用法：openyida get-page-config <appType> <formUuid>
 */

'use strict';

const querystring = require('querystring');
const {
  loadCookieData,
  triggerLogin,
  resolveBaseUrl,
  httpPost,
  requestWithAutoLogin,
} = require('../core/utils');
const { t } = require('../core/i18n');
const { banner, step, label, success, fail, warn, info, error, result, hint, listItem, usage } = require('../core/chalk');

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    warn(t('get_page_config.usage'));
    warn(t('get_page_config.example'));
    process.exit(1);
  }
  return { appType: args[0], formUuid: args[1] };
}

async function main() {
  const { appType, formUuid } = parseArgs();

  warn(t('get_page_config.title'));
  warn(t('get_page_config.app_id', appType));
  warn(t('get_page_config.form_uuid', formUuid));

  // Step 1: 读取登录态
  warn(t('common.step_login_label'));
  let cookieData = loadCookieData();
  if (!cookieData) {
    warn(t('common.no_login_cache'));
    cookieData = triggerLogin();
  }

  const authRef = {
    csrfToken: cookieData.csrf_token,
    cookies: cookieData.cookies,
    baseUrl: resolveBaseUrl(cookieData),
    cookieData,
  };
  success(t('common.login_ready', authRef.baseUrl));

  // Step 2: 查询分享配置
  warn(t('get_page_config.step_query'));
  warn(t('get_page_config.sending_request'));

  const shareConfig = await requestWithAutoLogin((auth) => {
    const postData = querystring.stringify({
      _api: 'Share.getShareConfig',
      _csrf_token: auth.csrfToken,
      _locale_time_zone_offset: '28800000',
      formUuid,
    });
    return httpPost(
      auth.baseUrl,
      `/dingtalk/web/${appType}/query/formdesign/getShareConfig.json`,
      postData,
      auth.cookies
    );
  }, authRef);

  // 输出结果
  if (shareConfig && shareConfig.success !== false && !shareConfig.__needLogin && !shareConfig.__csrfExpired) {
    const content = shareConfig.content || {};
    const result = {
      isOpen: content.isOpen === 'y',
      openUrl: content.openUrl || null,
      shareUrl: content.shareUrl || null,
    };

    warn(t('get_page_config.query_ok'));

    if (result.openUrl) {warn(t('get_page_config.open_url', authRef.baseUrl + result.openUrl));}
    if (result.shareUrl) {warn(t('get_page_config.share_url', authRef.baseUrl + result.shareUrl));}
    if (!result.openUrl && !result.shareUrl) {warn(t('get_page_config.no_config'));}

    console.log(JSON.stringify(result, null, 2));
  } else {
    const errorMsg = shareConfig ? shareConfig.errorMsg || t('common.unknown_error') : t('common.request_failed');
    warn(t('get_page_config.query_failed', errorMsg));
    process.exit(1);
  }
}

main().catch((error) => {
  fail(t('common.exception', error.message));
  process.exit(1);
});
