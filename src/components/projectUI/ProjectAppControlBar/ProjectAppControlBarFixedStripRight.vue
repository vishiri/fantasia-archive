<template>
  <div class="projectAppControlBar__right">
    <q-btn
      v-if="showEditDocumentButton"
      color="primary-bright"
      data-test-locator="projectAppControlBar-editDocumentButton"
      icon="mdi-file-document-edit"
      outline
      @click="onEnterEditModeClick"
    >
      <q-tooltip
        anchor="bottom middle"
        class="projectAppControlBar__buttonTooltip"
        :delay="500"
        self="top middle"
      >
        <div class="fa-tooltip-keybind-stack">
          <span class="fa-tooltip-keybind-stack__label">
            {{ editDocumentTooltip }}
          </span><div
            v-if="editDocumentKeybindLabel !== null"
            class="fa-tooltip-keybind-hint fa-text-keybind-hint"
            data-test-locator="projectAppControlBar-editDocumentButton-keybind"
          >
            ({{ editDocumentKeybindLabel }})
          </div>
        </div>
      </q-tooltip>
    </q-btn>
    <q-btn
      v-if="showSaveDocumentButtons"
      :color="saveDocumentButtonColor"
      data-test-locator="projectAppControlBar-saveDocumentKeepEditModeButton"
      icon="mdi-content-save-edit"
      outline
      @click="onSaveDocumentClick(true)"
    >
      <q-tooltip
        anchor="bottom left"
        class="projectAppControlBar__buttonTooltip"
        :delay="500"
        self="top middle"
      >
        <div class="fa-tooltip-keybind-stack">
          <span class="fa-tooltip-keybind-stack__label">
            {{ saveDocumentKeepEditModeTooltip }}
          </span><div
            v-if="saveDocumentKeepEditModeKeybindLabel !== null"
            class="fa-tooltip-keybind-hint fa-text-keybind-hint"
            data-test-locator="projectAppControlBar-saveDocumentKeepEditModeButton-keybind"
          >
            ({{ saveDocumentKeepEditModeKeybindLabel }})
          </div>
        </div>
      </q-tooltip>
    </q-btn>
    <q-btn
      v-if="showSaveDocumentButtons"
      :color="saveDocumentButtonColor"
      data-test-locator="projectAppControlBar-saveDocumentButton"
      icon="mdi-content-save"
      outline
      @click="onSaveDocumentClick(false)"
    >
      <q-tooltip
        anchor="bottom left"
        class="projectAppControlBar__buttonTooltip"
        :delay="500"
        self="top middle"
      >
        <div class="fa-tooltip-keybind-stack">
          <span class="fa-tooltip-keybind-stack__label">
            {{ saveDocumentTooltip }}
          </span><div
            v-if="saveDocumentKeybindLabel !== null"
            class="fa-tooltip-keybind-hint fa-text-keybind-hint"
            data-test-locator="projectAppControlBar-saveDocumentButton-keybind"
          >
            ({{ saveDocumentKeybindLabel }})
          </div>
        </div>
      </q-tooltip>
    </q-btn>
    <q-btn
      v-if="showDocumentStructureButtons"
      color="primary-bright"
      data-test-locator="projectAppControlBar-copyCurrentDocumentButton"
      icon="mdi-content-copy"
      outline
      @click="onCopyCurrentDocumentClick"
    >
      <q-tooltip
        anchor="bottom middle"
        class="projectAppControlBar__buttonTooltip"
        :delay="500"
        self="top middle"
      >
        {{ copyCurrentDocumentTooltip }}
      </q-tooltip>
    </q-btn>
    <q-btn
      v-if="showDocumentStructureButtons"
      color="primary-bright"
      data-test-locator="projectAppControlBar-addNewDocumentUnderThisButton"
      icon="mdi-file-tree"
      outline
      @click="onAddNewDocumentUnderCurrentClick"
    >
      <q-tooltip
        anchor="bottom middle"
        class="projectAppControlBar__buttonTooltip"
        :delay="500"
        self="top middle"
      >
        {{ addNewDocumentUnderThisTooltip }}
      </q-tooltip>
    </q-btn>
    <ProjectAppControlBarDeleteDocumentButton
      v-if="showDeleteDocumentButton"
      :show-leading-separator="showDocumentStructureButtons"
      :tooltip-label="deleteCurrentDocumentTooltip"
      @click="onDeleteCurrentDocumentClick"
    />
  </div>
</template>

<script setup lang="ts">
import type { T_projectAppControlBarSaveButtonColor } from 'app/types/T_projectAppControlBarSaveButtonColor'

import ProjectAppControlBarDeleteDocumentButton from './ProjectAppControlBarDeleteDocumentButton.vue'

defineOptions({
  name: 'ProjectAppControlBarFixedStripRight'
})

defineProps<{
  addNewDocumentUnderThisTooltip: string
  copyCurrentDocumentTooltip: string
  deleteCurrentDocumentTooltip: string
  editDocumentKeybindLabel: string | null
  editDocumentTooltip: string
  onAddNewDocumentUnderCurrentClick: () => void
  onCopyCurrentDocumentClick: () => void
  onDeleteCurrentDocumentClick: () => void
  onEnterEditModeClick: () => void
  onSaveDocumentClick: (keepEditMode: boolean) => void
  saveDocumentButtonColor: T_projectAppControlBarSaveButtonColor
  saveDocumentKeepEditModeKeybindLabel: string | null
  saveDocumentKeepEditModeTooltip: string
  saveDocumentKeybindLabel: string | null
  saveDocumentTooltip: string
  showDeleteDocumentButton: boolean
  showDocumentStructureButtons: boolean
  showEditDocumentButton: boolean
  showSaveDocumentButtons: boolean
}>()
</script>
