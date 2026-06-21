<template>
  <Draggable
    ref="treeScrollRef"
    :key="treeLayoutSyncKey"
    :model-value="treeData"
    class="dialogProjectSettingsWorldTemplateLayoutTree hasScrollbar"
    :class="treeRootClassList"
    :each-draggable="eachDraggableHandler"
    :each-droppable="eachDroppableHandler"
    data-test-locator="dialogProjectSettings-worldTemplateLayoutTree"
    :indent="DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_INDENT_PX"
    :max-level="2"
    :root-droppable="rootDroppableHandler"
    :style="treeStyle"
    virtualization
    @after-drop="treeWiring.onTreeAfterDrop"
    @before-drag-start="treeWiring.onBeforeDragStart"
    @dragend="treeWiring.onTreeDragEndCleanup"
    @update:model-value="treeWiring.onTreeDataUpdate"
  >
    <template #default="{ node }">
      <DialogProjectSettingsWorldTemplateLayoutTreeNode
        :blank-group-ids="props.blankGroupIds"
        :duplicate-document-template-ids="props.duplicateDocumentTemplateIds"
        :invalid-document-template-ids="props.invalidDocumentTemplateIds"
        :node="node"
        @delete-group="emitDeleteGroup"
        @remove-placement="emitRemovePlacement"
        @rename-placement-nickname="emitRenamePlacementNickname"
        @rename-group="emitRenameGroup"
      />
    </template>
  </Draggable>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, provide, ref, watch } from 'vue'
import { Draggable, dragContext } from '@he-tree/vue'
import '@he-tree/vue/style/default.css'

import DialogProjectSettingsWorldTemplateLayoutTreeNode from './DialogProjectSettingsWorldTemplateLayoutTreeNode.vue'
import type { I_dialogProjectSettingsWorldTemplateLayoutDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'
import {
  DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_INDENT_PX,
  DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ITEM_SELECTOR,
  countDialogProjectSettingsWorldTemplateLayoutDraftNodes,
  mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey
} from './scripts/functions/dialogProjectSettingsWorldTemplateLayoutTreeData'
import { createDialogProjectSettingsWorldTemplateLayoutTreeWiring } from './scripts/dialogProjectSettingsWorldTemplateLayoutTreeWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring } from './scripts/dialogProjectSettingsWorldTemplateLayoutTreeSyncWiring'
import { createDialogProjectSettingsScrollOnAppendWatch } from './scripts/dialogProjectSettingsScrollOnAppendWiring'
import { resolveVueComponentRootElement } from 'app/src/scripts/dom/functions/resolveVueComponentRootElement'
import {
  isDialogProjectSettingsWorldTemplateLayoutNodeDraggable,
  isDialogProjectSettingsWorldTemplateLayoutNodeDroppable,
  isDialogProjectSettingsWorldTemplateLayoutRootDroppable
} from './scripts/functions/dialogProjectSettingsWorldTemplateLayoutDnD'
import {
  dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey
} from './scripts/dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTree'
})

const props = defineProps<{
  blankGroupIds?: ReadonlySet<string>
  duplicateDocumentTemplateIds?: ReadonlySet<string>
  invalidDocumentTemplateIds?: ReadonlySet<string>
  templateLayout: I_dialogProjectSettingsWorldTemplateLayoutDraft
}>()

const emit = defineEmits<{
  deleteGroup: [groupId: string]
  removePlacement: [placementId: string]
  renamePlacementNickname: [placementId: string, nickname: string]
  renameGroup: [groupId: string, displayName: string]
  'update:templateLayout': [layout: I_dialogProjectSettingsWorldTemplateLayoutDraft]
}>()

const treeData = ref<I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode[]>([])
const treeScrollRef = ref<unknown>(null)
const suppressTreeEmit = ref(false)
const isTreeDragActive = ref(false)
const dragCommitPending = ref(false)
const dragCommitScheduled = ref(false)
const dragDropCommitted = ref(false)

const openRenameMenuTarget = ref<string | null>(null)
provide(dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey, openRenameMenuTarget)

const treeSyncWiring = createDialogProjectSettingsWorldTemplateLayoutTreeSyncWiring({
  emitTemplateLayout: (layout) => emit('update:templateLayout', layout),
  getTemplateLayout: () => props.templateLayout,
  nextTick,
  suppressTreeEmit,
  treeData
})

const treeWiring = createDialogProjectSettingsWorldTemplateLayoutTreeWiring({
  dragCommitPending,
  dragCommitScheduled,
  dragDropCommitted,
  emitLayoutFromTreeDataIfChanged: treeSyncWiring.emitLayoutFromTreeDataIfChanged,
  isTreeDragActive,
  nextTick,
  resyncTreeDataFromProps: treeSyncWiring.resyncTreeDataFromProps,
  suppressTreeEmit,
  treeData
})

const treeLayoutSyncKey = computed(() => {
  return mapDialogProjectSettingsWorldTemplateLayoutToTreeStructureKey(props.templateLayout)
})

const treeRootClassList = computed(() => {
  return {
    'dialogProjectSettingsWorldTemplateLayoutTree--listDragging': isTreeDragActive.value
  }
})

const treeStyle = computed(() => {
  return {
    height: '100%'
  }
})

watch(() => props.templateLayout, () => {
  treeWiring.resyncTreeDataFromProps()
}, {
  deep: true,
  immediate: true
})

createDialogProjectSettingsScrollOnAppendWatch({
  getCount: () => countDialogProjectSettingsWorldTemplateLayoutDraftNodes(props.templateLayout),
  getScrollContainer: () => resolveVueComponentRootElement(treeScrollRef.value),
  itemSelector: DIALOG_PROJECT_SETTINGS_WORLD_TEMPLATE_LAYOUT_TREE_NODE_ITEM_SELECTOR,
  nextTick,
  requestAnimationFrame: (callback) => window.requestAnimationFrame(callback),
  watch
})

function eachDraggableHandler (stat: { data: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode }): boolean {
  return isDialogProjectSettingsWorldTemplateLayoutNodeDraggable(stat.data)
}

function eachDroppableHandler (stat: { data: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode }): boolean {
  return isDialogProjectSettingsWorldTemplateLayoutNodeDroppable(stat.data, dragContext)
}

function rootDroppableHandler (): boolean {
  return isDialogProjectSettingsWorldTemplateLayoutRootDroppable(dragContext)
}

onUnmounted(() => {
  treeWiring.onUnmountedCleanup()
})

function emitDeleteGroup (groupId: string): void {
  emit('deleteGroup', groupId)
}

function emitRenameGroup (groupId: string, displayName: string): void {
  emit('renameGroup', groupId, displayName)
}

function emitRenamePlacementNickname (placementId: string, nickname: string): void {
  emit('renamePlacementNickname', placementId, nickname)
}

function emitRemovePlacement (placementId: string): void {
  emit('removePlacement', placementId)
}
</script>

<style lang="scss" src="./styles/DialogProjectSettings.worldTemplateLayoutTree.unscoped.scss"></style>
