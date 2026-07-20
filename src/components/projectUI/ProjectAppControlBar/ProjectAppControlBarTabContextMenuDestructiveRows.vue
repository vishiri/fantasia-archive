<template>
  <q-item
    v-close-popup
    clickable
    class="projectAppControlBarTabContextMenu__item text-secondary non-selectable"
    data-test-locator="projectAppControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne"
    role="menuitem"
    @click="onForceCloseAllTabsExceptThisOneClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ forceCloseAllTabsExceptThisOneLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-close-box"
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
    class="projectAppControlBarTabContextMenu__item text-secondary non-selectable"
    data-test-locator="projectAppControlBar-tabContextMenu-forceCloseAllTabs"
    role="menuitem"
    @click="onForceCloseAllTabsClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ forceCloseAllTabsLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-close-box-multiple"
      />
    </q-item-section>
  </q-item>

  <q-separator
    v-if="showDeleteThisDocument"
    class="projectAppControlBarTabContextMenu__separatorPrimaryBright"
    dark
    role="separator"
  />

  <q-item
    v-if="showDeleteThisDocument"
    v-close-popup
    clickable
    class="projectAppControlBarTabContextMenu__item text-secondary non-selectable"
    data-test-locator="projectAppControlBar-tabContextMenu-deleteThisDocument"
    role="menuitem"
    @click="onDeleteThisDocumentClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ deleteThisDocumentLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-text-box-remove-outline"
      />
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectAppControlBarTabContextMenuDestructiveRows'
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
