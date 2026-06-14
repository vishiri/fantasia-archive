import type { I_faProjectContentAPI } from 'app/types/I_faProjectContentAPI'

const STUB_UUID = '550e8400-e29b-41d4-a716-446655440000'

function stubNamedEntity () {
  return {
    id: STUB_UUID,
    displayName: 'Stub',
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
    documentCount: 0
  }
}

function stubDocument () {
  return {
    ...stubNamedEntity(),
    templateId: null,
    worldId: STUB_UUID
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
    createDocumentTemplate: async () => stubNamedEntity(),
    createMedia: async () => stubNamedEntity(),
    createWorld: async () => stubWorld(),
    deleteDocument: noop,
    deleteDocumentTemplate: noop,
    deleteMedia: noop,
    deleteWorld: noop,
    getDocumentById: async () => stubDocument(),
    getDocumentTemplateById: async () => stubNamedEntity(),
    getMediaById: async () => stubNamedEntity(),
    getWorldById: async () => stubWorld(),
    linkDocumentMedia: noop,
    linkWorldDocumentTemplate: noop,
    listDocumentMedia: emptyList,
    listDocumentTemplatesForWorld: emptyList,
    listDocuments: emptyList,
    listDocumentTemplates: emptyList,
    listMedia: emptyList,
    listWorlds: emptyList,
    listWorldsForProjectSettings: async () => ({ items: [stubWorldForSettings()] }),
    listWorldsForDocumentTemplate: emptyList,
    saveWorldsSnapshot: noop,
    setDocumentTemplate: async () => stubDocument(),
    setDocumentWorld: async () => stubDocument(),
    unlinkDocumentMedia: noop,
    unlinkWorldDocumentTemplate: noop,
    updateDocument: async () => stubDocument(),
    updateDocumentTemplate: async () => stubNamedEntity(),
    updateMedia: async () => stubNamedEntity(),
    updateWorld: async () => stubWorld()
  }
}
