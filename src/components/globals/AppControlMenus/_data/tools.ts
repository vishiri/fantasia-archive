import { i18n } from 'app/i18n/externalFileLoader'
import { openDialogComponent } from 'app/src/scripts/appInfo/openDialogMarkdownDocument'

import type { I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

// TODO - add functionality for all buttons and conditions

function buildToolsMenuData (): I_appMenuItem[] {
  return [
    faMenuItem('appControlMenus.tools.items.quickAddNewDocument', 'mdi-text-box-plus-outline'),
    faMenuItem('appControlMenus.tools.items.quickSearchDocument', 'mdi-database-search'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.tools.items.massDeleteDocument', 'mdi-text-box-remove-outline', {
      specialColor: 'secondary'
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.tools.items.toggleTree', 'mdi-page-layout-sidebar-left'),
    faMenuItem('appControlMenus.tools.items.showNoteBoard', 'mdi-clipboard-text-outline'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.tools.items.keybindSettings', 'mdi-keyboard-settings', {
      trigger: () => openDialogComponent('KeybindSettings')
    }),
    faMenuItem('appControlMenus.tools.items.programSettings', 'mdi-tune', {
      trigger: () => openDialogComponent('ProgramSettings')
    })
  ]
}

export function buildToolsMenu (): I_appMenuList {
  return {
    data: buildToolsMenuData(),
    title: i18n.global.t('appControlMenus.tools.title')
  }
}
