import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuBuildSession, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

export function buildDocumentsMenu (_session: I_appMenuBuildSession): I_appMenuList {
  return {
    data: [
      faMenuItem('appControlMenus.documents.items.quickAddNewDocument', 'mdi-text-box-plus-outline', {
        conditions: false
      }),
      faMenuItem('appControlMenus.documents.items.quickSearchDocument', 'mdi-database-search', {
        conditions: false
      }),
      faMenuSeparator(),
      faMenuItem('appControlMenus.documents.items.massDeleteDocument', 'mdi-text-box-remove-outline', {
        conditions: false,
        specialColor: 'secondary'
      }),
      faMenuSeparator(),
      faMenuItem('appControlMenus.documents.items.exportProjectDocuments', 'mdi-database-export-outline', {
        conditions: false
      })
    ],
    title: i18n.global.t('appControlMenus.documents.title')
  }
}
