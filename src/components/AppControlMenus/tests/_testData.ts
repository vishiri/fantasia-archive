import { I_appMenusDataList } from 'app/interfaces/I_appMenusDataList'
import { openDialogMarkdownDocument } from 'src/scripts/appInfo/openDialogMarkdownDocument'

export const testData:I_appMenusDataList = {
  title: 'Test Title',
  data: [
    {
      mode: 'item',
      text: 'Test Button 1 - Open Dialog with Markdown document',
      icon: 'mdi-text-box-plus-outline',
      submenu: undefined,
      trigger: openDialogMarkdownDocument,
      triggerArguments: ['changeLog'],
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: 'Test Button 2',
      icon: 'mdi-database-search',
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
      text: 'Test Button 3 - Secondary',
      icon: 'mdi-text-box-remove-outline',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: 'secondary'
    },
    {
      mode: 'separator'
    },
    {
      mode: 'item',
      text: 'Test Button 4',
      icon: 'mdi-page-layout-sidebar-left',
      submenu: undefined,
      trigger: undefined,
      conditions: true,
      specialColor: undefined
    },
    {
      mode: 'item',
      text: 'Test Button 5',
      icon: 'mdi-clipboard-text-outline',
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
      text: 'Test Button 6 - Grey, Submenu',
      icon: 'keyboard_arrow_right',
      trigger: undefined,
      conditions: true,
      specialColor: 'grey',
      submenu: [
        {
          mode: 'item',
          text: 'Submenu-Test Button 1',
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
          text: 'Submenu-Test Button 2 - Secondary',
          icon: 'mdi-wrench',
          trigger: undefined,
          conditions: true,
          specialColor: 'secondary'
        }
      ]

    }
  ]
}
