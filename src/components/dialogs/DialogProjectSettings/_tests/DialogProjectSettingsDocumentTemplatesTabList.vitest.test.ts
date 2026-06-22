/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import DialogProjectSettingsDocumentTemplatesTabList from '../DialogProjectSettingsDocumentTemplatesTabList.vue'
import { FA_DIALOG_PROJECT_SETTINGS_DOCUMENT_TEMPLATES_TAB_LIST_WIDTH_PX } from '../scripts/functions/dialogProjectSettingsDialogInput'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

/**
 * DialogProjectSettingsDocumentTemplatesTabList
 * Exposes add-template control and draggable list host.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabList renders add button', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabList, {
    props: {
      currentLanguageCode: 'en-US',
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
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplatesFilterInput"]').exists()).toBe(true)
})

/**
 * DialogProjectSettingsDocumentTemplatesTabList
 * Applies tabListWidthPx to the draggable column root for layout tests.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabList binds tabListWidthPx on the list root', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabList, {
    props: {
      currentLanguageCode: 'en-US',
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

const templatesFilterFixture = [
  buildDialogProjectSettingsDocumentTemplateDraft({
    icon: 'mdi-account',
    id: 'template-a',
    worldAppendixTranslations: { 'en-US': 'sheet' }
  }),
  buildDialogProjectSettingsDocumentTemplateDraft({
    icon: 'mdi-map',
    id: 'template-b',
    titleTranslations: { 'en-US': 'Locations' },
    worldAppendixTranslations: { 'en-US': 'atlas' }
  })
]

/**
 * DialogProjectSettingsDocumentTemplatesTabList
 * Filters visible template tabs by name and world appendix while filter text is entered.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabList filters template tabs by name and appendix', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabList, {
    props: {
      currentLanguageCode: 'en-US',
      selectedTemplateId: templatesFilterFixture[0].id,
      templates: templatesFilterFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesTabItem: defineComponent({
          props: {
            template: {
              required: true,
              type: Object
            }
          },
          template: '<div class="template-tab-stub" :data-test-template-name="template.titleTranslations[\'en-US\']" />'
        }),
        DialogProjectSettingsVerticalTabListFilterInput: defineComponent({
          props: {
            modelValue: {
              default: '',
              type: String
            }
          },
          emits: ['update:modelValue'],
          template: '<input class="templates-filter-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
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

  expect(w.findAll('.template-tab-stub')).toHaveLength(2)

  await w.find('.templates-filter-stub').setValue('atlas')
  expect(w.findAll('.template-tab-stub')).toHaveLength(1)
  expect(w.find('.template-tab-stub').attributes('data-test-template-name')).toBe('Locations')

  await w.find('.templates-filter-stub').setValue('missing')
  expect(w.find('[data-test-locator="dialogProjectSettings-documentTemplatesFilterEmpty"]').exists()).toBe(true)
})

const templatesFilteredReorderFixture = [
  buildDialogProjectSettingsDocumentTemplateDraft({
    icon: 'mdi-account',
    id: 'template-a',
    worldAppendixTranslations: { 'en-US': 'sheet' }
  }),
  buildDialogProjectSettingsDocumentTemplateDraft({
    icon: 'mdi-map',
    id: 'template-b',
    titleTranslations: { 'en-US': 'Locations' },
    worldAppendixTranslations: { 'en-US': 'atlas' }
  }),
  buildDialogProjectSettingsDocumentTemplateDraft({
    icon: 'mdi-note',
    id: 'template-c',
    titleTranslations: { 'en-US': 'Notes' },
    worldAppendixTranslations: { 'en-US': 'pad' }
  })
]

/**
 * DialogProjectSettingsDocumentTemplatesTabList
 * Merges filtered drag reorder back into the full template list.
 */
test('Test that DialogProjectSettingsDocumentTemplatesTabList merges filtered drag reorder into full list', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesTabList, {
    props: {
      currentLanguageCode: 'en-US',
      selectedTemplateId: templatesFilteredReorderFixture[0].id,
      templates: templatesFilteredReorderFixture
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesTabItem: true,
        DialogProjectSettingsVerticalTabListFilterInput: defineComponent({
          props: {
            modelValue: {
              default: '',
              type: String
            }
          },
          emits: ['update:modelValue'],
          template: '<input class="templates-filter-stub" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        }),
        QBtn: defineComponent({
          inheritAttrs: true,
          template: '<button v-bind="$attrs"><slot /></button>'
        }),
        VueDraggable: defineComponent({
          props: {
            modelValue: {
              required: true,
              type: Array
            }
          },
          emits: ['end', 'update:modelValue'],
          template: `
            <div>
              <slot />
              <button
                type="button"
                data-test-locator="emit-filtered-reorder"
                @click="
                  $emit('update:modelValue', [...modelValue].reverse());
                  $emit('end');
                "
              />
            </div>
          `
        })
      }
    }
  })

  await w.find('.templates-filter-stub').setValue('e')
  await w.find('[data-test-locator="emit-filtered-reorder"]').trigger('click')

  expect(w.emitted('update:templates')?.[0]?.[0]).toEqual([
    templatesFilteredReorderFixture[2],
    templatesFilteredReorderFixture[1],
    templatesFilteredReorderFixture[0]
  ])
})
