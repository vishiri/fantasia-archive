<template>
  <Teleport
    v-if="showAppControlBar"
    to="body"
  >
    <div
      class="projectAppControlBar projectAppControlBar--fixedStrip"
      :class="{ 'projectAppControlBar--fixedStrip--treeHidden': hideHierarchyTree }"
      data-test-locator="projectAppControlBar"
    >
      <div class="projectAppControlBar__blocker" />
      <div class="projectAppControlBar__wrapper">
        <div class="projectAppControlBar__left">
          <ProjectAppControlBarFixedStripLeft
            :advanced-search-guide-keybind-label="advancedSearchGuideKeybindLabel"
            :advanced-search-guide-tooltip="advancedSearchGuideTooltip"
            :keyboard-shortcuts-keybind-label="keyboardShortcutsKeybindLabel"
            :keyboard-shortcuts-tooltip="keyboardShortcutsTooltip"
            :on-advanced-search-guide-click="onAdvancedSearchGuideClick"
            :on-keyboard-shortcuts-click="onKeyboardShortcutsClick"
            :on-quick-add-click="onQuickAddClick"
            :on-quick-search-click="onQuickSearchClick"
            :on-tips-tricks-trivia-click="onTipsTricksTriviaClick"
            :on-toggle-app-noteboard-click="onToggleAppNoteboardClick"
            :on-toggle-hierarchy-tree-click="onToggleHierarchyTreeClick"
            :on-toggle-project-noteboard-click="onToggleProjectNoteboardClick"
            :quick-add-tooltip="quickAddTooltip"
            :quick-search-tooltip="quickSearchTooltip"
            :show-content-buttons="showContentButtons"
            :show-function-buttons="showFunctionButtons"
            :show-guide-buttons="showGuideButtons"
            :tips-tricks-trivia-tooltip="tipsTricksTriviaTooltip"
            :toggle-app-noteboard-keybind-label="toggleAppNoteboardKeybindLabel"
            :toggle-app-noteboard-tooltip="toggleAppNoteboardTooltip"
            :toggle-hierarchy-tree-keybind-label="toggleHierarchyTreeKeybindLabel"
            :toggle-hierarchy-tree-tooltip="toggleHierarchyTreeTooltip"
            :toggle-project-noteboard-keybind-label="toggleProjectNoteboardKeybindLabel"
            :toggle-project-noteboard-tooltip="toggleProjectNoteboardTooltip"
          />
        </div>
        <ProjectAppControlBarFixedStripRight
          :add-new-document-under-this-tooltip="addNewDocumentUnderThisTooltip"
          :copy-current-document-tooltip="copyCurrentDocumentTooltip"
          :delete-current-document-tooltip="deleteCurrentDocumentTooltip"
          :edit-document-keybind-label="editDocumentKeybindLabel"
          :edit-document-tooltip="editDocumentTooltip"
          :on-add-new-document-under-current-click="onAddNewDocumentUnderCurrentClick"
          :on-copy-current-document-click="onCopyCurrentDocumentClick"
          :on-delete-current-document-click="onDeleteCurrentDocumentClick"
          :on-enter-edit-mode-click="onEnterEditModeClick"
          :on-save-document-click="onSaveDocumentClick"
          :save-document-button-color="saveDocumentButtonColor"
          :save-document-keep-edit-mode-keybind-label="saveDocumentKeepEditModeKeybindLabel"
          :save-document-keep-edit-mode-tooltip="saveDocumentKeepEditModeTooltip"
          :save-document-keybind-label="saveDocumentKeybindLabel"
          :save-document-tooltip="saveDocumentTooltip"
          :show-delete-document-button="showDeleteDocumentButton"
          :show-document-structure-buttons="showDocumentStructureButtons"
          :show-edit-document-button="showEditDocumentButton"
          :show-save-document-buttons="showSaveDocumentButtons"
        />
      </div>
    </div>
  </Teleport>
  <div
    v-if="showAppControlBar"
    aria-hidden="true"
    class="projectAppControlBar__flowSpacer"
  />
</template>

<script setup lang="ts">
import type { T_projectAppControlBarSaveButtonColor } from 'app/types/T_projectAppControlBarSaveButtonColor'

import ProjectAppControlBarFixedStripLeft from './ProjectAppControlBarFixedStripLeft.vue'
import ProjectAppControlBarFixedStripRight from './ProjectAppControlBarFixedStripRight.vue'

defineOptions({
  name: 'ProjectAppControlBarFixedStrip'
})

defineProps<{
  addNewDocumentUnderThisTooltip: string
  advancedSearchGuideKeybindLabel: string | null
  advancedSearchGuideTooltip: string
  copyCurrentDocumentTooltip: string
  deleteCurrentDocumentTooltip: string
  editDocumentKeybindLabel: string | null
  editDocumentTooltip: string
  hideHierarchyTree: boolean
  keyboardShortcutsKeybindLabel: string | null
  keyboardShortcutsTooltip: string
  onAddNewDocumentUnderCurrentClick: () => void
  onAdvancedSearchGuideClick: () => void
  onCopyCurrentDocumentClick: () => void
  onDeleteCurrentDocumentClick: () => void
  onEnterEditModeClick: () => void
  onKeyboardShortcutsClick: () => void
  onQuickAddClick: () => void
  onQuickSearchClick: () => void
  onSaveDocumentClick: (keepEditMode: boolean) => void
  onTipsTricksTriviaClick: () => void
  onToggleAppNoteboardClick: () => void
  onToggleHierarchyTreeClick: () => void
  onToggleProjectNoteboardClick: () => void
  quickAddTooltip: string
  quickSearchTooltip: string
  saveDocumentButtonColor: T_projectAppControlBarSaveButtonColor
  saveDocumentKeepEditModeKeybindLabel: string | null
  saveDocumentKeepEditModeTooltip: string
  saveDocumentKeybindLabel: string | null
  saveDocumentTooltip: string
  showContentButtons: boolean
  showDeleteDocumentButton: boolean
  showDocumentStructureButtons: boolean
  showAppControlBar: boolean
  showEditDocumentButton: boolean
  showFunctionButtons: boolean
  showGuideButtons: boolean
  showSaveDocumentButtons: boolean
  tipsTricksTriviaTooltip: string
  toggleAppNoteboardKeybindLabel: string | null
  toggleAppNoteboardTooltip: string
  toggleHierarchyTreeKeybindLabel: string | null
  toggleHierarchyTreeTooltip: string
  toggleProjectNoteboardKeybindLabel: string | null
  toggleProjectNoteboardTooltip: string
}>()
</script>
