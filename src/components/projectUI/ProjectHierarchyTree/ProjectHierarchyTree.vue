<template>
  <div
    class="projectHierarchyTreeRoot"
    data-test-locator="projectHierarchyTree-root"
  >
    <ProjectHierarchyTreeProjectNameTitle
      v-if="showsProjectNameTitle"
      :project-display-name="projectDisplayName"
    />
    <div
      ref="treeScrollHostRef"
      class="projectHierarchyTreeHost"
      data-test-locator="projectHierarchyTree-host"
    >
      <Draggable
        v-if="treeData.length > 0"
        ref="treeComponentRef"
        :model-value="treeData"
        class="projectHierarchyTree hasScrollbar"
        :class="[
          treeRootClassList,
          { 'projectHierarchyTree--extraPadding': usesExtraTreePadding }
        ]"
        :default-open="false"
        :drag-open="isTreeDragActive"
        :drag-open-delay="PROJECT_HIERARCHY_TREE_DRAG_OPEN_DELAY_MS"
        :each-draggable="eachDraggableHandler"
        :each-droppable="eachDroppableHandler"
        data-test-locator="projectHierarchyTree"
        :indent="PROJECT_HIERARCHY_TREE_INDENT_PX"
        :tree-line="showsTreeLines"
        :tree-line-offset="PROJECT_HIERARCHY_TREE_LINE_OFFSET_PX"
        :node-key="heTreeNodeKey"
        :root-droppable="rootDroppableHandler"
        :style="treeStyle"
        :trigger-class="PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS"
        virtualization
        @after-drop="onTreeAfterDrop"
        @before-drag-open="onBeforeDragOpen"
        @before-drag-start="onBeforeDragStart"
        @click:node="onNodeClick"
        @close:node="onNodeClose"
        @dragend="onTreeDragEndCleanup"
        @open:node="onNodeOpen"
        @update:model-value="onTreeDataUpdate"
      >
        <template #default="{ node, stat }">
          <div
            class="projectHierarchyTree__nodeRow row items-center no-wrap"
            :class="resolveProjectHierarchyTreeNodeRowKindClass(node.nodeKind)"
            @auxclick="onDocumentRowAuxClick(node, $event)"
            @click="onWorldNodeRowClick(node, stat, $event)"
            @contextmenu="onNodeRowContextMenu(node, $event)"
            @pointerdown="onWorldNodeRowPointerDown(node, stat, $event)"
          >
            <ProjectHierarchyTreeOpenIcon
              v-if="projectHierarchyTreeNodeShowsOpenIcon(node, stat.children.length)"
              :expanded="isProjectHierarchyTreeOpenIconExpandedForOpenIcon(node.id, stat.open)"
              :pending-expand-animation="isOpenIconExpandAnimationPending(node.id)"
              @click.stop="onNonWorldOpenIconClick(node, stat)"
              @pointerdown.stop="onNonWorldOpenIconPointerDown(node, stat)"
            />
            <ProjectHierarchyTreeNode
              :active-document-id="activeDocumentId"
              class="projectHierarchyTree__nodeContent"
              :node="node"
              :order-number-badge-label="resolveOrderNumberBadgeLabelForNode(node)"
              :placement-count-display="resolvePlacementCountDisplayForNode(node)"
              :stat="stat"
            >
              <template
                v-if="projectHierarchyTreeNodeShowsDocumentButtonGroup(node, documentButtonVisibility)"
                #documentButtonGroup
              >
                <ProjectHierarchyTreeDocumentButtonGroup
                  :shows-add-under="resolveProjectHierarchyTreeDocumentButtonVisibilityForNode(node, documentButtonVisibility).showsAddUnder"
                  :shows-edit="resolveProjectHierarchyTreeDocumentButtonVisibilityForNode(node, documentButtonVisibility).showsEdit"
                  :shows-open="resolveProjectHierarchyTreeDocumentButtonVisibilityForNode(node, documentButtonVisibility).showsOpen"
                  @add-under-activate="onDocumentRowAddUnderButtonClick(node)"
                  @edit-activate="onDocumentRowEditButtonClick(node)"
                  @open-activate="onDocumentRowOpenButtonClick(node)"
                />
              </template>
            </ProjectHierarchyTreeNode>
          </div>
        </template>
      </Draggable>
      <ProjectHierarchyTreeNodeMenusHost
        v-model:is-node-context-menu-open="isNodeContextMenuOpen"
        v-model:rename-tag-name-draft="renameTagNameDraft"
        :add-document-placement-options="addDocumentPlacementOptions"
        :add-new-row-icon="contextMenuAddNewRowIcon"
        :add-new-row-label="contextMenuAddNewRowLabel"
        :anchor-node-id="contextMenuAnchorNodeId"
        :delete-tag-confirm-open="deleteTagConfirmOpen"
        :delete-tag-name="deleteTagName"
        :menu-pointer-position="nodeMenuPointerPosition"
        :on-add-new-click="onAddNewDocumentFromContextMenuClick"
        :on-add-new-document-to-this-tag-click="onAddNewDocumentToThisTagFromContextMenuClick"
        :on-add-new-document-under-this-click="onAddNewDocumentUnderThisFromContextMenuClick"
        :on-collapse-all-click="onCollapseAllUnderNodeClick"
        :on-confirm-delete-tag="onConfirmDeleteTag"
        :on-confirm-rename-tag="onConfirmRenameTag"
        :on-copy-background-color-click="onCopyBackgroundColorFromContextMenuClick"
        :on-copy-document-click="onCopyDocumentFromContextMenuClick"
        :on-copy-name-click="onCopyNameFromContextMenuClick"
        :on-copy-text-color-click="onCopyTextColorFromContextMenuClick"
        :on-delete-document-click="onDeleteDocumentFromContextMenuClick"
        :on-delete-tag-click="onDeleteTagFromContextMenuClick"
        :on-dismiss-delete-tag-dialog="onDismissDeleteTagDialog"
        :on-dismiss-rename-tag-dialog="onDismissRenameTagDialog"
        :on-edit-document-click="onEditDocumentFromContextMenuClick"
        :on-expand-all-click="onExpandAllUnderNodeClick"
        :on-hide="onNodeContextMenuHide"
        :on-open-document-click="onOpenDocumentFromContextMenuClick"
        :on-rename-tag-click="onRenameTagFromContextMenuClick"
        :on-sort-by-item-click="onSortByItemFromContextMenuClick"
        :rename-tag-can-confirm="renameTagCanConfirm"
        :rename-tag-current-name="renameTagCurrentName"
        :rename-tag-dialog-open="renameTagDialogOpen"
        :rename-tag-merge-warning="renameTagMergeWarning"
        :shows-bulk-expand-rows="contextMenuShowsBulkExpandRows"
        :shows-copy-rows="contextMenuShowsCopyRows"
        :shows-document-open-edit-rows="contextMenuShowsDocumentOpenEditRows"
        :shows-sort-by-rows="contextMenuShowsSortByRows"
        :sort-by-direct-scope-only="contextMenuSortByDirectScopeOnly"
        :shows-tag-menu-rows="contextMenuShowsTagMenuRows"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Draggable } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'

