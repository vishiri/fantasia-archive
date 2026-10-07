import { ResultAsync } from 'neverthrow'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import {
  resolveProjectAppControlBarTabCopyBackgroundColorText,
  resolveProjectAppControlBarTabCopyTextColorText
} from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyAppearanceColor'
import { resolveProjectAppControlBarTabCopyNameText } from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyName'
import { findProjectHierarchyTreeDocumentNodeByDocumentId } from 'app/src/components/projectUI/ProjectHierarchyTree/scripts/projectHierarchyTreeDocumentNodeLookup'
import {
  getFaProjectDocumentByIdForRenderer,
  hasFaProjectDocumentByIdReader
} from 'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
import { throwUnlessFaProjectContentMissingRow } from 'app/src/stores/scripts/faOpenedDocumentsTemporarySessionWiring'

import { createFaActionClipboardCopyResolvedText } from './functions/createFaActionClipboardCopyResolvedText'

type T_hierarchyTreeDocumentClipboardHandlerDeps = {
  S_FaProjectHierarchyTree: () => {
    treeData: I_faProjectHierarchyTreeHeTreeNode[]
  }
  copyToClipboard: (text: string) => Promise<void>
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  notifyCreate: (options: {
    color?: string
    faSkipNotifyConsoleLog?: boolean
    icon?: string
    message: string
    timeout?: number
    type: string
  }) => void
}

function findHierarchyTreeDocumentNode (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps,
  documentId: string
): I_faProjectHierarchyTreeHeTreeNode | null {
  return findProjectHierarchyTreeDocumentNodeByDocumentId(
    deps.S_FaProjectHierarchyTree().treeData,
    documentId
  )
}

function canReadUnloadedHierarchyDocument (): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  return hasFaProjectDocumentByIdReader()
}

async function resolveHierarchyTreeDocumentClipboardFields (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps,
  documentId: string
): Promise<{
  backgroundColor: string
  label: string
  textColor: string
} | null> {
  const node = findHierarchyTreeDocumentNode(deps, documentId)
  if (node !== null) {
    const backgroundColor = node.documentBackgroundColor ?? ''
    const label = node.label
    const textColor = node.documentTextColor ?? ''
    return {
      backgroundColor,
      label,
      textColor
    }
  }
  if (!canReadUnloadedHierarchyDocument()) {
    return null
  }
  const documentResult = await ResultAsync.fromPromise(
    getFaProjectDocumentByIdForRenderer(documentId),
    (error): unknown => error
  )
  if (documentResult.isErr()) {
    throwUnlessFaProjectContentMissingRow(documentResult.error)
    return null
  }
  const doc = documentResult.value
  const backgroundColor = doc.documentBackgroundColor ?? ''
  const label = doc.displayName
  const textColor = doc.documentTextColor ?? ''
  return {
    backgroundColor,
    label,
    textColor
  }
}

function createHandleCopyHierarchyTreeDocumentName (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps,
  copyResolvedText: (
    copyText: string,
    successMessageKey: string
  ) => Promise<T_faActionHandlerContinuation>
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyHierarchyTreeDocumentName (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const fields = await resolveHierarchyTreeDocumentClipboardFields(deps, payload.documentId)
    if (fields === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyNameText(fields.label)
    if (copyText === null) {
      return
    }

    return copyResolvedText(
      copyText,
      'projectUI.projectAppControlBar.copyNameSuccess'
    )
  }
}

function createHandleCopyHierarchyTreeDocumentTextColor (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps,
  copyResolvedText: (
    copyText: string,
    successMessageKey: string
  ) => Promise<T_faActionHandlerContinuation>
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyHierarchyTreeDocumentTextColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const fields = await resolveHierarchyTreeDocumentClipboardFields(deps, payload.documentId)
    if (fields === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyTextColorText({
      documentTextColorDraft: fields.textColor
    })
    if (copyText === null) {
      return
    }

    return copyResolvedText(
      copyText,
      'projectUI.projectAppControlBar.copyTextColorSuccess'
    )
  }
}

function createHandleCopyHierarchyTreeDocumentBackgroundColor (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps,
  copyResolvedText: (
    copyText: string,
    successMessageKey: string
  ) => Promise<T_faActionHandlerContinuation>
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyHierarchyTreeDocumentBackgroundColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const fields = await resolveHierarchyTreeDocumentClipboardFields(deps, payload.documentId)
    if (fields === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyBackgroundColorText({
      documentBackgroundColorDraft: fields.backgroundColor
    })
    if (copyText === null) {
      return
    }

    return copyResolvedText(
      copyText,
      'projectUI.projectAppControlBar.copyBackgroundColorSuccess'
    )
  }
}

export function createFaActionDefinitionHandlersHierarchyTreeDocumentClipboard (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps
): {
    handleCopyHierarchyTreeDocumentBackgroundColor: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleCopyHierarchyTreeDocumentName: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleCopyHierarchyTreeDocumentTextColor: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
  } {
  const { copyResolvedText } = createFaActionClipboardCopyResolvedText(deps)
  const handleCopyHierarchyTreeDocumentName = createHandleCopyHierarchyTreeDocumentName(
    deps,
    copyResolvedText
  )
  const handleCopyHierarchyTreeDocumentTextColor =
    createHandleCopyHierarchyTreeDocumentTextColor(deps, copyResolvedText)
  const handleCopyHierarchyTreeDocumentBackgroundColor =
    createHandleCopyHierarchyTreeDocumentBackgroundColor(deps, copyResolvedText)

  return {
    handleCopyHierarchyTreeDocumentBackgroundColor,
    handleCopyHierarchyTreeDocumentName,
    handleCopyHierarchyTreeDocumentTextColor
  }
}
