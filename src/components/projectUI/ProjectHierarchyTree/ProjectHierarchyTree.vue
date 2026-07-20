<template>
  <div
    ref="treeScrollHostRef"
    class="projectHierarchyTreeHost"
    data-test-locator="projectHierarchyTree-host"
  >
    <Draggable
      v-if="treeData.length > 0"
      :key="treeMountKey"
      ref="treeComponentRef"
      :model-value="treeData"
      class="projectHierarchyTree hasScrollbar"
      :class="treeRootClassList"
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
                :shows-add-under="documentButtonVisibility.showsAddUnder"
                :shows-edit="documentButtonVisibility.showsEdit"
                :shows-open="documentButtonVisibility.showsOpen"
                @add-under-activate="onDocumentRowAddUnderButtonClick(node)"
                @edit-activate="onDocumentRowEditButtonClick(node)"
                @open-activate="onDocumentRowOpenButtonClick(node)"
              />
            </template>
          </ProjectHierarchyTreeNode>
        </div>
      </template>
    </Draggable>
    <ProjectHierarchyTreeNodeContextMenu
      v-model:is-open="isNodeContextMenuOpen"
      :add-new-row-icon="contextMenuAddNewRowIcon"
      :add-new-row-label="contextMenuAddNewRowLabel"
      :anchor-node-id="contextMenuAnchorNodeId"
      :menu-pointer-position="nodeMenuPointerPosition"
      :on-add-new-click="onAddNewDocumentFromContextMenuClick"
      :on-add-new-document-under-this-click="onAddNewDocumentUnderThisFromContextMenuClick"
      :on-collapse-all-click="onCollapseAllUnderNodeClick"
      :on-copy-background-color-click="onCopyBackgroundColorFromContextMenuClick"
      :on-copy-document-click="onCopyDocumentFromContextMenuClick"
      :on-copy-name-click="onCopyNameFromContextMenuClick"
      :on-copy-text-color-click="onCopyTextColorFromContextMenuClick"
      :on-delete-document-click="onDeleteDocumentFromContextMenuClick"
      :on-edit-document-click="onEditDocumentFromContextMenuClick"
      :on-expand-all-click="onExpandAllUnderNodeClick"
      :on-hide="onNodeContextMenuHide"
      :on-open-document-click="onOpenDocumentFromContextMenuClick"
      :on-sort-by-item-click="onSortByItemFromContextMenuClick"
      :shows-bulk-expand-rows="contextMenuShowsBulkExpandRows"
      :shows-copy-rows="contextMenuShowsCopyRows"
      :shows-sort-by-rows="contextMenuShowsSortByRows"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Draggable } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'

import ProjectHierarchyTreeDocumentButtonGroup from './ProjectHierarchyTreeDocumentButtonGroup.vue'
import ProjectHierarchyTreeNode from './ProjectHierarchyTreeNode.vue'
import ProjectHierarchyTreeNodeContextMenu from './ProjectHierarchyTreeNodeContextMenu.vue'
import ProjectHierarchyTreeOpenIcon from './ProjectHierarchyTreeOpenIcon.vue'
import type {
  I_faProjectHierarchyTreeHeTreeInstance,
  I_faProjectHierarchyTreeHeTreeNode
} from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS,
  PROJECT_HIERARCHY_TREE_DRAG_OPEN_DELAY_MS,
  PROJECT_HIERARCHY_TREE_INDENT_PX,
  PROJECT_HIERARCHY_TREE_LINE_OFFSET_PX
} from './functions/projectHierarchyTreeConstants'
import { projectHierarchyTreeNodeShowsOpenIcon } from './functions/projectHierarchyTreeDocumentHasChildrenSync'
import { projectHierarchyTreeNodeShowsDocumentButtonGroup } from './functions/projectHierarchyTreeDocumentButtonVisibility'
import { resolveProjectHierarchyTreeNodeRowKindClass } from './functions/projectHierarchyTreeTreeNodeKindClass'
import { resolveFaDocumentTreeOrderNumberBadgeLabel } from 'app/src/scripts/openedDocuments/functions/openedDocumentTreeOrderNumber'
import { useProjectHierarchyTree } from './scripts/projectHierarchyTree_manager'

defineOptions({
  name: 'ProjectHierarchyTree'
})

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
  contextMenuAddNewRowIcon,
  contextMenuAddNewRowLabel,
  contextMenuAnchorNodeId,
  contextMenuShowsBulkExpandRows,
  contextMenuShowsCopyRows,
  contextMenuShowsSortByRows,
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
  onAddNewDocumentUnderThisFromContextMenuClick,
  onCollapseAllUnderNodeClick,
  onCopyBackgroundColorFromContextMenuClick,
  onCopyDocumentFromContextMenuClick,
  onCopyNameFromContextMenuClick,
  onCopyTextColorFromContextMenuClick,
  onDeleteDocumentFromContextMenuClick,
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
  onSortByItemFromContextMenuClick,
  onNonWorldOpenIconClick,
  onNonWorldOpenIconPointerDown,
  onWorldNodeRowClick,
  onWorldNodeRowPointerDown,
  onBeforeDragOpen,
  onTreeAfterDrop,
  onBeforeDragStart,
  onTreeDataUpdate,
  onTreeDragEndCleanup,
  resolvePlacementCountDisplayForCounts,
  showsOrderNumberBadge,
  rootDroppableHandler,
  setTreeComponentRef,
  setTreeScrollHostRef,
  showsTreeLines,
  treeData,
  treeMountKey,
  treeRootClassList,
  treeStyle
} = useProjectHierarchyTree({
  onDocumentOpenRequest: (documentId, mode, treeMeta) => {
    emit('document-open-request', documentId, mode, treeMeta)
  }
})

function resolvePlacementCountDisplayForNode (
  node: I_faProjectHierarchyTreeHeTreeNode
): {
  categoryCount: number
  display: ReturnType<typeof resolvePlacementCountDisplayForCounts>
  documentCount: number
} | null {
  if (node.nodeKind !== 'templatePlacement') {
    return null
  }
  const documentCount = node.documentCount ?? 0
  const categoryCount = node.categoryCount ?? 0
  return {
    categoryCount,
    display: resolvePlacementCountDisplayForCounts({
      categoryCount,
      documentCount
    }),
    documentCount
  }
}

function resolveOrderNumberBadgeLabelForNode (
  node: I_faProjectHierarchyTreeHeTreeNode
): string | null {
  if (!showsOrderNumberBadge.value || node.nodeKind !== 'document') {
    return null
  }
  return resolveFaDocumentTreeOrderNumberBadgeLabel(node.treeOrderNumber)
}

watch(treeScrollHostRef, (element) => {
  setTreeScrollHostRef(element)
}, {
  immediate: true
})

watch(treeComponentRef, (instance) => {
  setTreeComponentRef(instance)
}, {
  immediate: true
})
</script>

<style lang="scss" src="./styles/ProjectHierarchyTree.unscoped.scss"></style>
