import { i18n } from 'app/src/i18n/externalFileLoader'

import { I_appMenusDataList } from 'app/interfaces/I_appMenusDataList'

// TODO - add functionality for all buttons and conditions

export const project: I_appMenusDataList = {
  title: i18n.global.t('AppControlMenus.project.title'),
  data: [
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.project.items.newProject'),
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
      text: i18n.global.t('AppControlMenus.project.items.saveProject'),
      icon: 'mdi-package-variant-closed',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.project.items.loadProject'),
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
      text: i18n.global.t('AppControlMenus.project.items.exportProjectDocuments'),
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
      text: i18n.global.t('AppControlMenus.project.items.showProjectDashboard'),
      icon: 'mdi-chart-bar',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.project.items.projectSettings'),
      icon: 'mdi-book-cog-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: i18n.global.t('AppControlMenus.project.items.closeProject'),
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
      text: i18n.global.t('AppControlMenus.project.items.advancedProjectTools'),
      icon: 'keyboard_arrow_right',
      trigger: undefined,
      conditions: true,
      specialColor: 'grey',
      submenu: [
        {
          mode: 'item',
          text: i18n.global.t('AppControlMenus.project.items.aptMerge'),
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
          text: i18n.global.t('AppControlMenus.project.items.aptConvertOld'),
          icon: 'mdi-wrench',
          trigger: undefined,
          conditions: true,
          specialColor: undefined
        }
      ]
    }
  ]
}
