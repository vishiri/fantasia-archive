import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { resolveProjectDocumentControlBarTabCopyNameText } from '../functions/projectDocumentControlBarTabCopyName'

export function buildProjectDocumentControlBarTabContextMenuHandlers (input: {
  copyToClipboard: (text: string) => Promise<void>
  findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
  moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
  notifyCreate: (options: {
    caption?: string
    color: string
    faSkipNotifyConsoleLog?: boolean
    icon: string
    message: string
    timeout?: number
    type: string
  }) => void
  requestCloseTab: (documentId: string) => void
  resolveDocumentTabLabelFromOpenedTab: (tab: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  translateCopyNameFailed: () => string
  translateCopyNameSuccess: () => string
}): {
    onTabCopyNameClick: (documentId: string) => Promise<void>
    onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  } {
  async function onTabCopyNameClick (documentId: string): Promise<void> {
    const tab = input.findTabByDocumentId(documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectDocumentControlBarTabCopyNameText(
      input.resolveDocumentTabLabelFromOpenedTab({
        displayNameDraft: tab.displayNameDraft,
        tabLabel: tab.tabLabel
      })
    )
    if (copyText === null) {
      return
    }

    try {
      await input.copyToClipboard(copyText)
      input.notifyCreate({
        color: 'positive',
        faSkipNotifyConsoleLog: true,
        icon: 'mdi-clipboard-check-outline',
        message: input.translateCopyNameSuccess(),
        timeout: 2500,
        type: 'positive'
      })
    } catch (error: unknown) {
      const reason = error instanceof Error ? error.message : String(error)
      console.error('[ProjectDocumentControlBar] Failed to copy document tab name:', reason)
      input.notifyCreate({
        caption: reason,
        color: 'negative',
        faSkipNotifyConsoleLog: true,
        icon: 'mdi-clipboard-alert-outline',
        message: input.translateCopyNameFailed(),
        timeout: 4000,
        type: 'negative'
      })
    }
  }

  function onTabMoveClick (documentId: string, direction: 'left' | 'right'): void {
    input.moveDocumentTab(documentId, direction)
  }

  return {
    onTabCopyNameClick,
    onTabMoveClick
  }
}
