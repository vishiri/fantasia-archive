import { i18n } from 'app/src/i18n/externalFileLoader'

import { I_appMenusDataList } from 'app/interfaces/I_appMenusDataList'

// TODO - add functionality for all buttons and conditions

export const documents: I_appMenusDataList = {
  title: i18n.global.t('AppControlMenus.documents.title'),
  data: [
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.documents.items.quickAddNewDocument'),
      icon: 'mdi-text-box-plus-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    }
  ]
}
