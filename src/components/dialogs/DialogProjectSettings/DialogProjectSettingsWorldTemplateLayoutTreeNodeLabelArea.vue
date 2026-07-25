<template>
  <div
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode__labelArea row items-center no-wrap col"
    :data-test-locator="`${props.nodeTestLocator}-labelArea`"
  >
    <q-icon
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__icon"
      :class="{ 'dialogProjectSettingsWorldTemplateLayoutTreeNode__icon--nickname': props.node.usesNickname }"
      :name="props.displayIconName"
    />
    <span
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__label ellipsis"
      :class="{ 'dialogProjectSettingsWorldTemplateLayoutTreeNode__label--nickname': props.node.usesNickname }"
    >
      {{ props.node.label }}
    </span>
    <ProjectHierarchyTreePlacementCount
      v-if="placementCountBinding !== null"
      :category-count="placementCountBinding.categoryCount"
      :display="placementCountBinding.display"
      :document-count="placementCountBinding.documentCount"
      :test-locator="`${props.nodeTestLocator}-count`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_projectHierarchyTreePlacementCountDisplay } from 'app/types/I_projectHierarchyTreePlacementCount'
import ProjectHierarchyTreePlacementCount from 'app/src/components/projectUI/ProjectHierarchyTree/ProjectHierarchyTreePlacementCount.vue'
import { resolveProjectHierarchyTreePlacementCountSegments } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreePlacementCountSegments'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea'
})

const props = defineProps<{
  displayIconName: string
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  nodeTestLocator: string
}>()

const placementCountBinding = computed((): {
  categoryCount: number
  display: I_projectHierarchyTreePlacementCountDisplay
  documentCount: number
} | null => {
  if (props.node.nodeKind !== 'template') {
    return null
  }
  const categoryCount = props.node.categoryCountInWorld
  const documentCount = props.node.documentCountInWorld
  if (categoryCount + documentCount <= 0) {
    return null
  }
  const display = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount,
    disableCategoryCount: false,
    disableDocumentCounts: false,
    documentCount,
    invertCategoryPosition: false
  })
  return {
    categoryCount,
    display,
    documentCount
  }
})
</script>
