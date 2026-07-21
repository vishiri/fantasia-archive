<template>
  <h5
    class="projectHierarchyTree__projectName text-h5 q-my-none"
    data-test-locator="projectHierarchyTree-projectName"
  >
    {{ projectDisplayName }}
  </h5>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeProjectNameTitle'
})

defineProps<{
  projectDisplayName: string
}>()
</script>
