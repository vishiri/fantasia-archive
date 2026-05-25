/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogImportExportAppConfigImportStep from '../DialogImportExportAppConfigImportStep.vue'

const importExportQCheckboxStub = defineComponent({
  name: 'QCheckbox',
  inheritAttrs: true,
  props: {
    modelValue: {
      default: false,
      type: Boolean
    }
  },
  emits: ['update:modelValue'],
  template:
    '<button type="button" class="q-checkbox-stub" v-bind="$attrs" @click="$emit(\'update:modelValue\', !modelValue)" />'
})

const importStepMount = {
  global: {
    mocks: { $t: (key: string) => key },
    stubs: {
      QBtn: { template: '<button type="button" v-bind="$attrs"><slot /></button>' },
      QCheckbox: importExportQCheckboxStub,
      QItem: { template: '<div class="q-item-stub"><slot /></div>' },
      QItemLabel: { template: '<div class="q-item-label-stub"><slot /></div>' },
      QItemSection: { template: '<div class="q-item-section-stub"><slot /></div>' },
      QList: { template: '<div class="q-list-stub"><slot /></div>' }
    }
  }
} as const

/**
 * DialogImportExportAppConfigImportStep
 * Import selected button emits clickImportSelected when enabled.
 */
test('Test that DialogImportExportAppConfigImportStep emits clickImportSelected', async () => {
  const w = mount(DialogImportExportAppConfigImportStep, {
    ...importStepMount,
    props: {
      importApplyDisabled: false,
      importApplyAppSettings: true,
      importApplyKeybinds: true,
      importApplyAppStyling: true,
      importApplyAppNoteboard: true,
      keybindsImportEnabled: true,
      appNoteboardImportEnabled: true,
      appSettingsImportEnabled: true,
      appStylingImportEnabled: true
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogImportExportAppConfig-button-importSelected"]').trigger('click')

  expect(w.emitted('clickImportSelected')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogImportExportAppConfigImportStep
 * Import checkbox rows render for each selectable section.
 */
test('Test that DialogImportExportAppConfigImportStep renders import checkbox rows', async () => {
  const w = mount(DialogImportExportAppConfigImportStep, {
    ...importStepMount,
    props: {
      importApplyDisabled: true,
      importApplyAppSettings: false,
      importApplyKeybinds: false,
      importApplyAppStyling: false,
      importApplyAppNoteboard: false,
      keybindsImportEnabled: false,
      appNoteboardImportEnabled: false,
      appSettingsImportEnabled: false,
      appStylingImportEnabled: false
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogImportExportAppConfig-check-import-settings"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogImportExportAppConfig-check-import-keybinds"]').exists()).toBe(true)
  w.unmount()
})
