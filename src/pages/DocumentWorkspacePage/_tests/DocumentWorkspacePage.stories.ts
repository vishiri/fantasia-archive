import type { Decorator, Meta, StoryObj } from '@storybook/vue3-vite'

import { withStorybookWorkspaceHomePreview } from '../../../../.storybook-workspace/.storybook/decorators/withStorybookWorkspaceHomePreview'
import { createFaOpenedDocumentTabStoryFixture } from '../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
import StoryRouterShell from '../../../../.storybook-workspace/.storybook/components/StoryRouterShell.vue'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

const heroPreviewTab = createFaOpenedDocumentTabStoryFixture({
  documentId: 'doc-hero',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  isFinishedDraft: true,
  savedIsFinished: true,
  treeOrderNumberDraft: '10',
  savedTreeOrderNumber: 10,
  extraClassesDraft: 'hero-extra',
  savedExtraClasses: 'hero-extra',
  editState: false
})

const heroEditTab = createFaOpenedDocumentTabStoryFixture({
  ...heroPreviewTab,
  displayNameDraft: 'Hero renamed',
  documentTextColorDraft: '#1565c0',
  documentBackgroundColorDraft: '#e3f2fd',
  isMinorDraft: true,
  isDeadDraft: false,
  treeOrderNumberDraft: '42',
  extraClassesDraft: 'hero-extra draft-class',
  hasUnsavedChanges: true,
  editState: true
})

function seedDocumentWorkspaceTab (
  activeDocumentId: string,
  tabs: ReturnType<typeof createFaOpenedDocumentTabStoryFixture>[]
): Decorator {
  return (story) => {
    S_FaOpenedDocuments().$patch({
      activeDocumentId,
      hydrationComplete: true,
      tabs: tabs.map((tab) => ({ ...tab }))
    })
    return story()
  }
}

const meta = {
  args: {
    initialPath: '/home/document/doc-hero'
  },
  component: StoryRouterShell,
  parameters: {
    docs: {
      disable: true
    },
    layout: 'fullscreen'
  },
  tags: ['skip-visual'],
  title: 'Pages/DocumentWorkspacePage'
} satisfies Meta<typeof StoryRouterShell>

export default meta

/** Preview mode: read-only title and fields; tree badge stays on saved order until Save. */
export const PreviewMode: StoryObj<typeof meta> = {
  args: {
    initialPath: '/home/document/doc-hero'
  },
  decorators: [
    withStorybookWorkspaceHomePreview,
    seedDocumentWorkspaceTab('doc-hero', [heroPreviewTab])
  ]
}

/** Edit mode with dirty drafts (name, colors, status, order, extra classes). */
export const EditModeWithUnsavedDrafts: StoryObj<typeof meta> = {
  args: {
    initialPath: '/home/document/doc-hero'
  },
  decorators: [
    withStorybookWorkspaceHomePreview,
    seedDocumentWorkspaceTab('doc-hero', [heroEditTab])
  ]
}
