import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'

// TODO - add functionality for all buttons and conditions

function buildHelpInfoMenuData (): I_appMenuItem[] {
  return [
    faMenuItem('appControlMenus.helpInfo.items.advancedSearchGuide', 'mdi-file-question', {
      keybindCommandId: 'openAdvancedSearchGuide',
      trigger: () => runFaAction('openAdvancedSearchGuideDialog', undefined)
    }),
    faMenuItem('appControlMenus.helpInfo.items.tipsTricksTrivia', 'mdi-fire-alert', {
      trigger: () => runFaAction('openTipsTricksTriviaDialog', undefined)
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.helpInfo.items.changelog', 'mdi-clipboard-text', {
      trigger: () => runFaAction('openChangelogDialog', undefined)
    }),
    faMenuItem('appControlMenus.helpInfo.items.aboutFantasiaArchive', 'mdi-information-variant', {
      trigger: () => runFaAction('openAboutFantasiaArchiveDialog', undefined)
    }),
    faMenuItem('appControlMenus.helpInfo.items.license', 'mdi-script-text-outline', {
      trigger: () => runFaAction('openLicenseDialog', undefined)
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.helpInfo.items.actionMonitor', 'mdi-pulse', {
      keybindCommandId: 'openActionMonitor',
      trigger: () => runFaAction('openActionMonitorDialog', undefined)
    }),
    faMenuItem('appControlMenus.helpInfo.items.toggleDeveloperTools', 'mdi-code-tags', {
      keybindCommandId: 'toggleDeveloperTools',
      trigger: () => runFaAction('toggleDeveloperTools', undefined)
    })
  ]
}

export function buildHelpInfoMenu (): I_appMenuList {
  return {
    data: buildHelpInfoMenuData(),
    title: i18n.global.t('appControlMenus.helpInfo.title')
  }
}
