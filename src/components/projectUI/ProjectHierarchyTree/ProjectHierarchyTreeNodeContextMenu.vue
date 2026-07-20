<template>
  <div
    ref="pointerAnchorRef"
    class="projectHierarchyTreeNodeContextMenu__pointerAnchor"
    :style="pointerAnchorStyle"
  />
  <q-menu
    v-model="isOpenModel"
    anchor="top left"
    class="projectHierarchyTreeNodeContextMenu"
    dark
    data-test-locator="projectHierarchyTree-nodeContextMenu"
    :data-test-hierarchy-node-id="anchorNodeId ?? undefined"
    no-parent-event
    role="menu"
    self="top left"
    :target="pointerAnchorRef ?? undefined"
    @hide="onRootMenuHide"
  >
    <q-list class="projectHierarchyTreeNodeContextMenu__list">
      <template v-if="showsBulkExpandRows">
        <ProjectHierarchyTreeNodeContextMenuBulkRows
          :collapse-all-under-node-label="menuLabels.collapseAllUnderNodeLabel"
          :expand-all-under-node-label="menuLabels.expandAllUnderNodeLabel"
          :on-collapse-all-click="onCollapseAllClick"
          :on-expand-all-click="onExpandAllClick"
        />
      </template>
      <template v-if="showsSortByRows">
        <q-separator
          v-if="showsBulkExpandRows"
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuSortByRow
          :is-sort-by-submenu-open="isSortBySubmenuOpen"
          :on-sort-by-item-click="onSortByItemClick"
          :on-sort-by-submenu-activator-enter="onSortBySubmenuActivatorEnter"
          :on-sort-by-submenu-model-update="onSortBySubmenuModelUpdate"
          :on-submenu-activator-leave="onSubmenuActivatorLeave"
          :on-submenu-content-enter="onSubmenuContentEnter"
          :on-submenu-content-leave="onSubmenuContentLeave"
          :resolve-sort-by-item-detail-direction="resolveSortByItemDetailDirection"
          :resolve-sort-by-item-detail-scope="resolveSortByItemDetailScope"
          :resolve-sort-by-item-title="resolveSortByItemTitle"
          :sort-by-label="menuLabels.sortByLabel"
        />
      </template>
      <template v-if="showsAddNewRow">
        <q-separator
          v-if="showsBulkExpandRows || showsSortByRows"
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <q-item
          v-close-popup
          clickable
          class="projectHierarchyTreeNodeContextMenu__item non-selectable"
          data-test-locator="projectHierarchyTree-nodeContextMenu-addNew"
          role="menuitem"
          @click="onAddNewClick"
        >
          <q-item-section>
            <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
              {{ addNewRowLabel }}
            </span>
          </q-item-section>
          <q-item-section avatar>
            <q-icon
              class="projectHierarchyTreeNodeContextMenu__icon"
              :name="addNewRowIcon ?? undefined"
            />
          </q-item-section>
        </q-item>
      </template>
      <template v-if="showsCopyRows">
        <q-separator
          v-if="showsBulkExpandRows || showsAddNewRow || showsSortByRows"
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuCopyRows
          :copy-background-color-label="menuLabels.copyBackgroundColorLabel"
          :copy-name-label="menuLabels.copyNameLabel"
          :copy-text-color-label="menuLabels.copyTextColorLabel"
          :on-copy-background-color-click="onCopyBackgroundColorClick"
          :on-copy-name-click="onCopyNameClick"
          :on-copy-text-color-click="onCopyTextColorClick"
        />
        <q-separator
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuDocumentRows
          :add-new-document-under-this-label="menuLabels.addNewDocumentUnderThisLabel"
          :copy-document-label="menuLabels.copyDocumentLabel"
          :edit-document-label="menuLabels.editDocumentLabel"
          :on-add-new-document-under-this-click="onAddNewDocumentUnderThisClick"
          :on-copy-document-click="onCopyDocumentClick"
          :on-edit-document-click="onEditDocumentClick"
          :on-open-document-click="onOpenDocumentClick"
          :open-document-label="menuLabels.openDocumentLabel"
        />
        <q-separator
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuDeleteRow
          :delete-document-label="menuLabels.deleteDocumentLabel"
          :on-delete-document-click="onDeleteDocumentClick"
        />
      </template>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type { T_faProjectHierarchyTreeSortByMenuItemId } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createAppControlSingleMenuSubmenuHover } from 'app/src/components/globals/AppControlSingleMenu/scripts/appControlSingleMenu_manager'
import { PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS } from './scripts/projectHierarchyTreeSortByMenuItems'
import ProjectHierarchyTreeNodeContextMenuBulkRows from './ProjectHierarchyTreeNodeContextMenuBulkRows.vue'
import ProjectHierarchyTreeNodeContextMenuCopyRows from './ProjectHierarchyTreeNodeContextMenuCopyRows.vue'
import ProjectHierarchyTreeNodeContextMenuDeleteRow from './ProjectHierarchyTreeNodeContextMenuDeleteRow.vue'
import ProjectHierarchyTreeNodeContextMenuDocumentRows from './ProjectHierarchyTreeNodeContextMenuDocumentRows.vue'
import ProjectHierarchyTreeNodeContextMenuSortByRow from './ProjectHierarchyTreeNodeContextMenuSortByRow.vue'
import { resolveProjectHierarchyTreeNodeContextMenuLabels } from './scripts/projectHierarchyTreeNodeContextMenuLabelsWiring'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenu'
})

const props = defineProps<{
  addNewRowIcon: string | null
  addNewRowLabel: string | null
  anchorNodeId: string | null
  menuPointerPosition: I_qMenuViewportPointerPosition | null
  onAddNewClick: () => void
  onAddNewDocumentUnderThisClick: () => void
  onCollapseAllClick: () => void
  onCopyBackgroundColorClick: () => void
  onCopyDocumentClick: () => void
  onCopyNameClick: () => void
  onCopyTextColorClick: () => void
  onDeleteDocumentClick: () => void
  onEditDocumentClick: () => void
  onExpandAllClick: () => void
  onHide: () => void
  onOpenDocumentClick: () => void
  onSortByItemClick: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => void
  showsBulkExpandRows: boolean
  showsCopyRows: boolean
  showsSortByRows: boolean
}>()

const isOpenModel = defineModel<boolean>('isOpen', {
  required: true
})

const { t } = useI18n()

const PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX = 0
const submenuHover = createAppControlSingleMenuSubmenuHover()
const isSortBySubmenuOpen = computed(() => {
  return submenuHover.openSubmenuRowIndex.value === PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX
})

const pointerAnchorRef = ref<HTMLElement | null>(null)

const menuLabels = computed(() => resolveProjectHierarchyTreeNodeContextMenuLabels(t))

const showsAddNewRow = computed(() => {
  return props.addNewRowLabel !== null && props.addNewRowIcon !== null
})

const pointerAnchorStyle = computed((): Record<string, string> => {
  const position = props.menuPointerPosition
  if (position === null) {
    return {
      height: '0',
      left: '0',
      opacity: '0',
      pointerEvents: 'none',
      position: 'fixed',
      top: '0',
      width: '0'
    }
  }

  return {
    height: '1px',
    left: `${position.left}px`,
    pointerEvents: 'none',
    position: 'fixed',
    top: `${position.top}px`,
    width: '1px'
  }
})

function onSortBySubmenuActivatorEnter (): void {
  submenuHover.onSubmenuActivatorEnter(PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX)
}

function onSortBySubmenuModelUpdate (shown: boolean): void {
  submenuHover.onSubmenuModelUpdate(PROJECT_HIERARCHY_TREE_SORT_BY_SUBMENU_ROW_INDEX, shown)
}

function findSortByMenuItem (itemId: T_faProjectHierarchyTreeSortByMenuItemId) {
  return PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS.find((item) => {
    return item.id === itemId
  }) as (typeof PROJECT_HIERARCHY_TREE_SORT_BY_MENU_ITEMS)[number]
}

function resolveSortByItemTitle (itemId: T_faProjectHierarchyTreeSortByMenuItemId): string {
  return t(findSortByMenuItem(itemId).titleKey)
}

function resolveSortByItemDetailDirection (itemId: T_faProjectHierarchyTreeSortByMenuItemId): string {
  return t(findSortByMenuItem(itemId).detailDirectionKey)
}

function resolveSortByItemDetailScope (itemId: T_faProjectHierarchyTreeSortByMenuItemId): string {
  return t(findSortByMenuItem(itemId).detailScopeKey)
}

function onRootMenuHide (): void {
  submenuHover.onRootMenuHide()
  props.onHide()
}

const onAddNewClick = props.onAddNewClick
const onAddNewDocumentUnderThisClick = props.onAddNewDocumentUnderThisClick
const onCollapseAllClick = props.onCollapseAllClick
const onCopyBackgroundColorClick = props.onCopyBackgroundColorClick
const onCopyDocumentClick = props.onCopyDocumentClick
const onCopyNameClick = props.onCopyNameClick
const onCopyTextColorClick = props.onCopyTextColorClick
const onDeleteDocumentClick = props.onDeleteDocumentClick
const onEditDocumentClick = props.onEditDocumentClick
const onExpandAllClick = props.onExpandAllClick
const onOpenDocumentClick = props.onOpenDocumentClick
const onSortByItemClick = props.onSortByItemClick
const onSubmenuActivatorLeave = submenuHover.onSubmenuActivatorLeave
const onSubmenuContentEnter = submenuHover.onSubmenuContentEnter
const onSubmenuContentLeave = submenuHover.onSubmenuContentLeave
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeNodeContextMenu.unscoped.scss"></style>