import ProjectHierarchyTreeDocumentButtonGroup from './ProjectHierarchyTreeDocumentButtonGroup.vue'
import ProjectHierarchyTreeNode from './ProjectHierarchyTreeNode.vue'
import ProjectHierarchyTreeNodeMenusHost from './ProjectHierarchyTreeNodeMenusHost.vue'
import ProjectHierarchyTreeOpenIcon from './ProjectHierarchyTreeOpenIcon.vue'
import ProjectHierarchyTreeProjectNameTitle from './ProjectHierarchyTreeProjectNameTitle.vue'
import type {
  I_faProjectHierarchyTreeHeTreeInstance
} from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS,
  PROJECT_HIERARCHY_TREE_DRAG_OPEN_DELAY_MS,
  PROJECT_HIERARCHY_TREE_INDENT_PX,
  PROJECT_HIERARCHY_TREE_LINE_OFFSET_PX
} from './functions/projectHierarchyTreeConstants'
import { projectHierarchyTreeNodeShowsOpenIcon } from './functions/projectHierarchyTreeDocumentHasChildrenSync'
import { projectHierarchyTreeNodeShowsDocumentButtonGroup, resolveProjectHierarchyTreeDocumentButtonVisibilityForNode } from './functions/projectHierarchyTreeDocumentButtonVisibility'
import { resolveProjectHierarchyTreeNodeRowKindClass } from './functions/projectHierarchyTreeTreeNodeKindClass'
import { useProjectHierarchyTree } from './scripts/projectHierarchyTree_manager'

