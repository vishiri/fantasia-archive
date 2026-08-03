import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeNodeContextMenuBulkRows from '../ProjectHierarchyTreeNodeContextMenuBulkRows.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenuBulkRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenuBulkRows'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenuBulkRows>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    collapseAllUnderNodeLabel: 'Collapse all under this node',
    expandAllUnderNodeLabel: 'Expand all under this node',
    onCollapseAllClick: () => {},
    onExpandAllClick: () => {}
  },
  render: (args) => ({
    components: {
      ProjectHierarchyTreeNodeContextMenuBulkRows
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 320px; background: #1d1d1d;">
        <ProjectHierarchyTreeNodeContextMenuBulkRows v-bind="args" />
      </q-list>
    `
  })
}
