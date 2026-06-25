import { i18n } from 'app/i18n/externalFileLoader'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

import type { I_appMenuBuildSession, I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

// TODO - add functionality for all buttons and conditions

function buildToolsMenuData (_session: I_appMenuBuildSession): I_appMenuItem[] {
  return [
    faMenuItem('appControlMenus.tools.items.appNoteBoard', 'mdi-clipboard-text-outline', {
      keybindCommandId: 'toggleAppNoteboard',
      trigger: () => runFaAction('toggleAppNoteboardWindow', undefined)
    }),
    faMenuItem('appControlMenus.tools.items.appStyling', 'mdi-language-css3', {
      keybindCommandId: 'openAppStyling',
      trigger: () => runFaAction('openAppStylingWindow', undefined)
    }),
    faMenuItem('appControlMenus.tools.items.keybindSettings', 'mdi-keyboard-settings', {
      keybindCommandId: 'openKeybindSettings',
      trigger: () => runFaAction('openKeybindSettingsDialog', undefined)
    }),
    faMenuItem('appControlMenus.tools.items.appSettings', 'mdi-tune', {
      keybindCommandId: 'openAppSettings',
      trigger: () => runFaAction('openAppSettingsDialog', undefined)
    }),
    faMenuSeparator('tools-sep-before-import-export'),
    faMenuItem('appControlMenus.tools.items.importExportAppConfig', 'mdi-cog-transfer', {
      trigger: () => runFaAction('openImportExportAppConfigDialog', undefined)
    })
  ]
}

export function buildToolsMenu (session: I_appMenuBuildSession): I_appMenuList {
  return {
    data: buildToolsMenuData(session),
    title: i18n.global.t('appControlMenus.tools.title')
  }
}
