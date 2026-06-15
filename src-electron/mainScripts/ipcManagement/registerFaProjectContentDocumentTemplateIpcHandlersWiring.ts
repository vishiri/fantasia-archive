import type { IpcMain } from 'electron'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import {
  createFaProjectDocumentTemplate,
  deleteFaProjectDocumentTemplate,
  getFaProjectDocumentTemplateById,
  listFaProjectDocumentTemplates,
  listFaProjectDocumentTemplatesForProjectSettings,
  replaceFaProjectDocumentTemplatesSnapshot,
  updateFaProjectDocumentTemplate
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectDocumentTemplatesPersistWiring'
import {
  parseFaProjectDocumentTemplateCreateInput,
  parseFaProjectDocumentTemplateIdPayload,
  parseFaProjectDocumentTemplateUpdatePayload,
  parseFaProjectDocumentTemplatesSnapshotPayload
} from 'app/src-electron/shared/faProjectDocumentTemplateContentSchema'
import { runFaProjectContentIpcWork } from './runFaProjectContentIpcWorkWiring'

/**
 * Registers document template CRUD handlers on ipcMain for FA_PROJECT_CONTENT_IPC.
 */
export function wireFaProjectContentDocumentTemplateIpcHandlers (ipcMain: IpcMain): void {
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.createDocumentTemplateAsync,
    async (event, payload) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        return createFaProjectDocumentTemplate(
          db,
          parseFaProjectDocumentTemplateCreateInput(payload)
        )
      })
    }
  )
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.updateDocumentTemplateAsync,
    async (event, payload) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        const parsed = parseFaProjectDocumentTemplateUpdatePayload(payload)
        return updateFaProjectDocumentTemplate(db, parsed.id, parsed.patch)
      })
    }
  )
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.deleteDocumentTemplateAsync,
    async (event, payload) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        deleteFaProjectDocumentTemplate(db, parseFaProjectDocumentTemplateIdPayload(payload))
      })
    }
  )
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.getDocumentTemplateByIdAsync,
    async (event, payload) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        return getFaProjectDocumentTemplateById(
          db,
          parseFaProjectDocumentTemplateIdPayload(payload)
        )
      })
    }
  )
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listDocumentTemplatesAsync, async (event) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return listFaProjectDocumentTemplates(db)
    })
  })
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.listDocumentTemplatesForProjectSettingsAsync,
    async (event) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        return listFaProjectDocumentTemplatesForProjectSettings(db)
      })
    }
  )
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.saveDocumentTemplatesSnapshotAsync,
    async (event, payload) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        const items = parseFaProjectDocumentTemplatesSnapshotPayload(payload)
        replaceFaProjectDocumentTemplatesSnapshot(db, items)
      })
    }
  )
}
