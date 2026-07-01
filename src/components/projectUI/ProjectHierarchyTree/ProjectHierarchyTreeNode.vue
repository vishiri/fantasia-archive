<template>
  <div
    v-if="!isLazyPlaceholder"
    ref="nodeRootRef"
    class="projectHierarchyTreeNode q-hoverable relative-position row items-center no-wrap"
    :class="nodeRootClassList"
    :data-test-hierarchy-node-id="props.node.id"
    :data-test-locator="nodeTestLocator"
    :data-test-node-kind="props.node.nodeKind"
    :style="worldNodeStyle"
  >
    <div
      class="q-focus-helper"
      tabindex="-1"
    />
    <q-icon
      v-if="displayIcon !== ''"
      class="projectHierarchyTreeNode__icon"
      :class="{ 'projectHierarchyTreeNode__icon--layoutKind': props.node.nodeKind !== 'world' }"
      :name="displayIcon"
    />
    <span
      class="projectHierarchyTreeNode__label"
      :data-test-locator="`${nodeTestLocator}-label`"
    >
      {{ props.node.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import {
  applyProjectHierarchyTreeTreeNodeKindClass,
  clearProjectHierarchyTreeTreeNodeKindClass
} from './scripts/projectHierarchyTree_manager'

defineOptions({
  name: 'ProjectHierarchyTreeNode'
})

const props = defineProps<{
  node: I_faProjectHierarchyTreeHeTreeNode
  stat: {
    open: boolean
  }
}>()

const nodeRootRef = ref<HTMLElement | null>(null)

function syncHeTreeRowKindClass (): void {
  applyProjectHierarchyTreeTreeNodeKindClass(nodeRootRef.value, props.node.nodeKind)
}

onMounted(syncHeTreeRowKindClass)
onUpdated(syncHeTreeRowKindClass)
watch(() => props.node.nodeKind, syncHeTreeRowKindClass)
onBeforeUnmount(() => {
  clearProjectHierarchyTreeTreeNodeKindClass(nodeRootRef.value)
})

const isLazyPlaceholder = computed(() => {
  return props.node.id.endsWith('__lazy')
})

const nodeTestLocator = computed(() => {
  return `projectHierarchyTree-node-${props.node.nodeKind}`
})

const nodeRootClassList = computed(() => {
  return {
    'projectHierarchyTreeNode--document': props.node.nodeKind === 'document',
    'projectHierarchyTreeNode--group': props.node.nodeKind === 'group',
    'projectHierarchyTreeNode--documentTemplate': props.node.nodeKind === 'templatePlacement',
    'projectHierarchyTreeNode--world': props.node.nodeKind === 'world'
  }
})

const displayIcon = computed(() => {
  if (props.node.nodeKind === 'world') {
    return 'mdi-earth'
  }
  return props.node.icon
})

const worldNodeStyle = computed(() => {
  if (props.node.nodeKind !== 'world') {
    return undefined
  }
  return {
    color: props.node.worldColor
  }
})
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeNode.unscoped.scss"></style>

<style lang="scss" scoped>
.projectHierarchyTreeNode {
  &__label {
    flex: 1;
    min-width: 0;
    word-break: break-word;
  }
}
</style>