defineOptions({ name: 'ProjectHierarchyTree' })
const emit = defineEmits<{
  'document-open-request': [
    documentId: string,
    mode: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode,
    treeMeta: import('app/types/I_faOpenedDocumentsDomain').I_faOpenedDocumentTreeOpenMeta
  ]
}>()
const treeScrollHostRef = ref<HTMLElement | null>(null)
const treeComponentRef = ref<I_faProjectHierarchyTreeHeTreeInstance | null>(null)

const {
  activeDocumentId,
  addDocumentPlacementOptions,
  contextMenuAddNewRowIcon,
  contextMenuAddNewRowLabel,
  contextMenuAnchorNodeId,
  contextMenuShowsBulkExpandRows,
  contextMenuShowsCopyRows,
  contextMenuShowsDocumentOpenEditRows,
  contextMenuShowsSortByRows,
  contextMenuSortByDirectScopeOnly,
  contextMenuShowsTagMenuRows,
  deleteTagConfirmOpen,
  deleteTagName,
  documentButtonVisibility,
  eachDraggableHandler,
  eachDroppableHandler,
  heTreeNodeKey,
  isOpenIconExpandAnimationPending,
  isNodeContextMenuOpen,
  isProjectHierarchyTreeOpenIconExpandedForOpenIcon,
  isTreeDragActive,
  nodeMenuPointerPosition,
  onAddNewDocumentFromContextMenuClick,
  onAddNewDocumentToThisTagFromContextMenuClick,
  onAddNewDocumentUnderThisFromContextMenuClick,
  onCollapseAllUnderNodeClick,
  onConfirmDeleteTag,
  onConfirmRenameTag,
  onCopyBackgroundColorFromContextMenuClick,
  onCopyDocumentFromContextMenuClick,
  onCopyNameFromContextMenuClick,
  onCopyTextColorFromContextMenuClick,
  onDeleteDocumentFromContextMenuClick,
  onDeleteTagFromContextMenuClick,
  onDismissDeleteTagDialog,
  onDismissRenameTagDialog,
  onDocumentRowAddUnderButtonClick,
  onDocumentRowAuxClick,
  onDocumentRowEditButtonClick,
  onDocumentRowOpenButtonClick,
  onEditDocumentFromContextMenuClick,
  onExpandAllUnderNodeClick,
  onNodeClick,
  onNodeClose,
  onNodeContextMenuHide,
  onNodeOpen,
  onNodeRowContextMenu,
  onOpenDocumentFromContextMenuClick,
  onRenameTagFromContextMenuClick,
  onSortByItemFromContextMenuClick,
  renameTagCanConfirm,
  renameTagCurrentName,
  renameTagDialogOpen,
  renameTagMergeWarning,
  renameTagNameDraft,
  onNonWorldOpenIconClick,
  onNonWorldOpenIconPointerDown,
  onWorldNodeRowClick,
  onWorldNodeRowPointerDown,
  onBeforeDragOpen,
  onTreeAfterDrop,
  onBeforeDragStart,
  onTreeDataUpdate,
  onTreeDragEndCleanup,
  projectDisplayName,
  resolveOrderNumberBadgeLabelForNode,
  resolvePlacementCountDisplayForNode,
  showsProjectNameTitle,
  rootDroppableHandler,
  setTreeComponentRef,
  setTreeScrollHostRef,
  showsTreeLines,
  treeData,
  treeRootClassList,
  treeStyle,
  usesExtraTreePadding
} = useProjectHierarchyTree({
  onDocumentOpenRequest: (documentId, mode, treeMeta) => {
    emit('document-open-request', documentId, mode, treeMeta)
  }
})

watch(treeScrollHostRef, (element) => { setTreeScrollHostRef(element) }, { immediate: true })
watch(treeComponentRef, (instance) => { setTreeComponentRef(instance) }, { immediate: true })
</script>

<style lang="scss" src="./styles/ProjectHierarchyTree.unscoped.scss"></style>
