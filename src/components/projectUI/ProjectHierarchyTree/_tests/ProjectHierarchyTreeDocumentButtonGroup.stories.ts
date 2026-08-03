import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeDocumentButtonGroup from '../ProjectHierarchyTreeDocumentButtonGroup.vue'

const meta = {
  component: ProjectHierarchyTreeDocumentButtonGroup,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeDocumentButtonGroup'
} satisfies Meta<typeof ProjectHierarchyTreeDocumentButtonGroup>

export default meta

export const AllButtons: StoryObj<typeof meta> = {
  args: {
    showsAddUnder: true,
    showsEdit: true,
    showsOpen: true
  }
}

export const OpenAndEditOnly: StoryObj<typeof meta> = {
  args: {
    showsAddUnder: false,
    showsEdit: true,
    showsOpen: true
  }
}
