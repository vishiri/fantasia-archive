<template>
  <q-menu
    class="projectDocumentControlBarTabContextMenu"
    context-menu
    dark
    data-test-locator="projectDocumentControlBar-tabContextMenu"
    :data-test-tab-document-id="tab.documentId"
    role="menu"
    square
    touch-position
    @hide="onRootMenuHide"
  >
    <ProjectDocumentControlBarTabContextMenuList
      :active-document-tab-name="activeDocumentTabName"
      :browse-opened-tabs-label="browseOpenedTabsLabel"
      :close-all-tabs-without-changes-except-this-one-label="closeAllTabsWithoutChangesExceptThisOneLabel"
      :close-all-tabs-without-changes-label="closeAllTabsWithoutChangesLabel"
      :close-this-tab-label="closeThisTabLabel"
      :copy-name-label="copyNameLabel"
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
      :on-copy-name-click="onCopyNameClick"
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
      :show-delete-this-document="showDeleteThisDocument"
    />
  </q-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import ProjectDocumentControlBarTabContextMenuList from './ProjectDocumentControlBarTabContextMenuList.vue'
import { useProjectDocumentControlBarTabContextMenu } from './scripts/projectDocumentControlBarTabContextMenu_manager'

defineOptions({
  name: 'ProjectDocumentControlBarTabContextMenu'
})

const props = defineProps<{
  activeDocumentTabName: string | undefined
  moveDocumentTabLeftKeybindLabel: string | null
  moveDocumentTabRightKeybindLabel: string | null
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCloseClick: (documentId: string) => void
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  openedDocumentTabs: readonly I_faOpenedDocumentTab[]
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabRoute: (documentId: string) => string
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
  browseOpenedTabsLabel,
  closeAllTabsWithoutChangesExceptThisOneLabel,
  closeAllTabsWithoutChangesLabel,
  closeThisTabLabel,
  copyNameLabel,
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
  onCopyNameClick,
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
} = useProjectDocumentControlBarTabContextMenu({
  moveDocumentTabLeftKeybindLabel: moveDocumentTabLeftKeybindLabelComputed,
  moveDocumentTabRightKeybindLabel: moveDocumentTabRightKeybindLabelComputed,
  onTabCloseAllWithoutChangesClick: props.onTabCloseAllWithoutChangesClick,
  onTabCloseAllWithoutChangesExceptClick: props.onTabCloseAllWithoutChangesExceptClick,
  onTabCloseClick: props.onTabCloseClick,
  onTabCopyNameClick: props.onTabCopyNameClick,
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

<style lang="scss" src="./styles/ProjectDocumentControlBarTabContextMenu.unscoped.scss"></style>
