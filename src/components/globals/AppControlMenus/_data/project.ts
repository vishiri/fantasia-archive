import { i18n } from 'app/i18n/externalFileLoader'

import type { I_appMenuItem, I_appMenuList } from 'app/types/I_appMenusDataList'

import {
  faMenuItem,
  faMenuSeparator,
  faMenuSubItem,
  faMenuSubSeparator
} from 'app/src/components/globals/AppControlMenus/_data/menuDataHelpers'

// TODO - add functionality for all buttons and conditions

function buildProjectMenuData (): I_appMenuItem[] {
  return [
    faMenuItem('appControlMenus.project.items.newProject', 'mdi-plus'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.saveProject', 'mdi-package-variant-closed'),
    faMenuItem('appControlMenus.project.items.loadProject', 'mdi-package-variant'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.exportProjectDocuments', 'mdi-database-export-outline'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.showProjectDashboard', 'mdi-chart-bar'),
    faMenuItem('appControlMenus.project.items.projectSettings', 'mdi-book-cog-outline'),
    faMenuItem('appControlMenus.project.items.closeProject', 'mdi-exit-to-app'),
    faMenuSeparator(),
    faMenuItem('appControlMenus.project.items.advancedProjectTools', 'keyboard_arrow_right', {
      specialColor: 'grey',
      submenu: [
        faMenuSubItem('appControlMenus.project.items.aptMerge', 'mdi-folder-plus-outline'),
        faMenuSubSeparator(),
        faMenuSubItem('appControlMenus.project.items.aptConvertOld', 'mdi-wrench')
      ]
    })
  ]
}

export function buildProjectMenu (): I_appMenuList {
  return {
    data: buildProjectMenuData(),
    title: i18n.global.t('appControlMenus.project.title')
  }
}
