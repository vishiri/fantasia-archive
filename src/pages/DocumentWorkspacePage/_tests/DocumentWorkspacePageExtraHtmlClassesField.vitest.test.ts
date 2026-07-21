/** @vitest-environment jsdom */
import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import DocumentWorkspacePageExtraHtmlClassesField from '../DocumentWorkspacePageExtraHtmlClassesField.vue'

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
  extraClassesDraft: 'foo bar',
  savedExtraClasses: 'foo bar',
  hasUnsavedChanges: false,
  editState: true,
  tabLabel: 'Hero',
  templateIcon: 'mdi-account',
  worldId: 'world-1'
}

test('Test that DocumentWorkspacePageExtraHtmlClassesField renders input and updates model', async () => {
  const wrapper = mount(DocumentWorkspacePageExtraHtmlClassesField, {
    props: {
      documentTab,
      extraHtmlClassesFieldDescription: 'Extra HTML classes help',
      extraHtmlClassesFieldLabel: 'Extra HTML classes',
      extraHtmlClassesFieldReadOnly: false,
      extraHtmlClassesModel: 'foo bar'
    },
    global: {
      stubs: {
        QInput: {
          name: 'QInput',
          props: ['modelValue', 'disable', 'readonly'],
          emits: ['update:modelValue'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :value="modelValue" :data-readonly="readonly" :data-disabled="disable" @input="$emit(\'update:modelValue\', $event.target.value)" />'
        }
      }
    }
  })

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-extraHtmlClassesLabel"]').text()).toBe(
    'Extra HTML classes'
  )
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-extraHtmlClassesTitleIcon"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="documentWorkspacePage-extraHtmlClassesHelpIcon"]').attributes('data-test-tooltip-text')).toBe(
    'Extra HTML classes help'
  )

  const input = wrapper.findComponent({ name: 'QInput' })
  await input.vm.$emit('update:modelValue', 'next-class')
  expect(wrapper.emitted('update:extraHtmlClassesModel')).toEqual([['next-class']])
})

test('Test that DocumentWorkspacePageExtraHtmlClassesField marks input read-only', () => {
  const wrapper = mount(DocumentWorkspacePageExtraHtmlClassesField, {
    props: {
      documentTab,
      extraHtmlClassesFieldDescription: 'Extra HTML classes help',
      extraHtmlClassesFieldLabel: 'Extra HTML classes',
      extraHtmlClassesFieldReadOnly: true,
      extraHtmlClassesModel: 'foo bar'
    },
    global: {
      stubs: {
        QInput: {
          name: 'QInput',
          props: ['modelValue', 'disable', 'readonly'],
          template: '<input :data-test-locator="$attrs[\'data-test-locator\']" :data-readonly="readonly" :data-disabled="disable" />'
        }
      }
    }
  })

  const input = wrapper.find('[data-test-locator="documentWorkspacePage-extraHtmlClassesInput"]')
  expect(input.attributes('data-readonly')).toBe('true')
  expect(input.attributes('data-disabled')).toBe('true')
})

test('Test that DocumentWorkspacePageExtraHtmlClassesField hides when document tab is null', () => {
  const wrapper = mount(DocumentWorkspacePageExtraHtmlClassesField, {
    props: {
      documentTab: null,
      extraHtmlClassesFieldDescription: 'Extra HTML classes help',
      extraHtmlClassesFieldLabel: 'Extra HTML classes',
      extraHtmlClassesFieldReadOnly: true,
      extraHtmlClassesModel: ''
    }
  })

  expect(wrapper.find('[data-test-locator="documentWorkspacePage-extraHtmlClassesInput"]').exists()).toBe(false)
})
