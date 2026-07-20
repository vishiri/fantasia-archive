<template>
  <q-item
    v-close-popup
    clickable
    class="projectHierarchyTreeNodeContextMenu__item non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-openDocument"
    role="menuitem"
    @click="onOpenDocumentClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ openDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-book-open-page-variant-outline"
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
    data-test-locator="projectHierarchyTree-nodeContextMenu-editDocument"
    role="menuitem"
    @click="onEditDocumentClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ editDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-pencil"
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
    data-test-locator="projectHierarchyTree-nodeContextMenu-copyDocument"
    role="menuitem"
    @click="onCopyDocumentClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ copyDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-content-copy"
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
    data-test-locator="projectHierarchyTree-nodeContextMenu-addNewDocumentUnderThis"
    role="menuitem"
    @click="onAddNewDocumentUnderThisClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ addNewDocumentUnderThisLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-file-tree"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenuDocumentRows'
})

defineProps<{
  addNewDocumentUnderThisLabel: string
  copyDocumentLabel: string
  editDocumentLabel: string
  onAddNewDocumentUnderThisClick: () => void
  onCopyDocumentClick: () => void
  onEditDocumentClick: () => void
  onOpenDocumentClick: () => void
  openDocumentLabel: string
}>()
</script>
