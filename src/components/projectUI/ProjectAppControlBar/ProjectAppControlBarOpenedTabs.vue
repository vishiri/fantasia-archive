<template>
  <Teleport
    v-if="showDocumentTabs"
    :to="FA_PROJECT_APP_CONTROL_BAR_HEADER_MOUNT_SELECTOR"
  >
    <div class="projectAppControlBarTabs projectAppControlBarTabs--header">
      <q-tabs
        align="left"
        class="projectAppControlBarTabs__tabs tabsWrapper"
        dense
        inline-label
        mobile-arrows
        :model-value="activeDocumentTabName"
        no-caps
        outside-arrows
      >
        <TransitionGroup
          appear
          class="projectAppControlBarTabs__tabTransitionGroup"
          :duration="PROJECT_APP_CONTROL_BAR_TAB_TRANSITION_MS"
          :enter-active-class="PROJECT_APP_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS"
          :leave-active-class="PROJECT_APP_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS"
          tag="div"
        >
          <q-route-tab
            v-for="tab in openedDocumentTabs"
            :key="tab.documentId"
            :alert="tab.hasUnsavedChanges"
            alert-icon="mdi-feather"
            class="projectAppControlBarTabs__tab"
            :class="{
              'projectAppControlBarTabs__tab--customAppearance':
                resolveDocumentTabAppearanceChrome(tab) !== undefined,
              'projectAppControlBarTabs__tab--customDocumentBackground':
                resolveDocumentTabAppearanceChrome(tab)?.backgroundColor !== undefined,
              'projectAppControlBarTabs__tab--dead': tab.isDeadDraft === true,
              'projectAppControlBarTabs__tab--withUnsavedAlert': tab.hasUnsavedChanges,
              'projectAppControlBarTabs__tab--withWorldIndicator':
                showWorldTabIndicators && resolveTabWorldIndicatorColor(tab) !== null
            }"
            :data-test-locator="`projectAppControlBar-tab-${tab.documentId}`"
            :icon="resolveDocumentTabDisplayIcon(tab)"
            :name="tab.documentId"
            :ripple="false"
            :style="resolveDocumentTabInlineStyle(tab)"
            :to="resolveDocumentTabRoute(tab.documentId)"
            @auxclick.stop.prevent="onTabAuxClick(tab.documentId, $event)"
          >
            <span class="projectAppControlBarTabs__tabLabel">
              <span
                v-if="tab.isFinishedDraft === true"
                class="projectAppControlBarTabs__finishedMarker"
              >✓</span>
              <span
                v-if="tab.isDeadDraft === true"
                class="projectAppControlBarTabs__deadMarker"
              >†</span>
              <span
                class="projectAppControlBarTabs__tabLabelText"
                :class="{
                  'projectAppControlBarTabs__tabLabelText--dead': tab.isDeadDraft === true
                }"
              >{{ resolveDocumentTabLabel(tab) }}</span>
            </span>
            <ProjectAppControlBarTabWorldIndicator
              :color="resolveTabWorldIndicatorColor(tab)"
              :document-id="tab.documentId"
              :visible="showWorldTabIndicators"
            />
            <q-btn
              class="projectAppControlBarTabs__tabClose z-max q-ml-auto"
              dense
              flat
              icon="close"
              round
              size="xs"
              :data-test-locator="`projectAppControlBar-tabClose-${tab.documentId}`"
              @click.stop.prevent="onTabCloseClick(tab.documentId)"
            />
            <ProjectAppControlBarTabContextMenu
              :active-document-tab-name="activeDocumentTabName"
              :move-document-tab-left-keybind-label="moveDocumentTabLeftKeybindLabel"
              :move-document-tab-right-keybind-label="moveDocumentTabRightKeybindLabel"
              :on-tab-close-all-without-changes-click="onTabCloseAllWithoutChangesClick"
              :on-tab-close-all-without-changes-except-click="onTabCloseAllWithoutChangesExceptClick"
              :on-tab-close-click="onTabCloseClick"
              :on-tab-copy-background-color-click="onTabCopyBackgroundColorClick"
              :on-tab-copy-document-click="onTabCopyDocumentClick"
              :on-tab-copy-name-click="onTabCopyNameClick"
              :on-tab-copy-text-color-click="onTabCopyTextColorClick"
              :on-tab-add-new-document-under-this-click="onTabAddNewDocumentUnderThisClick"
              :on-tab-delete-click="onTabDeleteClick"
              :on-tab-force-close-all-click="onTabForceCloseAllClick"
              :on-tab-force-close-all-except-click="onTabForceCloseAllExceptClick"
              :on-tab-move-click="onTabMoveClick"
              :opened-document-tabs="openedDocumentTabs"
              :resolve-document-tab-appearance-chrome="resolveDocumentTabAppearanceChrome"
              :resolve-document-tab-display-icon="resolveDocumentTabDisplayIcon"
              :resolve-document-tab-inline-style="resolveDocumentTabInlineStyle"
              :resolve-document-tab-label="resolveDocumentTabLabel"
              :resolve-document-tab-route="resolveDocumentTabRoute"
              :resolve-tab-world-indicator-color="resolveTabWorldIndicatorColor"
              :show-world-tab-indicators="showWorldTabIndicators"
              :tab="tab"
            />
          </q-route-tab>
        </TransitionGroup>
      </q-tabs>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'

import type { I_faDocumentAppearanceChromeStyle } from 'app/types/I_faDocumentAppearanceChromeStyle'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import ProjectAppControlBarTabContextMenu from './ProjectAppControlBarTabContextMenu.vue'
import ProjectAppControlBarTabWorldIndicator from './ProjectAppControlBarTabWorldIndicator.vue'

import {
  PROJECT_APP_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS,
  PROJECT_APP_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS,
  PROJECT_APP_CONTROL_BAR_TAB_TRANSITION_MS
} from './functions/projectAppControlBarTabTransition'
import { FA_PROJECT_APP_CONTROL_BAR_HEADER_MOUNT_SELECTOR } from './scripts/projectAppControlBar_manager'

defineOptions({
  name: 'ProjectAppControlBarOpenedTabs'
})

defineProps<{
  activeDocumentTabName: string | undefined
  moveDocumentTabLeftKeybindLabel: string | null
  moveDocumentTabRightKeybindLabel: string | null
  onTabAddNewDocumentUnderThisClick: (documentId: string) => Promise<void>
  onTabAuxClick: (documentId: string, event: MouseEvent) => void
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCloseClick: (documentId: string) => void
  onTabCopyBackgroundColorClick: (documentId: string) => Promise<void>
  onTabCopyDocumentClick: (documentId: string) => Promise<void>
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabCopyTextColorClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  openedDocumentTabs: readonly I_faOpenedDocumentTab[]
  resolveDocumentTabAppearanceChrome: (
    tab: I_faOpenedDocumentTab
  ) => I_faDocumentAppearanceChromeStyle | undefined
  resolveDocumentTabDisplayIcon: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabInlineStyle: (tab: I_faOpenedDocumentTab) => CSSProperties | undefined
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabRoute: (documentId: string) => string
  resolveTabWorldIndicatorColor: (tab: I_faOpenedDocumentTab) => string | null
  showDocumentTabs: boolean
  showWorldTabIndicators: boolean
}>()
</script>
