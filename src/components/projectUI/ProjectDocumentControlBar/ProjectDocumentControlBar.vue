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
              :data-test-locator="`projectDocumentControlBar-tab-${tab.documentId}`"
              :icon="tab.templateIcon"
              :label="resolveDocumentTabLabel(tab)"
              :name="tab.documentId"
              :ripple="false"
              :to="resolveDocumentTabRoute(tab.documentId)"
              @auxclick.stop.prevent="onTabAuxClick(tab.documentId, $event)"
            >
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
            </q-route-tab>
          </TransitionGroup>
        </q-tabs>
      </div>
    </Teleport>
    <Teleport
      v-if="showDocumentControlBar"
      to="body"
    >
      <div
        class="projectDocumentControlBar projectDocumentControlBar--fixedStrip"
        data-test-locator="projectDocumentControlBar"
      >
        <div class="projectDocumentControlBar__blocker" />
        <div class="projectDocumentControlBar__wrapper">
          <div class="projectDocumentControlBar__left" />
          <div class="projectDocumentControlBar__right">
            <q-btn
              v-if="showEditDocumentButton"
              color="primary-bright"
              data-test-locator="projectDocumentControlBar-editDocumentButton"
              icon="mdi-file-document-edit"
              outline
              @click="onEnterEditModeClick"
            >
              <q-tooltip
                anchor="bottom middle"
                class="projectDocumentControlBar__buttonTooltip"
                :delay="500"
                self="top middle"
              >
                {{ editDocumentTooltip }}
              </q-tooltip>
            </q-btn>
            <q-btn
              v-if="showSaveDocumentButtons"
              :color="saveDocumentButtonColor"
              data-test-locator="projectDocumentControlBar-saveDocumentKeepEditModeButton"
              icon="mdi-content-save-edit"
              outline
              @click="onSaveDocumentClick(true)"
            >
              <q-tooltip
                anchor="bottom left"
                class="projectDocumentControlBar__buttonTooltip"
                :delay="500"
                self="top middle"
              >
                {{ saveDocumentKeepEditModeTooltip }}
              </q-tooltip>
            </q-btn>
            <q-btn
              v-if="showSaveDocumentButtons"
              :color="saveDocumentButtonColor"
              data-test-locator="projectDocumentControlBar-saveDocumentButton"
              icon="mdi-content-save"
              outline
              @click="onSaveDocumentClick(false)"
            >
              <q-tooltip
                anchor="bottom left"
                class="projectDocumentControlBar__buttonTooltip"
                :delay="500"
                self="top middle"
              >
                {{ saveDocumentTooltip }}
              </q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </Teleport>
    <div
      v-if="showDocumentControlBar"
      aria-hidden="true"
      class="projectDocumentControlBar__flowSpacer"
    />
    <DialogDiscardOpenedDocumentTab />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DialogDiscardOpenedDocumentTab from 'app/src/components/dialogs/DialogDiscardOpenedDocumentTab/DialogDiscardOpenedDocumentTab.vue'

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
  onEnterEditModeClick,
  onSaveDocumentClick,
  onTabAuxClick,
  onTabCloseClick,
  openedDocumentTabs,
  resolveDocumentTabLabel,
  resolveDocumentTabRoute,
  showDocumentControlBar,
  showDocumentTabs,
  showEditDocumentButton,
  showSaveDocumentButtons,
  saveDocumentButtonColor
} = useProjectDocumentControlBar()
</script>

<style lang="scss" src="./styles/ProjectDocumentControlBar.unscoped.scss"></style>
