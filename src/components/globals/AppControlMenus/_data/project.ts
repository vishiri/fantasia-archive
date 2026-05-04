import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuBuildSession, I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator,
  faMenuSubItem,
  faMenuSubSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

// TODO - add functionality for all buttons and conditions

function buildProjectMenuData (session: I_appMenuBuildSession): I_appMenuItem[] {
  const gate = session.hasActiveProject

  return [
    faMenuItem('appControlMenus.project.items.newProject', 'mdi-plus'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.saveProject', 'mdi-package-variant-closed', {
      conditions: gate
    }),
    faMenuItem('appControlMenus.project.items.loadProject', 'mdi-package-variant'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.exportProjectDocuments', 'mdi-database-export-outline'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.showProjectDashboard', 'mdi-chart-bar', {
      conditions: gate
    }),
    faMenuItem('appControlMenus.project.items.projectSettings', 'mdi-book-cog-outline', {
      conditions: gate
    }),
    faMenuItem('appControlMenus.project.items.closeProject', 'mdi-exit-to-app', {
      conditions: gate
    }),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.advancedProjectTools', 'keyboard_arrow_right', {
      specialColor: 'grey',
      submenu: [
        faMenuSubItem('appControlMenus.project.items.aptMerge', 'mdi-folder-plus-outline', {
          conditions: gate
        }),
        faMenuSubSeparator(),
        faMenuSubItem('appControlMenus.project.items.aptConvertOld', 'mdi-wrench')
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
