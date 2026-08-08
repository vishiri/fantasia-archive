<template>
  <div class="projectHierarchyTreeNodeMenusHost">
    <ProjectHierarchyTreeNodeContextMenu
      v-model:is-open="isNodeContextMenuOpen"
      :add-document-placement-options="addDocumentPlacementOptions"
      :add-new-row-icon="addNewRowIcon"
      :add-new-row-label="addNewRowLabel"
      :anchor-node-id="anchorNodeId"
      :menu-pointer-position="menuPointerPosition"
      :on-add-new-click="onAddNewClick"
      :on-add-new-document-to-this-tag-click="onAddNewDocumentToThisTagClick"
      :on-add-new-document-under-this-click="onAddNewDocumentUnderThisClick"
      :on-collapse-all-click="onCollapseAllClick"
      :on-copy-background-color-click="onCopyBackgroundColorClick"
      :on-copy-document-click="onCopyDocumentClick"
      :on-copy-name-click="onCopyNameClick"
      :on-copy-text-color-click="onCopyTextColorClick"
      :on-delete-document-click="onDeleteDocumentClick"
      :on-delete-tag-click="onDeleteTagClick"
      :on-edit-document-click="onEditDocumentClick"
      :on-expand-all-click="onExpandAllClick"
      :on-hide="onHide"
      :on-open-document-click="onOpenDocumentClick"
      :on-rename-tag-click="onRenameTagClick"
      :on-sort-by-item-click="onSortByItemClick"
      :shows-bulk-expand-rows="showsBulkExpandRows"
      :shows-copy-rows="showsCopyRows"
      :shows-document-open-edit-rows="showsDocumentOpenEditRows"
      :shows-sort-by-rows="showsSortByRows"
      :sort-by-direct-scope-only="sortByDirectScopeOnly"
      :shows-tag-menu-rows="showsTagMenuRows"
    />
    <ProjectHierarchyTreeTagDialogsHost
      v-model:rename-tag-name-draft="renameTagNameDraft"
      :delete-tag-confirm-open="deleteTagConfirmOpen"
      :delete-tag-name="deleteTagName"
      :on-confirm-delete-tag="onConfirmDeleteTag"
      :on-confirm-rename-tag="onConfirmRenameTag"
      :on-dismiss-delete-tag-dialog="onDismissDeleteTagDialog"
      :on-dismiss-rename-tag-dialog="onDismissRenameTagDialog"
      :rename-tag-can-confirm="renameTagCanConfirm"
      :rename-tag-current-name="renameTagCurrentName"
      :rename-tag-dialog-open="renameTagDialogOpen"
      :rename-tag-merge-warning="renameTagMergeWarning"
    />
  </div>
</template>

<script setup lang="ts">
import type { I_qMenuViewportPointerPosition } from 'app/types/I_qMenuViewportPointerPosition'
import type {
  I_faProjectHierarchyTreeTagAddDocumentPlacementOption,
  T_faProjectHierarchyTreeSortByMenuItemId
} from 'app/types/I_faProjectHierarchyTreeDomain'

import ProjectHierarchyTreeNodeContextMenu from './ProjectHierarchyTreeNodeContextMenu.vue'
import ProjectHierarchyTreeTagDialogsHost from './ProjectHierarchyTreeTagDialogsHost.vue'

defineOptions({
  name: 'ProjectHierarchyTreeNodeMenusHost'
})

defineProps<{
  addDocumentPlacementOptions: readonly I_faProjectHierarchyTreeTagAddDocumentPlacementOption[]
  addNewRowIcon: string | null
  addNewRowLabel: string | null
  anchorNodeId: string | null
  deleteTagConfirmOpen: boolean
  deleteTagName: string
  menuPointerPosition: I_qMenuViewportPointerPosition | null
  onAddNewClick: () => void
  onAddNewDocumentToThisTagClick: (placementNodeId: string) => void
  onAddNewDocumentUnderThisClick: () => void
  onCollapseAllClick: () => void
  onConfirmDeleteTag: () => void
  onConfirmRenameTag: () => void
  onCopyBackgroundColorClick: () => void
  onCopyDocumentClick: () => void
  onCopyNameClick: () => void
  onCopyTextColorClick: () => void
  onDeleteDocumentClick: () => void
  onDeleteTagClick: () => void
  onDismissDeleteTagDialog: () => void
  onDismissRenameTagDialog: () => void
  onEditDocumentClick: () => void
  onExpandAllClick: () => void
  onHide: () => void
  onOpenDocumentClick: () => void
  onRenameTagClick: () => void
  onSortByItemClick: (itemId: T_faProjectHierarchyTreeSortByMenuItemId) => void
  renameTagCanConfirm: boolean
  renameTagCurrentName: string
  renameTagDialogOpen: boolean
  renameTagMergeWarning: boolean
  showsBulkExpandRows: boolean
  showsCopyRows: boolean
  showsDocumentOpenEditRows: boolean
  showsSortByRows: boolean
  sortByDirectScopeOnly: boolean
  showsTagMenuRows: boolean
}>()

const isNodeContextMenuOpen = defineModel<boolean>('isNodeContextMenuOpen', {
  required: true
})
const renameTagNameDraft = defineModel<string>('renameTagNameDraft', {
  required: true
})
</script>
