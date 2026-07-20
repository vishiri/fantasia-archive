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
    <ProjectHierarchyTreeOrderNumberBadge
      v-if="orderNumberBadgeLabel !== null"
      :label="orderNumberBadgeLabel!"
    />
    <q-icon
      v-if="displayIcon !== ''"
      class="projectHierarchyTreeNode__icon"
      :class="{ 'projectHierarchyTreeNode__icon--layoutKind': props.node.nodeKind !== 'world' }"
      :name="displayIcon"
      :style="nodeIconLabelTextStyle"
    />
    <span
      v-if="showsFinishedMarker"
      class="projectHierarchyTreeNode__finishedMarker"
      :data-test-locator="`${nodeTestLocator}-finishedMarker`"
      :style="nodeIconLabelTextStyle"
    >✓</span>
    <span
      v-if="showsDeadMarker"
      class="projectHierarchyTreeNode__deadMarker"
      :data-test-locator="`${nodeTestLocator}-deadMarker`"
      :style="nodeIconLabelTextStyle"
    >†</span>
    <span
      class="projectHierarchyTreeNode__label"
      :class="{ 'projectHierarchyTreeNode__label--dead': showsDeadStrikethrough }"
      :data-test-locator="`${nodeTestLocator}-label`"
      :style="nodeIconLabelTextStyle"
    >
      {{ props.node.label }}
    </span>
    <ProjectHierarchyTreePlacementCount
      v-if="placementCountDisplay !== null"
      :category-count="placementCountDisplay!.categoryCount"
      :display="placementCountDisplay!.display"
      :document-count="placementCountDisplay!.documentCount"
    />
    <slot name="documentButtonGroup" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, watch } from 'vue'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_projectHierarchyTreePlacementCountDisplay } from 'app/types/I_projectHierarchyTreePlacementCount'
import { projectHierarchyTreeNodeShowsActiveTabHighlight } from './functions/projectHierarchyTreeActiveTabHighlight'
import ProjectHierarchyTreePlacementCount from './ProjectHierarchyTreePlacementCount.vue'
import ProjectHierarchyTreeOrderNumberBadge from './ProjectHierarchyTreeOrderNumberBadge.vue'
import {
  applyProjectHierarchyTreeTreeNodeKindClass,
  clearProjectHierarchyTreeTreeNodeKindClass,
  resolveProjectHierarchyTreeDocumentAppearanceChrome,
  resolveProjectHierarchyTreePlacementDisplayIcon,
  resolveProjectHierarchyTreeWorldDisplayColor
} from './scripts/projectHierarchyTree_manager'

defineOptions({
  name: 'ProjectHierarchyTreeNode'
})

const props = withDefaults(
  defineProps<{
    activeDocumentId?: string | null
    node: I_faProjectHierarchyTreeHeTreeNode
    orderNumberBadgeLabel?: string | null
    placementCountDisplay?: {
      categoryCount: number
      display: I_projectHierarchyTreePlacementCountDisplay
      documentCount: number
    } | null
    stat: {
      open: boolean
    }
  }>(),
  {
    activeDocumentId: null,
    orderNumberBadgeLabel: null,
    placementCountDisplay: null
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
  if (props.node.nodeKind === 'document' && props.node.isCategory === true) {
    return 'mdi-folder-open'
  }
  if (props.node.nodeKind === 'templatePlacement' || props.node.nodeKind === 'document') {
    return resolveProjectHierarchyTreePlacementDisplayIcon(props.node.icon)
  }
  if (props.node.nodeKind === 'addNewDocument') {
    return props.node.icon
  }
  return props.node.icon
})

const showsFinishedMarker = computed(() => {
  return props.node.nodeKind === 'document' && props.node.isFinished === true
})

const showsDeadMarker = computed(() => {
  return props.node.nodeKind === 'document' && props.node.isDead === true
})

const showsDeadStrikethrough = computed(() => {
  return showsDeadMarker.value
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
    '--projectHierarchyTreeNode-backgroundColor': backgroundColor,
    '--projectHierarchyTreeNode-focusHelperColor': backgroundColor,
    backgroundColor
  }
})

const nodeIconLabelTextStyle = computed(() => {
  if (props.node.nodeKind === 'world') {
    return {
      color: resolveProjectHierarchyTreeWorldDisplayColor(props.node.worldColor)
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
