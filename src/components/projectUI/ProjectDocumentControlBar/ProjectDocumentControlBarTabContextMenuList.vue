<template>
  <q-list
    class="projectDocumentControlBarTabContextMenu__list"
    dark
    role="none"
  >
    <q-item
      clickable
      class="projectDocumentControlBarTabContextMenu__item projectDocumentControlBarTabContextMenu__item--browseActivator non-selectable"
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
      <ProjectDocumentControlBarTabContextMenuBrowseSubmenu
        :active-document-tab-name="activeDocumentTabName"
        :is-browse-submenu-open="isBrowseSubmenuOpen"
        :on-browse-submenu-model-update="onBrowseSubmenuModelUpdate"
        :on-submenu-content-enter="onSubmenuContentEnter"
        :on-submenu-content-leave="onSubmenuContentLeave"
        :opened-document-tabs="openedDocumentTabs"
        :resolve-browse-tab-label="resolveBrowseTabLabel"
        :resolve-browse-tab-route="resolveBrowseTabRoute"
        :resolve-document-tab-appearance-chrome="resolveDocumentTabAppearanceChrome"
        :resolve-document-tab-inline-style="resolveDocumentTabInlineStyle"
        :resolve-tab-world-indicator-color="resolveTabWorldIndicatorColor"
        :show-world-tab-indicators="showWorldTabIndicators"
      />
    </q-item>

    <q-separator
      class="projectDocumentControlBarTabContextMenu__separator"
      dark
      role="separator"
    />

    <ProjectDocumentControlBarTabContextMenuCopyRows
      :copy-background-color-label="copyBackgroundColorLabel"
      :copy-name-label="copyNameLabel"
      :copy-text-color-label="copyTextColorLabel"
      :on-copy-background-color-click="onCopyBackgroundColorClick"
      :on-copy-name-click="onCopyNameClick"
      :on-copy-text-color-click="onCopyTextColorClick"
    />

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

    <q-separator
      class="projectDocumentControlBarTabContextMenu__separatorAlt"
      dark
      role="separator"
    />

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
      :show-delete-this-document="showDeleteThisDocument"
    />
  </q-list>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import ProjectDocumentControlBarTabContextMenuBrowseSubmenu from './ProjectDocumentControlBarTabContextMenuBrowseSubmenu.vue'
import ProjectDocumentControlBarTabContextMenuCloseRows from './ProjectDocumentControlBarTabContextMenuCloseRows.vue'
import ProjectDocumentControlBarTabContextMenuCopyRows from './ProjectDocumentControlBarTabContextMenuCopyRows.vue'
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
  copyBackgroundColorLabel: string
  copyNameLabel: string
  copyTextColorLabel: string
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
  onCopyBackgroundColorClick: () => void
  onCopyNameClick: () => void
  onCopyTextColorClick: () => void
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
  resolveDocumentTabAppearanceChrome: (
    tab: I_faOpenedDocumentTab
  ) => I_faDocumentAppearanceChromeStyle | undefined
  resolveDocumentTabInlineStyle: (tab: I_faOpenedDocumentTab) => CSSProperties | undefined
  resolveTabWorldIndicatorColor: (tab: I_faOpenedDocumentTab) => string | null
  showDeleteThisDocument: boolean
  showWorldTabIndicators: boolean
}>()
</script>
