import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'
import { openDialogComponent, openDialogMarkdownDocument } from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { toggleDevTools } from 'app/src/scripts/appGlobalManagementUI/toggleDevTools'

// TODO - add functionality for all buttons and conditions

function buildHelpInfoMenuData (): I_appMenuItem[] {
  return [
    faMenuItem('appControlMenus.helpInfo.items.advancedSearchGuide', 'mdi-file-question', {
      keybindCommandId: 'openAdvancedSearchGuide',
      trigger: () => openDialogMarkdownDocument('advancedSearchGuide')
    }),
    faMenuItem('appControlMenus.helpInfo.items.tipsTricksTrivia', 'mdi-fire-alert', {
      trigger: () => openDialogMarkdownDocument('tipsTricksTrivia')
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.helpInfo.items.changelog', 'mdi-clipboard-text', {
      trigger: () => openDialogMarkdownDocument('changeLog')
    }),
    faMenuItem('appControlMenus.helpInfo.items.aboutFantasiaArchive', 'mdi-information-variant', {
      trigger: () => openDialogComponent('AboutFantasiaArchive')
    }),
    faMenuItem('appControlMenus.helpInfo.items.license', 'mdi-script-text-outline', {
      trigger: () => openDialogMarkdownDocument('license')
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.helpInfo.items.toggleDeveloperTools', 'mdi-code-tags', {
      keybindCommandId: 'toggleDeveloperTools',
      trigger: toggleDevTools
    })
  ]
}

export function buildHelpInfoMenu (): I_appMenuList {
  return {
    data: buildHelpInfoMenuData(),
    title: i18n.global.t('appControlMenus.helpInfo.title')
  }
}
