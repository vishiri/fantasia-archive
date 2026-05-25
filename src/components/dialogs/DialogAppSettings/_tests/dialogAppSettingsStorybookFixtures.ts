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
        darkMode: {
          description: '',
          tags: '',
          title: 'Dark mode',
          value: false
        }
      }
    }
  }
}
