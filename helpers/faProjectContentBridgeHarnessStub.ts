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
    createWorld: async () => stubNamedEntity(),
    deleteDocument: noop,
    deleteDocumentTemplate: noop,
    deleteMedia: noop,
    deleteWorld: noop,
    getDocumentById: async () => stubDocument(),
    getDocumentTemplateById: async () => stubNamedEntity(),
    getMediaById: async () => stubNamedEntity(),
    getWorldById: async () => stubNamedEntity(),
    linkDocumentMedia: noop,
    linkWorldMedia: noop,
    listDocumentMedia: emptyList,
    listDocuments: emptyList,
    listDocumentTemplates: emptyList,
    listMedia: emptyList,
    listMediaForWorld: emptyList,
    listWorlds: emptyList,
    setDocumentTemplate: async () => stubDocument(),
    setDocumentWorld: async () => stubDocument(),
    unlinkDocumentMedia: noop,
    unlinkWorldMedia: noop,
    updateDocument: async () => stubDocument(),
    updateDocumentTemplate: async () => stubNamedEntity(),
    updateMedia: async () => stubNamedEntity(),
    updateWorld: async () => stubNamedEntity()
  }
}
