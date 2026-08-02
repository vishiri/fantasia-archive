import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'

import { createFaOpenedDocumentTabStoryFixture } from '../../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
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
      createFaOpenedDocumentTabStoryFixture({
        documentId: 'doc-1',
        displayNameDraft: 'Hero',
        savedDisplayName: 'Hero',
        hasUnsavedChanges: false
      })
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
