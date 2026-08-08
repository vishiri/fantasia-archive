import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { createPinia, setActivePinia } from 'pinia'

import ProjectHierarchyTree from '../ProjectHierarchyTree.vue'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

const meta = {
  component: ProjectHierarchyTree,
  tags: ['skip-visual'],
  title: 'Components/projectUI/ProjectHierarchyTree'
} satisfies Meta<typeof ProjectHierarchyTree>

export default meta

const storyWorlds = [
  {
    color: '#4caf50',
    colorPalette: '',
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
        titlePluralTranslations: { 'en-US': 'Characters' },
        titleSingularTranslations: { 'en-US': 'Character' },
        rootSortOrder: null,
        worldId: '550e8400-e29b-41d4-a716-446655440001'
      },
      {
        displayName: 'Scene',
        documentTemplateId: '7c9e6679-7425-40de-944b-e07fc1f90aeb',
        groupId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
        groupSortOrder: 1,
        hasChildren: false,
        icon: 'mdi-map-marker',
        id: '7c9e6679-7425-40de-944b-e07fc1f90aec',
        nickname: 'Scenes',
        titlePluralTranslations: { 'en-US': 'Scenes' },
        titleSingularTranslations: { 'en-US': 'Scene' },
        rootSortOrder: null,
        worldId: '550e8400-e29b-41d4-a716-446655440001'
      }
    ],
    sortOrder: 0
  }
]

const heroesPlacementId = '7c9e6679-7425-40de-944b-e07fc1f90ae9'
const scenesPlacementId = '7c9e6679-7425-40de-944b-e07fc1f90aec'

const storyHeroesDocumentChildren = [
  {
    displayName: 'Test Document - Character 01',
    documentBackgroundColor: null,
    documentTextColor: '#1565c0',
    hasChildren: false,
    id: '7c9e6679-7425-40de-944b-e07fc1f90afa',
    isCategory: false,
    isDead: false,
    isFinished: true,
    isMinor: false,
    parentDocumentId: null,
    placementId: heroesPlacementId,
    sortOrder: 0,
    treeOrderNumber: 10
  },
  {
    displayName: 'Fallen Captain',
    documentBackgroundColor: '#fff3e0',
    documentTextColor: '#c62828',
    hasChildren: false,
    id: '7c9e6679-7425-40de-944b-e07fc1f90afb',
    isCategory: false,
    isDead: true,
    isFinished: false,
    isMinor: true,
    parentDocumentId: null,
    placementId: heroesPlacementId,
    sortOrder: 1,
    treeOrderNumber: 7
  },
  {
    displayName: 'Heroes category',
    documentBackgroundColor: null,
    documentTextColor: null,
    hasChildren: true,
    id: '7c9e6679-7425-40de-944b-e07fc1f90afc',
    isCategory: true,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    placementId: heroesPlacementId,
    sortOrder: 2,
    treeOrderNumber: 1
  }
]

const storyWorldId = '550e8400-e29b-41d4-a716-446655440001'
const storyTagAlphaId = 'a77b1e3c-8ef3-44de-b58f-fdf48741672e'
const storyTagBetaId = 'b638ddb1-eee2-4d78-89db-331723040d9c'
const storyTagWrapperId = `${storyWorldId}__tagWrapper`

const storyWorldsWithTags = [
  {
    ...storyWorlds[0]!,
    tags: [
      {
        categoryCount: 0,
        documentCount: 2,
        id: storyTagAlphaId,
        name: 'Alpha'
      },
      {
        categoryCount: 0,
        documentCount: 1,
        id: storyTagBetaId,
        name: 'Beta'
      }
    ]
  }
]

