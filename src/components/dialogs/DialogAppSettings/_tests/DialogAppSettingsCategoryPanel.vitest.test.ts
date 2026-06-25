import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogAppSettingsCategoryPanel from '../DialogAppSettingsCategoryPanel.vue'

const categoryFixture = {
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

const settingBlockEmitter = defineComponent({
  name: 'DialogAppSettingsSettingBlock',
  emits: ['update-setting'],
  template: '<button type="button" @click="$emit(\'update-setting\', \'darkMode\', true)">emit-setting</button>'
})

const appSettingsCategoryPanelMount = {
  global: {
    mocks: { $t: (k: string) => k },
    stubs: {
      DialogAppSettingsSettingBlock: settingBlockEmitter,
      QSeparator: { template: '<hr class="q-separator-stub" />' }
    }
  }
} as const

/**
 * DialogAppSettingsCategoryPanel
 * Setting blocks should bubble update-setting through the category panel.
 */
test('Test that DialogAppSettingsCategoryPanel forwards update-setting from child blocks', async () => {
  const w = mount(DialogAppSettingsCategoryPanel, {
    ...appSettingsCategoryPanelMount,
    props: {
      category: categoryFixture,
      categoryKey: 'fixtureCategory',
      displayMode: 'search'
    }
  })

  await flushPromises()
  await w.get('button').trigger('click')

  expect(w.emitted('update-setting')?.[0]!).toEqual(['darkMode', true])
  w.unmount()
})

/**
 * DialogAppSettingsCategoryPanel
 * Tab display mode should use the tab title locator attribute.
 */
test('Test that DialogAppSettingsCategoryPanel uses tab title locator in tab mode', async () => {
  const w = mount(DialogAppSettingsCategoryPanel, {
    ...appSettingsCategoryPanelMount,
    props: {
      category: categoryFixture,
      categoryKey: 'fixtureCategory',
      displayMode: 'tab'
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogAppSettings-categoryTitle"]').exists()).toBe(true)
  w.unmount()
})
