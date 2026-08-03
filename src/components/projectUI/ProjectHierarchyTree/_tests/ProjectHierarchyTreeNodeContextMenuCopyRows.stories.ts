import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeNodeContextMenuCopyRows from '../ProjectHierarchyTreeNodeContextMenuCopyRows.vue'

const meta = {
  component: ProjectHierarchyTreeNodeContextMenuCopyRows,
  parameters: {
    docs: {
      story: {
        inline: false
      }
    }
  },
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNodeContextMenuCopyRows'
} satisfies Meta<typeof ProjectHierarchyTreeNodeContextMenuCopyRows>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    copyBackgroundColorLabel: 'Copy background color',
    copyNameLabel: 'Copy name',
    copyTextColorLabel: 'Copy text color',
    onCopyBackgroundColorClick: () => {},
    onCopyNameClick: () => {},
    onCopyTextColorClick: () => {}
  },
  render: (args) => ({
    components: {
      ProjectHierarchyTreeNodeContextMenuCopyRows
    },
    setup () {
      return {
        args
      }
    },
    template: `
      <q-list dark style="max-width: 320px; background: #1d1d1d;">
        <ProjectHierarchyTreeNodeContextMenuCopyRows v-bind="args" />
      </q-list>
    `
  })
}
