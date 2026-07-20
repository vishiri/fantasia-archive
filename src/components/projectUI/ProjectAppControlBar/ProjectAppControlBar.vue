<template>
  <div class="projectAppControlBarHost">
    <ProjectAppControlBarOpenedTabs
      :active-document-tab-name="activeDocumentTabName"
      :move-document-tab-left-keybind-label="moveDocumentTabLeftKeybindLabel"
      :move-document-tab-right-keybind-label="moveDocumentTabRightKeybindLabel"
      :on-tab-add-new-document-under-this-click="onTabAddNewDocumentUnderThisClick"
      :on-tab-aux-click="onTabAuxClick"
      :on-tab-close-all-without-changes-click="onTabCloseAllWithoutChangesClick"
      :on-tab-close-all-without-changes-except-click="onTabCloseAllWithoutChangesExceptClick"
      :on-tab-close-click="onTabCloseClick"
      :on-tab-copy-background-color-click="onTabCopyBackgroundColorClick"
      :on-tab-copy-document-click="onTabCopyDocumentClick"
      :on-tab-copy-name-click="onTabCopyNameClick"
      :on-tab-copy-text-color-click="onTabCopyTextColorClick"
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
      :show-document-tabs="showDocumentTabs"
      :show-world-tab-indicators="showWorldTabIndicators"
    />
    <ProjectAppControlBarFixedStrip
      :advanced-search-guide-keybind-label="advancedSearchGuideKeybindLabel"
      :advanced-search-guide-tooltip="advancedSearchGuideTooltip"
      :add-new-document-under-this-tooltip="addNewDocumentUnderThisTooltip"
      :copy-current-document-tooltip="copyCurrentDocumentTooltip"
      :delete-current-document-tooltip="deleteCurrentDocumentTooltip"
      :edit-document-keybind-label="editDocumentKeybindLabel"
      :edit-document-tooltip="editDocumentTooltip"
      :hide-hierarchy-tree="hideHierarchyTree"
      :keyboard-shortcuts-keybind-label="keyboardShortcutsKeybindLabel"
      :keyboard-shortcuts-tooltip="keyboardShortcutsTooltip"
      :on-advanced-search-guide-click="onAdvancedSearchGuideClick"
      :on-add-new-document-under-current-click="onAddNewDocumentUnderCurrentClick"
      :on-copy-current-document-click="onCopyCurrentDocumentClick"
      :on-delete-current-document-click="onDeleteCurrentDocumentClick"
      :on-enter-edit-mode-click="onEnterEditModeClick"
      :on-keyboard-shortcuts-click="onKeyboardShortcutsClick"
      :on-quick-add-click="onQuickAddClick"
      :on-quick-search-click="onQuickSearchClick"
      :on-save-document-click="onSaveDocumentClick"
      :on-tips-tricks-trivia-click="onTipsTricksTriviaClick"
      :on-toggle-app-noteboard-click="onToggleAppNoteboardClick"
      :on-toggle-hierarchy-tree-click="onToggleHierarchyTreeClick"
      :on-toggle-project-noteboard-click="onToggleProjectNoteboardClick"
      :quick-add-tooltip="quickAddTooltip"
      :quick-search-tooltip="quickSearchTooltip"
      :save-document-button-color="saveDocumentButtonColor"
      :save-document-keep-edit-mode-keybind-label="saveDocumentKeepEditModeKeybindLabel"
      :save-document-keep-edit-mode-tooltip="saveDocumentKeepEditModeTooltip"
      :save-document-keybind-label="saveDocumentKeybindLabel"
      :save-document-tooltip="saveDocumentTooltip"
      :show-content-buttons="showContentButtons"
      :show-delete-document-button="showDeleteDocumentButton"
      :show-document-structure-buttons="showDocumentStructureButtons"
      :show-app-control-bar="showAppControlBar"
      :show-edit-document-button="showEditDocumentButton"
      :show-function-buttons="showFunctionButtons"
      :show-guide-buttons="showGuideButtons"
      :show-save-document-buttons="showSaveDocumentButtons"
      :tips-tricks-trivia-tooltip="tipsTricksTriviaTooltip"
      :toggle-app-noteboard-keybind-label="toggleAppNoteboardKeybindLabel"
      :toggle-app-noteboard-tooltip="toggleAppNoteboardTooltip"
      :toggle-hierarchy-tree-keybind-label="toggleHierarchyTreeKeybindLabel"
      :toggle-hierarchy-tree-tooltip="toggleHierarchyTreeTooltip"
      :toggle-project-noteboard-keybind-label="toggleProjectNoteboardKeybindLabel"
      :toggle-project-noteboard-tooltip="toggleProjectNoteboardTooltip"
    />
    <DialogDiscardOpenedDocumentTab />
    <DialogDeleteOpenedDocument />
  </div>
