/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogImportExportAppConfigExportStep from '../DialogImportExportAppConfigExportStep.vue'

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

const exportStepMount = {
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
 * DialogImportExportAppConfigExportStep
 * Create export button emits clickCreateExport when enabled.
 */
test('Test that DialogImportExportAppConfigExportStep emits clickCreateExport', async () => {
  const w = mount(DialogImportExportAppConfigExportStep, {
    ...exportStepMount,
    props: {
      createExportDisabled: false,
      exportIncludeAppSettings: true,
      exportIncludeKeybinds: true,
      exportIncludeAppStyling: true,
      exportIncludeAppNoteboard: true
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogImportExportAppConfig-button-createExport"]').trigger('click')

  expect(w.emitted('clickCreateExport')).toHaveLength(1)
  w.unmount()
})

/**
 * DialogImportExportAppConfigExportStep
 * Export hint heading renders with the stable test locator.
 */
test('Test that DialogImportExportAppConfigExportStep renders export hint heading', async () => {
  const w = mount(DialogImportExportAppConfigExportStep, {
    ...exportStepMount,
    props: {
      createExportDisabled: true,
      exportIncludeAppSettings: false,
      exportIncludeKeybinds: false,
      exportIncludeAppStyling: false,
      exportIncludeAppNoteboard: false
    }
  })

  await flushPromises()

  expect(w.find('[data-test-locator="dialogImportExportAppConfig-export-hint"]').exists()).toBe(true)
  w.unmount()
})
