<template>
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
              <div class="fa-tooltip-keybind-stack">
                <span class="fa-tooltip-keybind-stack__label">
                  {{ editDocumentTooltip }}
                </span><div
                  v-if="editDocumentKeybindLabel !== null"
                  class="fa-tooltip-keybind-hint fa-text-keybind-hint"
                  data-test-locator="projectDocumentControlBar-editDocumentButton-keybind"
                >
                  ({{ editDocumentKeybindLabel }})
                </div>
              </div>
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
              <div class="fa-tooltip-keybind-stack">
                <span class="fa-tooltip-keybind-stack__label">
                  {{ saveDocumentKeepEditModeTooltip }}
                </span><div
                  v-if="saveDocumentKeepEditModeKeybindLabel !== null"
                  class="fa-tooltip-keybind-hint fa-text-keybind-hint"
                  data-test-locator="projectDocumentControlBar-saveDocumentKeepEditModeButton-keybind"
                >
                  ({{ saveDocumentKeepEditModeKeybindLabel }})
                </div>
              </div>
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
              <div class="fa-tooltip-keybind-stack">
                <span class="fa-tooltip-keybind-stack__label">
                  {{ saveDocumentTooltip }}
                </span><div
                  v-if="saveDocumentKeybindLabel !== null"
                  class="fa-tooltip-keybind-hint fa-text-keybind-hint"
                  data-test-locator="projectDocumentControlBar-saveDocumentButton-keybind"
                >
                  ({{ saveDocumentKeybindLabel }})
                </div>
              </div>
            </q-tooltip>
          </q-btn>
          <ProjectDocumentControlBarDeleteDocumentButton
            v-if="showDeleteDocumentButton"
            :show-leading-separator="showEditDocumentButton || showSaveDocumentButtons"
            :tooltip-label="deleteCurrentDocumentTooltip"
            @click="onDeleteCurrentDocumentClick"
          />
        </div>
      </div>
    </div>
  </Teleport>
  <div
    v-if="showDocumentControlBar"
    aria-hidden="true"
    class="projectDocumentControlBar__flowSpacer"
  />
</template>

<script setup lang="ts">
import type { T_projectDocumentControlBarSaveButtonColor } from 'app/types/T_projectDocumentControlBarSaveButtonColor'

import ProjectDocumentControlBarDeleteDocumentButton from './ProjectDocumentControlBarDeleteDocumentButton.vue'

defineOptions({
  name: 'ProjectDocumentControlBarFixedStrip'
})

defineProps<{
  deleteCurrentDocumentTooltip: string
  editDocumentKeybindLabel: string | null
  editDocumentTooltip: string
  onDeleteCurrentDocumentClick: () => void
  onEnterEditModeClick: () => void
  onSaveDocumentClick: (keepEditMode: boolean) => void
  saveDocumentButtonColor: T_projectDocumentControlBarSaveButtonColor
  saveDocumentKeepEditModeKeybindLabel: string | null
  saveDocumentKeepEditModeTooltip: string
  saveDocumentKeybindLabel: string | null
  saveDocumentTooltip: string
  showDeleteDocumentButton: boolean
  showDocumentControlBar: boolean
  showEditDocumentButton: boolean
  showSaveDocumentButtons: boolean
}>()
</script>
