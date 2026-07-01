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
          @click="onWorldNodeRowClick(node, stat, $event)"
          @pointerdown="onWorldNodeRowPointerDown(node, stat, $event)"
        >
          <q-icon
            v-if="projectHierarchyTreeNodeShowsOpenIcon(node, stat.children.length)"
            class="projectHierarchyTree__openIcon"
            :class="{ 'projectHierarchyTree__openIcon--open': stat.open }"
            data-test-locator="projectHierarchyTree-openIcon"
            name="play_arrow"
            @click.stop="onNonWorldOpenIconClick(node, stat)"
            @pointerdown.stop="onNonWorldOpenIconPointerDown(node, stat)"
          />
          <ProjectHierarchyTreeNode
            class="projectHierarchyTree__nodeContent"
            :node="node"
            :stat="stat"
          />
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Draggable } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'

import ProjectHierarchyTreeNode from './ProjectHierarchyTreeNode.vue'
import type { I_faProjectHierarchyTreeHeTreeInstance } from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  PROJECT_HIERARCHY_TREE_DRAG_HANDLE_CLASS,
  PROJECT_HIERARCHY_TREE_DRAG_OPEN_DELAY_MS,
  PROJECT_HIERARCHY_TREE_INDENT_PX
} from './functions/projectHierarchyTreeConstants'
import { projectHierarchyTreeNodeShowsOpenIcon } from './functions/projectHierarchyTreeDocumentHasChildrenSync'
import { useProjectHierarchyTree } from './scripts/projectHierarchyTree_manager'

defineOptions({
  name: 'ProjectHierarchyTree'
})

const emit = defineEmits<{
  'document-click': [documentId: string]
}>()

const treeScrollHostRef = ref<HTMLElement | null>(null)
const treeComponentRef = ref<I_faProjectHierarchyTreeHeTreeInstance | null>(null)

const {
  eachDraggableHandler,
  eachDroppableHandler,
  isTreeDragActive,
  onNodeClick,
  onNodeClose,
  onNodeOpen,
  onNonWorldOpenIconClick,
  onNonWorldOpenIconPointerDown,
  onWorldNodeRowClick,
  onWorldNodeRowPointerDown,
  onBeforeDragOpen,
  onTreeAfterDrop,
  onBeforeDragStart,
  onTreeDataUpdate,
  onTreeDragEndCleanup,
  rootDroppableHandler,
  setTreeComponentRef,
  setTreeScrollHostRef,
  treeData,
  treeMountKey,
  treeRootClassList,
  treeStyle
} = useProjectHierarchyTree({
  onDocumentClick: (documentId) => {
    emit('document-click', documentId)
  }
})

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
