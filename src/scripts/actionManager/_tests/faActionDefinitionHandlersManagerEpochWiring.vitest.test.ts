import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

vi.mock(import('quasar'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Notify: {
      ...actual.Notify,
      create: vi.fn()
    }
  }
})

import { FaActionUserCanceledError } from '../functions/faActionUserCanceledError'
import {
  handleCopyHierarchyTreeDocument,
  handleCopyOpenedDocumentTabDocument,
  handleSaveOpenedDocumentDisplayName,
  handleSaveProjectMedia,
  handleSortHierarchyTreeDocuments
} from '../faActionDefinitionHandlers_manager'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

test('Test that action handler wiring reads the active project epoch', async () => {
  const activeProject = S_FaActiveProject()
  activeProject.setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'project-id',
    name: 'N'
  })
  const readProjectContentEpoch = vi.spyOn(activeProject, 'readProjectContentEpoch').mockReturnValue(1)
  const isProjectReplacementInFlight = vi.spyOn(activeProject, 'isProjectReplacementInFlight').mockReturnValue(false)
  vi.spyOn(S_FaOpenedDocuments(), 'saveDocumentDisplayName').mockResolvedValue(undefined)
  await handleSaveOpenedDocumentDisplayName({
    documentId: 'doc-1',
    keepEditMode: false
  })
  expect(readProjectContentEpoch).toHaveBeenCalled()
  expect(isProjectReplacementInFlight).toHaveBeenCalled()

  vi.spyOn(S_FaOpenedDocuments(), 'createTemporaryDocumentCopyFromSource').mockResolvedValue(null)
  await handleCopyHierarchyTreeDocument({ documentId: 'doc-1' })
  vi.spyOn(S_FaOpenedDocuments(), 'createTemporaryDocumentCopyFromOpenedTab').mockResolvedValue(null)
  await handleCopyOpenedDocumentTabDocument({ documentId: 'doc-1' })

  vi.stubGlobal('window', {
    faContentBridgeAPIs: {
      projectContent: {
        listDocumentsUnderTag: vi.fn(async () => ({ items: [] })),
        reorderDocumentsUnderTag: vi.fn(async () => undefined)
      }
    }
  })
  await handleSortHierarchyTreeDocuments({
    direction: 'asc',
    documentId: null,
    key: 'name',
    nodeKind: 'tag',
    placementId: '',
    scope: 'direct',
    tagId: 'tag-1'
  })

  isProjectReplacementInFlight.mockReturnValue(true)
  await expect(handleSaveProjectMedia({ items: [] })).rejects.toBeInstanceOf(FaActionUserCanceledError)
})
