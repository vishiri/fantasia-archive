<template>
  <q-separator
    class="projectAppControlBarTabContextMenu__separatorPrimaryBright"
    dark
    role="separator"
  />

  <q-item
    v-close-popup
    clickable
    class="projectAppControlBarTabContextMenu__item non-selectable"
    data-test-locator="projectAppControlBar-tabContextMenu-copyDocument"
    role="menuitem"
    @click="onCopyDocumentClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ copyDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-content-copy"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectAppControlBarTabContextMenu__separatorAlt"
    dark
    role="separator"
  />

  <q-item
    v-close-popup
    clickable
    class="projectAppControlBarTabContextMenu__item non-selectable"
    data-test-locator="projectAppControlBar-tabContextMenu-addNewDocumentUnderThis"
    role="menuitem"
    @click="onAddNewDocumentUnderThisClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ addNewDocumentUnderThisLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-file-tree"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectAppControlBarTabContextMenu__separatorPrimaryBright"
    dark
    role="separator"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectAppControlBarTabContextMenuDocumentRows'
})

defineProps<{
  addNewDocumentUnderThisLabel: string
  copyDocumentLabel: string
  onAddNewDocumentUnderThisClick: () => void
  onCopyDocumentClick: () => void
}>()
</script>
