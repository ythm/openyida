const https = require('https');
const http = require('http');
const querystring = require('querystring');

const { loadCookieData, triggerLogin, refreshCsrfToken, resolveBaseUrl, isLoginExpired, isCsrfTokenExpired } = require('../core/utils');
const { t } = require('../core/i18n');
const { banner, step, label, success, fail, warn, info, error, result, usage } = require('../core/chalk');

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.length < 4) {
    usage(t('update_form_config.usage'), t('update_form_config.example'));
    info(t('update_form_config.params_label'));
    label(t('update_form_config.param_is_render_nav'), '');
    label(t('update_form_config.param_title'), '');
    process.exit(1);
  }
  return {
    appType: args[0],
    formUuid: args[1],
    isRenderNav: args[2],
    title: args[3],
  };
}

function buildPostData(csrfToken, formUuid, isRenderNav, title) {
  const titleJson = JSON.stringify({
    pureEn_US: title,
    en_US: title,
    zh_CN: title,
    envLocale: null,
    type: 'i18n',
    ja_JP: null,
    key: null,
  });

  return querystring.stringify({
    _api: 'Form.updateFormSchemaInfo',
    _csrf_token: csrfToken,
    _locale_time_zone_offset: '28800000',
    formUuid: formUuid,
    serialSwitch: 'n',
    consultPerson: '',
    defaultManager: 'n',
    submissionRule: 'RESUBMIT',
    redirectConfig: '',
    pushTask: 'y',
    defaultOrder: 'cd',
    showPrint: 'y',
    relateUuid: '',
    title: titleJson,
    pageType: 'web,mobile',
    isInner: 'y',
    isNew: 'n',
    isAgent: 'y',
    showAgent: 'n',
    showDingGroup: 'y',
    reStart: 'n',
    previewConfig: 'y',
    formulaType: 'n',
    displayTitle: '%24%7Blegao_creator%7D%E5%8F%91%E8%B5%B7%E7%9A%84%24%7Blegao_formname%7D',
    displayType: 'RE',
    isRenderNav: isRenderNav,
    manageCustomActionInfo: '[]',
  });
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
  const { appType, formUuid, isRenderNav, title } = parseArgs();

  banner(t('update_form_config.title'));
  label('App ID:', appType);
  label('Form UUID:', formUuid);
  label('Render Nav:', isRenderNav === 'true' ? t('common.yes') : t('common.no'));
  label('Title:', title);

  step(1, t('common.step_login_label'));
  let cookieData = loadCookieData();
  if (!cookieData) {
    warn(t('common.no_login_cache'));
    cookieData = triggerLogin();
  }
  let { cookies } = cookieData;
  let baseUrl = resolveBaseUrl(cookieData);
  success(t('common.login_ready', baseUrl));

  step(2, t('update_form_config.step_update'));
  info(t('update_form_config.sending_request'));
  let { csrf_token: csrfToken } = cookieData;

  const postData = buildPostData(csrfToken, formUuid, isRenderNav, title);

  let apiResult = await sendPostRequest(
    baseUrl,
    cookies,
    `/dingtalk/web/${appType}/query/formdesign/updateFormSchemaInfo.json`,
    postData
  );

  if (apiResult && apiResult.__csrfExpired) {
    cookieData = refreshCsrfToken();
    csrfToken = cookieData.csrf_token;
    cookies = cookieData.cookies;
    baseUrl = resolveBaseUrl(cookieData);
    const newPostData = buildPostData(csrfToken, formUuid, isRenderNav, title);
    info(t('common.resend_csrf'));
    apiResult = await sendPostRequest(
      baseUrl,
      cookies,
      `/dingtalk/web/${appType}/query/formdesign/updateFormSchemaInfo.json`,
      newPostData
    );
  }

  if (apiResult && apiResult.__needLogin) {
    cookieData = triggerLogin();
    csrfToken = cookieData.csrf_token;
    cookies = cookieData.cookies;
    baseUrl = resolveBaseUrl(cookieData);
    const newPostData = buildPostData(csrfToken, formUuid, isRenderNav, title);
    info(t('common.resend'));
    apiResult = await sendPostRequest(
      baseUrl,
      cookies,
      `/dingtalk/web/${appType}/query/formdesign/updateFormSchemaInfo.json`,
      newPostData
    );
  }

  if (apiResult && !apiResult.__needLogin && !apiResult.__csrfExpired) {
    if (apiResult.success) {
      result(true, t('update_form_config.update_ok'), [
        ['Render Nav', isRenderNav === 'true' ? t('update_form_config.nav_shown') : t('update_form_config.nav_hidden')],
      ]);
      console.log(JSON.stringify({
        success: true,
        isRenderNav: isRenderNav === 'true',
        message: isRenderNav === 'true' ? t('update_form_config.nav_shown') : t('update_form_config.nav_hidden')
      }, null, 2));
    } else {
      result(false, t('update_form_config.update_failed', apiResult.errorMsg || t('common.unknown_error')));
      console.log(JSON.stringify({
        success: false,
        message: apiResult.errorMsg || t('update_form_config.update_failed_msg'),
        errorCode: apiResult.errorCode
      }, null, 2));
    }
  } else {
    fail(t('common.request_failed_label'));
    process.exit(1);
  }
}

main().catch((err) => {
  error(t('common.exception', err.message));
});
