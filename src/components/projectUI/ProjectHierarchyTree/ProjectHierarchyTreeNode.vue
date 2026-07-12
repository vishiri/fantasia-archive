<template>
  <div
    v-if="!isLazyPlaceholder"
    ref="nodeRootRef"
    class="projectHierarchyTreeNode q-hoverable relative-position row items-center no-wrap"
    :class="nodeRootClassList"
    :data-test-hierarchy-node-id="props.node.id"
    :data-test-locator="nodeTestLocator"
    :data-test-node-kind="props.node.nodeKind"
    :style="nodeRootBackgroundStyle"
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
      :style="nodeIconLabelTextStyle"
    />
    <span
      class="projectHierarchyTreeNode__label"
      :data-test-locator="`${nodeTestLocator}-label`"
      :style="nodeIconLabelTextStyle"
    >
      {{ props.node.label }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import { projectHierarchyTreeNodeShowsActiveTabHighlight } from './functions/projectHierarchyTreeActiveTabHighlight'
import {
  applyProjectHierarchyTreeTreeNodeKindClass,
  clearProjectHierarchyTreeTreeNodeKindClass,
  resolveProjectHierarchyTreeDocumentAppearanceChrome,
  resolveProjectHierarchyTreePlacementDisplayIcon
} from './scripts/projectHierarchyTree_manager'

defineOptions({
  name: 'ProjectHierarchyTreeNode'
})

const props = withDefaults(
  defineProps<{
    activeDocumentId?: string | null
    node: I_faProjectHierarchyTreeHeTreeNode
    stat: {
      open: boolean
    }
  }>(),
  {
    activeDocumentId: null
  }
)

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
  const showsActiveTabHighlight = projectHierarchyTreeNodeShowsActiveTabHighlight(
    props.node,
    props.activeDocumentId
  )

  return {
    'projectHierarchyTreeNode--activeTabDocument': showsActiveTabHighlight,
    'projectHierarchyTreeNode--addNewDocument': props.node.nodeKind === 'addNewDocument',
    'projectHierarchyTreeNode--customDocumentAppearance': hasCustomDocumentAppearance.value,
    'projectHierarchyTreeNode--customDocumentBackground': hasCustomDocumentBackground.value,
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
  if (props.node.nodeKind === 'templatePlacement' || props.node.nodeKind === 'document') {
    return resolveProjectHierarchyTreePlacementDisplayIcon(props.node.icon)
  }
  if (props.node.nodeKind === 'addNewDocument') {
    return props.node.icon
  }
  return props.node.icon
})

const documentAppearanceChrome = computed(() => {
  return resolveProjectHierarchyTreeDocumentAppearanceChrome(props.node)
})

const hasCustomDocumentAppearance = computed(() => {
  return documentAppearanceChrome.value !== undefined
})

const hasCustomDocumentBackground = computed(() => {
  return documentAppearanceChrome.value?.backgroundColor !== undefined
})

const nodeRootBackgroundStyle = computed(() => {
  const backgroundColor = documentAppearanceChrome.value?.backgroundColor
  if (backgroundColor === undefined) {
    return undefined
  }
  return {
    '--projectHierarchyTreeNode-focusHelperColor': backgroundColor,
    backgroundColor
  }
})

const nodeIconLabelTextStyle = computed(() => {
  if (props.node.nodeKind === 'world') {
    return {
      color: props.node.worldColor
    }
  }

  const textColor = documentAppearanceChrome.value?.color
  if (textColor === undefined) {
    return undefined
  }

  return {
    color: textColor
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
