import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeNodeContextMenuDocumentRows from '../ProjectHierarchyTreeNodeContextMenuDocumentRows.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenuDocumentRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenuDocumentRows'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenuDocumentRows>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    addNewDocumentUnderThisLabel: 'Add new document under this',
    copyDocumentLabel: 'Copy document',
    editDocumentLabel: 'Edit document',
    onAddNewDocumentUnderThisClick: () => {},
    onCopyDocumentClick: () => {},
    onEditDocumentClick: () => {},
    onOpenDocumentClick: () => {},
    openDocumentLabel: 'Open document'
  },
  render: (args) => ({
    components: {
      ProjectHierarchyTreeNodeContextMenuDocumentRows
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 320px; background: #1d1d1d;">
        <ProjectHierarchyTreeNodeContextMenuDocumentRows v-bind="args" />
      </q-list>
    `
  })
}
