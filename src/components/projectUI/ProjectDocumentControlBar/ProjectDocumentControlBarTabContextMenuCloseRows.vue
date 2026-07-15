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
    data-test-locator="projectDocumentControlBar-tabContextMenu-closeThisTab"
    role="menuitem"
    @click="onCloseThisTabClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ closeThisTabLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-close"
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
    data-test-locator="projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne"
    role="menuitem"
    @click="onCloseAllTabsWithoutChangesExceptThisOneClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ closeAllTabsWithoutChangesExceptThisOneLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-close-box-outline"
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
    data-test-locator="projectDocumentControlBar-tabContextMenu-closeAllTabsWithoutChanges"
    role="menuitem"
    @click="onCloseAllTabsWithoutChangesClick"
  >
    <q-item-section>
      <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
        {{ closeAllTabsWithoutChangesLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectDocumentControlBarTabContextMenu__icon"
        name="mdi-close-box-multiple-outline"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectDocumentControlBarTabContextMenu__separator"
    dark
    role="separator"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectDocumentControlBarTabContextMenuCloseRows'
})

defineProps<{
  closeAllTabsWithoutChangesExceptThisOneLabel: string
  closeAllTabsWithoutChangesLabel: string
  closeThisTabLabel: string
  onCloseAllTabsWithoutChangesClick: () => void
  onCloseAllTabsWithoutChangesExceptThisOneClick: () => void
  onCloseThisTabClick: () => void
}>()
</script>
