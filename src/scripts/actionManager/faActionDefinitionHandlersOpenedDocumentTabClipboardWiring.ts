import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import {
  resolveProjectAppControlBarTabCopyBackgroundColorText,
  resolveProjectAppControlBarTabCopyTextColorText
} from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyAppearanceColor'
import { resolveProjectAppControlBarTabCopyNameText } from 'app/src/components/projectUI/ProjectAppControlBar/functions/projectAppControlBarTabCopyName'

import { createFaActionClipboardCopyResolvedText } from './functions/createFaActionClipboardCopyResolvedText'

type T_openedDocumentTabClipboardHandlerDeps = {
  S_FaOpenedDocuments: () => {
    findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
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
  resolveDocumentTabLabelFromOpenedTab: (tab: {
    displayNameDraft: string
    tabLabel: string
  }) => string
}

function findOpenedDocumentTab (
  deps: T_openedDocumentTabClipboardHandlerDeps,
  documentId: string
): I_faOpenedDocumentTab | null {
  return deps.S_FaOpenedDocuments().findTabByDocumentId(documentId)
}

function createHandleCopyOpenedDocumentTabName (
  deps: T_openedDocumentTabClipboardHandlerDeps,
  copyResolvedText: (
    copyText: string,
    successMessageKey: string
  ) => Promise<T_faActionHandlerContinuation>
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyOpenedDocumentTabName (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const tab = findOpenedDocumentTab(deps, payload.documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyNameText(
      deps.resolveDocumentTabLabelFromOpenedTab({
        displayNameDraft: tab.displayNameDraft,
        tabLabel: tab.tabLabel
      })
    )
    if (copyText === null) {
      return
    }

    return copyResolvedText(
      copyText,
      'projectUI.projectAppControlBar.copyNameSuccess'
    )
  }
}

function createHandleCopyOpenedDocumentTabTextColor (
  deps: T_openedDocumentTabClipboardHandlerDeps,
  copyResolvedText: (
    copyText: string,
    successMessageKey: string
  ) => Promise<T_faActionHandlerContinuation>
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyOpenedDocumentTabTextColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const tab = findOpenedDocumentTab(deps, payload.documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyTextColorText(tab)
    if (copyText === null) {
      return
    }

    return copyResolvedText(
      copyText,
      'projectUI.projectAppControlBar.copyTextColorSuccess'
    )
  }
}

function createHandleCopyOpenedDocumentTabBackgroundColor (
  deps: T_openedDocumentTabClipboardHandlerDeps,
  copyResolvedText: (
    copyText: string,
    successMessageKey: string
  ) => Promise<T_faActionHandlerContinuation>
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyOpenedDocumentTabBackgroundColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const tab = findOpenedDocumentTab(deps, payload.documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectAppControlBarTabCopyBackgroundColorText(tab)
    if (copyText === null) {
      return
    }

    return copyResolvedText(
      copyText,
      'projectUI.projectAppControlBar.copyBackgroundColorSuccess'
    )
  }
}

export function createFaActionDefinitionHandlersOpenedDocumentTabClipboard (
  deps: T_openedDocumentTabClipboardHandlerDeps
): {
    handleCopyOpenedDocumentTabBackgroundColor: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleCopyOpenedDocumentTabName: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
    handleCopyOpenedDocumentTabTextColor: (
      payload: { documentId: string }
    ) => Promise<T_faActionHandlerContinuation | void>
  } {
  const { copyResolvedText } = createFaActionClipboardCopyResolvedText(deps)
  const handleCopyOpenedDocumentTabName = createHandleCopyOpenedDocumentTabName(
    deps,
    copyResolvedText
  )
  const handleCopyOpenedDocumentTabTextColor = createHandleCopyOpenedDocumentTabTextColor(
    deps,
    copyResolvedText
  )
  const handleCopyOpenedDocumentTabBackgroundColor =
    createHandleCopyOpenedDocumentTabBackgroundColor(deps, copyResolvedText)

  return {
    handleCopyOpenedDocumentTabBackgroundColor,
    handleCopyOpenedDocumentTabName,
    handleCopyOpenedDocumentTabTextColor
  }
}
