<template>
  <q-menu
    :model-value="isBrowseSubmenuOpen"
    anchor="top end"
    class="projectDocumentControlBarTabContextMenu__browseSubmenu"
    dark
    data-test-locator="projectDocumentControlBar-tabContextMenu-browseSubmenu"
    role="menu"
    self="top start"
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
          v-if="contextMenuShouldShowSeparatorAltBeforeIndex(browseTabIndex)"
          class="projectDocumentControlBarTabContextMenu__separatorAlt"
          dark
          role="separator"
        />
        <q-item
          v-close-popup
          clickable
          class="projectDocumentControlBarTabContextMenu__item projectDocumentControlBarTabContextMenu__item--browseTab non-selectable"
          :class="{
            'projectDocumentControlBarTabContextMenu__item--browseTabActive': browseTab.documentId === activeDocumentTabName,
            'projectDocumentControlBarTabContextMenu__item--browseTabCustomAppearance': resolveDocumentTabAppearanceChrome(browseTab) !== undefined
          }"
          data-test-locator="projectDocumentControlBar-tabContextMenu-browseTab"
          :data-test-browse-tab-active="browseTab.documentId === activeDocumentTabName ? 'true' : 'false'"
          :data-test-browse-tab-document-id="browseTab.documentId"
          :data-test-browse-tab-has-unsaved-changes="browseTab.hasUnsavedChanges ? 'true' : 'false'"
          role="menuitem"
          :style="resolveDocumentTabInlineStyle(browseTab)"
          :to="resolveBrowseTabRoute(browseTab.documentId)"
        >
          <ProjectDocumentControlBarTabWorldIndicator
            :color="resolveTabWorldIndicatorColor(browseTab)"
            :document-id="browseTab.documentId"
            indicator-class="projectDocumentControlBarTabContextMenu__browseTabWorldIndicator"
            :visible="showWorldTabIndicators"
          />
          <q-item-section>
            <span class="projectDocumentControlBarTabContextMenu__primaryLabel">
              {{ resolveBrowseTabLabel(browseTab) }}
            </span>
          </q-item-section>
          <q-item-section avatar>
            <div class="projectDocumentControlBarTabContextMenu__browseTabTrailingIcons">
              <q-icon
                class="projectDocumentControlBarTabContextMenu__browseTabIcon"
                :name="resolveDocumentTabDisplayIcon(browseTab)"
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
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { contextMenuShouldShowSeparatorAltBeforeIndex } from 'app/src/components/globals/AppControlMenus/scripts/functions/contextMenuShouldShowSeparatorAltBeforeItem'

import ProjectDocumentControlBarTabWorldIndicator from './ProjectDocumentControlBarTabWorldIndicator.vue'

defineOptions({
  name: 'ProjectDocumentControlBarTabContextMenuBrowseSubmenu'
})

defineProps<{
  activeDocumentTabName: string | undefined
  isBrowseSubmenuOpen: boolean
  onBrowseSubmenuModelUpdate: (shown: boolean) => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  openedDocumentTabs: readonly I_faOpenedDocumentTab[]
  resolveBrowseTabLabel: (browseTab: I_faOpenedDocumentTab) => string
  resolveBrowseTabRoute: (documentId: string) => string
  resolveDocumentTabAppearanceChrome: (
    tab: I_faOpenedDocumentTab
  ) => I_faDocumentAppearanceChromeStyle | undefined
  resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabInlineStyle: (tab: I_faOpenedDocumentTab) => CSSProperties | undefined
  resolveTabWorldIndicatorColor: (tab: I_faOpenedDocumentTab) => string | null
  showWorldTabIndicators: boolean
}>()
</script>
