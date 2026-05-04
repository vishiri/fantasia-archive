import { i18n } from 'app/i18n/externalFileLoader'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'

import type { I_appMenuBuildSession, I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

// TODO - add functionality for all buttons and conditions

function buildToolsMenuData (session: I_appMenuBuildSession): I_appMenuItem[] {
  const gate = session.hasActiveProject

  return [
    faMenuItem('appControlMenus.tools.items.toggleTree', 'mdi-page-layout-sidebar-left', {
      conditions: gate
    }),
    faMenuItem('appControlMenus.tools.items.showNoteBoard', 'mdi-clipboard-text-outline'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.tools.items.importExportProgramConfig', 'mdi-cog-transfer', {
      trigger: () => runFaAction('openImportExportProgramConfigDialog', undefined)
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.tools.items.programStyling', 'mdi-language-css3', {
      keybindCommandId: 'openProgramStyling',
      trigger: () => runFaAction('openProgramStylingWindow', undefined)
    }),
    faMenuItem('appControlMenus.tools.items.keybindSettings', 'mdi-keyboard-settings', {
      keybindCommandId: 'openKeybindSettings',
      trigger: () => runFaAction('openKeybindSettingsDialog', undefined)
    }),
    faMenuItem('appControlMenus.tools.items.programSettings', 'mdi-tune', {
      keybindCommandId: 'openProgramSettings',
      trigger: () => runFaAction('openProgramSettingsDialog', undefined)
    })
  ]
}

export function buildToolsMenu (session: I_appMenuBuildSession): I_appMenuList {
  return {
    data: buildToolsMenuData(session),
    title: i18n.global.t('appControlMenus.tools.title')
  }
}
