import type { I_faOpenedDocumentTab, I_faOpenedDocumentTreeOpenMeta } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import { findProjectHierarchyTreeDocumentNodeByDocumentId } from 'app/src/components/projectUI/ProjectHierarchyTree/scripts/projectHierarchyTreeDocumentNodeLookup'
import { resolveHierarchyTreeDocumentOpenEditSteps } from 'app/src/scripts/openedDocuments/functions/resolveHierarchyTreeDocumentOpenEditSteps'
import { findOpenedDocumentTabIndexByDocumentId } from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDomain'

type T_hierarchyTreeDocumentActionsHandlerDeps = {
  S_FaOpenedDocuments: () => {
    createTemporaryDocumentCopyFromSource: (documentId: string) => Promise<string | null>
    createTemporaryDocumentUnderParentDocument: (documentId: string) => Promise<string | null>
    enterDocumentEditMode: (documentId: string) => void
    focusTab: (documentId: string) => Promise<void>
    openFromTree: (
      documentId: string,
      mode: 'leftNavigate',
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
  notifyCreate: (options: {
    message: string
    type: string
  }) => void
}

function resolveHierarchyTreeDocumentTreeOpenMeta (
  node: I_faProjectHierarchyTreeHeTreeNode
): I_faOpenedDocumentTreeOpenMeta {
  return {
    tabLabel: node.label,
    templateIcon: node.icon
  }
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
  return {
    tabEditState: tab.editState,
    tabIsOpen: true
  }
}

async function runHierarchyTreeDocumentOpenEditAction (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps,
  input: {
    documentId: string
    mode: 'open' | 'edit'
  }
): Promise<T_faActionHandlerContinuation | void> {
  const node = findProjectHierarchyTreeDocumentNodeByDocumentId(
    deps.S_FaProjectHierarchyTree().treeData,
    input.documentId
  )
  if (node === null || node.documentId === null) {
    return
  }

  const openedDocumentsStore = deps.S_FaOpenedDocuments()
  const tabState = readOpenedDocumentTabState(openedDocumentsStore.tabs, input.documentId)
  const steps = resolveHierarchyTreeDocumentOpenEditSteps({
    mode: input.mode,
    tabEditState: tabState.tabEditState,
    tabIsOpen: tabState.tabIsOpen
  })
  const treeMeta = resolveHierarchyTreeDocumentTreeOpenMeta(node)

  if (steps.shouldOpenFromTree) {
    await openedDocumentsStore.openFromTree(input.documentId, 'leftNavigate', treeMeta)
  }
  if (steps.shouldFocusTab) {
    await openedDocumentsStore.focusTab(input.documentId)
  }
  if (steps.shouldEnterEditMode) {
    openedDocumentsStore.enterDocumentEditMode(input.documentId)
  }

  return { payloadPreview: input.documentId }
}

function createHandleOpenHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleOpenHierarchyTreeDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    return runHierarchyTreeDocumentOpenEditAction(deps, {
      documentId: payload.documentId,
      mode: 'open'
    })
  }
}

function createHandleEditHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleEditHierarchyTreeDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    return runHierarchyTreeDocumentOpenEditAction(deps, {
      documentId: payload.documentId,
      mode: 'edit'
    })
  }
}

function createHandleCopyHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyHierarchyTreeDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentCopyFromSource(
      payload.documentId
    )
    if (newDocumentId === null) {
      deps.notifyCreate({
        message: deps.i18n.global.t('globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError'),
        type: 'negative'
      })
      return
    }

    return { payloadPreview: newDocumentId }
  }
}

function createHandleAddHierarchyTreeChildDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleAddHierarchyTreeChildDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const newDocumentId = await deps.S_FaOpenedDocuments().createTemporaryDocumentUnderParentDocument(
      payload.documentId
    )
    if (newDocumentId === null) {
      deps.notifyCreate({
        message: deps.i18n.global.t('globalFunctionality.faOpenedDocuments.copyDocumentMissingTemplateError'),
        type: 'negative'
      })
      return
    }

    return { payloadPreview: newDocumentId }
  }
}

function createHandleDeleteHierarchyTreeDocument (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleDeleteHierarchyTreeDocument (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    deps.S_FaOpenedDocuments().requestDeleteDocument(payload.documentId)
    return { payloadPreview: payload.documentId }
  }
}

export function createFaActionDefinitionHandlersHierarchyTreeDocumentActions (
  deps: T_hierarchyTreeDocumentActionsHandlerDeps
): {
    handleAddHierarchyTreeChildDocument: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleCopyHierarchyTreeDocument: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleDeleteHierarchyTreeDocument: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleEditHierarchyTreeDocument: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleOpenHierarchyTreeDocument: (
      payload: { documentId: string }
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
