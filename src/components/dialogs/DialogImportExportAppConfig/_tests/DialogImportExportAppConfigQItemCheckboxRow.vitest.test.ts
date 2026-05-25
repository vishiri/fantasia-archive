/** @vitest-environment jsdom */
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { expect, test } from 'vitest'

import DialogImportExportAppConfigQItemCheckboxRow from '../DialogImportExportAppConfigQItemCheckboxRow.vue'

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

const checkboxRowMount = {
  global: {
    mocks: { $t: (key: string) => key },
    stubs: {
      QCheckbox: importExportQCheckboxStub,
      QItem: { template: '<div class="q-item-stub"><slot /></div>' },
      QItemLabel: { template: '<div class="q-item-label-stub"><slot /></div>' },
      QItemSection: { template: '<div class="q-item-section-stub"><slot /></div>' }
    }
  }
} as const

/**
 * DialogImportExportAppConfigQItemCheckboxRow
 * Checkbox clicks should update the bound v-model.
 */
test('Test that DialogImportExportAppConfigQItemCheckboxRow toggles model on checkbox click', async () => {
  const w = mount(DialogImportExportAppConfigQItemCheckboxRow, {
    ...checkboxRowMount,
    props: {
      modelValue: false,
      checkboxColor: 'dark',
      dataTestLocator: 'dialogImportExportAppConfig-check-export-settings',
      labelI18nKey: 'dialogs.importExportAppConfig.checkboxes.appSettings',
      'onUpdate:modelValue': (value: boolean) => {
        w.setProps({ modelValue: value })
      }
    }
  })

  await flushPromises()
  await w.get('[data-test-locator="dialogImportExportAppConfig-check-export-settings"]').trigger('click')

  expect(w.props('modelValue')).toBe(true)
  w.unmount()
})

/**
 * DialogImportExportAppConfigQItemCheckboxRow
 * Disabled rows expose aria-disabled and skip pointer interaction styling class.
 */
test('Test that DialogImportExportAppConfigQItemCheckboxRow marks disabled rows', async () => {
  const w = mount(DialogImportExportAppConfigQItemCheckboxRow, {
    ...checkboxRowMount,
    props: {
      modelValue: false,
      checkboxColor: 'dark',
      dataTestLocator: 'dialogImportExportAppConfig-check-import-settings',
      disabled: true,
      labelI18nKey: 'dialogs.importExportAppConfig.checkboxes.appSettings'
    }
  })

  await flushPromises()

  expect(w.find('.importExportAppConfigQItemCheckboxRow--isDisabled').exists()).toBe(true)
  expect(w.attributes('aria-disabled')).toBe('true')
  w.unmount()
})
