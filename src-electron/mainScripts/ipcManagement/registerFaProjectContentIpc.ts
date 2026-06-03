import { ipcMain } from 'electron'

import {
  wireFaProjectContentDocumentIpcHandlers,
  wireFaProjectContentDocumentTemplateIpcHandlers,
  wireFaProjectContentMediaIpcHandlers,
  wireFaProjectContentMediaLinkIpcHandlers,
  wireFaProjectContentWorldIpcHandlers
} from './registerFaProjectContentIpcHandlersWiring'

let registered = false

/**
 * Registers project content CRUD IPC; safe to call once from 'startApp'.
 */
export function registerFaProjectContentIpc (): void {
  if (registered) {
    return
  }
  registered = true

  wireFaProjectContentWorldIpcHandlers(ipcMain)
  wireFaProjectContentMediaIpcHandlers(ipcMain)
  wireFaProjectContentDocumentTemplateIpcHandlers(ipcMain)
  wireFaProjectContentDocumentIpcHandlers(ipcMain)
  wireFaProjectContentMediaLinkIpcHandlers(ipcMain)
}