</template>

<script setup lang="ts">
import DialogDeleteOpenedDocument from 'app/src/components/dialogs/DialogDeleteOpenedDocument/DialogDeleteOpenedDocument.vue'
import DialogDiscardOpenedDocumentTab from 'app/src/components/dialogs/DialogDiscardOpenedDocumentTab/DialogDiscardOpenedDocumentTab.vue'

import ProjectAppControlBarFixedStrip from './ProjectAppControlBarFixedStrip.vue'
import ProjectAppControlBarOpenedTabs from './ProjectAppControlBarOpenedTabs.vue'

import {
  useProjectAppControlBar,
  useProjectAppControlBarI18nTooltips
} from './scripts/projectAppControlBar_manager'

defineOptions({
  name: 'ProjectAppControlBar'
})

const {
  addNewDocumentUnderThisTooltip,
  advancedSearchGuideTooltip,
  copyCurrentDocumentTooltip,
  deleteCurrentDocumentTooltip,
  editDocumentTooltip,
  keyboardShortcutsTooltip,
  quickAddTooltip,
  quickSearchTooltip,
  saveDocumentKeepEditModeTooltip,
  saveDocumentTooltip,
  tipsTricksTriviaTooltip,
  toggleAppNoteboardTooltip,
  toggleHierarchyTreeTooltip,
  toggleProjectNoteboardTooltip
} = useProjectAppControlBarI18nTooltips()

const {
  activeDocumentTabName,
  advancedSearchGuideKeybindLabel,
  editDocumentKeybindLabel,
  hideHierarchyTree,
  keyboardShortcutsKeybindLabel,
  moveDocumentTabLeftKeybindLabel,
  moveDocumentTabRightKeybindLabel,
  onAddNewDocumentUnderCurrentClick,
  onAdvancedSearchGuideClick,
  onCopyCurrentDocumentClick,
  onEnterEditModeClick,
  onDeleteCurrentDocumentClick,
  onKeyboardShortcutsClick,
  onQuickAddClick,
  onQuickSearchClick,
  onSaveDocumentClick,
  onTipsTricksTriviaClick,
  onToggleAppNoteboardClick,
  onToggleHierarchyTreeClick,
  onToggleProjectNoteboardClick,
  onTabAuxClick,
  onTabCloseAllWithoutChangesClick,
  onTabCloseAllWithoutChangesExceptClick,
  onTabCloseClick,
  onTabCopyBackgroundColorClick,
  onTabCopyDocumentClick,
  onTabCopyNameClick,
  onTabCopyTextColorClick,
  onTabAddNewDocumentUnderThisClick,
  onTabDeleteClick,
  onTabForceCloseAllClick,
  onTabForceCloseAllExceptClick,
  onTabMoveClick,
  openedDocumentTabs,
  resolveDocumentTabLabel,
  resolveDocumentTabAppearanceChrome,
  resolveDocumentTabDisplayIcon,
  resolveDocumentTabInlineStyle,
  resolveDocumentTabRoute,
  resolveTabWorldIndicatorColor,
  saveDocumentKeepEditModeKeybindLabel,
  saveDocumentKeybindLabel,
  showDeleteDocumentButton,
  showDocumentStructureButtons,
  showAppControlBar,
  showContentButtons,
  showDocumentTabs,
  showWorldTabIndicators,
  showEditDocumentButton,
  showFunctionButtons,
  showGuideButtons,
  showSaveDocumentButtons,
  saveDocumentButtonColor,
  toggleAppNoteboardKeybindLabel,
  toggleHierarchyTreeKeybindLabel,
  toggleProjectNoteboardKeybindLabel
} = useProjectAppControlBar()
</script>

<style lang="scss" src="./styles/ProjectAppControlBar.unscoped.scss"></style>
