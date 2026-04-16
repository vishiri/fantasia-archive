/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogProgramSettingsSettingBlock from '../DialogProgramSettingsSettingBlock.vue'

const QToggleStub = defineComponent({
  name: 'QToggle',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue'],
  template: '<button type="button" class="q-toggle-stub" @click="$emit(\'update:modelValue\', !modelValue)" />'
})

const QTooltipStub = defineComponent({
  name: 'QTooltip',
  setup (_props, { slots }) {
    return () => slots.default?.() ?? null
  }
})

const programSettingsSettingBlockMount = {
  global: {
    components: {
      QIcon: { template: '<i class="q-icon-stub"><slot /></i>' },
      QToggle: QToggleStub,
      QTooltip: QTooltipStub
    },
    config: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => {
          const lower = tag.toLowerCase()
          if (lower === 'q-toggle' || lower === 'q-icon' || lower === 'q-tooltip') {
            return false
          }

          return /^q-/i.test(tag)
        }
      }
    },
    mocks: { $t: (k: string) => k }
  }
} as const

/**
 * DialogProgramSettingsSettingBlock
 * Toggle changes should emit update-setting with the setting key and new value.
 */
test('Test that DialogProgramSettingsSettingBlock emits update-setting when toggled', async () => {
  const w = mount(DialogProgramSettingsSettingBlock, {
    ...programSettingsSettingBlockMount,
    props: {
      displayMode: 'tab',
      setting: {
        description: 'desc',
        tags: 'tags',
        title: 'Setting title',
        value: false
      },
      settingKey: 'darkMode'
    }
  })

  await flushPromises()
  await w.get('.q-toggle-stub').trigger('click')

  expect(w.emitted('update-setting')?.[0]).toEqual(['darkMode', true])
  w.unmount()
})

/**
 * DialogProgramSettingsSettingBlock
 * Search display mode should use the search-specific setting locator prefix.
 */
test('Test that DialogProgramSettingsSettingBlock uses search locator prefix in search mode', async () => {
  const w = mount(DialogProgramSettingsSettingBlock, {
    ...programSettingsSettingBlockMount,
    props: {
      displayMode: 'search',
      setting: {
        description: 'd',
        tags: 't',
        title: 'Title',
        value: false
      },
      settingKey: 'showDocumentID'
    }
  })

  await flushPromises()

  expect(
    w.find('[data-test-locator="dialogProgramSettings-search-setting-showDocumentID"]').exists()
  ).toBe(true)
  w.unmount()
})

/**
 * DialogProgramSettingsSettingBlock
 * Non-empty notes should render the red note line under the toggle.
 */
test('Test that DialogProgramSettingsSettingBlock shows note text when provided', async () => {
  const w = mount(DialogProgramSettingsSettingBlock, {
    ...programSettingsSettingBlockMount,
    props: {
      displayMode: 'tab',
      setting: {
        description: '',
        note: 'Fixture note body',
        tags: '',
        title: 'T',
        value: false
      },
      settingKey: 'k'
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogProgramSettings-settingNote"]').text()).toContain('Fixture note body')
  w.unmount()
})

/**
 * DialogProgramSettingsSettingBlock
 * Tooltip slot should surface the setting description text for help icons.
 */
test('Test that DialogProgramSettingsSettingBlock renders description inside tooltip slot', async () => {
  const w = mount(DialogProgramSettingsSettingBlock, {
    ...programSettingsSettingBlockMount,
    props: {
      displayMode: 'tab',
      setting: {
        description: 'Tooltip description copy',
        tags: '',
        title: 'T',
        value: false
      },
      settingKey: 'k'
    }
  })

  await flushPromises()

  expect(w.find('[data-test-tooltip-text="Tooltip description copy"]').exists()).toBe(true)
  w.unmount()
})
