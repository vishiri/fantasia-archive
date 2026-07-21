import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

import DialogDiscardOpenedDocumentTab from '../DialogDiscardOpenedDocumentTab.vue'

const discardQDialogStub = defineComponent({
  name: 'QDialog',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'hide'],
  template: `
    <div class="discard-qdialog-stub" v-bind="$attrs">
      <div v-if="modelValue" class="discard-qdialog-inner">
        <slot />
      </div>
    </div>
  `
})

const discardDialogGlobal = {
  mocks: {
    $t: (key: string) => {
      if (key === 'dialogs.discardOpenedDocumentTab.titlePrefix') {
        return 'Discard changes to '
      }
      if (key === 'dialogs.discardOpenedDocumentTab.titleSuffix') {
        return '?'
      }
      return key
    }
  },
  stubs: {
    QBtn: {
      emits: ['click'],
      template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>'
    },
    QCard: { template: '<div><slot /></div>' },
    QCardActions: { template: '<div><slot /></div>' },
    QCardSection: { template: '<div><slot /></div>' },
    QDialog: discardQDialogStub
  }
} as const

function mountDiscardDialogWithPendingTab () {
  const pinia = createPinia()
  setActivePinia(pinia)
  const store = S_FaOpenedDocuments()
  store.replaceSessionForComponentTesting({
    activeDocumentId: 'doc-1',
    tabs: [
      {
        displayNameDraft: 'Hero',
        documentId: 'doc-1',
        editState: FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE,
        hasUnsavedChanges: true,
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
        tabLabel: 'Character',
        templateIcon: 'mdi-account'
      }
    ]
  })

  const wrapper = mount(DialogDiscardOpenedDocumentTab, {
    global: {
      ...discardDialogGlobal,
      plugins: [pinia]
    }
  })
  store.requestCloseTab('doc-1')

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

/**
 * DialogDiscardOpenedDocumentTab SFC presence
 */
test('Test that DialogDiscardOpenedDocumentTab SFC is defined', () => {
  expect(DialogDiscardOpenedDocumentTab).toBeTruthy()
})

test('Test that DialogDiscardOpenedDocumentTab renders discard title and action buttons', async () => {
  const wrapper = mountDiscardDialogWithPendingTab()
  await flushPromises()

  expect(wrapper.find('[data-test-locator="dialogDiscardOpenedDocumentTab"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="dialogDiscardOpenedDocumentTab-title"]').exists()).toBe(true)
  expect(wrapper.find('[data-test-locator="dialogDiscardOpenedDocumentTab-title"] .text-primary-bright').text()).toBe('Hero')
  expect(wrapper.find('[data-test-locator="dialogDiscardOpenedDocumentTab-discard"]').exists()).toBe(true)

  wrapper.unmount()
})

test('Test that DialogDiscardOpenedDocumentTab forwards discard and hide handlers to the opened documents store', async () => {
  const wrapper = mountDiscardDialogWithPendingTab()
  const store = S_FaOpenedDocuments()
  const confirmSpy = vi.spyOn(store, 'confirmDiscardAndClose').mockResolvedValue()
  const dismissSpy = vi.spyOn(store, 'dismissPendingClose')

  await flushPromises()
  await wrapper.get('[data-test-locator="dialogDiscardOpenedDocumentTab-discard"]').trigger('click')
  expect(confirmSpy).toHaveBeenCalled()

  store.requestCloseTab('doc-1')
  await flushPromises()
  await wrapper.getComponent(discardQDialogStub).vm.$emit('update:modelValue', false)
  await wrapper.getComponent(discardQDialogStub).vm.$emit('hide')
  expect(dismissSpy).toHaveBeenCalled()

  confirmSpy.mockRestore()
  dismissSpy.mockRestore()
  wrapper.unmount()
})
