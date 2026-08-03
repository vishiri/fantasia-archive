import type { Meta, StoryObj } from '@storybook/vue3-vite'

import ProjectHierarchyTreeNode from '../ProjectHierarchyTreeNode.vue'

const baseNode = {
  children: [],
  childrenLoaded: false,
  documentId: null as string | null,
  groupId: null as string | null,
  hasChildren: true,
  icon: 'mdi-account',
  id: 'node-1',
  label: 'Row label',
  placementId: 'placement-1',
  worldColor: '#112233',
  worldId: 'world-1'
}

const meta = {
  component: ProjectHierarchyTreeNode,
  tags: ['autodocs', 'skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTreeNode'
} satisfies Meta<typeof ProjectHierarchyTreeNode>

export default meta

export const WorldRow: StoryObj<typeof meta> = {
  args: {
    node: {
      ...baseNode,
      icon: '',
      nodeKind: 'world'
    },
    stat: {
      open: true
    }
  }
}

export const PlacementRow: StoryObj<typeof meta> = {
  args: {
    node: {
      ...baseNode,
      nodeKind: 'templatePlacement'
    },
    stat: {
      open: false
    }
  }
}

export const DocumentRow: StoryObj<typeof meta> = {
  args: {
    node: {
      ...baseNode,
      documentId: 'doc-1',
      hasChildren: false,
      label: 'Hero',
      nodeKind: 'document'
    },
    stat: {
      open: false
    }
  }
}
