<template>
  <q-item
    v-close-popup
    clickable
    class="projectDocumentControlBarTabContextMenu__item non-selectable"
    data-test-locator="projectDocumentControlBar-tabContextMenu-copyName"
    role="menuitem"
    @click="onCopyNameClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ copyNameLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-text-recognition"
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
    data-test-locator="projectDocumentControlBar-tabContextMenu-copyTextColor"
    role="menuitem"
    @click="onCopyTextColorClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ copyTextColorLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-eyedropper"
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
    data-test-locator="projectDocumentControlBar-tabContextMenu-copyBackgroundColor"
    role="menuitem"
    @click="onCopyBackgroundColorClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ copyBackgroundColorLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-format-color-fill"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectDocumentControlBarTabContextMenuCopyRows'
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
