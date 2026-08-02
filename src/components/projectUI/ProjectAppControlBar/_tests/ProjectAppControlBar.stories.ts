import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { withStorybookWorkspaceHomePreview } from '../../../../../.storybook-workspace/.storybook/decorators/withStorybookWorkspaceHomePreview'
import { createFaOpenedDocumentTabStoryFixture } from '../../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
import StoryRouterShell from '../../../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

const sampleTabs: I_faOpenedDocumentTab[] = [
  createFaOpenedDocumentTabStoryFixture({
    documentId: 'doc-hero',
    displayNameDraft: 'Hero',
    savedDisplayName: 'Hero',
    isFinishedDraft: true,
    savedIsFinished: true,
    treeOrderNumberDraft: '10',
    savedTreeOrderNumber: 10
  }),
  createFaOpenedDocumentTabStoryFixture({
    documentId: 'doc-villain',
    displayNameDraft: 'Villain draft',
    savedDisplayName: 'Villain',
    templateIcon: 'mdi-skull',
    documentTextColorDraft: '#c62828',
    savedDocumentTextColor: '',
    documentBackgroundColorDraft: '#fff3e0',
    savedDocumentBackgroundColor: '',
    isDeadDraft: true,
    savedIsDead: false,
    isMinorDraft: true,
    savedIsMinor: false,
    hasUnsavedChanges: true,
    treeOrderNumberDraft: '3',
    savedTreeOrderNumber: 7,
    extraClassesDraft: 'villain-draft',
    savedExtraClasses: ''
  })
]

const seedOpenedDocumentTabs: Decorator = (story) => {
  S_FaOpenedDocuments().$patch({
    activeDocumentId: 'doc-hero',
    hydrationComplete: true,
    tabs: sampleTabs.map((tab) => ({ ...tab }))
  })
  return story()
}

const meta = {
  args: {
    initialPath: '/home/document/doc-hero'
  },
  component: StoryRouterShell,
  decorators: [withStorybookWorkspaceHomePreview, seedOpenedDocumentTabs],
  parameters: {
    docs: {
      disable: true
    },
    layout: 'fullscreen'
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBar'
} satisfies Meta<typeof StoryRouterShell>

export default meta

export const WithDocumentTabs: StoryObj<typeof meta> = {
  args: {
    initialPath: '/home/document/doc-hero'
  }
}

export const WithMultipleDocumentTabsForContextMenu: StoryObj<typeof meta> = {
  args: {
    initialPath: '/home/document/doc-villain'
  },
  decorators: [
    withStorybookWorkspaceHomePreview,
    (story) => {
      S_FaOpenedDocuments().$patch({
        activeDocumentId: 'doc-villain',
        hydrationComplete: true,
        tabs: [
          ...sampleTabs,
          createFaOpenedDocumentTabStoryFixture({
            documentId: 'doc-location',
            tabLabel: 'Location',
            templateIcon: 'mdi-map-marker',
            displayNameDraft: 'Castle',
            savedDisplayName: 'Castle',
            documentBackgroundColorDraft: '#e8f5e9',
            savedDocumentBackgroundColor: '#e8f5e9',
            isCategoryDraft: true,
            savedIsCategory: true,
            treeOrderNumberDraft: '1',
            savedTreeOrderNumber: 1
          })
        ]
      })
      return story()
    }
  ]
}

export const WorkspaceHomeWithoutTabs: StoryObj<typeof meta> = {
  args: {
    initialPath: '/home'
  },
  decorators: [
    withStorybookWorkspaceHomePreview,
    (story) => {
      S_FaOpenedDocuments().$patch({
        activeDocumentId: null,
        hydrationComplete: true,
        tabs: []
      })
      return story()
    }
  ]
}
