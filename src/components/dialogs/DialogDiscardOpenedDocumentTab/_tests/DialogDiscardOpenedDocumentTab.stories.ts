import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'

import { createFaOpenedDocumentTabStoryFixture } from '../../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
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
      createFaOpenedDocumentTabStoryFixture({
        documentId: 'doc-1',
        displayNameDraft: 'Hero',
        savedDisplayName: 'Hero',
        hasUnsavedChanges: true
      })
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
