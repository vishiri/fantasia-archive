<template>
  <q-item
    v-close-popup
    clickable
    class="projectHierarchyTreeNodeContextMenu__item text-secondary non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-deleteDocument"
    role="menuitem"
    @click="onDeleteDocumentClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ deleteDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-text-box-remove-outline"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenuDeleteRow'
})

defineProps<{
  deleteDocumentLabel: string
  onDeleteDocumentClick: () => void
}>()
</script>
