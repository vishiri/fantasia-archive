import type { IpcMain } from 'electron'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { runFaProjectContentIpcWork } from './runFaProjectContentIpcWorkWiring'
import {
  parseFaProjectDeleteTagPayload,
  parseFaProjectListDocumentTagsPayload,
  parseFaProjectListDocumentsUnderTagPayload,
  parseFaProjectListTagsForWorldPayload,
  parseFaProjectListTagsWithDocumentCountsForWorldPayload,
  parseFaProjectRenameTagPayload,
  parseFaProjectReorderDocumentsUnderTagPayload,
  parseFaProjectSetDocumentTagsPayload
} from 'app/src-electron/shared/faProjectTagContentSchema'
import {
  listFaProjectDocumentTags,
  listFaProjectDocumentsUnderTag,
  listFaProjectTagsForWorld,
  listFaProjectTagsWithDocumentCountsForWorld
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectTagsQueryWiring'
import {
  deleteFaProjectTag,
  renameFaProjectTag,
  reorderFaProjectDocumentsUnderTag,
  setFaProjectDocumentTags
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectTagsPersistWiring'

/**
 * Registers document tag CRUD / membership handlers on ipcMain for FA_PROJECT_CONTENT_IPC.
 */
export function wireFaProjectContentTagIpcHandlers (ipcMain: IpcMain): void {
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listTagsForWorldAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectListTagsForWorldPayload(payload)
      return listFaProjectTagsForWorld(db, parsed.worldId)
    })
  })
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.listTagsWithDocumentCountsForWorldAsync,
    async (event, payload) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        const parsed = parseFaProjectListTagsWithDocumentCountsForWorldPayload(payload)
        return listFaProjectTagsWithDocumentCountsForWorld(db, parsed.worldId)
      })
    }
  )
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listDocumentTagsAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectListDocumentTagsPayload(payload)
      return listFaProjectDocumentTags(db, parsed.documentId)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listDocumentsUnderTagAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectListDocumentsUnderTagPayload(payload)
      return listFaProjectDocumentsUnderTag(db, parsed.tagId)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.setDocumentTagsAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectSetDocumentTagsPayload(payload)
      return db.transaction(() => {
        return setFaProjectDocumentTags(db, parsed.documentId, parsed.tags)
      })()
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.reorderDocumentsUnderTagAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectReorderDocumentsUnderTagPayload(payload)
      db.transaction(() => {
        reorderFaProjectDocumentsUnderTag(db, parsed.tagId, parsed.orderedDocumentIds)
      })()
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.renameTagAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectRenameTagPayload(payload)
      return db.transaction(() => {
        return renameFaProjectTag(db, parsed.tagId, parsed.newName)
      })()
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.deleteTagAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const parsed = parseFaProjectDeleteTagPayload(payload)
      db.transaction(() => {
        deleteFaProjectTag(db, parsed.tagId)
      })()
    })
  })
}
