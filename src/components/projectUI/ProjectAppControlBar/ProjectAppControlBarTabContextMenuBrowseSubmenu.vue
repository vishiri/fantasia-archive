<template>
  <q-menu
    :model-value="isBrowseSubmenuOpen"
    anchor="top end"
    class="projectAppControlBarTabContextMenu__browseSubmenu"
    dark
    data-test-locator="projectAppControlBar-tabContextMenu-browseSubmenu"
    role="menu"
    self="top start"
    transition-hide="jump-left"
    transition-show="jump-right"
    @mouseenter="onSubmenuContentEnter"
    @mouseleave="onSubmenuContentLeave"
    @update:model-value="onBrowseSubmenuModelUpdate"
  >
    <q-list
      class="projectAppControlBarTabContextMenu__list"
      dark
      role="none"
    >
      <template
        v-for="(browseTab, browseTabIndex) in openedDocumentTabs"
        :key="browseTab.documentId"
      >
        <q-separator
          v-if="contextMenuShouldShowSeparatorAltBeforeIndex(browseTabIndex)"
          class="projectAppControlBarTabContextMenu__separatorAlt"
          dark
          role="separator"
        />
        <q-item
          v-close-popup
          clickable
          class="projectAppControlBarTabContextMenu__item projectAppControlBarTabContextMenu__item--browseTab non-selectable"
          :class="{
            'projectAppControlBarTabContextMenu__item--browseTabActive': browseTab.documentId === activeDocumentTabName,
            'projectAppControlBarTabContextMenu__item--browseTabCustomAppearance': resolveDocumentTabAppearanceChrome(browseTab) !== undefined,
            'projectAppControlBarTabContextMenu__item--browseTabWithUnsavedAlert': browseTab.hasUnsavedChanges
          }"
          data-test-locator="projectAppControlBar-tabContextMenu-browseTab"
          :data-test-browse-tab-active="browseTab.documentId === activeDocumentTabName ? 'true' : 'false'"
          :data-test-browse-tab-document-id="browseTab.documentId"
          :data-test-browse-tab-has-unsaved-changes="browseTab.hasUnsavedChanges ? 'true' : 'false'"
          role="menuitem"
          :style="resolveDocumentTabInlineStyle(browseTab)"
          :to="resolveBrowseTabRoute(browseTab.documentId)"
        >
          <ProjectAppControlBarTabWorldIndicator
            :color="resolveTabWorldIndicatorColor(browseTab)"
            :document-id="browseTab.documentId"
            indicator-class="projectAppControlBarTabContextMenu__browseTabWorldIndicator"
            :visible="showWorldTabIndicators"
          />
          <q-item-section avatar>
            <q-icon
              class="projectAppControlBarTabContextMenu__browseTabIcon"
              :name="resolveDocumentTabDisplayIcon(browseTab)"
            />
          </q-item-section>
          <q-item-section>
            <span class="projectAppControlBarTabContextMenu__primaryLabel">
              {{ resolveBrowseTabLabel(browseTab) }}
            </span>
          </q-item-section>
          <q-icon
            v-if="browseTab.hasUnsavedChanges"
            class="projectAppControlBarTabContextMenu__browseTabUnsavedIcon"
            name="mdi-feather"
          />
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

import ProjectAppControlBarTabWorldIndicator from './ProjectAppControlBarTabWorldIndicator.vue'

defineOptions({
  name: 'ProjectAppControlBarTabContextMenuBrowseSubmenu'
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
