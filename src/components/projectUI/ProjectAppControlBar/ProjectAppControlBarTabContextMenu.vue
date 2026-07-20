<template>
  <div
    ref="tabContextMenuMountRef"
    class="projectAppControlBarTabs__tabContextMenuMount"
    hidden
  />
  <q-menu
    v-model="isTabContextMenuOpen"
    anchor="bottom left"
    class="projectAppControlBarTabContextMenu"
    dark
    data-test-locator="projectAppControlBar-tabContextMenu"
    :data-test-tab-document-id="tab.documentId"
    no-parent-event
    role="menu"
    self="top left"
    :target="tabMenuTargetElement ?? undefined"
    @hide="onRootMenuHide"
  >
    <ProjectAppControlBarTabContextMenuList
      :active-document-tab-name="activeDocumentTabName"
      :browse-opened-tabs-label="browseOpenedTabsLabel"
      :close-all-tabs-without-changes-except-this-one-label="closeAllTabsWithoutChangesExceptThisOneLabel"
      :close-all-tabs-without-changes-label="closeAllTabsWithoutChangesLabel"
      :close-this-tab-label="closeThisTabLabel"
      :copy-background-color-label="copyBackgroundColorLabel"
      :copy-document-label="copyDocumentLabel"
      :copy-name-label="copyNameLabel"
      :copy-text-color-label="copyTextColorLabel"
      :add-new-document-under-this-label="addNewDocumentUnderThisLabel"
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
  </q-menu>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import ProjectAppControlBarTabContextMenuList from './ProjectAppControlBarTabContextMenuList.vue'
import { createProjectAppControlBarTabContextMenuOpenWiring } from './scripts/projectAppControlBarTabContextMenuOpenWiring'
import { useProjectAppControlBarTabContextMenu } from './scripts/projectAppControlBarTabContextMenu_manager'

defineOptions({
  name: 'ProjectAppControlBarTabContextMenu'
})

const tabContextMenuMountRef = ref<HTMLElement | null>(null)

const {
  isTabContextMenuOpen,
  tabMenuTargetElement
} = createProjectAppControlBarTabContextMenuOpenWiring({
  tabContextMenuMountRef
})

const props = defineProps<{
  activeDocumentTabName: string | undefined
  moveDocumentTabLeftKeybindLabel: string | null
  moveDocumentTabRightKeybindLabel: string | null
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCloseClick: (documentId: string) => void
  onTabCopyBackgroundColorClick: (documentId: string) => Promise<void>
  onTabCopyDocumentClick: (documentId: string) => Promise<void>
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabCopyTextColorClick: (documentId: string) => Promise<void>
  onTabAddNewDocumentUnderThisClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  openedDocumentTabs: readonly I_faOpenedDocumentTab[]
  resolveDocumentTabAppearanceChrome: (
    tab: I_faOpenedDocumentTab
  ) => I_faDocumentAppearanceChromeStyle | undefined
  resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabInlineStyle: (tab: I_faOpenedDocumentTab) => CSSProperties | undefined
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabRoute: (documentId: string) => string
  resolveTabWorldIndicatorColor: (tab: I_faOpenedDocumentTab) => string | null
  showWorldTabIndicators: boolean
  tab: I_faOpenedDocumentTab
}>()

const activeDocumentTabName = computed(() => {
  return props.activeDocumentTabName
})

const openedDocumentTabsComputed = computed(() => {
  return props.openedDocumentTabs
})

const moveDocumentTabLeftKeybindLabelComputed = computed(() => {
  return props.moveDocumentTabLeftKeybindLabel
})

const moveDocumentTabRightKeybindLabelComputed = computed(() => {
  return props.moveDocumentTabRightKeybindLabel
})

const {
  addNewDocumentUnderThisLabel,
  browseOpenedTabsLabel,
  closeAllTabsWithoutChangesExceptThisOneLabel,
  closeAllTabsWithoutChangesLabel,
  closeThisTabLabel,
  copyBackgroundColorLabel,
  copyDocumentLabel,
  copyNameLabel,
  copyTextColorLabel,
  deleteThisDocumentLabel,
  forceCloseAllTabsExceptThisOneLabel,
  forceCloseAllTabsLabel,
  isBrowseSubmenuOpen,
  moveDocumentTabLeftKeybindLabel,
  moveDocumentTabRightKeybindLabel,
  moveTabLeftLabel,
  moveTabRightLabel,
  onBrowseSubmenuActivatorEnter,
  onBrowseSubmenuModelUpdate,
  onCloseAllTabsWithoutChangesClick,
  onCloseAllTabsWithoutChangesExceptThisOneClick,
  onCloseThisTabClick,
  onCopyBackgroundColorClick,
  onCopyDocumentClick,
  onCopyNameClick,
  onCopyTextColorClick,
  onAddNewDocumentUnderThisClick,
  onDeleteThisDocumentClick,
  onForceCloseAllTabsClick,
  onForceCloseAllTabsExceptThisOneClick,
  onMoveTabLeftClick,
  onMoveTabRightClick,
  onRootMenuHide,
  onSubmenuActivatorLeave,
  onSubmenuContentEnter,
  onSubmenuContentLeave,
  openedDocumentTabs,
  resolveBrowseTabLabel,
  resolveBrowseTabRoute,
  showDeleteThisDocument
} = useProjectAppControlBarTabContextMenu({
  moveDocumentTabLeftKeybindLabel: moveDocumentTabLeftKeybindLabelComputed,
  moveDocumentTabRightKeybindLabel: moveDocumentTabRightKeybindLabelComputed,
  onTabCloseAllWithoutChangesClick: props.onTabCloseAllWithoutChangesClick,
  onTabCloseAllWithoutChangesExceptClick: props.onTabCloseAllWithoutChangesExceptClick,
  onTabCloseClick: props.onTabCloseClick,
  onTabCopyBackgroundColorClick: props.onTabCopyBackgroundColorClick,
  onTabCopyDocumentClick: props.onTabCopyDocumentClick,
  onTabCopyNameClick: props.onTabCopyNameClick,
  onTabCopyTextColorClick: props.onTabCopyTextColorClick,
  onTabAddNewDocumentUnderThisClick: props.onTabAddNewDocumentUnderThisClick,
  onTabDeleteClick: props.onTabDeleteClick,
  onTabForceCloseAllClick: props.onTabForceCloseAllClick,
  onTabForceCloseAllExceptClick: props.onTabForceCloseAllExceptClick,
  onTabMoveClick: props.onTabMoveClick,
  openedDocumentTabs: openedDocumentTabsComputed,
  resolveDocumentTabLabel: props.resolveDocumentTabLabel,
  resolveDocumentTabRoute: props.resolveDocumentTabRoute,
  tab: props.tab
})

const tab = props.tab
</script>

<style lang="scss" src="./styles/ProjectAppControlBarTabContextMenu.unscoped.scss"></style>
