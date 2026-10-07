<template>
  <q-badge
    class="projectHierarchyTreeOrderNumberBadge"
    data-test-locator="projectHierarchyTree-orderNumberBadge"
    floating
  >
    {{ props.label }}
    <q-tooltip>
      {{ $t('projectUI.projectHierarchyTree.orderNumberBadgeTooltip') }}
    </q-tooltip>
  </q-badge>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeOrderNumberBadge'
})

const props = defineProps<{
  label: string
}>()
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeOrderNumberBadge.unscoped.scss"></style>
