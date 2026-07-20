import { i18n } from 'app/i18n/externalFileLoader'

import type { I_faRecentProjectEntry } from 'app/types/I_faRecentProjectsDomain'
import type { I_appMenuBuildSession, I_appMenuItem, I_appMenuList, I_appMenuSubItem } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator,
  faMenuSubItem,
  faMenuSubSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'

// TODO - add functionality for all buttons and conditions

function buildLoadRecentSubmenu (recent: readonly I_faRecentProjectEntry[]): I_appMenuSubItem[] {
  return recent.map((entry) => {
    return faMenuSubItem('appControlMenus.project.items.recentProjectRow', '', {
      itemKey: `recent-project-${entry.filePath}`,
      secondaryHintText: entry.filePath,
      text: entry.name,
      trigger: () => runFaAction('loadExistingProject', { filePath: entry.filePath })
    })
  })
}

function buildProjectMenuData (session: I_appMenuBuildSession): I_appMenuItem[] {
  const gate = session.hasActiveProject
  const recent = session.recentProjects ?? []
  const hasRecent = recent.length > 0

  return [
    faMenuItem('appControlMenus.project.items.newProject', 'mdi-plus', {
      trigger: () => runFaAction('openNewProjectDialog', undefined)
    }),
    faMenuSeparator('project-sep-after-new'),
    faMenuItem('appControlMenus.project.items.loadProject', 'mdi-package-variant', {
      trigger: () => runFaAction('loadExistingProject', {})
    }),
    faMenuItem('appControlMenus.project.items.loadRecentProject', 'keyboard_arrow_right', {
      conditions: hasRecent,
      specialColor: 'grey',
      ...(hasRecent ? { submenu: buildLoadRecentSubmenu(recent) } : {})
    }),
    faMenuSeparator('project-sep-after-recent'),
    faMenuItem('appControlMenus.project.items.showProjectDashboard', 'mdi-chart-bar', {
      conditions: gate,
      keybindCommandId: 'showProjectDashboard',
      trigger: () => runFaAction('showProjectDashboard', undefined)
    }),
    faMenuSeparator('project-sep-before-noteboard'),
    faMenuItem('appControlMenus.project.items.toggleProjectNoteboard', 'mdi-notebook-edit-outline', {
      conditions: gate,
      keybindCommandId: 'toggleProjectNoteboard',
      trigger: () => runFaAction('toggleProjectNoteboardWindow', undefined)
    }),
    faMenuItem('appControlMenus.project.items.openProjectCustomCss', 'mdi-language-css3', {
      conditions: gate,
      keybindCommandId: 'openProjectStyling',
      trigger: () => runFaAction('openProjectStylingDialog', undefined)
    }),
    faMenuItem('appControlMenus.project.items.projectSettings', 'mdi-book-cog-outline', {
      conditions: gate,
      keybindCommandId: 'openProjectSettings',
      trigger: () => runFaAction('openProjectSettingsDialog', undefined)
    }),
    faMenuSeparator('project-sep-before-advanced'),
    faMenuItem('appControlMenus.project.items.advancedProjectTools', 'keyboard_arrow_right', {
      specialColor: 'grey',
      submenu: [
        faMenuSubItem('appControlMenus.project.items.aptMerge', 'mdi-folder-plus-outline', {
          conditions: false
        }),
        faMenuSubSeparator('project-apt-sep-merge-convert'),
        faMenuSubItem('appControlMenus.project.items.aptConvertOld', 'mdi-wrench', {
          conditions: false
        })
      ]
    })
  ]
}

export function buildProjectMenu (session: I_appMenuBuildSession): I_appMenuList {
  return {
    data: buildProjectMenuData(session),
    title: i18n.global.t('appControlMenus.project.title')
  }
}
