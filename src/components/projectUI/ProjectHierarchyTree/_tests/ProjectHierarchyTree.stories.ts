import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'

import ProjectHierarchyTree from '../ProjectHierarchyTree.vue'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'

const meta = {
  component: ProjectHierarchyTree,
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTree'
} satisfies Meta<typeof ProjectHierarchyTree>

export default meta

const storyWorlds = [
  {
    color: '#4caf50',
    displayName: 'Eldoria',
    groups: [
      {
        displayName: 'Characters',
        hasChildren: true,
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        rootSortOrder: 0,
        worldId: '550e8400-e29b-41d4-a716-446655440001'
      }
    ],
    id: '550e8400-e29b-41d4-a716-446655440001',
    placements: [
      {
        displayName: 'Character',
        documentTemplateId: '7c9e6679-7425-40de-944b-e07fc1f90ae8',
        groupId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        groupSortOrder: 0,
        hasChildren: true,
        icon: 'mdi-account',
        id: '7c9e6679-7425-40de-944b-e07fc1f90ae9',
        nickname: 'Heroes',
        rootSortOrder: null,
        worldId: '550e8400-e29b-41d4-a716-446655440001'
      }
    ],
    sortOrder: 0
  }
]

async function seedHierarchyStoryStores (): Promise<void> {
  const pinia = createPinia()
  setActivePinia(pinia)
  S_FaActiveProject().$patch({
    activeProject: {
      filePath: '/storybook/sample.faproject',
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Storybook Sample Project'
    },
    hasActiveProject: true
  })
  const contentApi = window.faContentBridgeAPIs?.projectContent
  if (contentApi !== undefined) {
    contentApi.listWorkspaceHierarchyLayout = async () => ({
      worlds: storyWorlds
    })
    contentApi.listPlacementDocumentChildren = async () => ({
      items: [
        {
          displayName: 'Test Document - Character 01',
          hasChildren: false,
          id: '7c9e6679-7425-40de-944b-e07fc1f90afa',
          parentDocumentId: null,
          placementId: '7c9e6679-7425-40de-944b-e07fc1f90ae9',
          sortOrder: 0
        }
      ]
    })
  }
  await S_FaProjectHierarchyTree().refreshLayout()
}

export const Default: StoryObj<typeof meta> = {
  loaders: [
    async () => {
      await seedHierarchyStoryStores()
      return {}
    }
  ],
  render: () => ({
    components: {
      ProjectHierarchyTree
    },
    template: '<div style="height: 360px; width: 375px;"><ProjectHierarchyTree /></div>'
  })
}
