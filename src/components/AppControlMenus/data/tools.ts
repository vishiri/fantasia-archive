import { i18n } from 'app/src/i18n/externalFileLoader'

import { I_appMenusDataList } from 'app/interfaces/I_appMenusDataList'

// TODO - add functionality for all buttons and conditions

export const tools: I_appMenusDataList = {
  title: i18n.global.t('AppControlMenus.tools.title'),
  data: [
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.tools.items.quickAddNewDocument'),
      icon: 'mdi-text-box-plus-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.tools.items.quickSearchDocument'),
      icon: 'mdi-database-search',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.tools.items.massDeleteDocument'),
      icon: 'mdi-text-box-remove-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: 'secondary'
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.tools.items.toggleTree'),
      icon: 'mdi-page-layout-sidebar-left',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.tools.items.showNoteBoard'),
      icon: 'mdi-clipboard-text-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },

    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.tools.items.programSettings'),
      icon: 'mdi-tune',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    }
  ]
}
