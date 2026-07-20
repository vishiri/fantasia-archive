import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

import DialogDeleteOpenedDocument from '../DialogDeleteOpenedDocument.vue'

const deleteQDialogStub = defineComponent({
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
    <div class="delete-qdialog-stub" v-bind="$attrs">
      <div v-if="modelValue" class="delete-qdialog-inner">
        <slot />
      </div>
    </div>
  `
})

const deleteDialogGlobal = {
  mocks: {
    $t: (key: string) => key
  },
  stubs: {
    QBtn: {
      emits: ['click'],
      template: '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)"><slot /></button>'
    },
    QCard: { template: '<div><slot /></div>' },
    QCardActions: { template: '<div><slot /></div>' },
    QCardSection: { template: '<div><slot /></div>' },
    QDialog: deleteQDialogStub
  }
} as const

function mountDeleteDialogWithPendingTab () {
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
        hasUnsavedChanges: false,
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
        tabLabel: 'Character',
        templateIcon: 'mdi-account'
      }
    ]
  })

  const wrapper = mount(DialogDeleteOpenedDocument, {
    global: {
      ...deleteDialogGlobal,
      plugins: [pinia]
    }
  })
  store.requestDeleteDocument('doc-1')

  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

test('Test that DialogDeleteOpenedDocument SFC is defined', () => {
  expect(DialogDeleteOpenedDocument).toBeTruthy()
})

test('Test that DialogDeleteOpenedDocument renders pending delete copy and confirm actions', async () => {
  const wrapper = mountDeleteDialogWithPendingTab()
  await flushPromises()

  expect(wrapper.find('[data-test-locator="dialogDeleteOpenedDocument"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Hero')
  expect(wrapper.find('[data-test-locator="dialogDeleteOpenedDocument-delete"]').exists()).toBe(true)

  wrapper.unmount()
})

test('Test that DialogDeleteOpenedDocument confirm and hide handlers reach the opened documents store', async () => {
  const wrapper = mountDeleteDialogWithPendingTab()
  const store = S_FaOpenedDocuments()
  const confirmSpy = vi.spyOn(store, 'confirmDeleteOpenedDocument').mockResolvedValue()
  const dismissSpy = vi.spyOn(store, 'dismissPendingDelete')

  await flushPromises()
  await wrapper.get('[data-test-locator="dialogDeleteOpenedDocument-delete"]').trigger('click')
  expect(confirmSpy).toHaveBeenCalledWith('doc-1')

  store.requestDeleteDocument('doc-1')
  await flushPromises()
  await wrapper.getComponent(deleteQDialogStub).vm.$emit('update:modelValue', false)
  await wrapper.getComponent(deleteQDialogStub).vm.$emit('hide')
  expect(dismissSpy).toHaveBeenCalled()

  confirmSpy.mockRestore()
  dismissSpy.mockRestore()
  wrapper.unmount()
})
