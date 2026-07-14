<template>
  <div class="projectDocumentControlBarHost">
    <Teleport
      v-if="showDocumentTabs"
      :to="FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR"
    >
      <div class="projectDocumentControlBarTabs projectDocumentControlBarTabs--header">
        <q-tabs
          align="left"
          class="projectDocumentControlBarTabs__tabs tabsWrapper"
          dense
          inline-label
          mobile-arrows
          :model-value="activeDocumentTabName"
          no-caps
          outside-arrows
        >
          <TransitionGroup
            appear
            class="projectDocumentControlBarTabs__tabTransitionGroup"
            :duration="PROJECT_DOCUMENT_CONTROL_BAR_TAB_TRANSITION_MS"
            :enter-active-class="PROJECT_DOCUMENT_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS"
            :leave-active-class="PROJECT_DOCUMENT_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS"
            tag="div"
          >
            <q-route-tab
              v-for="tab in openedDocumentTabs"
              :key="tab.documentId"
              :alert="tab.hasUnsavedChanges"
              alert-icon="mdi-feather"
              class="projectDocumentControlBarTabs__tab"
              :class="{
                'projectDocumentControlBarTabs__tab--customAppearance':
                  resolveDocumentTabAppearanceChrome(tab) !== undefined,
                'projectDocumentControlBarTabs__tab--withWorldIndicator':
                  showWorldTabIndicators && resolveTabWorldIndicatorColor(tab) !== null
              }"
              :data-test-locator="`projectDocumentControlBar-tab-${tab.documentId}`"
              :icon="tab.templateIcon"
              :label="resolveDocumentTabLabel(tab)"
              :name="tab.documentId"
              :ripple="false"
              :style="resolveDocumentTabInlineStyle(tab)"
              :to="resolveDocumentTabRoute(tab.documentId)"
              @auxclick.stop.prevent="onTabAuxClick(tab.documentId, $event)"
            >
              <ProjectDocumentControlBarTabWorldIndicator
                :color="resolveTabWorldIndicatorColor(tab)"
                :document-id="tab.documentId"
                :visible="showWorldTabIndicators"
              />
              <q-btn
                class="projectDocumentControlBarTabs__tabClose z-max q-ml-auto"
                :class="{ 'q-mr-sm': tab.hasUnsavedChanges }"
                dense
                flat
                icon="close"
                round
                size="xs"
                :data-test-locator="`projectDocumentControlBar-tabClose-${tab.documentId}`"
                @click.stop.prevent="onTabCloseClick(tab.documentId)"
              />
              <ProjectDocumentControlBarTabContextMenu
                :active-document-tab-name="activeDocumentTabName"
                :move-document-tab-left-keybind-label="moveDocumentTabLeftKeybindLabel"
                :move-document-tab-right-keybind-label="moveDocumentTabRightKeybindLabel"
                :on-tab-close-all-without-changes-click="onTabCloseAllWithoutChangesClick"
                :on-tab-close-all-without-changes-except-click="onTabCloseAllWithoutChangesExceptClick"
                :on-tab-close-click="onTabCloseClick"
                :on-tab-copy-background-color-click="onTabCopyBackgroundColorClick"
                :on-tab-copy-name-click="onTabCopyNameClick"
                :on-tab-copy-text-color-click="onTabCopyTextColorClick"
                :on-tab-delete-click="onTabDeleteClick"
                :on-tab-force-close-all-click="onTabForceCloseAllClick"
                :on-tab-force-close-all-except-click="onTabForceCloseAllExceptClick"
                :on-tab-move-click="onTabMoveClick"
                :opened-document-tabs="openedDocumentTabs"
                :resolve-document-tab-appearance-chrome="resolveDocumentTabAppearanceChrome"
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
    <ProjectDocumentControlBarFixedStrip
      :delete-current-document-tooltip="deleteCurrentDocumentTooltip"
      :edit-document-keybind-label="editDocumentKeybindLabel"
      :edit-document-tooltip="editDocumentTooltip"
      :on-delete-current-document-click="onDeleteCurrentDocumentClick"
      :on-enter-edit-mode-click="onEnterEditModeClick"
      :on-save-document-click="onSaveDocumentClick"
      :save-document-button-color="saveDocumentButtonColor"
      :save-document-keep-edit-mode-keybind-label="saveDocumentKeepEditModeKeybindLabel"
      :save-document-keep-edit-mode-tooltip="saveDocumentKeepEditModeTooltip"
      :save-document-keybind-label="saveDocumentKeybindLabel"
      :save-document-tooltip="saveDocumentTooltip"
      :show-delete-document-button="showDeleteDocumentButton"
      :show-document-control-bar="showDocumentControlBar"
      :show-edit-document-button="showEditDocumentButton"
      :show-save-document-buttons="showSaveDocumentButtons"
    />
    <DialogDiscardOpenedDocumentTab />
    <DialogDeleteOpenedDocument />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DialogDeleteOpenedDocument from 'app/src/components/dialogs/DialogDeleteOpenedDocument/DialogDeleteOpenedDocument.vue'
