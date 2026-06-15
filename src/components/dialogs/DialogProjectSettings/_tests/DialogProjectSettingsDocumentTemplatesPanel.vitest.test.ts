/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesPanel from '../DialogProjectSettingsDocumentTemplatesPanel.vue'

const templateA = {
  displayName: 'Character',
  documentCount: 0,
  icon: '',
  id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  worldAppendix: ''
}

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Renders the centered empty state when no templates exist.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel renders empty state when templates list is empty', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      templates: []
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesEmptyState: defineComponent({
          emits: ['addTemplate'],
          template: '<div class="empty-state-stub" data-test-locator="empty-state-stub" />'
        }),
        DialogProjectSettingsDocumentTemplatesDetailPanel: true,
        DialogProjectSettingsDocumentTemplatesTabList: true,
        QSeparator: true
      }
    }
  })

  expect(w.find('.empty-state-stub').exists()).toBe(true)
  expect(w.find('.tab-list-stub').exists()).toBe(false)
})

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Renders the template tab list and detail panel for the selected row.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel renders list and detail for selection', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      templates: [templateA]
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesEmptyState: true,
        DialogProjectSettingsDocumentTemplatesDetailPanel: defineComponent({
          props: {
            nameHasError: Boolean,
            removeDisabled: Boolean,
            template: {
              type: Object,
              required: true
            }
          },
          template: '<div class="detail-stub" :data-test-template-id="template.id" />'
        }),
        DialogProjectSettingsDocumentTemplatesTabList: defineComponent({
          props: {
            selectedTemplateId: {
              type: String,
              default: null
            },
            templates: {
              type: Array,
              required: true
            }
          },
          emits: ['addTemplate', 'select', 'update:templates'],
          template: `
            <div class="tab-list-stub">
              <button type="button" data-test-locator="select-template" @click="$emit('select', templates[0].id)" />
            </div>
          `
        }),
        QSeparator: { template: '<hr />' }
      }
    }
  })

  expect(w.find('.tab-list-stub').exists()).toBe(true)
  await w.find('[data-test-locator="select-template"]').trigger('click')
  expect(w.find('.detail-stub').attributes('data-test-template-id')).toBe(templateA.id)
})
