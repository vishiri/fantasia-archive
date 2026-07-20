import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import {
  resolveProjectAppControlBarTabCopyBackgroundColorText,
  resolveProjectAppControlBarTabCopyTextColorText
} from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyAppearanceColor'
import { resolveProjectAppControlBarTabCopyNameText } from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyName'
import { findProjectHierarchyTreeDocumentNodeByDocumentId } from 'app/src/components/projectUI/ProjectHierarchyTree/scripts/projectHierarchyTreeDocumentNodeLookup'

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

function notifyHierarchyTreeDocumentClipboardCopySuccess (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps,
  messageKey: string
): void {
  deps.notifyCreate({
    color: 'positive',
    faSkipNotifyConsoleLog: true,
    icon: 'mdi-clipboard-check-outline',
    message: deps.i18n.global.t(messageKey),
    timeout: 2500,
    type: 'positive'
  })
}

async function copyHierarchyTreeDocumentResolvedText (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps,
  copyText: string,
  successMessageKey: string
): Promise<T_faActionHandlerContinuation> {
  await deps.copyToClipboard(copyText)
  notifyHierarchyTreeDocumentClipboardCopySuccess(deps, successMessageKey)
  return { payloadPreview: copyText }
}

function createHandleCopyHierarchyTreeDocumentName (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyHierarchyTreeDocumentName (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const node = findHierarchyTreeDocumentNode(deps, payload.documentId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyNameText(node.label)
    if (copyText === null) {
      return
    }

    return copyHierarchyTreeDocumentResolvedText(
      deps,
      copyText,
      'projectUI.projectAppControlBar.copyNameSuccess'
    )
  }
}

function createHandleCopyHierarchyTreeDocumentTextColor (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyHierarchyTreeDocumentTextColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const node = findHierarchyTreeDocumentNode(deps, payload.documentId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyTextColorText({
      documentTextColorDraft: node.documentTextColor ?? ''
    })
    if (copyText === null) {
      return
    }

    return copyHierarchyTreeDocumentResolvedText(
      deps,
      copyText,
      'projectUI.projectAppControlBar.copyTextColorSuccess'
    )
  }
}

function createHandleCopyHierarchyTreeDocumentBackgroundColor (
  deps: T_hierarchyTreeDocumentClipboardHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyHierarchyTreeDocumentBackgroundColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const node = findHierarchyTreeDocumentNode(deps, payload.documentId)
    if (node === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyBackgroundColorText({
      documentBackgroundColorDraft: node.documentBackgroundColor ?? ''
    })
    if (copyText === null) {
      return
    }

    return copyHierarchyTreeDocumentResolvedText(
      deps,
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
  const handleCopyHierarchyTreeDocumentName = createHandleCopyHierarchyTreeDocumentName(deps)
  const handleCopyHierarchyTreeDocumentTextColor = createHandleCopyHierarchyTreeDocumentTextColor(deps)
  const handleCopyHierarchyTreeDocumentBackgroundColor =
    createHandleCopyHierarchyTreeDocumentBackgroundColor(deps)

  return {
    handleCopyHierarchyTreeDocumentBackgroundColor,
    handleCopyHierarchyTreeDocumentName,
    handleCopyHierarchyTreeDocumentTextColor
  }
}
