import { i18n } from 'app/src/i18n/externalFileLoader'

import type { I_appMenuList } from 'app/types/I_appMenusDataList'

// TODO - add functionality for all buttons and conditions

export const project: I_appMenuList = {
  title: i18n.global.t('appControlMenus.project.title'),
  data: [
    {
      mode: 'item',
      text: i18n.global.t('appControlMenus.project.items.newProject'),
      icon: 'mdi-plus',
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
      text: i18n.global.t('appControlMenus.project.items.saveProject'),
      icon: 'mdi-package-variant-closed',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('appControlMenus.project.items.loadProject'),
      icon: 'mdi-package-variant',
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
      text: i18n.global.t('appControlMenus.project.items.exportProjectDocuments'),
      icon: 'mdi-database-export-outline',
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
      text: i18n.global.t('appControlMenus.project.items.showProjectDashboard'),
      icon: 'mdi-chart-bar',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('appControlMenus.project.items.projectSettings'),
      icon: 'mdi-book-cog-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('appControlMenus.project.items.closeProject'),
      icon: 'mdi-exit-to-app',
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
      text: i18n.global.t('appControlMenus.project.items.advancedProjectTools'),
      icon: 'keyboard_arrow_right',
      trigger: undefined,
      conditions: true,
      specialColor: 'grey',
      submenu: [
        {
          mode: 'item',
          text: i18n.global.t('appControlMenus.project.items.aptMerge'),
          icon: 'mdi-folder-plus-outline',
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        },
        {
          mode: 'separator'
        },
        {
          mode: 'item',
          text: i18n.global.t('appControlMenus.project.items.aptConvertOld'),
          icon: 'mdi-wrench',
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        }
      ]
    }
  ]
}
