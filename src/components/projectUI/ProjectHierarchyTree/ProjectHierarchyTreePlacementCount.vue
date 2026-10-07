<template>
  <span
    v-if="display.shows"
    class="projectHierarchyTreePlacementCount text-weight-medium q-ml-xs"
    :data-test-locator="testLocator"
  >(<template
    v-for="(segment, index) in display.segments"
    :key="segment.kind"
  ><span
    v-if="index > 0 && display.showDivider"
    class="projectHierarchyTreePlacementCount__divider"
  >{{ display.doubleDashDivider ? ' || ' : ' | ' }}</span><span
    :class="segment.kind === 'document'
      ? 'projectHierarchyTreePlacementCount__docCount text-primary-bright'
      : 'projectHierarchyTreePlacementCount__catCount'"
    :data-test-locator="`${testLocator}-${segment.kind}`"
  >{{ segment.value }}</span></template>)<q-tooltip>
    <div data-test-locator="projectHierarchyTree-placementCountTooltip">
      {{ $t('projectUI.projectHierarchyTree.placementCountTooltip.totalCount') }}
      <span class="projectHierarchyTreePlacementCount__tooltipValue text-bold">{{ totalCount }}</span>
      <br>
      {{ $t('projectUI.projectHierarchyTree.placementCountTooltip.documentCount') }}
      <span class="projectHierarchyTreePlacementCount__tooltipValue text-bold">{{ documentCount }}</span>
      <br>
      {{ $t('projectUI.projectHierarchyTree.placementCountTooltip.categoryCount') }}
      <span class="projectHierarchyTreePlacementCount__tooltipValue text-bold">{{ categoryCount }}</span>
    </div>
  </q-tooltip>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { I_projectHierarchyTreePlacementCountDisplay } from 'app/types/I_projectHierarchyTreePlacementCount'

const props = defineProps<{
  categoryCount: number
  display: I_projectHierarchyTreePlacementCountDisplay
  documentCount: number
  testLocator?: string
}>()

const testLocator = computed(() => {
  return props.testLocator ?? 'projectHierarchyTree-placementCount'
})

const totalCount = computed(() => {
  return props.documentCount + props.categoryCount
})
</script>

<style lang="scss">
@use './styles/variables' as *;

.projectHierarchyTreePlacementCount {
  color: $projectHierarchyTree-placementCount-color;
  margin-left: $projectHierarchyTree-placementCount-marginLeft;
}

.projectHierarchyTreePlacementCount__catCount {
  color: $projectHierarchyTree-placementCount-catCount-color;
}

.projectHierarchyTreePlacementCount__tooltipValue {
  color: $projectHierarchyTree-placementCount-tooltipValue-color;
}
</style>
