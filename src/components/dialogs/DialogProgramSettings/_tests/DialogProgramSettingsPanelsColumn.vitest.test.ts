import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import type { T_programSettingsRenderTree } from 'app/types/I_dialogProgramSettings'

import DialogProgramSettingsPanelsColumn from '../DialogProgramSettingsPanelsColumn.vue'

const minimalTree: T_programSettingsRenderTree = {
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
 * DialogProgramSettingsPanelsColumn
 * Mounts with a minimal tree and shows the tab-panels host used for settings content.
 */
test('Test that DialogProgramSettingsPanelsColumn renders the tab-panels scroller', () => {
  const w = mount(DialogProgramSettingsPanelsColumn, {
    props: {
      hasActiveSearchQuery: false,
      hasSearchNoMatchingSettings: false,
      programSettingsTree: minimalTree,
      searchFilteredProgramSettingsTree: minimalTree,
      selectedCategoryTab: 'demoCategory'
    },
    global: {
      mocks: { $t: (k: string) => k },
      stubs: {
        DialogProgramSettingsCategoryPanel: { template: '<div class="category-panel-stub" />' },
        ErrorCard: { template: '<div />' },
        QSeparator: { template: '<hr />' },
        QTabPanel: { template: '<div><slot /></div>' },
        QTabPanels: { template: '<div class="q-tab-panels-stub"><slot /></div>' }
      }
    }
  })

  expect(w.find('.dialogProgramSettings__tabPanelsRoot').exists()).toBe(true)
  expect(w.find('.category-panel-stub').exists()).toBe(true)
  w.unmount()
})
