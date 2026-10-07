import type { I_faProjectContentAPI } from 'app/types/I_faProjectContentAPI'

function stubNamedEntity () {
  const displayNameTranslations = { 'en-US': 'Stub' }
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'Stub',
    displayNameTranslations,
    createdAtMs: 0,
    updatedAtMs: 0
  }
}

function stubMedia () {
  const type = 'external' as const
  const internalType = '' as const
  const externalType = '' as const
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'Stub',
    type,
    internalType,
    externalType,
    externalLink: '',
    externalEmbed: '',
    internalLink: '',
    internalEmbed: null,
    createdAtMs: 0,
    updatedAtMs: 0
  }
}

function stubWorld () {
  const namedEntity = stubNamedEntity()
  return {
    ...namedEntity,
    color: '#808080',
    colorPalette: '',
    sortOrder: 0
  }
}

function stubWorldForSettings () {
  const world = stubWorld()
  const templateLayout = {
    groups: [],
    placements: []
  }
  return {
    ...world,
    documentCount: 0,
    templateLayout
  }
}

function stubDocumentTemplate () {
  const namedEntity = stubNamedEntity()
  const titlePluralTranslations = { 'en-US': 'Stub' }
  const titleSingularTranslations = {}
  const worldAppendixTranslations = {}
  return {
    ...namedEntity,
    icon: '',
    sortOrder: 0,
    titlePluralTranslations,
    titleSingularTranslations,
    worldAppendix: '',
    worldAppendixTranslations
  }
}

import {
  FA_PROJECT_DOCUMENT_STATUS_FLAG_DEFAULTS
} from './openedDocumentTabTestStatusFlagDefaults'

function stubDocument () {
  const namedEntity = stubNamedEntity()
  return {
    ...namedEntity,
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
async function emptyProjectContentList () {
  const items: never[] = []
  return { items }
}

async function noopProjectContentCall () {
  return undefined
}

async function returnStubDocument () {
  return stubDocument()
}

async function returnStubDocumentTemplate () {
  return stubDocumentTemplate()
}

async function returnStubMedia () {
  return stubMedia()
}

async function returnStubWorld () {
  return stubWorld()
}

async function listDocumentDistribution () {
  const counts: never[] = []
  const templates: never[] = []
  const worlds: never[] = []
  return {
    counts,
    documentTemplateTotalCount: 0,
    templates,
    totalDocumentCount: 0,
    worlds
  }
}

async function listWorldsForProjectSettings () {
  const items = [stubWorldForSettings()]
  return { items }
}

async function listWorkspaceHierarchyLayout () {
  const worlds: never[] = []
  return { worlds }
}

async function stubHierarchyDocumentMove () {
  return {
    id: '550e8400-e29b-41d4-a716-446655440000',
    displayName: 'Stub',
    placementId: 'placement-stub',
    parentDocumentId: null,
    sortOrder: 0,
    isCategory: false,
    hasChildren: false
  }
}

async function renameTag () {
  const tag = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    worldId: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Stub',
    createdAtMs: 0,
    updatedAtMs: 0
  }
  return {
    tag,
    merged: false,
    mergedFromTagId: null
  }
}

async function searchProjectHierarchy (query: string) {
  const hits: never[] = []
  return {
    hits,
    query
  }
}

async function upsertMedia () {
  const items = [stubMedia()]
  return { items }
}

export function createFaProjectContentBridgeHarnessStub (): I_faProjectContentAPI {
  return {
    createDocument: returnStubDocument,
    createDocumentTemplate: returnStubDocumentTemplate,
    createMedia: returnStubMedia,
    createWorld: returnStubWorld,
    deleteDocument: noopProjectContentCall,
    deleteDocumentTemplate: noopProjectContentCall,
    deleteMedia: noopProjectContentCall,
    deleteWorld: noopProjectContentCall,
    getDocumentById: returnStubDocument,
    getDocumentTemplateById: returnStubDocumentTemplate,
    getMediaById: returnStubMedia,
    getWorldById: returnStubWorld,
    linkDocumentMedia: noopProjectContentCall,
    listDocumentDistribution,
    listDocumentLastOpened: emptyProjectContentList,
    listDocumentMedia: emptyProjectContentList,
    listDocumentTags: emptyProjectContentList,
    listDocumentsUnderTag: emptyProjectContentList,
    listTagsForWorld: emptyProjectContentList,
    listTagsWithDocumentCountsForWorld: emptyProjectContentList,
    listDocumentTemplates: emptyProjectContentList,
    listDocumentTemplatesForProjectSettings: emptyProjectContentList,
    listDocuments: emptyProjectContentList,
    listMedia: emptyProjectContentList,
    listWorlds: emptyProjectContentList,
    listWorldsForProjectSettings,
    listWorkspaceHierarchyLayout,
    listPlacementDocumentChildren: emptyProjectContentList,
    reindexDocumentSiblingsInHierarchy: stubHierarchyDocumentMove,
    moveDocumentInHierarchy: stubHierarchyDocumentMove,
    renameTag,
    recordDocumentLastOpened: noopProjectContentCall,
    reorderDocumentsUnderTag: noopProjectContentCall,
    searchProjectHierarchy,
    saveDocumentTemplatesSnapshot: noopProjectContentCall,
    saveWorldsSnapshot: noopProjectContentCall,
    setDocumentTags: emptyProjectContentList,
    setDocumentTemplate: returnStubDocument,
    setDocumentWorld: returnStubDocument,
    deleteTag: noopProjectContentCall,
    unlinkDocumentMedia: noopProjectContentCall,
    updateDocument: returnStubDocument,
    updateDocumentTemplate: returnStubDocumentTemplate,
    updateMedia: returnStubMedia,
    updateWorld: returnStubWorld,
    upsertMedia
  }
}
