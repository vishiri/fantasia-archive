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
          :sort-by-direct-scope-only="sortByDirectScopeOnly"
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
              class="projectHierarchyTreeNodeContextMenu__icon fa-color-glyph"
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
          :shows-add-under="!showsDocumentOpenEditRows"
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
      <template v-else-if="showsDocumentOpenEditRows">
        <q-separator
          v-if="showsBulkExpandRows || showsAddNewRow || showsSortByRows"
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
          :shows-add-under="false"
          :shows-copy-document="false"
        />
      </template>
      <template v-if="showsTagMenuRows">
        <q-separator
          v-if="showsBulkExpandRows || showsAddNewRow || showsSortByRows || showsCopyRows || showsDocumentOpenEditRows"
          class="projectHierarchyTreeNodeContextMenu__separator"
          dark
          role="separator"
        />
        <ProjectHierarchyTreeNodeContextMenuTagRows
          :add-document-placement-options="addDocumentPlacementOptions"
          :add-new-document-to-this-tag-label="menuLabels.addNewDocumentToThisTagLabel"
          :delete-tag-label="menuLabels.deleteTagLabel"
          :is-add-to-tag-submenu-open="isAddToTagSubmenuOpen"
          :on-add-new-document-to-this-tag-click="onAddNewDocumentToThisTagClick"
          :on-add-to-tag-submenu-activator-enter="onAddToTagSubmenuActivatorEnter"
          :on-add-to-tag-submenu-model-update="onAddToTagSubmenuModelUpdate"
          :on-delete-tag-click="onDeleteTagClick"
          :on-rename-tag-click="onRenameTagClick"
          :on-submenu-activator-leave="onSubmenuActivatorLeave"
          :on-submenu-content-enter="onSubmenuContentEnter"
          :on-submenu-content-leave="onSubmenuContentLeave"
          :rename-tag-label="menuLabels.renameTagLabel"
        />
      </template>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type {
  I_faProjectHierarchyTreeTagAddDocumentPlacementOption,
  T_faProjectHierarchyTreeSortByMenuItemId
} from 'app/types/I_faProjectHierarchyTreeDomain'

import ProjectHierarchyTreeNodeContextMenuBulkRows from './ProjectHierarchyTreeNodeContextMenuBulkRows.vue'
import ProjectHierarchyTreeNodeContextMenuCopyRows from './ProjectHierarchyTreeNodeContextMenuCopyRows.vue'
import ProjectHierarchyTreeNodeContextMenuDeleteRow from './ProjectHierarchyTreeNodeContextMenuDeleteRow.vue'
import ProjectHierarchyTreeNodeContextMenuDocumentRows from './ProjectHierarchyTreeNodeContextMenuDocumentRows.vue'
import ProjectHierarchyTreeNodeContextMenuSortByRow from './ProjectHierarchyTreeNodeContextMenuSortByRow.vue'
import ProjectHierarchyTreeNodeContextMenuTagRows from './ProjectHierarchyTreeNodeContextMenuTagRows.vue'
import {
  createProjectHierarchyTreeNodeContextMenuUiWiring,
  resolveProjectHierarchyTreeNodeContextMenuPointerAnchorStyle
} from './scripts/projectHierarchyTreeNodeContextMenuUiWiring'

defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenu'
})

const props = defineProps<{
  addDocumentPlacementOptions: readonly I_faProjectHierarchyTreeTagAddDocumentPlacementOption[]
  addNewRowIcon: string | null
  addNewRowLabel: string | null
  anchorNodeId: string | null
  menuPointerPosition: I_qMenuViewportPointerPosition | null
  onAddNewClick: () => void
  onAddNewDocumentToThisTagClick: (placementNodeId: string) => void
  onAddNewDocumentUnderThisClick: () => void
  onCollapseAllClick: () => void
  onCopyBackgroundColorClick: () => void
  onCopyDocumentClick: () => void
  onCopyNameClick: () => void
  onCopyTextColorClick: () => void
  onDeleteDocumentClick: () => void
  onDeleteTagClick: () => void
  onEditDocumentClick: () => void
  onExpandAllClick: () => void
  onHide: () => void
  onOpenDocumentClick: () => void
  onRenameTagClick: () => void
  onSortByItemClick: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => void
  showsBulkExpandRows: boolean
  showsCopyRows: boolean
  showsDocumentOpenEditRows: boolean
  showsSortByRows: boolean
  sortByDirectScopeOnly: boolean
  showsTagMenuRows: boolean
}>()

const isOpenModel = defineModel<boolean>('isOpen', { required: true })
const { t } = useI18n()
const ui = createProjectHierarchyTreeNodeContextMenuUiWiring({ t })
const {
  isAddToTagSubmenuOpen,
  isSortBySubmenuOpen,
  menuLabels,
  onAddToTagSubmenuActivatorEnter,
  onAddToTagSubmenuModelUpdate,
  onSortBySubmenuActivatorEnter,
  onSortBySubmenuModelUpdate,
  onSubmenuActivatorLeave,
  onSubmenuContentEnter,
  onSubmenuContentLeave,
  pointerAnchorRef,
  resolveSortByItemDetailDirection,
  resolveSortByItemDetailScope,
  resolveSortByItemTitle
} = ui

const showsAddNewRow = computed(() => {
  return props.addNewRowLabel !== null && props.addNewRowIcon !== null
})

const pointerAnchorStyle = computed(() => {
  return resolveProjectHierarchyTreeNodeContextMenuPointerAnchorStyle(props.menuPointerPosition)
})
function onRootMenuHide (): void {
  ui.onRootMenuHide(props.onHide)
}
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeNodeContextMenu.unscoped.scss"></style>
