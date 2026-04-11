import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuList } from 'app/types/I_appMenusDataList'

import { faMenuItem } from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

// TODO - add functionality for all buttons and conditions

export function buildDocumentsMenu (): I_appMenuList {
  return {
    data: [
      faMenuItem('appControlMenus.documents.items.quickAddNewDocument', 'mdi-text-box-plus-outline')
    ],
    title: i18n.global.t('appControlMenus.documents.title')
  }
}
