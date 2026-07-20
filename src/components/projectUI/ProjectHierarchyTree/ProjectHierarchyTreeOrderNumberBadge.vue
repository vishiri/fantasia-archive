<template>
  <q-badge
    class="projectHierarchyTreeOrderNumberBadge"
    data-test-locator="projectHierarchyTree-orderNumberBadge"
    floating
  >
    {{ props.label }}
    <q-tooltip :delay="500">
      {{ tooltipText }}
    </q-tooltip>
  </q-badge>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ProjectHierarchyTreeOrderNumberBadge'
})

const props = defineProps<{
  label: string
}>()

const { t } = useI18n()

const tooltipText = computed(() => {
  return t('projectUI.projectHierarchyTree.orderNumberBadgeTooltip')
})
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeOrderNumberBadge.unscoped.scss"></style>
