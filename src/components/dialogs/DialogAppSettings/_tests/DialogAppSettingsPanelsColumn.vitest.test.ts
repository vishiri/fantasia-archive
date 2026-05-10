import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'

import DialogAppSettingsPanelsColumn from '../DialogAppSettingsPanelsColumn.vue'

const minimalTree: T_appSettingsRenderTree = {
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

/**
 * DialogAppSettingsPanelsColumn
 * Mounts with a minimal tree and shows the tab-panels host used for settings content.
 */
test('Test that DialogAppSettingsPanelsColumn renders the tab-panels scroller', () => {
  const w = mount(DialogAppSettingsPanelsColumn, {
    props: {
      hasActiveSearchQuery: false,
      hasSearchNoMatchingSettings: false,
      appSettingsTree: minimalTree,
      searchFilteredAppSettingsTree: minimalTree,
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogAppSettingsCategoryPanel: { template: '<div class="category-panel-stub" />' },
        ErrorCard: { template: '<div />' },
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div class="q-tab-panels-stub"><slot /></div>' }
      }
    }
  })

  expect(w.find('.dialogAppSettings__tabPanelsRoot').exists()).toBe(true)
  expect(w.find('.category-panel-stub').exists()).toBe(true)
  w.unmount()
})
