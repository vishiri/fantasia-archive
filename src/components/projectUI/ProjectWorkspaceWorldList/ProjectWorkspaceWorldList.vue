<template>
  <ul
    v-if="worldListItems.length > 0"
    class="projectWorkspaceWorldList"
    data-test-locator="projectWorkspaceWorldList"
  >
    <li
      v-for="world in worldListItems"
      :key="world.id"
      class="projectWorkspaceWorldList__item"
      :data-test-world-id="world.id"
      data-test-locator="projectWorkspaceWorldList-item"
    >
      {{ world.displayName }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useProjectWorkspaceWorldList } from './scripts/projectWorkspaceWorldList_manager'

defineOptions({
  name: 'ProjectWorkspaceWorldList'
})

const { worldListItems } = useProjectWorkspaceWorldList()
</script>

<style lang="scss" scoped>
.projectWorkspaceWorldList {
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    margin: 0;
    padding: 0;
  }
}
</style>
