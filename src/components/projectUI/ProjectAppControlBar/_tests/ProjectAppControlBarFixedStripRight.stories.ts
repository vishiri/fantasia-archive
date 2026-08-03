import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectAppControlBarFixedStripRight from '../ProjectAppControlBarFixedStripRight.vue'

const meta = {
  component: ProjectAppControlBarFixedStripRight,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectAppControlBarFixedStripRight'
} satisfies Meta<typeof ProjectAppControlBarFixedStripRight>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    addNewDocumentUnderThisTooltip: 'Add new document under this',
    copyCurrentDocumentTooltip: 'Copy current document',
    deleteCurrentDocumentTooltip: 'Delete document',
    editDocumentKeybindLabel: 'Ctrl+E',
    editDocumentTooltip: 'Edit document',
    onAddNewDocumentUnderCurrentClick: () => {},
    onCopyCurrentDocumentClick: () => {},
    onDeleteCurrentDocumentClick: () => {},
    onEnterEditModeClick: () => {},
    onSaveDocumentClick: () => {},
    saveDocumentButtonColor: 'primary-bright',
    saveDocumentKeepEditModeKeybindLabel: 'Ctrl+Shift+S',
    saveDocumentKeepEditModeTooltip: 'Save and keep editing',
    saveDocumentKeybindLabel: 'Ctrl+S',
    saveDocumentTooltip: 'Save document',
    showDeleteDocumentButton: true,
    showDocumentStructureButtons: true,
    showEditDocumentButton: true,
    showSaveDocumentButtons: true
  },
  render: (args) => ({
    components: {
      ProjectAppControlBarFixedStripRight
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <div class="bg-dark q-pa-md" style="display: flex; justify-content: flex-end;">
        <ProjectAppControlBarFixedStripRight v-bind="args" />
      </div>
    `
  })
}
