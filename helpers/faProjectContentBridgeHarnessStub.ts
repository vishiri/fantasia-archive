import type { I_faProjectContentAPI } from 'app/types/I_faProjectContentAPI'

function stubNamedEntity () {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'Stub',
    displayNameTranslations: { 'en-US': 'Stub' },
    createdAtMs: 0,
    updatedAtMs: 0
  }
}

function stubWorld () {
  return {
    ...stubNamedEntity(),
    color: '#808080',
    colorPallete: '',
    sortOrder: 0
  }
}

function stubWorldForSettings () {
  return {
    ...stubWorld(),
    documentCount: 0,
    templateLayout: {
      groups: [],
      placements: []
    }
  }
}

function stubDocumentTemplate () {
  return {
    ...stubNamedEntity(),
    icon: '',
    sortOrder: 0,
    titlePluralTranslations: { 'en-US': 'Stub' },
    titleSingularTranslations: {},
    worldAppendix: '',
    worldAppendixTranslations: {}
  }
}

import {
  FA_PROJECT_DOCUMENT_STATUS_FLAG_DEFAULTS
} from './openedDocumentTabTestStatusFlagDefaults'

function stubDocument () {
  return {
    ...stubNamedEntity(),
    templateId: null,
    worldId: '550e8400-e29b-41d4-a716-446655440000',
    placementId: null,
    parentDocumentId: null,
    sortOrder: 0,
    documentTextColor: null,
    documentBackgroundColor: null,
    ...FA_PROJECT_DOCUMENT_STATUS_FLAG_DEFAULTS
  }
}

/**
 * No-op projectContent bridge for Storybook canvas and Vitest renderer harnesses.
 */
export function createFaProjectContentBridgeHarnessStub (): I_faProjectContentAPI {
  const emptyList = async () => ({ items: [] })
  const noop = async () => undefined
  return {
    createDocument: async () => stubDocument(),
    createDocumentTemplate: async () => stubDocumentTemplate(),
    createMedia: async () => stubNamedEntity(),
    createWorld: async () => stubWorld(),
    deleteDocument: noop,
    deleteDocumentTemplate: noop,
    deleteMedia: noop,
    deleteWorld: noop,
    getDocumentById: async () => stubDocument(),
    getDocumentTemplateById: async () => stubDocumentTemplate(),
    getMediaById: async () => stubNamedEntity(),
    getWorldById: async () => stubWorld(),
    linkDocumentMedia: noop,
    listDocumentMedia: emptyList,
    listDocumentTemplates: emptyList,
    listDocumentTemplatesForProjectSettings: async () => ({ items: [] }),
    listDocuments: emptyList,
    listMedia: emptyList,
    listWorlds: emptyList,
    listWorldsForProjectSettings: async () => ({ items: [stubWorldForSettings()] }),
    listWorkspaceHierarchyLayout: async () => ({ worlds: [] }),
    listPlacementDocumentChildren: emptyList,
    reindexDocumentSiblingsInHierarchy: async () => ({
      id: '550e8400-e29b-41d4-a716-446655440000',
      displayName: 'Stub',
      placementId: 'placement-stub',
      parentDocumentId: null,
      sortOrder: 0,
      isCategory: false,
      hasChildren: false
    }),
    moveDocumentInHierarchy: async () => ({
      id: '550e8400-e29b-41d4-a716-446655440000',
      displayName: 'Stub',
      placementId: 'placement-stub',
      parentDocumentId: null,
      sortOrder: 0,
      isCategory: false,
      hasChildren: false
    }),
    searchProjectHierarchy: async (query) => {
      return {
        hits: [],
        query
      }
    },
    saveDocumentTemplatesSnapshot: noop,
    saveWorldsSnapshot: noop,
    setDocumentTemplate: async () => stubDocument(),
    setDocumentWorld: async () => stubDocument(),
    unlinkDocumentMedia: noop,
    updateDocument: async () => stubDocument(),
    updateDocumentTemplate: async () => stubDocumentTemplate(),
    updateMedia: async () => stubNamedEntity(),
    updateWorld: async () => stubWorld()
  }
}
