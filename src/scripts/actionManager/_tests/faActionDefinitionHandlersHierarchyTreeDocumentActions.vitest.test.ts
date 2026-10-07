import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createFaActionDefinitionHandlersHierarchyTreeDocumentActions } from '../faActionDefinitionHandlersHierarchyTreeDocumentActionsWiring'

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
  createTemporaryDocumentCopyFromSource?: (
    documentId: string,
    openMode?: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode | undefined
  ) => Promise<string | null>
  createTemporaryDocumentUnderParentDocument?: (
    documentId: string,
    openMode?: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode | undefined
  ) => Promise<string | null>
  enterDocumentEditMode?: (documentId: string) => void
  focusTab?: (documentId: string) => Promise<void>
  openFromTree?: (
    documentId: string,
    mode: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode,
    treeMeta: { tabLabel: string, templateIcon: string }
  ) => Promise<void>
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
  requestDeleteDocument?: (documentId: string) => void
  tabs?: readonly I_faOpenedDocumentTab[]
  treeData?: I_faProjectHierarchyTreeHeTreeNode[]
} = {}) {
  let activeDocumentId: string | null = null
  const openFromTree = input.openFromTree ?? vi.fn(async (
    documentId: string,
    mode?: import('app/types/I_faOpenedDocumentsDomain').T_faOpenedDocumentOpenMode
  ) => {
    if (mode !== 'middleBackground') {
      activeDocumentId = documentId
    }
  })
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
      get activeDocumentId () {
        return activeDocumentId
      },
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
    notifyCreate,
    ...(input.isProjectReplacementInFlight === undefined
      ? {}
      : { isProjectReplacementInFlight: input.isProjectReplacementInFlight }),
    ...(input.readProjectContentEpoch === undefined
      ? {}
      : { readProjectContentEpoch: input.readProjectContentEpoch })
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

test('Test that handleOpenHierarchyTreeDocument opens a document that is not loaded in the tree', async () => {
  const { focusTab, handlers, openFromTree } = createHandlers({
    treeData: []
  })

  await handlers.handleOpenHierarchyTreeDocument({ documentId: 'doc-hidden' })

  expect(openFromTree).toHaveBeenCalledWith('doc-hidden', 'leftNavigate', {
    tabLabel: '',
    templateIcon: ''
  })
  expect(focusTab).toHaveBeenCalledWith('doc-hidden')
})

test('Test that handleOpenHierarchyTreeDocument does not steal focus when openFromTree is superseded', async () => {
  const { enterDocumentEditMode, focusTab, handlers, openFromTree } = createHandlers({
    openFromTree: vi.fn(async () => undefined)
  })

  await handlers.handleOpenHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(openFromTree).toHaveBeenCalled()
  expect(focusTab).not.toHaveBeenCalled()
  expect(enterDocumentEditMode).not.toHaveBeenCalled()
})

test('Test that handleEditHierarchyTreeDocument does not focus or edit when openFromTree is superseded', async () => {
  const { enterDocumentEditMode, focusTab, handlers, openFromTree } = createHandlers({
    openFromTree: vi.fn(async () => undefined)
  })

  await handlers.handleEditHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(openFromTree).toHaveBeenCalled()
  expect(focusTab).not.toHaveBeenCalled()
  expect(enterDocumentEditMode).not.toHaveBeenCalled()
})

test('Test that handleOpenHierarchyTreeDocument honors middleBackground openMode', async () => {
  const { focusTab, handlers, openFromTree } = createHandlers()

  await handlers.handleOpenHierarchyTreeDocument({
    documentId: 'doc-a',
    openMode: 'middleBackground'
  })

  expect(openFromTree).toHaveBeenCalledWith('doc-a', 'middleBackground', {
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  })
  expect(focusTab).not.toHaveBeenCalled()
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

test('Test that handleEditHierarchyTreeDocument middleBackground skips focus', async () => {
  const { enterDocumentEditMode, focusTab, handlers, openFromTree } = createHandlers()

  await handlers.handleEditHierarchyTreeDocument({
    documentId: 'doc-a',
    openMode: 'middleBackground'
  })

  expect(openFromTree).toHaveBeenCalledWith('doc-a', 'middleBackground', {
    tabLabel: 'Hero',
    templateIcon: 'mdi-account'
  })
  expect(focusTab).not.toHaveBeenCalled()
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

  expect(createTemporaryDocumentCopyFromSource).toHaveBeenCalledWith('doc-a', undefined)
  expect(result).toEqual({ payloadPreview: 'copy-1' })
})

test('Test that a second copy of the same document waits out the in-flight copy', async () => {
  let releaseCopy: (() => void) | undefined
  const copyGate = new Promise<string>((resolve) => {
    releaseCopy = () => {
      resolve('copy-1')
    }
  })
  const createTemporaryDocumentCopyFromSource = vi.fn(() => copyGate)
  const { handlers } = createHandlers({
    createTemporaryDocumentCopyFromSource
  })
  const firstCopy = handlers.handleCopyHierarchyTreeDocument({ documentId: 'doc-a' })
  const secondCopy = handlers.handleCopyHierarchyTreeDocument({ documentId: 'doc-a' })
  await Promise.resolve()
  expect(createTemporaryDocumentCopyFromSource).toHaveBeenCalledTimes(1)
  const finishCopy = releaseCopy
  if (finishCopy === undefined) {
    throw new Error('missing copy resolver')
  }
  finishCopy()
  await firstCopy
  await secondCopy
  expect(createTemporaryDocumentCopyFromSource).toHaveBeenCalledTimes(1)
})

test('Test that handleCopyHierarchyTreeDocument passes middleBackground openMode', async () => {
  const { createTemporaryDocumentCopyFromSource, handlers } = createHandlers()

  await handlers.handleCopyHierarchyTreeDocument({
    documentId: 'doc-a',
    openMode: 'middleBackground'
  })

  expect(createTemporaryDocumentCopyFromSource).toHaveBeenCalledWith('doc-a', 'middleBackground')
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

test('Test that handleCopyHierarchyTreeDocument stays quiet while a project open is in flight', async () => {
  const { handlers, notifyCreate } = createHandlers({
    createTemporaryDocumentCopyFromSource: vi.fn(async () => null),
    isProjectReplacementInFlight: () => true,
    readProjectContentEpoch: () => 1
  })

  await handlers.handleCopyHierarchyTreeDocument({ documentId: 'doc-a' })

  expect(notifyCreate).not.toHaveBeenCalled()
})

test('Test that handleAddHierarchyTreeChildDocument stays quiet after the project changes', async () => {
  let epoch = 1
  const { handlers, notifyCreate } = createHandlers({
    createTemporaryDocumentUnderParentDocument: vi.fn(async () => {
      epoch = 2
      return null
    }),
    isProjectReplacementInFlight: () => false,
    readProjectContentEpoch: () => epoch
  })

  await handlers.handleAddHierarchyTreeChildDocument({ documentId: 'doc-a' })

  expect(notifyCreate).not.toHaveBeenCalled()
})

test('Test that handleAddHierarchyTreeChildDocument delegates to createTemporaryDocumentUnderParentDocument', async () => {
  const { createTemporaryDocumentUnderParentDocument, handlers } = createHandlers()

  const result = await handlers.handleAddHierarchyTreeChildDocument({ documentId: 'doc-a' })

  expect(createTemporaryDocumentUnderParentDocument).toHaveBeenCalledWith('doc-a', undefined)
  expect(result).toEqual({ payloadPreview: 'child-1' })
})

test('Test that handleAddHierarchyTreeChildDocument passes middleBackground openMode', async () => {
  const { createTemporaryDocumentUnderParentDocument, handlers } = createHandlers()

  await handlers.handleAddHierarchyTreeChildDocument({
    documentId: 'doc-a',
    openMode: 'middleBackground'
  })

  expect(createTemporaryDocumentUnderParentDocument).toHaveBeenCalledWith(
    'doc-a',
    'middleBackground'
  )
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
