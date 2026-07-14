import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { T_faActionHandlerContinuation } from 'app/types/I_faActionManagerDomain'

import {
  resolveProjectDocumentControlBarTabCopyBackgroundColorText,
  resolveProjectDocumentControlBarTabCopyTextColorText
} from 'app/src/components/projectUI/ProjectDocumentControlBar/functions/projectDocumentControlBarTabCopyAppearanceColor'
import { resolveProjectDocumentControlBarTabCopyNameText } from 'app/src/components/projectUI/ProjectDocumentControlBar/functions/projectDocumentControlBarTabCopyName'

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

function notifyOpenedDocumentTabClipboardCopySuccess (
  deps: T_openedDocumentTabClipboardHandlerDeps,
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

async function copyOpenedDocumentTabResolvedText (
  deps: T_openedDocumentTabClipboardHandlerDeps,
  copyText: string,
  successMessageKey: string
): Promise<T_faActionHandlerContinuation> {
  await deps.copyToClipboard(copyText)
  notifyOpenedDocumentTabClipboardCopySuccess(deps, successMessageKey)
  return { payloadPreview: copyText }
}

function createHandleCopyOpenedDocumentTabName (
  deps: T_openedDocumentTabClipboardHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyOpenedDocumentTabName (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const tab = findOpenedDocumentTab(deps, payload.documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectDocumentControlBarTabCopyNameText(
      deps.resolveDocumentTabLabelFromOpenedTab({
        displayNameDraft: tab.displayNameDraft,
        tabLabel: tab.tabLabel
      })
    )
    if (copyText === null) {
      return
    }

    return copyOpenedDocumentTabResolvedText(
      deps,
      copyText,
      'projectUI.projectDocumentControlBar.copyNameSuccess'
    )
  }
}

function createHandleCopyOpenedDocumentTabTextColor (
  deps: T_openedDocumentTabClipboardHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyOpenedDocumentTabTextColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const tab = findOpenedDocumentTab(deps, payload.documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectDocumentControlBarTabCopyTextColorText(tab)
    if (copyText === null) {
      return
    }

    return copyOpenedDocumentTabResolvedText(
      deps,
      copyText,
      'projectUI.projectDocumentControlBar.copyTextColorSuccess'
    )
  }
}

function createHandleCopyOpenedDocumentTabBackgroundColor (
  deps: T_openedDocumentTabClipboardHandlerDeps
): (payload: { documentId: string }) => Promise<T_faActionHandlerContinuation | void> {
  return async function handleCopyOpenedDocumentTabBackgroundColor (payload: {
    documentId: string
  }): Promise<T_faActionHandlerContinuation | void> {
    const tab = findOpenedDocumentTab(deps, payload.documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectDocumentControlBarTabCopyBackgroundColorText(tab)
    if (copyText === null) {
      return
    }

    return copyOpenedDocumentTabResolvedText(
      deps,
      copyText,
      'projectUI.projectDocumentControlBar.copyBackgroundColorSuccess'
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
  const handleCopyOpenedDocumentTabName = createHandleCopyOpenedDocumentTabName(deps)
  const handleCopyOpenedDocumentTabTextColor = createHandleCopyOpenedDocumentTabTextColor(deps)
  const handleCopyOpenedDocumentTabBackgroundColor =
    createHandleCopyOpenedDocumentTabBackgroundColor(deps)

  return {
    handleCopyOpenedDocumentTabBackgroundColor,
    handleCopyOpenedDocumentTabName,
    handleCopyOpenedDocumentTabTextColor
  }
}
