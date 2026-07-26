/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogAppSettingsSettingBlock from '../DialogAppSettingsSettingBlock.vue'

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

const QSelectStub = defineComponent({
  name: 'QSelect',
  inheritAttrs: true,
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  template: '<button type="button" class="q-select-stub" @click="$emit(\'update:modelValue\', \'lightThemeFlat\')" />'
})

const QTooltipStub = defineComponent({
  name: 'QTooltip',
  setup (_props, { slots }) {
    return () => slots.default?.() ?? null
  }
})

const appSettingsSettingBlockMount = {
  global: {
    components: {
      QIcon: { template: '<i class="q-icon-stub" :data-name="$attrs.name || name" />' },
      QSelect: QSelectStub,
      QToggle: QToggleStub,
      QTooltip: QTooltipStub
    },
    config: {
      compilerOptions: {
        isCustomElement: (tag: string): boolean => {
          const lower = tag.toLowerCase()
          if (
            lower === 'q-toggle' ||
            lower === 'q-select' ||
            lower === 'q-icon' ||
            lower === 'q-tooltip'
          ) {
            return false
          }

          return /^q-/i.test(tag)
        }
      }
    },
    mocks: { $t: (k: string) => k },
    stubs: {
      FaHelpTooltipIcon: false
    }
  }
} as const

/**
 * DialogAppSettingsSettingBlock
 * Toggle changes should emit update-setting with the setting key and new value.
 */
test('Test that DialogAppSettingsSettingBlock emits update-setting when toggled', async () => {
  const w = mount(DialogAppSettingsSettingBlock, {
    ...appSettingsSettingBlockMount,
    props: {
      displayMode: 'tab',
      setting: {
        control: 'toggle',
        description: 'desc',
        tags: 'tags',
        title: 'Setting title',
        value: false
      },
      settingKey: 'showDocumentID'
    }
  })

  await flushPromises()
  await w.get('.q-toggle-stub').trigger('click')

  expect(w.emitted('update-setting')?.[0]!).toEqual(['showDocumentID', true])
  w.unmount()
})

/**
 * DialogAppSettingsSettingBlock
 * Select changes should emit update-setting with the setting key and selected value.
 */
test('Test that DialogAppSettingsSettingBlock emits update-setting when select changes', async () => {
  const w = mount(DialogAppSettingsSettingBlock, {
    ...appSettingsSettingBlockMount,
    props: {
      displayMode: 'tab',
      setting: {
        control: 'select',
        description: 'desc',
        options: [
          {
            label: 'Flat theme, Light',
            value: 'lightThemeFlat'
          },
          {
            label: 'Fantasy theme, Dark',
            value: 'darkThemeFantasy'
          }
        ],
        tags: 'theme',
        title: 'App theme',
        value: 'darkThemeFantasy'
      },
      settingKey: 'appTheme'
    }
  })

  await flushPromises()
  await w.get('.q-select-stub').trigger('click')

  expect(w.emitted('update-setting')?.[0]!).toEqual(['appTheme', 'lightThemeFlat'])
  expect(w.find('[data-test-locator="dialogAppSettings-settingSelect"]').exists()).toBe(true)
  w.unmount()
})

/**
 * DialogAppSettingsSettingBlock
 * Non-string select model values must not emit update-setting.
 */
test('Test that DialogAppSettingsSettingBlock ignores non-string select values', async () => {
  const QSelectNullStub = defineComponent({
    name: 'QSelect',
    inheritAttrs: true,
    emits: ['update:modelValue'],
    template: '<button type="button" class="q-select-null-stub" @click="$emit(\'update:modelValue\', null)" />'
  })

  const w = mount(DialogAppSettingsSettingBlock, {
    ...appSettingsSettingBlockMount,
    global: {
      ...appSettingsSettingBlockMount.global,
      components: {
        ...appSettingsSettingBlockMount.global.components,
        QSelect: QSelectNullStub
      }
    },
    props: {
      displayMode: 'tab',
      setting: {
        control: 'select',
        description: 'desc',
        options: [
          {
            label: 'Flat theme, Light',
            value: 'lightThemeFlat'
          }
        ],
        tags: 'theme',
        title: 'App theme',
        value: 'darkThemeFantasy'
      },
      settingKey: 'appTheme'
    }
  })

  await flushPromises()
  await w.get('.q-select-null-stub').trigger('click')

  expect(w.emitted('update-setting')).toBeUndefined()
  w.unmount()
})

/**
 * DialogAppSettingsSettingBlock
 * Search display mode should use the search-specific setting locator prefix.
 */
test('Test that DialogAppSettingsSettingBlock uses search locator prefix in search mode', async () => {
  const w = mount(DialogAppSettingsSettingBlock, {
    ...appSettingsSettingBlockMount,
    props: {
      displayMode: 'search',
      setting: {
        control: 'toggle',
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
    w.find('[data-test-locator="dialogAppSettings-search-setting-showDocumentID"]').exists()
  ).toBe(true)
  w.unmount()
})

/**
 * DialogAppSettingsSettingBlock
 * Non-empty notes should render the red note line under the toggle.
 */
test('Test that DialogAppSettingsSettingBlock shows note text when provided', async () => {
  const w = mount(DialogAppSettingsSettingBlock, {
    ...appSettingsSettingBlockMount,
    props: {
      displayMode: 'tab',
      setting: {
        control: 'toggle',
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

  expect(w.find('[data-test-locator="dialogAppSettings-settingNote"]').text()).toContain('Fixture note body')
  w.unmount()
})

/**
 * DialogAppSettingsSettingBlock
 * Tooltip slot should surface the setting description text for help icons.
 */
test('Test that DialogAppSettingsSettingBlock renders description inside tooltip slot', async () => {
  const w = mount(DialogAppSettingsSettingBlock, {
    ...appSettingsSettingBlockMount,
    props: {
      displayMode: 'tab',
      setting: {
        control: 'toggle',
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
