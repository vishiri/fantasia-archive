import { ipcRenderer } from 'electron'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import type { I_faProjectContentAPI } from 'app/types/I_faProjectContentAPI'

function clonePayload<T> (value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

async function invokeProjectContent<T> (
  channel: string,
  payload?: unknown
): Promise<T> {
  const cloned = payload === undefined ? undefined : clonePayload(payload)
  return await ipcRenderer.invoke(channel, cloned) as T
}

export const projectContentAPI: I_faProjectContentAPI = {
  createWorld: async (input) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.createWorldAsync, input)
  },
  updateWorld: async (id, patch) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.updateWorldAsync, {
      id,
      patch
    })
  },
  deleteWorld: async (id) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.deleteWorldAsync, { id })
  },
  getWorldById: async (id) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.getWorldByIdAsync, { id })
  },
  listWorlds: async () => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.listWorldsAsync)
  },
  listWorldsForDocumentTemplate: async (documentTemplateId) => {
    return await invokeProjectContent(
      FA_PROJECT_CONTENT_IPC.listWorldsForDocumentTemplateAsync,
      { documentTemplateId }
    )
  },
  createMedia: async (input) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.createMediaAsync, input)
  },
  updateMedia: async (id, patch) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.updateMediaAsync, {
      id,
      patch
    })
  },
  deleteMedia: async (id) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.deleteMediaAsync, { id })
  },
  getMediaById: async (id) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.getMediaByIdAsync, { id })
  },
  listMedia: async () => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.listMediaAsync)
  },
  createDocumentTemplate: async (input) => {
    return await invokeProjectContent(
      FA_PROJECT_CONTENT_IPC.createDocumentTemplateAsync,
      input
    )
  },
  updateDocumentTemplate: async (id, patch) => {
    return await invokeProjectContent(
      FA_PROJECT_CONTENT_IPC.updateDocumentTemplateAsync,
      {
        id,
        patch
      }
    )
  },
  deleteDocumentTemplate: async (id) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.deleteDocumentTemplateAsync, { id })
  },
  getDocumentTemplateById: async (id) => {
    return await invokeProjectContent(
      FA_PROJECT_CONTENT_IPC.getDocumentTemplateByIdAsync,
      { id }
    )
  },
  listDocumentTemplates: async () => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.listDocumentTemplatesAsync)
  },
  listDocumentTemplatesForWorld: async (worldId) => {
    return await invokeProjectContent(
      FA_PROJECT_CONTENT_IPC.listDocumentTemplatesForWorldAsync,
      { worldId }
    )
  },
  createDocument: async (input) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.createDocumentAsync, input)
  },
  updateDocument: async (id, patch) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.updateDocumentAsync, {
      id,
      patch
    })
  },
  deleteDocument: async (id) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.deleteDocumentAsync, { id })
  },
  getDocumentById: async (id) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.getDocumentByIdAsync, { id })
  },
  listDocuments: async (filter) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.listDocumentsAsync, filter)
  },
  setDocumentWorld: async (input) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.setDocumentWorldAsync, input)
  },
  setDocumentTemplate: async (input) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.setDocumentTemplateAsync, input)
  },
  linkWorldDocumentTemplate: async (input) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.linkWorldDocumentTemplateAsync, input)
  },
  linkWorldMedia: async (input) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.linkWorldMediaAsync, input)
  },
  unlinkWorldDocumentTemplate: async (input) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.unlinkWorldDocumentTemplateAsync, input)
  },
  unlinkWorldMedia: async (input) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.unlinkWorldMediaAsync, input)
  },
  listMediaForWorld: async (worldId) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.listMediaForWorldAsync, { worldId })
  },
  linkDocumentMedia: async (input) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.linkDocumentMediaAsync, input)
  },
  unlinkDocumentMedia: async (input) => {
    await invokeProjectContent(FA_PROJECT_CONTENT_IPC.unlinkDocumentMediaAsync, input)
  },
  listDocumentMedia: async (documentId) => {
    return await invokeProjectContent(FA_PROJECT_CONTENT_IPC.listDocumentMediaAsync, { documentId })
  }
}
