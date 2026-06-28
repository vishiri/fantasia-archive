import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeSearch from '../ProjectHierarchyTreeSearch.vue'

const meta = {
  component: ProjectHierarchyTreeSearch,
  parameters: {
    docs: {
      disable: true
    }
  },
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeSearch'
} satisfies Meta<typeof ProjectHierarchyTreeSearch>

export default meta

export const Default: StoryObj<typeof meta> = {}
