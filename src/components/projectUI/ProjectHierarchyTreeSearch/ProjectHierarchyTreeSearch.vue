<template>
  <div
    class="projectHierarchyTreeSearch"
    :class="layoutModeClass"
    data-test-locator="projectHierarchyTreeSearch"
    :style="searchWrapperStyle"
  >
    <div class="projectHierarchyTreeSearch__inputHost">
      <q-input
        v-model="searchQuery"
        filled
        dark
        dense
        hide-bottom-space
        color="primary-bright"
        :label="$t('projectUI.projectHierarchyTreeSearch.label')"
        data-test-locator="projectHierarchyTreeSearch-input"
        @blur="isSearchFocused = false"
        @focus="isSearchFocused = true"
      >
        <template
          v-if="searchQuery !== ''"
          #prepend
        >
          <q-icon
            class="cursor-pointer text-secondary"
            data-test-locator="projectHierarchyTreeSearch-clear"
            name="clear"
            @click="clearSearchQuery"
          />
        </template>
        <template #append>
          <q-icon
            class="projectHierarchyTreeSearch__appendIcon"
            name="mdi-text-search"
          />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useProjectHierarchyTreeSearch } from './scripts/projectHierarchyTreeSearch_manager'

defineOptions({
  name: 'ProjectHierarchyTreeSearch'
})

const {
  clearSearchQuery,
  isSearchFocused,
  layoutMode,
  searchQuery,
  searchWrapperStyle
} = useProjectHierarchyTreeSearch()

const layoutModeClass = computed(() => {
  return `projectHierarchyTreeSearch--layout${layoutMode.value.charAt(0).toUpperCase()}${layoutMode.value.slice(1)}`
})
</script>

<style lang="scss" src="./styles/ProjectHierarchyTreeSearch.unscoped.scss"></style>
