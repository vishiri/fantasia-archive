<template>
  <div
    class="dialogProjectSettingsWorldTemplateLayoutTreeNode__labelArea row items-center no-wrap col"
    :data-test-locator="`${props.nodeTestLocator}-labelArea`"
  >
    <q-icon
      class="dialogProjectSettingsWorldTemplateLayoutTreeNode__icon fa-color-glyph"
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
import { storeToRefs } from 'pinia'

import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_projectHierarchyTreePlacementCountDisplay } from 'app/types/I_projectHierarchyTreePlacementCount'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import ProjectHierarchyTreePlacementCount from 'app/src/components/projectUI/ProjectHierarchyTree/ProjectHierarchyTreePlacementCount.vue'
import { resolveProjectHierarchyTreePlacementCountSegments } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreePlacementCountSegments'
import { resolveProjectHierarchyTreePlacementCountVisibility } from 'app/src/components/projectUI/ProjectHierarchyTree/functions/projectHierarchyTreePlacementCountVisibility'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

defineOptions({
  name: 'DialogProjectSettingsWorldTemplateLayoutTreeNodeLabelArea'
})

const props = defineProps<{
  displayIconName: string
  node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  nodeTestLocator: string
}>()

const { appSettingsDialogPreview, settings } = storeToRefs(S_FaUserSettings())

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
  const visibility = resolveProjectHierarchyTreePlacementCountVisibility(
    settings.value,
    appSettingsDialogPreview.value,
    {
      disableCategoryCount: FA_USER_SETTINGS_DEFAULTS.disableCategoryCount,
      disableDocumentCounts: FA_USER_SETTINGS_DEFAULTS.disableDocumentCounts,
      doubleDashDocCount: FA_USER_SETTINGS_DEFAULTS.doubleDashDocCount,
      invertCategoryPosition: FA_USER_SETTINGS_DEFAULTS.invertCategoryPosition
    }
  )
  const display = resolveProjectHierarchyTreePlacementCountSegments({
    categoryCount,
    disableCategoryCount: visibility.disableCategoryCount,
    disableDocumentCounts: visibility.disableDocumentCounts,
    documentCount,
    doubleDashDocCount: visibility.doubleDashDocCount,
    invertCategoryPosition: visibility.invertCategoryPosition
  })
  return {
    categoryCount,
    display,
    documentCount
  }
})
</script>
