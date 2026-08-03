import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeOrderNumberBadge from '../ProjectHierarchyTreeOrderNumberBadge.vue'

const meta = {
  component: ProjectHierarchyTreeOrderNumberBadge,
  decorators: [
    (story) => ({
      components: {
        story
      },
      template: `
        <div style="position: relative; width: 48px; height: 48px; margin: 2rem;">
          <story />
        </div>
      `
    })
  ],
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeOrderNumberBadge'
} satisfies Meta<typeof ProjectHierarchyTreeOrderNumberBadge>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    label: '12'
  }
}
