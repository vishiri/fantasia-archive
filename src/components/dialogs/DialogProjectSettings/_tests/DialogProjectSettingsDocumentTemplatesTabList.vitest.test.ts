/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesTabList from '../DialogProjectSettingsDocumentTemplatesTabList.vue'
import { FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX } from '../scripts/functions/dialogProjectSettingsDialogInput'

/**
 * DialogProjectSettingsDocumentTemplatesTabList
 * Exposes add-template control and draggable list host.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabList renders add button', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabList, {
    props: {
      selectedTemplateId: null,
      templates: []
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesTabItem: defineComponent({
          template: '<div class="tab-item-stub" />'
        }),
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button v-bind="$attrs"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          template: '<div class="draggable-stub"><slot /></div>'
        })
      }
    }
  })

  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-addButton"]').exists()).toBe(true)
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplates-list"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsDocumentTemplatesTabList
 * Applies tabListWidthPx to the draggable column root for layout tests.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabList binds tabListWidthPx on the list root', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabList, {
    props: {
      selectedTemplateId: null,
      tabListWidthPx: FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX,
      templates: []
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesTabItem: defineComponent({
          template: '<div class="tab-item-stub" />'
        }),
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button v-bind="$attrs"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          template: '<div class="draggable-stub"><slot /></div>'
        })
      }
    }
  })

  const root = w.find('.dialogProjectSettingsDocumentTemplatesTabList')
  expect(root.attributes('data-test-layout-width')).toBe('360')
  expect(root.attributes('style')).toContain('--fa-vertical-draggable-tabs-column-width: 360px')
  expect(root.attributes('style')).toContain('--fa-vertical-draggable-tabs-tab-padding: 4px 40px 4px 60px')
})