import DialogDiscardOpenedDocumentTab from 'app/src/components/dialogs/DialogDiscardOpenedDocumentTab/DialogDiscardOpenedDocumentTab.vue'

import ProjectDocumentControlBarFixedStrip from './ProjectDocumentControlBarFixedStrip.vue'
import ProjectDocumentControlBarTabContextMenu from './ProjectDocumentControlBarTabContextMenu.vue'
import ProjectDocumentControlBarTabWorldIndicator from './ProjectDocumentControlBarTabWorldIndicator.vue'

import {
  PROJECT_DOCUMENT_CONTROL_BAR_TAB_ENTER_ACTIVE_CLASS,
  PROJECT_DOCUMENT_CONTROL_BAR_TAB_LEAVE_ACTIVE_CLASS,
  PROJECT_DOCUMENT_CONTROL_BAR_TAB_TRANSITION_MS
} from './functions/projectDocumentControlBarTabTransition'
import {
  FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR,
  useProjectDocumentControlBar
} from './scripts/projectDocumentControlBar_manager'

defineOptions({
  name: 'ProjectDocumentControlBar'
})

const { t } = useI18n()

const deleteCurrentDocumentTooltip = computed(() => {
  return t('projectUI.projectDocumentControlBar.deleteCurrentDocumentTooltip')
})

const editDocumentTooltip = computed(() => {
  return t('projectUI.projectDocumentControlBar.editDocumentTooltip')
})

const saveDocumentKeepEditModeTooltip = computed(() => {
  return t('projectUI.projectDocumentControlBar.saveDocumentKeepEditModeTooltip')
})

const saveDocumentTooltip = computed(() => {
  return t('projectUI.projectDocumentControlBar.saveDocumentTooltip')
})

const {
  activeDocumentTabName,
  editDocumentKeybindLabel,
  moveDocumentTabLeftKeybindLabel,
  moveDocumentTabRightKeybindLabel,
  onEnterEditModeClick,
  onDeleteCurrentDocumentClick,
  onSaveDocumentClick,
  onTabAuxClick,
  onTabCloseAllWithoutChangesClick,
  onTabCloseAllWithoutChangesExceptClick,
  onTabCloseClick,
  onTabCopyBackgroundColorClick,
  onTabCopyNameClick,
  onTabCopyTextColorClick,
  onTabDeleteClick,
  onTabForceCloseAllClick,
  onTabForceCloseAllExceptClick,
  onTabMoveClick,
  openedDocumentTabs,
  resolveDocumentTabLabel,
  resolveDocumentTabAppearanceChrome,
  resolveDocumentTabInlineStyle,
  resolveDocumentTabRoute,
  resolveTabWorldIndicatorColor,
  saveDocumentKeepEditModeKeybindLabel,
  saveDocumentKeybindLabel,
  showDeleteDocumentButton,
  showDocumentControlBar,
  showDocumentTabs,
  showWorldTabIndicators,
  showEditDocumentButton,
  showSaveDocumentButtons,
  saveDocumentButtonColor
} = useProjectDocumentControlBar()
</script>

<style lang="scss" src="./styles/ProjectDocumentControlBar.unscoped.scss"></style>
