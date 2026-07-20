<template>
  <q-item
    v-close-popup
    clickable
    class="projectAppControlBarTabContextMenu__item non-selectable"
    data-test-locator="projectAppControlBar-tabContextMenu-copyName"
    role="menuitem"
    @click="onCopyNameClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ copyNameLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-text-recognition"
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
    data-test-locator="projectAppControlBar-tabContextMenu-copyTextColor"
    role="menuitem"
    @click="onCopyTextColorClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ copyTextColorLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-eyedropper"
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
    data-test-locator="projectAppControlBar-tabContextMenu-copyBackgroundColor"
    role="menuitem"
    @click="onCopyBackgroundColorClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ copyBackgroundColorLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-format-color-fill"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectAppControlBarTabContextMenuCopyRows'
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
