/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import DocumentWorkspacePageTagsField from '../DocumentWorkspacePageTagsField.vue'

const documentTab: I_faOpenedDocumentTab = {
  documentId: 'doc-1',
  displayNameDraft: 'Hero',
  persistenceState: 'persisted',
  savedDisplayName: 'Hero',
  documentTextColorDraft: '',
  savedDocumentTextColor: '',
  documentBackgroundColorDraft: '',
  savedDocumentBackgroundColor: '',
  isCategoryDraft: false,
  savedIsCategory: false,
  isFinishedDraft: false,
  isMinorDraft: false,
  isDeadDraft: false,
  savedIsFinished: false,
  savedIsMinor: false,
  savedIsDead: false,
  parentDocumentIdDraft: '',
  savedParentDocumentId: '',
  treeOrderNumberDraft: '',
  savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
  extraClassesDraft: '',
  savedExtraClasses: '',
  tagsDraft: [{
    id: 'tag-1',
    name: 'Heroes'
  }],
  savedTags: [{
    id: 'tag-1',
    name: 'Heroes'
  }],
  hasUnsavedChanges: false,
  editState: true,
  tabLabel: 'Hero',
  templateIcon: 'mdi-account',
  worldId: 'world-1'
}

/**
 * DocumentWorkspacePageTagsField
 * Renders Tags FaSelectInput and emits model updates.
 */
test('Test that DocumentWorkspacePageTagsField renders select and updates model', async () => {
  const onTagsRequestOptions = vi.fn()
  const wrapper = mount(DocumentWorkspacePageTagsField, {
    props: {
      documentTab,
      onTagsRequestOptions,
      tagsFieldDescription: 'Tags help',
      tagsFieldLabel: 'Tags',
      tagsFieldReadOnly: false,
      tagsModel: [{
        id: 'tag-1',
        name: 'Heroes'
      }],
      tagsOptions: [{
        id: 'tag-1',
        name: 'Heroes'
      }],
      'onUpdate:tagsModel': vi.fn()
    },
    global: {
      stubs: {
        FaHelpTooltipIcon: {
          template: '<span data-test-locator="documentWorkspacePage-tagsHelpIcon" :data-test-tooltip-text="$attrs[\'data-test-tooltip-text\']" />'
        },
        FaSelectInput: {
          name: 'FaSelectInput',
          emits: ['update:modelValue', 'request-options'],
          props: ['modelValue', 'disable', 'options'],
          template: '<div data-test-locator="documentWorkspacePage-tagsInput"><button data-test-locator="tags-request" type="button" @click="$emit(\'request-options\')" /><button data-test-locator="tags-update" type="button" @click="$emit(\'update:modelValue\', [{ id: \'tag-2\', name: \'Places\' }])" /></div>'
        },
        QIcon: true,
        QTooltip: true
      }
    }
  })

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-tagsLabel"]').text()).toBe('Tags')
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-tagsTitleIcon"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-tagsHelpIcon"]').attributes('data-test-tooltip-text')).toBe('Tags help')
  await wrapper.find('[data-test-locator="tags-request"]').trigger('click')
  expect(onTagsRequestOptions).toHaveBeenCalled()
  await wrapper.find('[data-test-locator="tags-update"]').trigger('click')
  expect(wrapper.emitted('update:tagsModel')).toEqual([[[{
    id: 'tag-2',
    name: 'Places'
  }]]])
})

/**
 * DocumentWorkspacePageTagsField
 * Marks select read-only and hides when tab is null.
 */
test('Test that DocumentWorkspacePageTagsField hides when document tab is null', () => {
  const wrapper = mount(DocumentWorkspacePageTagsField, {
    props: {
      documentTab: null,
      onTagsRequestOptions: vi.fn(),
      tagsFieldDescription: 'Tags help',
      tagsFieldLabel: 'Tags',
      tagsFieldReadOnly: true,
      tagsModel: [],
      tagsOptions: []
    },
    global: {
      stubs: {
        FaHelpTooltipIcon: true,
        FaSelectInput: true,
        QIcon: true,
        QTooltip: true
      }
    }
  })
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-tagsInput"]').exists()).toBe(false)
})
