<template>
  <q-list
    class="projectDocumentControlBarTabContextMenu__list"
    dark
    role="none"
  >
    <q-item
      clickable
      class="projectDocumentControlBarTabContextMenu__item text-grey non-selectable"
      data-test-locator="projectDocumentControlBar-tabContextMenu-browseOpenedTabs"
      role="menuitem"
      @mouseenter="onBrowseSubmenuActivatorEnter"
      @mouseleave="onSubmenuActivatorLeave"
    >
      <q-item-section>
        <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
          {{ browseOpenedTabsLabel }}
        </span>
      </q-item-section>
      <q-item-section avatar>
        <q-icon
          class="projectDocumentControlBarTabContextMenu__icon"
          name="keyboard_arrow_right"
        />
      </q-item-section>
      <q-menu
        :model-value="isBrowseSubmenuOpen"
        anchor="top end"
        class="projectDocumentControlBarTabContextMenu__browseSubmenu"
        dark
        data-test-locator="projectDocumentControlBar-tabContextMenu-browseSubmenu"
        role="menu"
        self="top start"
        square
        transition-hide="jump-left"
        transition-show="jump-right"
        @mouseenter="onSubmenuContentEnter"
        @mouseleave="onSubmenuContentLeave"
        @update:model-value="onBrowseSubmenuModelUpdate"
      >
        <q-list
          class="projectDocumentControlBarTabContextMenu__list"
          dark
          role="none"
        >
          <template
            v-for="(browseTab, browseTabIndex) in openedDocumentTabs"
            :key="browseTab.documentId"
          >
            <q-separator
              v-if="browseTabIndex > 0"
              class="projectDocumentControlBarTabContextMenu__separator"
              dark
              role="separator"
            />
            <q-item
              v-close-popup
              clickable
              class="projectDocumentControlBarTabContextMenu__item non-selectable"
              :class="{ 'text-primary-bright': browseTab.documentId === activeDocumentTabName }"
              data-test-locator="projectDocumentControlBar-tabContextMenu-browseTab"
              :data-test-browse-tab-active="browseTab.documentId === activeDocumentTabName ? 'true' : 'false'"
              :data-test-browse-tab-document-id="browseTab.documentId"
              :data-test-browse-tab-has-unsaved-changes="browseTab.hasUnsavedChanges ? 'true' : 'false'"
              role="menuitem"
              :to="resolveBrowseTabRoute(browseTab.documentId)"
            >
              <q-item-section>
                <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
                  {{ resolveBrowseTabLabel(browseTab) }}
                </span>
              </q-item-section>
              <q-item-section avatar>
                <div class="projectDocumentControlBarTabContextMenu__browseTabTrailingIcons">
                  <q-icon
                    class="projectDocumentControlBarTabContextMenu__browseTabIcon"
                    :name="browseTab.templateIcon"
                  />
                  <q-icon
                    v-if="browseTab.hasUnsavedChanges"
                    class="projectDocumentControlBarTabContextMenu__browseTabUnsavedIcon"
                    name="mdi-feather"
                  />
                </div>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-menu>
    </q-item>

    <q-separator
      class="projectDocumentControlBarTabContextMenu__separator"
      dark
      role="separator"
    />

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
      class="projectDocumentControlBarTabContextMenu__separator"
      dark
      role="separator"
    />

    <q-item
      v-close-popup
      clickable
      class="projectDocumentControlBarTabContextMenu__item non-selectable"
      data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabLeft"
      role="menuitem"
      @click="onMoveTabLeftClick"
    >
      <q-item-section>
        <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
          {{ moveTabLeftLabel }}
        </span><div
          v-if="moveDocumentTabLeftKeybindLabel"
          class="projectDocumentControlBarTabContextMenu__keybindText fa-text-keybind-hint"
          data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabLeft-keybind"
        >
          ({{ moveDocumentTabLeftKeybindLabel }})
        </div>
      </q-item-section>
      <q-item-section avatar>
        <q-icon
          class="projectDocumentControlBarTabContextMenu__icon"
          name="mdi-chevron-left"
        />
      </q-item-section>
    </q-item>

    <q-item
      v-close-popup
      clickable
      class="projectDocumentControlBarTabContextMenu__item non-selectable"
      data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabRight"
      role="menuitem"
      @click="onMoveTabRightClick"
    >
      <q-item-section>
        <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
          {{ moveTabRightLabel }}
        </span><div
          v-if="moveDocumentTabRightKeybindLabel"
          class="projectDocumentControlBarTabContextMenu__keybindText fa-text-keybind-hint"
          data-test-locator="projectDocumentControlBar-tabContextMenu-moveTabRight-keybind"
        >
          ({{ moveDocumentTabRightKeybindLabel }})
        </div>
      </q-item-section>
      <q-item-section avatar>
        <q-icon
          class="projectDocumentControlBarTabContextMenu__icon"
          name="mdi-chevron-right"
        />
      </q-item-section>
    </q-item>

    <ProjectDocumentControlBarTabContextMenuCloseRows
      :close-all-tabs-without-changes-except-this-one-label="closeAllTabsWithoutChangesExceptThisOneLabel"
      :close-all-tabs-without-changes-label="closeAllTabsWithoutChangesLabel"
      :close-this-tab-label="closeThisTabLabel"
      :on-close-all-tabs-without-changes-click="onCloseAllTabsWithoutChangesClick"
      :on-close-all-tabs-without-changes-except-this-one-click="onCloseAllTabsWithoutChangesExceptThisOneClick"
      :on-close-this-tab-click="onCloseThisTabClick"
    />

    <ProjectDocumentControlBarTabContextMenuDestructiveRows
      :delete-this-document-label="deleteThisDocumentLabel"
      :force-close-all-tabs-except-this-one-label="forceCloseAllTabsExceptThisOneLabel"
      :force-close-all-tabs-label="forceCloseAllTabsLabel"
      :on-delete-this-document-click="onDeleteThisDocumentClick"
      :on-force-close-all-tabs-click="onForceCloseAllTabsClick"
      :on-force-close-all-tabs-except-this-one-click="onForceCloseAllTabsExceptThisOneClick"
    />
  </q-list>
