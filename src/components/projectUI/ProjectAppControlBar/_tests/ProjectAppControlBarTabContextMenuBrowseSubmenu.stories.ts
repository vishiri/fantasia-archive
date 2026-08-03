import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import { createFaOpenedDocumentTabStoryFixture } from '../../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import ProjectAppControlBarTabContextMenuBrowseSubmenu from '../ProjectAppControlBarTabContextMenuBrowseSubmenu.vue'

const sampleTabs = [
  createFaOpenedDocumentTabStoryFixture({
    documentId: 'doc-hero',
    displayNameDraft: 'Hero',
    savedDisplayName: 'Hero',
    hasUnsavedChanges: true
  }),
  createFaOpenedDocumentTabStoryFixture({
    documentId: 'doc-villain',
    displayNameDraft: 'Villain',
    savedDisplayName: 'Villain',
    templateIcon: 'mdi-skull'
  })
]

const meta = {
  component: ProjectAppControlBarTabContextMenuBrowseSubmenu,
  parameters: {
    docs: {
      disable: true,
      story: {
        inline: false
      }
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabContextMenuBrowseSubmenu'
} satisfies Meta<typeof ProjectAppControlBarTabContextMenuBrowseSubmenu>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectAppControlBarTabContextMenuBrowseSubmenu
    },
    setup () {
      const isBrowseSubmenuOpen = ref(true)
      return {
        activeDocumentTabName: 'doc-hero',
        isBrowseSubmenuOpen,
        onBrowseSubmenuModelUpdate: (shown: boolean) => {
          isBrowseSubmenuOpen.value = shown
        },
        onSubmenuContentEnter: () => {},
        onSubmenuContentLeave: () => {},
        openedDocumentTabs: sampleTabs,
        resolveBrowseTabLabel: (tab: I_faOpenedDocumentTab) => tab.displayNameDraft,
        resolveBrowseTabRoute: (documentId: string) => `/home/document/${documentId}`,
        resolveDocumentTabAppearanceChrome: () => undefined,
        resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => tab.templateIcon,
        resolveDocumentTabInlineStyle: () => undefined,
        resolveTabWorldIndicatorColor: () => '#4caf50',
        showWorldTabIndicators: true
      }
    },
    template: `
      <div style="padding: 2rem;">
        <ProjectAppControlBarTabContextMenuBrowseSubmenu
          :active-document-tab-name="activeDocumentTabName"
          :is-browse-submenu-open="isBrowseSubmenuOpen"
          :on-browse-submenu-model-update="onBrowseSubmenuModelUpdate"
          :on-submenu-content-enter="onSubmenuContentEnter"
          :on-submenu-content-leave="onSubmenuContentLeave"
          :opened-document-tabs="openedDocumentTabs"
          :resolve-browse-tab-label="resolveBrowseTabLabel"
          :resolve-browse-tab-route="resolveBrowseTabRoute"
          :resolve-document-tab-appearance-chrome="resolveDocumentTabAppearanceChrome"
          :resolve-document-tab-display-icon="resolveDocumentTabDisplayIcon"
          :resolve-document-tab-inline-style="resolveDocumentTabInlineStyle"
          :resolve-tab-world-indicator-color="resolveTabWorldIndicatorColor"
          :show-world-tab-indicators="showWorldTabIndicators"
        />
      </div>
    `
  })
}
