import type { I_faOpenedDocumentTab, I_faOpenedDocumentTreeOpenMeta, T_faOpenedDocumentOpenMode } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import { findProjectHierarchyTreeDocumentNodeByDocumentId } from 'app/src/components/projectUI/ProjectHierarchyTree/scripts/projectHierarchyTreeDocumentNodeLookup'
import {
  createHandleAddHierarchyTreeChildDocument,
  createHandleCopyHierarchyTreeDocument
} from './faActionDefinitionHandlersHierarchyTreeDocumentCreateWiring'
import {
  findOpenedDocumentTabIndexByDocumentId,
  resolveHierarchyTreeDocumentOpenEditSteps,
  resolveHierarchyTreeDocumentOpenMetaFromNode
} from 'app/src/scripts/openedDocuments/openedDocuments_manager'

type T_hierarchyTreeDocumentActionsHandlerDeps = {
  S_FaOpenedDocuments: () => {
    createTemporaryDocumentCopyFromSource: (
      documentId: string,
      openMode?: T_faOpenedDocumentOpenMode | undefined
    ) => Promise<string | null>
    createTemporaryDocumentUnderParentDocument: (
      documentId: string,
      openMode?: T_faOpenedDocumentOpenMode | undefined
    ) => Promise<string | null>
    activeDocumentId: string | null
    enterDocumentEditMode: (documentId: string) => void
    focusTab: (documentId: string) => Promise<void>
    openFromTree: (
      documentId: string,
      mode: T_faOpenedDocumentOpenMode,
      treeMeta: I_faOpenedDocumentTreeOpenMeta
    ) => Promise<void>
    requestDeleteDocument: (documentId: string) => void
    tabs: readonly I_faOpenedDocumentTab[]
  }
  S_FaProjectHierarchyTree: () => {
    treeData: I_faProjectHierarchyTreeHeTreeNode[]
  }
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  isProjectReplacementInFlight?: () => boolean
  notifyCreate: (options: {
    message: string
    type: string
  }) => void
  readProjectContentEpoch?: () => number
}

function readOpenedDocumentTabState (
  tabs: readonly I_faOpenedDocumentTab[],
  documentId: string
): {
    tabEditState: boolean | null
    tabIsOpen: boolean
  } {
  const index = findOpenedDocumentTabIndexByDocumentId(tabs, documentId)
  if (index === -1) {
    return {
      tabEditState: null,
      tabIsOpen: false
    }
  }
  const tab = tabs[index]
  if (tab === undefined) {
    return {
      tabEditState: null,
      tabIsOpen: false
    }
  }
  const tabEditState = tab.editState
  const tabIsOpen = true
  return {
    tabEditState,
    tabIsOpen
  }
}

async function runHierarchyTreeDocumentOpenEditAction (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps,
  input: {
    documentId: string
    mode: 'open' | 'edit'
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }
): Promise<T_faActionHandlerContinuation | void> {
  const node = findProjectHierarchyTreeDocumentNodeByDocumentId(
    deps.S_FaProjectHierarchyTree().treeData,
    input.documentId
  )
  const treeMeta = resolveHierarchyTreeDocumentOpenMetaFromNode(node)

  const openedDocumentsStore = deps.S_FaOpenedDocuments()
  const tabState = readOpenedDocumentTabState(openedDocumentsStore.tabs, input.documentId)
  const steps = resolveHierarchyTreeDocumentOpenEditSteps({
    mode: input.mode,
    tabEditState: tabState.tabEditState,
    tabIsOpen: tabState.tabIsOpen
  })
  const treeOpenMode = input.openMode ?? 'leftNavigate'
  let openKeptFocus = true

  if (steps.shouldOpenFromTree) {
    await openedDocumentsStore.openFromTree(input.documentId, treeOpenMode, treeMeta)
    if (treeOpenMode !== 'middleBackground') {
      openKeptFocus = openedDocumentsStore.activeDocumentId === input.documentId
    }
  }
  if (openKeptFocus && steps.shouldFocusTab && treeOpenMode !== 'middleBackground') {
    await openedDocumentsStore.focusTab(input.documentId)
  }
  if (openKeptFocus && steps.shouldEnterEditMode) {
    openedDocumentsStore.enterDocumentEditMode(input.documentId)
  }

  const payloadPreview = input.documentId
  return { payloadPreview }
}

function createHandleOpenHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: { documentId: string, openMode?: T_faOpenedDocumentOpenMode | undefined }) =>
  Promise<T_faActionHandlerContinuation | void> {
  return async function handleOpenHierarchyTreeDocument (payload: {
    documentId: string
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }): Promise<T_faActionHandlerContinuation | void> {
    return runHierarchyTreeDocumentOpenEditAction(deps, {
      documentId: payload.documentId,
      mode: 'open',
      openMode: payload.openMode
    })
  }
}

function createHandleEditHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: {
    documentId: string
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleEditHierarchyTreeDocument (payload: {
    documentId: string
    openMode?: T_faOpenedDocumentOpenMode | undefined
  }): Promise<T_faActionHandlerContinuation | void> {
    return runHierarchyTreeDocumentOpenEditAction(deps, {
      documentId: payload.documentId,
      mode: 'edit',
      openMode: payload.openMode
    })
  }
}

function createHandleDeleteHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleDeleteHierarchyTreeDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    deps.S_FaOpenedDocuments().requestDeleteDocument(payload.documentId)
    const payloadPreview = payload.documentId
    return { payloadPreview }
  }
}

export function createFaActionDefinitionHandlersHierarchyTreeDocumentActions (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): {
    handleAddHierarchyTreeChildDocument: (
      payload: {
        documentId: string
        openMode?: T_faOpenedDocumentOpenMode | undefined
      }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleCopyHierarchyTreeDocument: (
      payload: {
        documentId: string
        openMode?: T_faOpenedDocumentOpenMode | undefined
      }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleDeleteHierarchyTreeDocument: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleEditHierarchyTreeDocument: (
      payload: {
        documentId: string
        openMode?: T_faOpenedDocumentOpenMode | undefined
      }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleOpenHierarchyTreeDocument: (
      payload: {
        documentId: string
        openMode?: T_faOpenedDocumentOpenMode | undefined
      }
    ) => Promise<T_faActionHandlerContinuation | void>
  } {
  const handleOpenHierarchyTreeDocument = createHandleOpenHierarchyTreeDocument(deps)
  const handleEditHierarchyTreeDocument = createHandleEditHierarchyTreeDocument(deps)
  const handleCopyHierarchyTreeDocument = createHandleCopyHierarchyTreeDocument(deps)
  const handleAddHierarchyTreeChildDocument = createHandleAddHierarchyTreeChildDocument(deps)
  const handleDeleteHierarchyTreeDocument = createHandleDeleteHierarchyTreeDocument(deps)

  return {
    handleAddHierarchyTreeChildDocument,
    handleCopyHierarchyTreeDocument,
    handleDeleteHierarchyTreeDocument,
    handleEditHierarchyTreeDocument,
    handleOpenHierarchyTreeDocument
  }
}
