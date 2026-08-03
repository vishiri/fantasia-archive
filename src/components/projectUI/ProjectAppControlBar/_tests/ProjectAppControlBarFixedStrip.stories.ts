import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarFixedStrip from '../ProjectAppControlBarFixedStrip.vue'

const meta = {
  component: ProjectAppControlBarFixedStrip,
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarFixedStrip'
} satisfies Meta<typeof ProjectAppControlBarFixedStrip>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    addNewDocumentUnderThisTooltip: 'Add new document under this',
    advancedSearchGuideKeybindLabel: null,
    advancedSearchGuideTooltip: 'Advanced search guide',
    copyCurrentDocumentTooltip: 'Copy current document',
    deleteCurrentDocumentTooltip: 'Delete document',
    editDocumentKeybindLabel: 'Ctrl+E',
    editDocumentTooltip: 'Edit document',
    hideHierarchyTree: false,
    keyboardShortcutsKeybindLabel: null,
    keyboardShortcutsTooltip: 'Keyboard shortcuts',
    onAddNewDocumentUnderCurrentClick: () => {},
    onAdvancedSearchGuideClick: () => {},
    onCopyCurrentDocumentClick: () => {},
    onDeleteCurrentDocumentClick: () => {},
    onEnterEditModeClick: () => {},
    onKeyboardShortcutsClick: () => {},
    onQuickAddClick: () => {},
    onQuickSearchClick: () => {},
    onSaveDocumentClick: () => {},
    onTipsTricksTriviaClick: () => {},
    onToggleAppNoteboardClick: () => {},
    onToggleHierarchyTreeClick: () => {},
    onToggleProjectNoteboardClick: () => {},
    quickAddTooltip: 'Quick add',
    quickSearchTooltip: 'Quick search',
    saveDocumentButtonColor: 'primary-bright',
    saveDocumentKeepEditModeKeybindLabel: 'Ctrl+Shift+S',
    saveDocumentKeepEditModeTooltip: 'Save and keep editing',
    saveDocumentKeybindLabel: 'Ctrl+S',
    saveDocumentTooltip: 'Save document',
    showAppControlBar: true,
    showAppNoteboardContentDot: false,
    showContentButtons: true,
    showDeleteDocumentButton: true,
    showDocumentStructureButtons: true,
    showEditDocumentButton: true,
    showFunctionButtons: true,
    showGuideButtons: true,
    showProjectNoteboardContentDot: false,
    showSaveDocumentButtons: true,
    tipsTricksTriviaTooltip: 'Tips',
    toggleAppNoteboardKeybindLabel: null,
    toggleAppNoteboardTooltip: 'Toggle app noteboard',
    toggleHierarchyTreeKeybindLabel: null,
    toggleHierarchyTreeTooltip: 'Toggle hierarchy tree',
    toggleProjectNoteboardKeybindLabel: null,
    toggleProjectNoteboardTooltip: 'Toggle project noteboard'
  },
  render: (args) => ({
    components: {
      ProjectAppControlBarFixedStrip
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <div style="min-height: 120px;">
        <ProjectAppControlBarFixedStrip v-bind="args" />
      </div>
    `
  })
}
