import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeProjectNameTitle from '../ProjectHierarchyTreeProjectNameTitle.vue'

const meta = {
  component: ProjectHierarchyTreeProjectNameTitle,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeProjectNameTitle'
} satisfies Meta<typeof ProjectHierarchyTreeProjectNameTitle>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    projectDisplayName: 'Storybook Sample Project'
  }
}
