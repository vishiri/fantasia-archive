<template>
  <q-item
    v-close-popup
    clickable
    class="projectHierarchyTreeNodeContextMenu__item non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-expandAll"
    role="menuitem"
    @click="onExpandAllClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ expandAllUnderNodeLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-expand-all-outline"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectHierarchyTreeNodeContextMenu__separatorAlt"
    dark
    role="separator"
  />

  <q-item
    v-close-popup
    clickable
    class="projectHierarchyTreeNodeContextMenu__item non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-collapseAll"
    role="menuitem"
    @click="onCollapseAllClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ collapseAllUnderNodeLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-collapse-all-outline"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenuBulkRows'
})

defineProps<{
  collapseAllUnderNodeLabel: string
  expandAllUnderNodeLabel: string
  onCollapseAllClick: () => void
  onExpandAllClick: () => void
}>()
</script>
