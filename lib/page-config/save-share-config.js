/**
 * save-share-config.js - 宜搭页面公开访问/分享配置保存命令
 *
 * 用法：openyida save-share-config <appType> <formUuid> <url> <isOpen> [openAuth]
 */

'use strict';

const https = require('https');
const http = require('http');
const querystring = require('querystring');

const { loadCookieData, triggerLogin, refreshCsrfToken, resolveBaseUrl, isLoginExpired, isCsrfTokenExpired } = require('../core/utils');
const { t } = require('../core/i18n');
const { banner, step, label, success, fail, warn, info, error, result, hint, listItem, usage } = require('../core/chalk');

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    warn(t('save_share_config.usage'));
    warn(t('save_share_config.example'));
    warn(t('save_share_config.is_open_hint'));
    warn(t('save_share_config.open_auth_hint'));
    process.exit(1);
  }
  return {
    appType: args[0],
    formUuid: args[1],
    openUrl: args[2],
    isOpen: args[3],
    openAuth: args[4] || 'n',
  };
}

function validateParams(params) {
  if (params.isOpen !== 'y' && params.isOpen !== 'n') {
    throw new Error(t('save_share_config.err_is_open_invalid', params.isOpen));
  }
  if (params.openAuth !== 'y' && params.openAuth !== 'n') {
    throw new Error(t('save_share_config.err_open_auth_invalid', params.openAuth));
  }
  if (params.isOpen === 'y' && !params.openUrl) {
    throw new Error(t('save_share_config.err_open_url_required'));
  }
  if (params.isOpen === 'n') {
    return true;
  }
  if (!params.openUrl.startsWith('/o/') && !params.openUrl.startsWith('/s/')) {
    throw new Error(t('save_share_config.err_open_url_prefix', params.openUrl) + '（也支持 /s/ 前缀用于组织内分享）');
  }
  const pathPart = params.openUrl.slice(3);
  if (!/^[a-zA-Z0-9_-]+$/.test(pathPart)) {
    throw new Error(t('save_share_config.err_open_url_chars', params.openUrl));
  }
  return true;
}


function sendPostRequest(baseUrl, cookies, requestPath, postData) {
  return new Promise((resolve, reject) => {
    const cookieHeader = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const parsedUrl = new URL(baseUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const requestModule = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: requestPath,
      method: 'POST',
      headers: {
        Origin: baseUrl,
        Referer: baseUrl + '/',
        Cookie: cookieHeader,
        Accept: 'application/json, text/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-requested-with': 'XMLHttpRequest',
      },
      timeout: 30000,
    };

    const request = requestModule.request(requestOptions, (response) => {
      let responseData = '';
      response.on('data', (chunk) => { responseData += chunk; });
      response.on('end', () => {
        info(t('common.http_status', response.statusCode));
        let parsed;
        try {
          parsed = JSON.parse(responseData);
        } catch (parseError) {
          warn(t('common.response_body', responseData.substring(0, 500)));
          resolve({ success: false, errorMsg: 'HTTP ' + response.statusCode + ': ' + t('common.response_not_json') });
          return;
        }
        if (isLoginExpired(parsed)) {
          warn(t('common.login_expired', parsed.errorMsg));
          resolve({ __needLogin: true });
          return;
        }
        if (isCsrfTokenExpired(parsed)) {
          warn(t('common.csrf_expired', parsed.errorMsg));
          resolve({ __csrfExpired: true });
          return;
        }
        resolve(parsed);
      });
    });

    request.on('timeout', () => {
      warn(t('common.request_timeout'));
      request.destroy();
      reject(new Error(t('common.request_timeout')));
    });

    request.on('error', (requestError) => {
      reject(requestError);
    });

    request.write(postData);
    request.end();
  });
}

