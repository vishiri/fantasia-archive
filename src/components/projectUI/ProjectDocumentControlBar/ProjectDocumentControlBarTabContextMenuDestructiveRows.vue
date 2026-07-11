<template>
  <q-item
    v-close-popup
    clickable
    class="projectDocumentControlBarTabContextMenu__item text-secondary non-selectable"
    data-test-locator="projectDocumentControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne"
    role="menuitem"
    @click="onForceCloseAllTabsExceptThisOneClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ forceCloseAllTabsExceptThisOneLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-close-box"
      />
    </q-item-section>
  </q-item>

  <q-item
    v-close-popup
    clickable
    class="projectDocumentControlBarTabContextMenu__item text-secondary non-selectable"
    data-test-locator="projectDocumentControlBar-tabContextMenu-forceCloseAllTabs"
    role="menuitem"
    @click="onForceCloseAllTabsClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ forceCloseAllTabsLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-close-box-multiple"
      />
    </q-item-section>
  </q-item>

  <q-item
    v-if="showDeleteThisDocument"
    v-close-popup
    clickable
    class="projectDocumentControlBarTabContextMenu__item text-secondary non-selectable"
    data-test-locator="projectDocumentControlBar-tabContextMenu-deleteThisDocument"
    role="menuitem"
    @click="onDeleteThisDocumentClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ deleteThisDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-text-box-remove-outline"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectDocumentControlBarTabContextMenuDestructiveRows'
})

defineProps<{
  deleteThisDocumentLabel: string
  forceCloseAllTabsExceptThisOneLabel: string
  forceCloseAllTabsLabel: string
  onDeleteThisDocumentClick: () => void
  onForceCloseAllTabsClick: () => void
  onForceCloseAllTabsExceptThisOneClick: () => void
  showDeleteThisDocument: boolean
}>()
</script>
