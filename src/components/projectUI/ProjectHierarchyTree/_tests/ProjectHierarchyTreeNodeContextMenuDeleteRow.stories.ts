import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeNodeContextMenuDeleteRow from '../ProjectHierarchyTreeNodeContextMenuDeleteRow.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenuDeleteRow,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenuDeleteRow'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenuDeleteRow>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    deleteDocumentLabel: 'Delete document',
    onDeleteDocumentClick: () => {}
  },
  render: (args) => ({
    components: {
      ProjectHierarchyTreeNodeContextMenuDeleteRow
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 320px; background: #1d1d1d;">
        <ProjectHierarchyTreeNodeContextMenuDeleteRow v-bind="args" />
      </q-list>
    `
  })
}
