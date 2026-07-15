<template>
  <q-item
    v-close-popup
    clickable
    class="projectHierarchyTreeNodeContextMenu__item non-selectable"
    data-test-locator="projectHierarchyTree-nodeContextMenu-copyName"
    role="menuitem"
    @click="onCopyNameClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ copyNameLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-text-recognition"
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
    data-test-locator="projectHierarchyTree-nodeContextMenu-copyTextColor"
    role="menuitem"
    @click="onCopyTextColorClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ copyTextColorLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-eyedropper"
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
    data-test-locator="projectHierarchyTree-nodeContextMenu-copyBackgroundColor"
    role="menuitem"
    @click="onCopyBackgroundColorClick"
  >
    <q-item-section>
      <span class="projectHierarchyTreeNodeContextMenu__primaryLabel">
        {{ copyBackgroundColorLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectHierarchyTreeNodeContextMenu__icon"
        name="mdi-format-color-fill"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectHierarchyTreeNodeContextMenuCopyRows'
})

defineProps<{
  copyBackgroundColorLabel: string
  copyNameLabel: string
  copyTextColorLabel: string
  onCopyBackgroundColorClick: () => void
  onCopyNameClick: () => void
  onCopyTextColorClick: () => void
}>()
</script>
