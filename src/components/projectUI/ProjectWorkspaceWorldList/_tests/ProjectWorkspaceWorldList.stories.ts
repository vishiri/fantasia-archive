import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectWorkspaceWorldList from '../ProjectWorkspaceWorldList.vue'

const meta = {
  component: ProjectWorkspaceWorldList,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectWorkspaceWorldList'
} satisfies Meta<typeof ProjectWorkspaceWorldList>

export default meta

export const Default: StoryObj<typeof meta> = {}