</template>

<script setup lang="ts">
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import ProjectDocumentControlBarTabContextMenuCloseRows from './ProjectDocumentControlBarTabContextMenuCloseRows.vue'
import ProjectDocumentControlBarTabContextMenuDestructiveRows from './ProjectDocumentControlBarTabContextMenuDestructiveRows.vue'

defineOptions({
  name: 'ProjectDocumentControlBarTabContextMenuList'
})

defineProps<{
  activeDocumentTabName: string | undefined
  browseOpenedTabsLabel: string
  closeAllTabsWithoutChangesExceptThisOneLabel: string
  closeAllTabsWithoutChangesLabel: string
  closeThisTabLabel: string
  copyNameLabel: string
  deleteThisDocumentLabel: string
  forceCloseAllTabsExceptThisOneLabel: string
  forceCloseAllTabsLabel: string
  isBrowseSubmenuOpen: boolean
  moveDocumentTabLeftKeybindLabel: string | null
  moveDocumentTabRightKeybindLabel: string | null
  moveTabLeftLabel: string
  moveTabRightLabel: string
  onBrowseSubmenuActivatorEnter: () => void
  onBrowseSubmenuModelUpdate: (shown: boolean) => void
  onCloseAllTabsWithoutChangesClick: () => void
  onCloseAllTabsWithoutChangesExceptThisOneClick: () => void
  onCloseThisTabClick: () => void
  onCopyNameClick: () => void
  onDeleteThisDocumentClick: () => void
  onForceCloseAllTabsClick: () => void
  onForceCloseAllTabsExceptThisOneClick: () => void
  onMoveTabLeftClick: () => void
  onMoveTabRightClick: () => void
  onSubmenuActivatorLeave: () => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  openedDocumentTabs: readonly I_faOpenedDocumentTab[]
  resolveBrowseTabLabel: (browseTab: I_faOpenedDocumentTab) => string
  resolveBrowseTabRoute: (documentId: string) => string
}>()
</script>
