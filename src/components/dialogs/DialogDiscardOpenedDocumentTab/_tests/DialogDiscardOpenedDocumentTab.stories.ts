import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'

import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

import DialogDiscardOpenedDocumentTab from '../DialogDiscardOpenedDocumentTab.vue'

const meta = {
  component: DialogDiscardOpenedDocumentTab,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '320px'
      },
      description: {
        component:
          'Confirm discard of unsaved tab edits before close. Opens when S_FaOpenedDocuments.pendingCloseDocumentId is set.'
      }
    }
  },
  tags: ['autodocs'],
  title: 'Components/dialogs/DialogDiscardOpenedDocumentTab'
} satisfies Meta<typeof DialogDiscardOpenedDocumentTab>

export default meta

function seedPendingCloseDocument (): void {
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
  store.requestCloseTab('doc-1')
}

export const Default: StoryObj<typeof meta> = {
  loaders: [
    async () => {
      seedPendingCloseDocument()
      return {}
    }
  ],
  render: () => ({
    components: {
      DialogDiscardOpenedDocumentTab
    },
    template: '<DialogDiscardOpenedDocumentTab />'
  })
}
