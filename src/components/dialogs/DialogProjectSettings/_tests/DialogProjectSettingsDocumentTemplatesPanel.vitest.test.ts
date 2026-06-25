/* eslint-disable vue/one-component-per-file -- colocated Quasar stub components for Vue Test Utils mounts */

import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import DialogProjectSettingsDocumentTemplatesPanel from '../DialogProjectSettingsDocumentTemplatesPanel.vue'
import * as dialogProjectSettingsDocumentTemplatesSelection from '../scripts/functions/dialogProjectSettingsDocumentTemplatesSelection'
import { buildDialogProjectSettingsDocumentTemplateDraft } from './dialogProjectSettingsDocumentTemplateDraftFixtures'

const templateA = buildDialogProjectSettingsDocumentTemplateDraft()

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Renders the centered empty state when no templates exist.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel renders empty state when templates list is empty', () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
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
 * Forwards add-template when the empty state requests a new template.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel emits addTemplate from empty state', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
      templates: []
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesEmptyState: defineComponent({
          emits: ['addTemplate'],
          template: '<button type="button" data-test-locator="empty-add" @click="$emit(\'addTemplate\')" />'
        }),
        DialogProjectSettingsDocumentTemplatesDetailPanel: true,
        DialogProjectSettingsDocumentTemplatesTabList: true,
        QSeparator: true
      }
    }
  })

  await w.find('[data-test-locator="empty-add"]').trigger('click')
  expect(w.emitted('addTemplate')).toHaveLength(1)
})

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Passes name validation state to the detail panel for the selected template.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel binds nameHasError on detail panel', async () => {
  const invalidTemplate = buildDialogProjectSettingsDocumentTemplateDraft({
    titlePluralTranslations: {},
    titleSingularTranslations: {}
  })

  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
      templates: [invalidTemplate]
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
          template: '<div class="detail-stub" :data-test-name-has-error="String(nameHasError)" />'
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
          emits: ['select'],
          mounted (): void {
            this.$emit('select', invalidTemplate.id)
          },
          template: '<div class="tab-list-stub" />'
        }),
        QSeparator: true
      }
    }
  })

  expect(w.find('.detail-stub').attributes('data-test-name-has-error')).toBe('true')
})

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Renders the template tab list and detail panel for the selected row.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel renders list and detail for selection', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
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
  expect(w.emitted('addTemplate')).toBeUndefined()
  expect(w.find('.detail-stub').attributes('data-test-template-id')).toBe(templateA.id)
})

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Forwards template order updates from the tab list.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel forwards update templates from tab list', async () => {
  const reordered = [
    buildDialogProjectSettingsDocumentTemplateDraft({
      id: 'template-b',
      titlePluralTranslations: { 'en-US': 'Locations' }
    }),
    templateA
  ]

  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
      templates: [templateA, reordered[0]]
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesEmptyState: true,
        DialogProjectSettingsDocumentTemplatesDetailPanel: true,
        DialogProjectSettingsDocumentTemplatesTabList: defineComponent({
          emits: ['update:templates'],
          setup () {
            return { reordered }
          },
          template: '<button type="button" data-test-locator="emit-update-templates" @click="$emit(\'update:templates\', reordered)" />'
        }),
        QSeparator: true
      }
    }
  })

  await w.find('[data-test-locator="emit-update-templates"]').trigger('click')
  expect(w.emitted('update:templates')?.[0]).toEqual([reordered])
})

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Forwards detail panel field updates and add-template from the tab list.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel forwards detail and list events', async () => {
  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
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
            template: {
              type: Object,
              required: true
            }
          },
          emits: [
            'remove',
            'update:icon',
            'update:title-translations',
            'update:worldAppendixTranslations'
          ],
          template: `
            <div class="detail-stub">
              <button type="button" data-test-locator="emit-remove" @click="$emit('remove')" />
              <button type="button" data-test-locator="emit-icon" @click="$emit('update:icon', 'mdi-pencil')" />
              <button type="button" data-test-locator="emit-title" @click="$emit('update:title-translations', { plural: { 'en-US': 'Hero' }, singular: {} })" />
              <button type="button" data-test-locator="emit-appendix" @click="$emit('update:worldAppendixTranslations', { 'en-US': 'Notes' })" />
            </div>
          `
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
            <div>
              <button type="button" data-test-locator="emit-add-template" @click="$emit('addTemplate')" />
              <button type="button" data-test-locator="emit-select-template" @click="$emit('select', templates[0].id)" />
            </div>
          `
        }),
        QSeparator: { template: '<hr />' }
      }
    }
  })

  await w.find('[data-test-locator="emit-select-template"]').trigger('click')
  await w.find('[data-test-locator="emit-add-template"]').trigger('click')
  expect(w.emitted('addTemplate')).toBeTruthy()

  await w.find('[data-test-locator="emit-remove"]').trigger('click')
  expect(w.emitted('removeTemplate')?.[0]).toEqual([templateA.id])

  await w.find('[data-test-locator="emit-icon"]').trigger('click')
  expect(w.emitted('updateTemplateIcon')?.[0]).toEqual([templateA.id, 'mdi-pencil'])

  await w.find('[data-test-locator="emit-title"]').trigger('click')
  expect(w.emitted('updateTemplateTitleTranslations')?.[0]).toEqual([
    templateA.id,
    {
      plural: { 'en-US': 'Hero' },
      singular: {}
    }
  ])

  await w.find('[data-test-locator="emit-appendix"]').trigger('click')
  expect(w.emitted('updateTemplateWorldAppendixTranslations')?.[0]).toEqual([
    templateA.id,
    { 'en-US': 'Notes' }
  ])
})

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Resolves selected template when the templates prop changes.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel resyncs selection when templates change', async () => {
  const templateB = buildDialogProjectSettingsDocumentTemplateDraft({
    id: 'template-b',
    titlePluralTranslations: { 'en-US': 'Location' },
    titleSingularTranslations: {}
  })

  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
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
          emits: ['select'],
          template: '<button type="button" data-test-locator="select-template" @click="$emit(\'select\', templates[0].id)" />'
        }),
        QSeparator: true
      }
    }
  })

  await w.find('[data-test-locator="select-template"]').trigger('click')
  await w.setProps({ templates: [templateB] })
  expect(w.find('.detail-stub').attributes('data-test-template-id')).toBe(templateB.id)
})

/**
 * DialogProjectSettingsDocumentTemplatesPanel
 * Omits the detail panel when no template id is selected.
 */
test('Test that DialogProjectSettingsDocumentTemplatesPanel hides detail when selection is unresolved', () => {
  const selectionSpy = vi
    .spyOn(
      dialogProjectSettingsDocumentTemplatesSelection,
      'resolveDialogProjectSettingsDocumentTemplatesPanelSelection'
    )
    .mockReturnValue(null)

  const w = mount(DialogProjectSettingsDocumentTemplatesPanel, {
    props: {
      currentLanguageCode: 'en-US',
      templates: [templateA]
    },
    global: {
      mocks: {
        $t: (key: string) => key
      },
      stubs: {
        DialogProjectSettingsDocumentTemplatesEmptyState: true,
        DialogProjectSettingsDocumentTemplatesDetailPanel: defineComponent({
          template: '<div class="detail-stub" data-test-locator="detail-stub" />'
        }),
        DialogProjectSettingsDocumentTemplatesTabList: true,
        QSeparator: true
      }
    }
  })

  expect(w.find('[data-test-locator="detail-stub"]').exists()).toBe(false)
  selectionSpy.mockRestore()
})
