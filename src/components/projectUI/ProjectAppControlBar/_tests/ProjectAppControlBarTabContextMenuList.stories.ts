import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'

import { createFaOpenedDocumentTabStoryFixture } from '../../../../../.storybook-workspace/.storybook/fixtures/createFaOpenedDocumentTabStoryFixture'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  resolveProjectAppControlBarTabAppearanceChrome,
  resolveProjectAppControlBarTabInlineStyle
} from '../scripts/projectAppControlBarTabAppearanceChromeWiring'
import { resolveProjectAppControlBarTabDisplayIcon } from '../functions/projectAppControlBarTabDisplayIcon'
import ProjectAppControlBarTabContextMenuList from '../ProjectAppControlBarTabContextMenuList.vue'

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
  component: ProjectAppControlBarTabContextMenuList,
  parameters: {
    docs: {
      disable: true,
      story: {
        inline: false
      }
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarTabContextMenuList'
} satisfies Meta<typeof ProjectAppControlBarTabContextMenuList>

export default meta

export const Default: StoryObj<typeof meta> = {
  render: () => ({
    components: {
      ProjectAppControlBarTabContextMenuList
    },
    setup () {
      const isBrowseSubmenuOpen = ref(false)
      return {
        activeDocumentTabName: 'doc-hero',
        addNewDocumentUnderThisLabel: 'Add new document under this',
        browseOpenedTabsLabel: 'Browse opened tabs',
        closeAllTabsWithoutChangesExceptThisOneLabel: 'Close all except this one',
        closeAllTabsWithoutChangesLabel: 'Close all without changes',
        closeThisTabLabel: 'Close this tab',
        copyBackgroundColorLabel: 'Copy background color',
        copyDocumentLabel: 'Copy document',
        copyNameLabel: 'Copy name',
        copyTextColorLabel: 'Copy text color',
        deleteThisDocumentLabel: 'Delete this document',
        forceCloseAllTabsExceptThisOneLabel: 'Force close all except this one',
        forceCloseAllTabsLabel: 'Force close all tabs',
        isBrowseSubmenuOpen,
        moveDocumentTabLeftKeybindLabel: 'Ctrl+Left',
        moveDocumentTabRightKeybindLabel: 'Ctrl+Right',
        moveTabLeftLabel: 'Move tab left',
        moveTabRightLabel: 'Move tab right',
        onBrowseSubmenuActivatorEnter: () => {
          isBrowseSubmenuOpen.value = true
        },
        onBrowseSubmenuModelUpdate: (shown: boolean) => {
          isBrowseSubmenuOpen.value = shown
        },
        onCloseAllTabsWithoutChangesClick: () => {},
        onCloseAllTabsWithoutChangesExceptThisOneClick: () => {},
        onCloseThisTabClick: () => {},
        onCopyBackgroundColorClick: () => {},
        onCopyDocumentClick: () => {},
        onCopyNameClick: () => {},
        onCopyTextColorClick: () => {},
        onAddNewDocumentUnderThisClick: () => {},
        onDeleteThisDocumentClick: () => {},
        onForceCloseAllTabsClick: () => {},
        onForceCloseAllTabsExceptThisOneClick: () => {},
        onMoveTabLeftClick: () => {},
        onMoveTabRightClick: () => {},
        onSubmenuActivatorLeave: () => {},
        onSubmenuContentEnter: () => {},
        onSubmenuContentLeave: () => {},
        openedDocumentTabs: sampleTabs,
        resolveBrowseTabLabel: (tab: I_faOpenedDocumentTab) => tab.displayNameDraft,
        resolveBrowseTabRoute: (documentId: string) => `/home/document/${documentId}`,
        resolveDocumentTabAppearanceChrome: resolveProjectAppControlBarTabAppearanceChrome,
        resolveDocumentTabDisplayIcon: resolveProjectAppControlBarTabDisplayIcon,
        resolveDocumentTabInlineStyle: resolveProjectAppControlBarTabInlineStyle,
        resolveTabWorldIndicatorColor: () => null,
        showDeleteThisDocument: true,
        showWorldTabIndicators: false
      }
    },
    template: `
      <div style="padding: 2rem; max-width: 320px;">
        <q-list dark class="bg-dark">
          <ProjectAppControlBarTabContextMenuList
            :active-document-tab-name="activeDocumentTabName"
            :add-new-document-under-this-label="addNewDocumentUnderThisLabel"
            :browse-opened-tabs-label="browseOpenedTabsLabel"
            :close-all-tabs-without-changes-except-this-one-label="closeAllTabsWithoutChangesExceptThisOneLabel"
            :close-all-tabs-without-changes-label="closeAllTabsWithoutChangesLabel"
            :close-this-tab-label="closeThisTabLabel"
            :copy-background-color-label="copyBackgroundColorLabel"
            :copy-document-label="copyDocumentLabel"
            :copy-name-label="copyNameLabel"
            :copy-text-color-label="copyTextColorLabel"
            :delete-this-document-label="deleteThisDocumentLabel"
            :force-close-all-tabs-except-this-one-label="forceCloseAllTabsExceptThisOneLabel"
            :force-close-all-tabs-label="forceCloseAllTabsLabel"
            :is-browse-submenu-open="isBrowseSubmenuOpen"
            :move-document-tab-left-keybind-label="moveDocumentTabLeftKeybindLabel"
            :move-document-tab-right-keybind-label="moveDocumentTabRightKeybindLabel"
            :move-tab-left-label="moveTabLeftLabel"
            :move-tab-right-label="moveTabRightLabel"
            :on-browse-submenu-activator-enter="onBrowseSubmenuActivatorEnter"
            :on-browse-submenu-model-update="onBrowseSubmenuModelUpdate"
            :on-close-all-tabs-without-changes-click="onCloseAllTabsWithoutChangesClick"
            :on-close-all-tabs-without-changes-except-this-one-click="onCloseAllTabsWithoutChangesExceptThisOneClick"
            :on-close-this-tab-click="onCloseThisTabClick"
            :on-copy-background-color-click="onCopyBackgroundColorClick"
            :on-copy-document-click="onCopyDocumentClick"
            :on-copy-name-click="onCopyNameClick"
            :on-copy-text-color-click="onCopyTextColorClick"
            :on-add-new-document-under-this-click="onAddNewDocumentUnderThisClick"
            :on-delete-this-document-click="onDeleteThisDocumentClick"
            :on-force-close-all-tabs-click="onForceCloseAllTabsClick"
            :on-force-close-all-tabs-except-this-one-click="onForceCloseAllTabsExceptThisOneClick"
            :on-move-tab-left-click="onMoveTabLeftClick"
            :on-move-tab-right-click="onMoveTabRightClick"
            :on-submenu-activator-leave="onSubmenuActivatorLeave"
            :on-submenu-content-enter="onSubmenuContentEnter"
            :on-submenu-content-leave="onSubmenuContentLeave"
            :opened-document-tabs="openedDocumentTabs"
            :resolve-browse-tab-label="resolveBrowseTabLabel"
            :resolve-browse-tab-route="resolveBrowseTabRoute"
            :resolve-document-tab-appearance-chrome="resolveDocumentTabAppearanceChrome"
            :resolve-document-tab-display-icon="resolveDocumentTabDisplayIcon"
            :resolve-document-tab-inline-style="resolveDocumentTabInlineStyle"
            :resolve-tab-world-indicator-color="resolveTabWorldIndicatorColor"
            :show-delete-this-document="showDeleteThisDocument"
            :show-world-tab-indicators="showWorldTabIndicators"
          />
        </q-list>
      </div>
    `
  })
}
