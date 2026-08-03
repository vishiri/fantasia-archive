import type { Meta, StoryObj } from '@storybook/vue3-vite'

import { createFaOpenedDocumentTabStoryFixture } from '../../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  resolveProjectAppControlBarTabAppearanceChrome,
  resolveProjectAppControlBarTabInlineStyle
} from '../scripts/projectAppControlBarTabAppearanceChromeWiring'
import ProjectAppControlBarTabContextMenu from '../ProjectAppControlBarTabContextMenu.vue'

const sampleTab = createFaOpenedDocumentTabStoryFixture({
  documentId: 'doc-hero',
  displayNameDraft: 'Hero',
  savedDisplayName: 'Hero',
  hasUnsavedChanges: true
})

const sampleTabs = [
  sampleTab,
  createFaOpenedDocumentTabStoryFixture({
    documentId: 'doc-villain',
    displayNameDraft: 'Villain',
    savedDisplayName: 'Villain',
    templateIcon: 'mdi-skull'
  })
]

const meta = {
  component: ProjectAppControlBarTabContextMenu,
  parameters: {
    docs: {
      disable: true,
      story: {
        inline: false
      }
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabContextMenu'
} satisfies Meta<typeof ProjectAppControlBarTabContextMenu>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectAppControlBarTabContextMenu
    },
    setup () {
      return {
        activeDocumentTabName: 'doc-hero',
        moveDocumentTabLeftKeybindLabel: 'Ctrl+Left',
        moveDocumentTabRightKeybindLabel: 'Ctrl+Right',
        onTabAddNewDocumentUnderThisClick: async () => undefined,
        onTabCloseAllWithoutChangesClick: () => {},
        onTabCloseAllWithoutChangesExceptClick: () => {},
        onTabCloseClick: () => {},
        onTabCopyBackgroundColorClick: async () => undefined,
        onTabCopyDocumentClick: async () => undefined,
        onTabCopyNameClick: async () => undefined,
        onTabCopyTextColorClick: async () => undefined,
        onTabDeleteClick: () => {},
        onTabForceCloseAllClick: () => {},
        onTabForceCloseAllExceptClick: () => {},
        onTabMoveClick: () => {},
        openedDocumentTabs: sampleTabs,
        resolveDocumentTabAppearanceChrome: resolveProjectAppControlBarTabAppearanceChrome,
        resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => tab.templateIcon,
        resolveDocumentTabInlineStyle: resolveProjectAppControlBarTabInlineStyle,
        resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => tab.displayNameDraft,
        resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
        resolveTabWorldIndicatorColor: () => null,
        showWorldTabIndicators: false,
        tab: sampleTab
      }
    },
    template: `
      <div style="padding: 2rem;">
        <ProjectAppControlBarTabContextMenu
          :active-document-tab-name="activeDocumentTabName"
          :move-document-tab-left-keybind-label="moveDocumentTabLeftKeybindLabel"
          :move-document-tab-right-keybind-label="moveDocumentTabRightKeybindLabel"
          :on-tab-add-new-document-under-this-click="onTabAddNewDocumentUnderThisClick"
          :on-tab-close-all-without-changes-click="onTabCloseAllWithoutChangesClick"
          :on-tab-close-all-without-changes-except-click="onTabCloseAllWithoutChangesExceptClick"
          :on-tab-close-click="onTabCloseClick"
          :on-tab-copy-background-color-click="onTabCopyBackgroundColorClick"
          :on-tab-copy-document-click="onTabCopyDocumentClick"
          :on-tab-copy-name-click="onTabCopyNameClick"
          :on-tab-copy-text-color-click="onTabCopyTextColorClick"
          :on-tab-delete-click="onTabDeleteClick"
          :on-tab-force-close-all-click="onTabForceCloseAllClick"
          :on-tab-force-close-all-except-click="onTabForceCloseAllExceptClick"
          :on-tab-move-click="onTabMoveClick"
          :opened-document-tabs="openedDocumentTabs"
          :resolve-document-tab-appearance-chrome="resolveDocumentTabAppearanceChrome"
          :resolve-document-tab-display-icon="resolveDocumentTabDisplayIcon"
          :resolve-document-tab-inline-style="resolveDocumentTabInlineStyle"
          :resolve-document-tab-label="resolveDocumentTabLabel"
          :resolve-document-tab-route="resolveDocumentTabRoute"
          :resolve-tab-world-indicator-color="resolveTabWorldIndicatorColor"
          :show-world-tab-indicators="showWorldTabIndicators"
          :tab="tab"
        />
      </div>
    `
  })
}
