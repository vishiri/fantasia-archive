import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuBuildSession, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

// TODO - add functionality for all buttons and conditions

export function buildDocumentsMenu (session: I_appMenuBuildSession): I_appMenuList {
  const gate = session.hasActiveProject

  return {
    data: [
      faMenuItem('appControlMenus.documents.items.quickAddNewDocument', 'mdi-text-box-plus-outline', {
        conditions: gate
      }),
      faMenuItem('appControlMenus.documents.items.quickSearchDocument', 'mdi-database-search', {
        conditions: gate
      }),
      faMenuSeparator(),
      faMenuItem('appControlMenus.documents.items.massDeleteDocument', 'mdi-text-box-remove-outline', {
        conditions: gate,
        specialColor: 'secondary'
      })
    ],
    title: i18n.global.t('appControlMenus.documents.title')
  }
}
