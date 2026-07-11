import { expect, test, vi } from 'vitest'

import { FA_PROJECT_CONTENT_IPC } from 'app/src-electron/electron-ipc-bridge'

const { invokeMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(() => Promise.resolve({ items: [] }))
}))

vi.mock('electron', () => ({
  ipcRenderer: {
    invoke: invokeMock
  }
}))

import { projectContentAPI } from '../projectContentAPI'

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'
const SAMPLE_UUID_B = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * projectContentAPI
 * Every bridge method invokes the matching FA_PROJECT_CONTENT_IPC channel.
 */
test('Test that projectContentAPI methods invoke expected IPC channels', async () => {
  await projectContentAPI.createWorld({ displayName: 'Realm' })
  await projectContentAPI.updateWorld(SAMPLE_UUID, { displayName: 'Realm 2' })
  await projectContentAPI.deleteWorld(SAMPLE_UUID)
  await projectContentAPI.getWorldById(SAMPLE_UUID)
  await projectContentAPI.listWorlds()
  await projectContentAPI.listWorldsForProjectSettings()
  await projectContentAPI.saveWorldsSnapshot([
    {
      displayNameTranslations: { 'en-US': 'Realm' },
      id: SAMPLE_UUID
    }
  ])
  await projectContentAPI.listDocumentTemplatesForProjectSettings()
  await projectContentAPI.saveDocumentTemplatesSnapshot([
    {
      id: SAMPLE_UUID_B,
      titlePluralTranslations: { 'en-US': 'Character' },
      titleSingularTranslations: {},
    }
  ])

  await projectContentAPI.createMedia({ displayName: 'Art' })
  await projectContentAPI.updateMedia(SAMPLE_UUID, { displayName: 'Art 2' })
  await projectContentAPI.deleteMedia(SAMPLE_UUID)
  await projectContentAPI.getMediaById(SAMPLE_UUID)
  await projectContentAPI.listMedia()

  await projectContentAPI.createDocumentTemplate({ displayName: 'Tpl' })
  await projectContentAPI.updateDocumentTemplate(SAMPLE_UUID, { displayName: 'Tpl 2' })
  await projectContentAPI.deleteDocumentTemplate(SAMPLE_UUID)
  await projectContentAPI.getDocumentTemplateById(SAMPLE_UUID)
  await projectContentAPI.listDocumentTemplates()

  await projectContentAPI.createDocument({
    displayName: 'Doc',
    worldId: SAMPLE_UUID
  })
  await projectContentAPI.updateDocument(SAMPLE_UUID, { displayName: 'Doc 2' })
  await projectContentAPI.deleteDocument(SAMPLE_UUID)
  await projectContentAPI.getDocumentById(SAMPLE_UUID)
  await projectContentAPI.listDocuments({ worldId: SAMPLE_UUID })
  await projectContentAPI.setDocumentWorld({
    documentId: SAMPLE_UUID,
    worldId: SAMPLE_UUID_B
  })
  await projectContentAPI.setDocumentTemplate({
    documentId: SAMPLE_UUID,
    templateId: null
  })

  await projectContentAPI.linkDocumentMedia({
    documentId: SAMPLE_UUID,
    mediaId: SAMPLE_UUID_B
  })
  await projectContentAPI.unlinkDocumentMedia({
    documentId: SAMPLE_UUID,
    mediaId: SAMPLE_UUID_B
  })
  await projectContentAPI.listDocumentMedia(SAMPLE_UUID)

  await projectContentAPI.listWorkspaceHierarchyLayout()
  await projectContentAPI.listPlacementDocumentChildren({
    placementId: SAMPLE_UUID
  })
  await projectContentAPI.moveDocumentInHierarchy({
    documentId: SAMPLE_UUID,
    targetParentDocumentId: null,
    targetSortOrder: 0
  })
  await projectContentAPI.reindexDocumentSiblingsInHierarchy({
    movedDocumentId: SAMPLE_UUID,
    orderedDocumentIds: [SAMPLE_UUID, SAMPLE_UUID_B],
    parentDocumentId: null,
    placementId: SAMPLE_UUID_B
  })
  await projectContentAPI.searchProjectHierarchy('hero')

  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.createWorldAsync,
    { displayName: 'Realm' }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.updateWorldAsync,
    {
      id: SAMPLE_UUID,
      patch: { displayName: 'Realm 2' }
    }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.listWorldsForProjectSettingsAsync,
    undefined
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.saveWorldsSnapshotAsync,
    {
      items: [
        {
          displayNameTranslations: { 'en-US': 'Realm' },
          id: SAMPLE_UUID
        }
      ]
    }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.listDocumentTemplatesForProjectSettingsAsync,
    undefined
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.saveDocumentTemplatesSnapshotAsync,
    {
      items: [
        {
          id: SAMPLE_UUID_B,
          titlePluralTranslations: { 'en-US': 'Character' },
          titleSingularTranslations: {},
        }
      ]
    }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.listDocumentMediaAsync,
    { documentId: SAMPLE_UUID }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.listWorkspaceHierarchyLayoutAsync,
    undefined
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.listPlacementDocumentChildrenAsync,
    { placementId: SAMPLE_UUID }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.moveDocumentInHierarchyAsync,
    {
      documentId: SAMPLE_UUID,
      targetParentDocumentId: null,
      targetSortOrder: 0
    }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.reindexDocumentSiblingsInHierarchyAsync,
    {
      movedDocumentId: SAMPLE_UUID,
      orderedDocumentIds: [SAMPLE_UUID, SAMPLE_UUID_B],
      parentDocumentId: null,
      placementId: SAMPLE_UUID_B
    }
  )
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROJECT_CONTENT_IPC.searchProjectHierarchyAsync,
    { query: 'hero' }
  )
})
