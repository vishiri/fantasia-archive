/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesDetailPanel from '../DialogProjectSettingsDocumentTemplatesDetailPanel.vue'

/**
 * DialogProjectSettingsDocumentTemplatesDetailPanel
 * Renders name, world appendix, and icon inputs for the selected template.
 */
test('Test that DialogProjectSettingsDocumentTemplatesDetailPanel renders template fields', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesDetailPanel, {
    props: {
      nameHasError: false,
      removeDisabled: false,
      template: {
        displayName: 'Character',
        documentCount: 0,
        icon: 'mdi-account',
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        worldAppendix: 'Notes'
      }
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesDeleteButton: defineComponent({
          template: '<button data-test-locator="delete-stub" />'
        }),
        FaIconPickerInput: defineComponent({
          inheritAttrs: false,
          props: {
            modelValue: {
              type: String,
              default: ''
            },
            testLocator: {
              type: String,
              required: true
            }
          },
          emits: ['update:modelValue'],
          template: `
            <div :data-test-locator="testLocator">
              <button
                :data-test-locator="testLocator + '-trigger'"
                type="button"
                @click="$emit('update:modelValue', 'mdi-pencil')"
              />
            </div>
          `
        }),
        QInput: defineComponent({
          inheritAttrs: true,
          props: {
            modelValue: {
              type: String,
              default: ''
            }
          },
          emits: ['update:modelValue'],
          template: '<input v-bind="$attrs" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-nameInput"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixInput"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-worldAppendixTooltipIcon"]').attributes('data-test-tooltip-text')).toBe(
    'dialogs.projectSettings.fields.documentTemplateWorldAppendix.tooltip'
  )
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-iconInput"]').exists()).toBe(true)
})
