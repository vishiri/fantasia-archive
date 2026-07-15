<template>
  <q-separator
    class="projectDocumentControlBarTabContextMenu__separatorPrimaryBright"
    dark
    role="separator"
  />

  <q-item
    v-close-popup
    clickable
    class="projectDocumentControlBarTabContextMenu__item non-selectable"
    data-test-locator="projectDocumentControlBar-tabContextMenu-copyDocument"
    role="menuitem"
    @click="onCopyDocumentClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ copyDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-content-copy"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectDocumentControlBarTabContextMenu__separatorAlt"
    dark
    role="separator"
  />

  <q-item
    v-close-popup
    clickable
    class="projectDocumentControlBarTabContextMenu__item non-selectable"
    data-test-locator="projectDocumentControlBar-tabContextMenu-addNewDocumentUnderThis"
    role="menuitem"
    @click="onAddNewDocumentUnderThisClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ addNewDocumentUnderThisLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-file-tree"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectDocumentControlBarTabContextMenu__separatorPrimaryBright"
    dark
    role="separator"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectDocumentControlBarTabContextMenuDocumentRows'
})

defineProps<{
  addNewDocumentUnderThisLabel: string
  copyDocumentLabel: string
  onAddNewDocumentUnderThisClick: () => void
  onCopyDocumentClick: () => void
}>()
</script>
