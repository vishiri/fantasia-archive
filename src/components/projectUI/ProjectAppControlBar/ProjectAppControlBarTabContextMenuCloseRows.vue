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
    data-test-locator="projectAppControlBar-tabContextMenu-closeThisTab"
    role="menuitem"
    @click="onCloseThisTabClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ closeThisTabLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-close"
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
    data-test-locator="projectAppControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne"
    role="menuitem"
    @click="onCloseAllTabsWithoutChangesExceptThisOneClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ closeAllTabsWithoutChangesExceptThisOneLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-close-box-outline"
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
    data-test-locator="projectAppControlBar-tabContextMenu-closeAllTabsWithoutChanges"
    role="menuitem"
    @click="onCloseAllTabsWithoutChangesClick"
  >
    <q-item-section>
      <span class="projectAppControlBarTabContextMenu__primaryLabel">
        {{ closeAllTabsWithoutChangesLabel }}
      </span>
    </q-item-section>
    <q-item-section avatar>
      <q-icon
        class="projectAppControlBarTabContextMenu__icon"
        name="mdi-close-box-multiple-outline"
      />
    </q-item-section>
  </q-item>

  <q-separator
    class="projectAppControlBarTabContextMenu__separator"
    dark
    role="separator"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProjectAppControlBarTabContextMenuCloseRows'
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
