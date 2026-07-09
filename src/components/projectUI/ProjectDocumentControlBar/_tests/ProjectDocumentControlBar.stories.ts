import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { withStorybookWorkspaceHomePreview } from '../../../../.storybook-workspace/.storybook/decorators/withStorybookWorkspaceHomePreview'
import StoryRouterShell from '../../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

const sampleTabs: I_faOpenedDocumentTab[] = [
  {
    documentId: 'doc-hero',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    displayNameDraft: 'Hero',
    savedDisplayName: 'Hero',
    hasUnsavedChanges: false,
    editState: false
  },
  {
    documentId: 'doc-villain',
    tabLabel: 'Character',
    templateIcon: 'mdi-skull',
    displayNameDraft: 'Villain draft',
    savedDisplayName: 'Villain',
    hasUnsavedChanges: true,
    editState: false
  }
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
  title: 'Components/projectUI/ProjectDocumentControlBar'
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
          {
            documentId: 'doc-location',
            tabLabel: 'Location',
            templateIcon: 'mdi-map-marker',
            displayNameDraft: 'Castle',
            savedDisplayName: 'Castle',
            hasUnsavedChanges: false,
            editState: false
          }
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