async function main() {
  const { appType, formUuid, openUrl, isOpen, openAuth } = parseArgs();

  warn(t('save_share_config.title'));
  warn(t('save_share_config.app_id', appType));
  warn(t('save_share_config.form_uuid', formUuid));
  warn(t('save_share_config.open_url', openUrl || t('common.empty')));
  warn(t('save_share_config.is_open', isOpen === 'y' ? t('common.yes') : t('common.no')));
  warn(t('save_share_config.open_auth', openAuth === 'y' ? t('common.yes') : t('common.no')));

  warn(t('save_share_config.step_validate'));
  try {
    validateParams({ openUrl, isOpen, openAuth });
    warn(t('save_share_config.validate_ok'));
  } catch (err) {
    warn(t('save_share_config.validate_failed', err.message));
    process.exit(1);
  }

  warn(t('common.step_login_label'));
  let cookieData = loadCookieData();
  if (!cookieData) {
    warn(t('common.no_login_cache'));
    cookieData = triggerLogin();
  }
  let { cookies } = cookieData;
  let baseUrl = resolveBaseUrl(cookieData);
  success(t('common.login_ready', baseUrl));

  warn(t('save_share_config.step_save'));
  warn(t('save_share_config.sending_request'));
  let { csrf_token: csrfToken } = cookieData;

  const authConfig = JSON.stringify({
    openAuth: openAuth,
    authSources: [],
  });

  // 根据 URL 前缀区分：/s/ 传 shareUrl，/o/ 传 openUrl
  const isShareUrl = openUrl.startsWith('/s/');

  function buildPostData(token) {
    const params = {
      _api: 'Share.saveShareConfig',
      _csrf_token: token,
      _locale_time_zone_offset: '28800000',
      formUuid: formUuid,
    };
    if (isShareUrl) {
      params.shareUrl = openUrl;
    } else {
      params.openUrl = openUrl;
      params.isOpen = isOpen;
      params.openPageAuthConfig = authConfig;
    }
    return querystring.stringify(params);
  }

  const postData = buildPostData(csrfToken);

  let result = await sendPostRequest(
    baseUrl,
    cookies,
    `/dingtalk/web/${appType}/query/formdesign/saveShareConfig.json`,
    postData
  );

  if (result && result.__csrfExpired) {
    cookieData = refreshCsrfToken();
    csrfToken = cookieData.csrf_token;
    cookies = cookieData.cookies;
    baseUrl = resolveBaseUrl(cookieData);
    info(t('common.resend_csrf'));
    result = await sendPostRequest(
      baseUrl,
      cookies,
      `/dingtalk/web/${appType}/query/formdesign/saveShareConfig.json`,
      buildPostData(csrfToken)
    );
  }

  if (result && result.__needLogin) {
    cookieData = triggerLogin();
    csrfToken = cookieData.csrf_token;
    cookies = cookieData.cookies;
    baseUrl = resolveBaseUrl(cookieData);
    info(t('common.resend'));
    result = await sendPostRequest(
      baseUrl,
      cookies,
      `/dingtalk/web/${appType}/query/formdesign/saveShareConfig.json`,
      buildPostData(csrfToken)
    );
  }

  if (result && !result.__needLogin && !result.__csrfExpired) {
    if (result.success) {
      warn(t('save_share_config.save_ok'));
      console.log(JSON.stringify({
        success: true,
        openUrl: isOpen === 'y' ? openUrl : null,
        isOpen: isOpen === 'y',
        message: t('save_share_config.save_ok_msg')
      }, null, 2));
    } else {
      warn(t('save_share_config.save_failed', result.errorMsg || t('common.unknown_error')));
      console.log(JSON.stringify({
        success: false,
        message: result.errorMsg || t('save_share_config.save_failed_msg'),
        errorCode: result.errorCode
      }, null, 2));
    }
  } else {
    fail(t('common.request_failed_label'));
    process.exit(1);
  }
}

main().catch((error) => {
  fail(t('common.exception', error.message));
  process.exit(1);
});
