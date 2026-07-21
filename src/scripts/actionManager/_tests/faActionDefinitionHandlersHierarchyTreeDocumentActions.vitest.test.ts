import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createFaActionDefinitionHandlersHierarchyTreeDocumentActions } from '../faActionDefinitionHandlersHierarchyTreeDocumentActions'

const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentBackgroundColor: null,
  documentId: 'doc-a',
  documentTextColor: null,
  groupId: 'group-1',
  hasChildren: false,
  icon: 'mdi-account',
  id: 'doc-a',
  label: 'Hero',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

function createHandlers (input: {
  createTemporaryDocumentCopyFromSource?: (documentId: string) => Promise<string | null>
  createTemporaryDocumentUnderParentDocument?: (documentId: string) => Promise<string | null>
  enterDocumentEditMode?: (documentId: string) => void
  focusTab?: (documentId: string) => Promise<void>
  openFromTree?: (
    documentId: string,
    mode: 'leftNavigate',
    treeMeta: { tabLabel: string, templateIcon: string }
  ) => Promise<void>
  requestDeleteDocument?: (documentId: string) => void
  tabs?: readonly I_faOpenedDocumentTab[]
  treeData?: I_faProjectHierarchyTreeHeTreeNode[]
} = {}) {
  const openFromTree = input.openFromTree ?? vi.fn(async () => undefined)
  const focusTab = input.focusTab ?? vi.fn(async () => undefined)
  const enterDocumentEditMode = input.enterDocumentEditMode ?? vi.fn()
  const createTemporaryDocumentCopyFromSource =
    input.createTemporaryDocumentCopyFromSource ?? vi.fn(async () => 'copy-1')
  const createTemporaryDocumentUnderParentDocument =
    input.createTemporaryDocumentUnderParentDocument ?? vi.fn(async () => 'child-1')
  const requestDeleteDocument = input.requestDeleteDocument ?? vi.fn()
  const notifyCreate = vi.fn()

  const handlers = createFaActionDefinitionHandlersHierarchyTreeDocumentActions({
    S_FaOpenedDocuments: () => ({
      createTemporaryDocumentCopyFromSource,
      createTemporaryDocumentUnderParentDocument,
      enterDocumentEditMode,
      focusTab,
      openFromTree,
      requestDeleteDocument,
      tabs: input.tabs ?? []
    }),
    S_FaProjectHierarchyTree: () => ({
      treeData: input.treeData ?? [documentNode]
    }),
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    notifyCreate
  })

  return {
    createTemporaryDocumentCopyFromSource,
    createTemporaryDocumentUnderParentDocument,
    enterDocumentEditMode,
    focusTab,
    handlers,
    notifyCreate,
    openFromTree,
    requestDeleteDocument
  }
}

test('Test that handleOpenHierarchyTreeDocument opens and focuses a closed tab without entering edit', async () => {
  const { enterDocumentEditMode, focusTab, handlers, openFromTree } = createHandlers()

  await handlers.handleOpenHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(openFromTree).toHaveBeenCalledWith('doc-a', 'leftNavigate', {
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  })
  expect(focusTab).toHaveBeenCalledWith('doc-a')
  expect(enterDocumentEditMode).not.toHaveBeenCalled()
})

test('Test that handleEditHierarchyTreeDocument opens, focuses, and enters edit for a closed tab', async () => {
  const { enterDocumentEditMode, focusTab, handlers, openFromTree } = createHandlers()

  await handlers.handleEditHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(openFromTree).toHaveBeenCalledWith('doc-a', 'leftNavigate', {
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  })
  expect(focusTab).toHaveBeenCalledWith('doc-a')
  expect(enterDocumentEditMode).toHaveBeenCalledWith('doc-a')
})

test('Test that handleEditHierarchyTreeDocument only focuses when tab is already in edit', async () => {
  const { enterDocumentEditMode, focusTab, handlers, openFromTree } = createHandlers({
    tabs: [{
      documentId: 'doc-a',
      displayNameDraft: 'Hero',
      documentBackgroundColorDraft: '',
      documentTextColorDraft: '',
      editState: true,
      hasUnsavedChanges: false,
      persistenceState: 'persisted',
      savedDisplayName: 'Hero',
      savedDocumentBackgroundColor: '',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      extraClassesDraft: '',
      savedExtraClasses: '',
      savedDocumentTextColor: '',
      tabLabel: 'Hero',
      templateIcon: 'mdi-account'
    }]
  })

  await handlers.handleEditHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(openFromTree).not.toHaveBeenCalled()
  expect(focusTab).toHaveBeenCalledWith('doc-a')
  expect(enterDocumentEditMode).not.toHaveBeenCalled()
})

test('Test that handleCopyHierarchyTreeDocument delegates to createTemporaryDocumentCopyFromSource', async () => {
  const { createTemporaryDocumentCopyFromSource, handlers } = createHandlers()

  const result = await handlers.handleCopyHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(createTemporaryDocumentCopyFromSource).toHaveBeenCalledWith('doc-a')
  expect(result).toEqual({ payloadPreview: 'copy-1' })
})

test('Test that handleCopyHierarchyTreeDocument notifies when copy source cannot be duplicated', async () => {
  const { handlers, notifyCreate } = createHandlers({
    createTemporaryDocumentCopyFromSource: vi.fn(async () => null)
  })

  const result = await handlers.handleCopyHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(result).toBeUndefined()
  expect(notifyCreate).toHaveBeenCalledWith({
    message: 'globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError',
    type: 'negative'
  })
})

test('Test that handleAddHierarchyTreeChildDocument delegates to createTemporaryDocumentUnderParentDocument', async () => {
  const { createTemporaryDocumentUnderParentDocument, handlers } = createHandlers()

  const result = await handlers.handleAddHierarchyTreeChildDocument({ documentId: 'doc-a' })

  expect(createTemporaryDocumentUnderParentDocument).toHaveBeenCalledWith('doc-a')
  expect(result).toEqual({ payloadPreview: 'child-1' })
})

test('Test that handleAddHierarchyTreeChildDocument notifies when source cannot seed child', async () => {
  const { handlers, notifyCreate } = createHandlers({
    createTemporaryDocumentUnderParentDocument: vi.fn(async () => null)
  })

  const result = await handlers.handleAddHierarchyTreeChildDocument({ documentId: 'doc-a' })

  expect(result).toBeUndefined()
  expect(notifyCreate).toHaveBeenCalledWith({
    message: 'globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError',
    type: 'negative'
  })
})

test('Test that handleDeleteHierarchyTreeDocument requests delete confirmation', async () => {
  const { handlers, requestDeleteDocument } = createHandlers()

  await handlers.handleDeleteHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(requestDeleteDocument).toHaveBeenCalledWith('doc-a')
})
