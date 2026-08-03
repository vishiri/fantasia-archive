import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreePlacementCount from '../ProjectHierarchyTreePlacementCount.vue'

const meta = {
  component: ProjectHierarchyTreePlacementCount,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreePlacementCount'
} satisfies Meta<typeof ProjectHierarchyTreePlacementCount>

export default meta

export const DocumentAndCategory: StoryObj<typeof meta> = {
  args: {
    categoryCount: 2,
    display: {
      doubleDashDivider: false,
      segments: [
        {
          kind: 'document',
          value: 3
        },
        {
          kind: 'category',
          value: 2
        }
      ],
      showDivider: true,
      shows: true
    },
    documentCount: 3,
    testLocator: 'projectHierarchyTree-placementCount-story'
  }
}

export const DoubleDashDivider: StoryObj<typeof meta> = {
  args: {
    categoryCount: 2,
    display: {
      doubleDashDivider: true,
      segments: [
        {
          kind: 'document',
          value: 3
        },
        {
          kind: 'category',
          value: 2
        }
      ],
      showDivider: true,
      shows: true
    },
    documentCount: 3,
    testLocator: 'projectHierarchyTree-placementCount-story-double'
  }
}
