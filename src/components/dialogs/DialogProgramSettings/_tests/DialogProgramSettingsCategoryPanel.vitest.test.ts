import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogProgramSettingsCategoryPanel from '../DialogProgramSettingsCategoryPanel.vue'

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
  name: 'DialogProgramSettingsSettingBlock',
  emits: ['update-setting'],
  template: '<button type="button" @click="$emit(\'update-setting\', \'darkMode\', true)">emit-setting</button>'
})

const programSettingsCategoryPanelMount = {
  global: {
    mocks: { $t: (k: string) => k },
    stubs: {
      DialogProgramSettingsSettingBlock: settingBlockEmitter,
      QSeparator: { template: '<hr class="q-separator-stub" />' }
    }
  }
} as const

/**
 * DialogProgramSettingsCategoryPanel
 * Setting blocks should bubble update-setting through the category panel.
 */
test('Test that DialogProgramSettingsCategoryPanel forwards update-setting from child blocks', async () => {
  const w = mount(DialogProgramSettingsCategoryPanel, {
    ...programSettingsCategoryPanelMount,
    props: {
      category: categoryFixture,
      categoryKey: 'fixtureCategory',
      displayMode: 'search'
    }
  })

  await flushPromises()
  await w.get('button').trigger('click')

  expect(w.emitted('update-setting')?.[0]).toEqual(['darkMode', true])
  w.unmount()
})

/**
 * DialogProgramSettingsCategoryPanel
 * Tab display mode should use the tab title locator attribute.
 */
test('Test that DialogProgramSettingsCategoryPanel uses tab title locator in tab mode', async () => {
  const w = mount(DialogProgramSettingsCategoryPanel, {
    ...programSettingsCategoryPanelMount,
    props: {
      category: categoryFixture,
      categoryKey: 'fixtureCategory',
      displayMode: 'tab'
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogProgramSettings-categoryTitle"]').exists()).toBe(true)
  w.unmount()
})
