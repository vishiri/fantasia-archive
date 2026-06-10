import type { IpcMain } from 'electron'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { runWithFaProjectDatabaseForIpcAsync } from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import {
  linkFaProjectWorldDocumentTemplate,
  listFaProjectDocumentTemplatesForWorld,
  listFaProjectWorldsForDocumentTemplate,
  unlinkFaProjectWorldDocumentTemplate
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectWorldDocumentTemplateLinksWiring'
import {
  parseFaProjectDocumentTemplateIdOnlyPayload,
  parseFaProjectWorldDocumentTemplateLinkPayload,
  parseFaProjectWorldIdOnlyPayload
} from 'app/src-electron/shared/faProjectContentLinksSchema'

/**
 * Registers world/document-template link handlers on ipcMain.
 */
export function wireFaProjectContentWorldDocumentTemplateLinkIpcHandlers (
  ipcMain: IpcMain
): void {
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.linkWorldDocumentTemplateAsync, async (event, payload) => {
    return await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
      const parsed = parseFaProjectWorldDocumentTemplateLinkPayload(payload)
      linkFaProjectWorldDocumentTemplate(db, parsed.worldId, parsed.documentTemplateId)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.unlinkWorldDocumentTemplateAsync, async (event, payload) => {
    return await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
      const parsed = parseFaProjectWorldDocumentTemplateLinkPayload(payload)
      unlinkFaProjectWorldDocumentTemplate(db, parsed.worldId, parsed.documentTemplateId)
    })
  })
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listDocumentTemplatesForWorldAsync, async (event, payload) => {
    return await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
      return listFaProjectDocumentTemplatesForWorld(db, parseFaProjectWorldIdOnlyPayload(payload))
    })
  })
  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.listWorldsForDocumentTemplateAsync,
    async (event, payload) => {
      return await runWithFaProjectDatabaseForIpcAsync(event, (db) => {
        return listFaProjectWorldsForDocumentTemplate(
          db,
          parseFaProjectDocumentTemplateIdOnlyPayload(payload)
        )
      })
    }
  )
}
