import { ipcMain } from 'electron'

import {
  wireFaProjectContentDocumentIpcHandlers,
  wireFaProjectContentMediaIpcHandlers,
  wireFaProjectContentMediaLinkIpcHandlers,
  wireFaProjectContentWorldIpcHandlers
} from './registerFaProjectContentIpcHandlersWiring'
import { wireFaProjectContentDocumentTemplateIpcHandlers } from './registerFaProjectContentDocumentTemplateIpcHandlersWiring'
import { wireFaProjectContentHierarchyTreeIpcHandlers } from './registerFaProjectContentHierarchyTreeIpcHandlersWiring'

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
  wireFaProjectContentHierarchyTreeIpcHandlers(ipcMain)
}
