import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeOpenIcon from '../ProjectHierarchyTreeOpenIcon.vue'

const meta = {
  component: ProjectHierarchyTreeOpenIcon,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeOpenIcon'
} satisfies Meta<typeof ProjectHierarchyTreeOpenIcon>

export default meta

export const Expanded: StoryObj<typeof meta> = {
  args: {
    expanded: true,
    pendingExpandAnimation: false
  }
}

export const Collapsed: StoryObj<typeof meta> = {
  args: {
    expanded: false,
    pendingExpandAnimation: false
  }
}
