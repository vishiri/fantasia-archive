/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesEmptyState from '../DialogProjectSettingsDocumentTemplatesEmptyState.vue'

/**
 * DialogProjectSettingsDocumentTemplatesEmptyState
 * Renders the centered add-first-template call to action.
 */
test('Test that DialogProjectSettingsDocumentTemplatesEmptyState renders add-first button', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesEmptyState, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button v-bind="$attrs"><slot /></button>'
        })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-emptyState"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-addFirstButton"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsDocumentTemplatesEmptyState
 * Emits addTemplate when the centered button is clicked.
 */
test('Test that DialogProjectSettingsDocumentTemplatesEmptyState emits addTemplate on click', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesEmptyState, {
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button v-bind="$attrs"><slot /></button>'
        })
      }
    }
  })

  await w.find('[data-test-locator="dialogProjectSettings-documentTemplates-addFirstButton"]').trigger('click')
  expect(w.emitted('addTemplate')).toHaveLength(1)
})
