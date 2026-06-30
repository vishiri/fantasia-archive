import type { IpcMain } from 'electron'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'
import { runFaProjectContentIpcWork } from './runFaProjectContentIpcWorkWiring'
import {
  listFaProjectPlacementDocumentChildren,
  listFaProjectWorkspaceHierarchyLayout,
  moveFaProjectDocumentInHierarchy,
  searchFaProjectHierarchy
} from 'app/src-electron/mainScripts/projectManagement/projectDbContent/faProjectHierarchyTreePersistWiring'
import {
  parseFaProjectHierarchyTreeListPlacementChildrenInput,
  parseFaProjectHierarchyTreeMoveDocumentInput,
  parseFaProjectHierarchyTreeSearchQueryPayload
} from 'app/src-electron/shared/faProjectHierarchyTreeContentSchema'

/**
 * Registers workspace hierarchy tree content IPC handlers on ipcMain.
 */
export function wireFaProjectContentHierarchyTreeIpcHandlers (ipcMain: IpcMain): void {
  ipcMain.handle(FA_PROJECT_CONTENT_IPC.listWorkspaceHierarchyLayoutAsync, async (event) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      return listFaProjectWorkspaceHierarchyLayout(db)
    })
  })

  ipcMain.handle(
    FA_PROJECT_CONTENT_IPC.listPlacementDocumentChildrenAsync,
    async (event, payload) => {
      return await runFaProjectContentIpcWork(event, (db) => {
        const input = parseFaProjectHierarchyTreeListPlacementChildrenInput(payload)
        return listFaProjectPlacementDocumentChildren(db, input)
      })
    }
  )

  ipcMain.handle(FA_PROJECT_CONTENT_IPC.moveDocumentInHierarchyAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const input = parseFaProjectHierarchyTreeMoveDocumentInput(payload)
      return moveFaProjectDocumentInHierarchy(db, input)
    })
  })

  ipcMain.handle(FA_PROJECT_CONTENT_IPC.searchProjectHierarchyAsync, async (event, payload) => {
    return await runFaProjectContentIpcWork(event, (db) => {
      const query = parseFaProjectHierarchyTreeSearchQueryPayload(payload)
      return searchFaProjectHierarchy(db, query)
    })
  })
}
