import { i18n } from 'app/src/i18n/externalFileLoader'

import type { I_appMenuList } from 'app/types/I_appMenusDataList'

// TODO - add functionality for all buttons and conditions

export const documents: I_appMenuList = {
  title: i18n.global.t('appControlMenus.documents.title'),
  data: [
    {
      mode: 'item',
      text: i18n.global.t('appControlMenus.documents.items.quickAddNewDocument'),
      icon: 'mdi-text-box-plus-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    }
  ]
}
