import type {
  I_appSettingsCategoryRenderItem,
  T_appSettingsRenderTree
} from 'app/types/I_dialogAppSettings'

export const dialogAppSettingsStorybookMinimalTree: T_appSettingsRenderTree = {
  demoCategory: {
    title: 'Demo',
    subCategories: {
      demoSub: {
        title: 'Sub',
        settingsList: {
          demoSetting: {
            description: 'd',
            tags: '',
            title: 'Setting',
            control: 'toggle',
            value: false
          }
        }
      }
    }
  }
}

export const dialogAppSettingsStorybookCategoryFixture: I_appSettingsCategoryRenderItem = {
  title: 'Cat title',
  subCategories: {
    subOne: {
      title: 'Sub title',
      settingsList: {
        showDocumentID: {
          description: '',
          tags: '',
          title: 'Show document ID',
          control: 'toggle',
          value: false
        },
        appTheme: {
          description: 'Choose a visual theme for the app to use.',
          tags: 'theme',
          title: 'App theme',
          control: 'select',
          value: 'darkThemeFantasy',
          options: [
            {
              label: 'Flat theme, Light',
              value: 'lightThemeFlat'
            },
            {
              label: 'Dark, flat theme',
              value: 'darkThemeFlat'
            },
            {
              label: 'Light, fantasy theme',
              value: 'lightThemeFantasy'
            },
            {
              label: 'Fantasy theme, Dark',
              value: 'darkThemeFantasy'
            }
          ]
        }
      }
    }
  }
}
