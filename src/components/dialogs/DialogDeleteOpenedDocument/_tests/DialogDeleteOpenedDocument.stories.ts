import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'

import { FA_OPENED_DOCUMENT_DEFAULT_EDIT_STATE } from 'app/types/I_faOpenedDocumentsDomain'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

import DialogDeleteOpenedDocument from '../DialogDeleteOpenedDocument.vue'

const meta = {
  component: DialogDeleteOpenedDocument,
  parameters: {
    docs: {
      story: {
        inline: false,
        iframeHeight: '420px'
      },
      description: {
        component:
          'Confirm permanent delete of an opened document. Opens when S_FaOpenedDocuments.pendingDeleteDocumentId is set.'
      }
    }
  },
  tags: ['autodocs'],
  title: 'Components/dialogs/DialogDeleteOpenedDocument'
} satisfies Meta<typeof DialogDeleteOpenedDocument>

export default meta

function seedPendingDeleteDocument (): void {
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
        extraClassesDraft: '',
        savedExtraClasses: '',
        tabLabel: 'Character',
        templateIcon: 'mdi-account'
      }
    ]
  })
  store.requestDeleteDocument('doc-1')
}

export const Default: StoryObj<typeof meta> = {
  loaders: [
    async () => {
      seedPendingDeleteDocument()
      return {}
    }
  ],
  render: () => ({
    components: {
      DialogDeleteOpenedDocument
    },
    template: '<DialogDeleteOpenedDocument />'
  })
}
