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
  > | </span><span
    :class="segment.kind === 'document'
      ? 'projectHierarchyTreePlacementCount__docCount text-primary-bright'
      : 'projectHierarchyTreePlacementCount__catCount'"
    :data-test-locator="`${testLocator}-${segment.kind}`"
  >{{ segment.value }}</span></template>)<q-tooltip :delay="500">
    <div data-test-locator="projectHierarchyTree-placementCountTooltip">
      {{ totalCountLabel }}
      <span class="text-bold text-primary-bright">{{ totalCount }}</span>
      <br>
      {{ documentCountLabel }}
      <span class="text-bold text-primary-bright">{{ documentCount }}</span>
      <br>
      {{ categoryCountLabel }}
      <span class="text-bold text-primary-bright">{{ categoryCount }}</span>
    </div>
  </q-tooltip>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import type { I_projectHierarchyTreePlacementCountDisplay } from 'app/types/I_projectHierarchyTreePlacementCount'

const props = defineProps<{
  categoryCount: number
  display: I_projectHierarchyTreePlacementCountDisplay
  documentCount: number
  testLocator?: string
}>()

const { t } = useI18n()

const testLocator = computed(() => {
  return props.testLocator ?? 'projectHierarchyTree-placementCount'
})

const totalCount = computed(() => {
  return props.documentCount + props.categoryCount
})

const totalCountLabel = computed(() => {
  return t('projectUI.projectHierarchyTree.placementCountTooltip.totalCount')
})

const documentCountLabel = computed(() => {
  return t('projectUI.projectHierarchyTree.placementCountTooltip.documentCount')
})

const categoryCountLabel = computed(() => {
  return t('projectUI.projectHierarchyTree.placementCountTooltip.categoryCount')
})
</script>
