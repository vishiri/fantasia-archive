import type { IpcMain } from 'electron'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { runFaProjectContentIpcWork } from './runFaProjectContentIpcWorkWiring'
import {
  createFaProjectDocument,
  deleteFaProjectDocument,
  getFaProjectDocumentById,
  listFaProjectDocuments,
  setFaProjectDocumentTemplate,
  setFaProjectDocumentWorld,
  updateFaProjectDocument
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectDocumentsPersistWiring'
import {
  linkFaProjectDocumentMedia,
  listFaProjectMediaForDocument,
  unlinkFaProjectDocumentMedia
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectDocumentMediaLinksWiring'
import {
  createFaProjectMedia,
  deleteFaProjectMedia,
  getFaProjectMediaById,
  listFaProjectMedia,
  updateFaProjectMedia
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectMediaPersistWiring'
import {
  createFaProjectWorld,
  deleteFaProjectWorld,
  getFaProjectWorldById,
  listFaProjectWorlds,
  listFaProjectWorldsForProjectSettings,
  replaceFaProjectWorldsSnapshot,
  updateFaProjectWorld
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectWorldsPersistWiring'
import {
  parseFaProjectDocumentCreateInput,
  parseFaProjectDocumentIdPayload,
  parseFaProjectDocumentListFilter,
  parseFaProjectDocumentUpdatePayload,
  parseFaProjectSetDocumentTemplatePayload,
  parseFaProjectSetDocumentWorldPayload
} from 'app/src-electron/shared/faProjectDocumentContentSchema'
import {
  parseFaProjectDocumentMediaLinkPayload,
  parseFaProjectDocumentIdOnlyPayload
} from 'app/src-electron/shared/faProjectContentLinksSchema'
import {
  parseFaProjectMediaCreateInput,
  parseFaProjectMediaIdPayload,
  parseFaProjectMediaUpdatePayload
} from 'app/src-electron/shared/faProjectMediaContentSchema'
import {
  parseFaProjectWorldCreateInput,
  parseFaProjectWorldIdPayload,
  parseFaProjectWorldsSnapshotPayload,
  parseFaProjectWorldUpdatePayload
} from 'app/src-electron/shared/faProjectWorldContentSchema'

/**
 * Registers world CRUD handlers on ipcMain for FA_PROJECT_CONTENT_IPC.
 */
export function wireFaProjectContentWorldIpcHandlers (ipcMain: IpcMain): void {
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.createWorldAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return createFaProjectWorld(db, parseFaProjectWorldCreateInput(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.updateWorldAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectWorldUpdatePayload(payload)
      return updateFaProjectWorld(db, parsed.id, parsed.patch)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.deleteWorldAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      deleteFaProjectWorld(db, parseFaProjectWorldIdPayload(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.getWorldByIdAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return getFaProjectWorldById(db, parseFaProjectWorldIdPayload(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listWorldsAsync, async (event) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return listFaProjectWorlds(db)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listWorldsForProjectSettingsAsync, async (event) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return listFaProjectWorldsForProjectSettings(db)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.saveWorldsSnapshotAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const items = parseFaProjectWorldsSnapshotPayload(payload)
      replaceFaProjectWorldsSnapshot(db, items)
    })
  })
}

/**
 * Registers media CRUD handlers on ipcMain for FA_PROJECT_CONTENT_IPC.
 */
export function wireFaProjectContentMediaIpcHandlers (ipcMain: IpcMain): void {
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.createMediaAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return createFaProjectMedia(db, parseFaProjectMediaCreateInput(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.updateMediaAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectMediaUpdatePayload(payload)
      return updateFaProjectMedia(db, parsed.id, parsed.patch)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.deleteMediaAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      deleteFaProjectMedia(db, parseFaProjectMediaIdPayload(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.getMediaByIdAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return getFaProjectMediaById(db, parseFaProjectMediaIdPayload(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listMediaAsync, async (event) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return listFaProjectMedia(db)
    })
  })
}

/**
 * Registers document CRUD and FK assignment handlers on ipcMain.
 */
export function wireFaProjectContentDocumentIpcHandlers (ipcMain: IpcMain): void {
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.createDocumentAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return createFaProjectDocument(db, parseFaProjectDocumentCreateInput(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.updateDocumentAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectDocumentUpdatePayload(payload)
      return updateFaProjectDocument(db, parsed.id, parsed.patch)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.deleteDocumentAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      deleteFaProjectDocument(db, parseFaProjectDocumentIdPayload(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.getDocumentByIdAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return getFaProjectDocumentById(db, parseFaProjectDocumentIdPayload(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listDocumentsAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return listFaProjectDocuments(db, parseFaProjectDocumentListFilter(payload))
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.setDocumentWorldAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectSetDocumentWorldPayload(payload)
      return setFaProjectDocumentWorld(db, parsed.documentId, parsed.worldId)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.setDocumentTemplateAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectSetDocumentTemplatePayload(payload)
      return setFaProjectDocumentTemplate(db, parsed.documentId, parsed.templateId)
    })
  })
}

/**
 * Registers document/media link handlers on ipcMain.
 */
export function wireFaProjectContentMediaLinkIpcHandlers (ipcMain: IpcMain): void {
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.linkDocumentMediaAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectDocumentMediaLinkPayload(payload)
      linkFaProjectDocumentMedia(db, parsed.documentId, parsed.mediaId)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.unlinkDocumentMediaAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectDocumentMediaLinkPayload(payload)
      unlinkFaProjectDocumentMedia(db, parsed.documentId, parsed.mediaId)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listDocumentMediaAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return listFaProjectMediaForDocument(db, parseFaProjectDocumentIdOnlyPayload(payload))
    })
  })
}