const storyDocumentsUnderTagAlpha = [
  {
    displayName: 'Test Document - Character 01',
    documentBackgroundColor: '',
    documentId: '7c9e6679-7425-40de-944b-e07fc1f90afa',
    documentTextColor: '#1565c0',
    extraClasses: '',
    isCategory: false,
    isDead: false,
    isFinished: true,
    isMinor: false,
    sortOrder: 0,
    templateId: '7c9e6679-7425-40de-944b-e07fc1f90ae8',
    treeOrderNumber: 10
  },
  {
    displayName: 'Fallen Captain',
    documentBackgroundColor: '#fff3e0',
    documentId: '7c9e6679-7425-40de-944b-e07fc1f90afb',
    documentTextColor: '#c62828',
    extraClasses: '',
    isCategory: false,
    isDead: true,
    isFinished: false,
    isMinor: true,
    sortOrder: 1,
    templateId: '7c9e6679-7425-40de-944b-e07fc1f90ae8',
    treeOrderNumber: 7
  }
]

async function seedHierarchyStoryStores (options?: {
  expandedNodeIds?: string[]
  listDocumentsUnderTag?: typeof window.faContentBridgeAPIs.projectContent.listDocumentsUnderTag
  listPlacementDocumentChildren?: typeof window.faContentBridgeAPIs.projectContent.listPlacementDocumentChildren
  worlds?: typeof storyWorlds
}): Promise<void> {
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
  S_FaUserSettings().$patch({
    settings: {
      hideTreeOrderNumbers: false,
      languageCode: 'en-US'
    }
  })
  const contentApi = window.faContentBridgeAPIs?.projectContent
  if (contentApi !== undefined) {
    contentApi.listWorkspaceHierarchyLayout = async () => ({
      worlds: options?.worlds ?? storyWorlds
    })
    contentApi.listPlacementDocumentChildren = options?.listPlacementDocumentChildren ?? (async () => ({
      items: storyHeroesDocumentChildren
    }))
    contentApi.listDocumentsUnderTag = options?.listDocumentsUnderTag ?? (async () => ({
      items: []
    }))
  }
  await S_FaProjectHierarchyTree().refreshLayout()
  if (options?.expandedNodeIds !== undefined) {
    S_FaProjectHierarchyTree().$patch({
      uiState: {
        expandedNodeIds: options.expandedNodeIds,
        schemaVersion: 1,
        scrollTopPx: 0
      }
    })
  }
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

/** Expanded Heroes placement: add-new row plus order badges / finished / dead / minor / colors. */
export const ExpandedPlacementWithAddNew: StoryObj<typeof meta> = {
  loaders: [
    async () => {
      await seedHierarchyStoryStores({
        expandedNodeIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          heroesPlacementId
        ]
      })
      return {}
    }
  ],
  render: () => ({
    components: {
      ProjectHierarchyTree
    },
    template: '<div style="height: 420px; width: 375px;"><ProjectHierarchyTree /></div>'
  })
}

export const ExpandedEmptyPlacementWithAddNew: StoryObj<typeof meta> = {
  loaders: [
    async () => {
      await seedHierarchyStoryStores({
        expandedNodeIds: [
          '550e8400-e29b-41d4-a716-446655440001',
          '7c9e6679-7425-40de-944b-e07fc1f90ae7',
          scenesPlacementId
        ],
        listPlacementDocumentChildren: async () => ({
          items: []
        })
      })
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

/** World tags wrapper + Alpha tag expanded with under-tag documents. */
export const ExpandedTagsWithDocuments: StoryObj<typeof meta> = {
  loaders: [
    async () => {
      await seedHierarchyStoryStores({
        expandedNodeIds: [
          storyWorldId,
          storyTagWrapperId,
          storyTagAlphaId
        ],
        listDocumentsUnderTag: async (input) => {
          if (input.tagId !== storyTagAlphaId) {
            return {
              items: []
            }
          }
          return {
            items: storyDocumentsUnderTagAlpha
          }
        },
        worlds: storyWorldsWithTags
      })
      return {}
    }
  ],
  render: () => ({
    components: {
      ProjectHierarchyTree
    },
    template: '<div style="height: 480px; width: 375px;"><ProjectHierarchyTree /></div>'
  })
}
