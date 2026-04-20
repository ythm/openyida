'use strict';

const {
  httpGet,
  requestWithAutoLogin,
} = require('../core/utils');
const { t } = require('../core/i18n');

function resolveLocalizedText(value, fallback = '') {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return value.zh_CN || value.en_US || value.zh_TW || fallback;
  }

  return fallback;
}

function normalizeFormNavigationNode(node) {
  if (!node || node.navType === 'SYSTEM' || !node.formUuid) {
    return null;
  }

  return {
    formUuid: node.formUuid,
    formName: resolveLocalizedText(node.title || node.i18nTitle || node.name, t('list_forms.unnamed_form')),
    formType: node.formType || '',
    pathName: node.pathName || '',
  };
}

async function fetchFormPageList(appType, authRef) {
  const result = await requestWithAutoLogin((auth) => {
    return httpGet(
      auth.baseUrl,
      `/dingtalk/web/${appType}/query/formnav/getFormNavigationListByOrder.json`,
      { _api: 'Nav.queryList', _mock: false },
      auth.cookies
    );
  }, authRef);

  if (!result || result.success === false) {
    throw new Error(
      t('list_forms.fetch_failed') + ': ' +
      (result ? result.errorMsg || t('common.unknown_error') : t('common.request_failed'))
    );
  }

  const items = Array.isArray(result.content) ? result.content : [];
  return items
    .map(normalizeFormNavigationNode)
    .filter(Boolean);
}

module.exports = {
  fetchFormPageList,
  normalizeFormNavigationNode,
  resolveLocalizedText,
};
