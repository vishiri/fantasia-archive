import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  resolveProjectDocumentControlBarTabCopyBackgroundColorText,
  resolveProjectDocumentControlBarTabCopyTextColorText
} from '../functions/projectDocumentControlBarTabCopyAppearanceColor'
import { resolveProjectDocumentControlBarTabCopyNameText } from '../functions/projectDocumentControlBarTabCopyName'

export function buildProjectDocumentControlBarTabContextMenuHandlers (input: {
  findTabByDocumentId: (documentId: string) => I_faOpenedDocumentTab | null
  moveDocumentTab: (documentId: string, direction: 'left' | 'right') => void
  resolveDocumentTabLabelFromOpenedTab: (tab: {
    displayNameDraft: string
    tabLabel: string
  }) => string
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
}): {
    onTabCopyBackgroundColorClick: (documentId: string) => Promise<void>
    onTabCopyDocumentClick: (documentId: string) => Promise<void>
    onTabCopyNameClick: (documentId: string) => Promise<void>
    onTabCopyTextColorClick: (documentId: string) => Promise<void>
    onTabAddNewDocumentUnderThisClick: (documentId: string) => Promise<void>
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

    input.runFaAction('copyOpenedDocumentTabName', { documentId })
  }

  async function onTabCopyTextColorClick (documentId: string): Promise<void> {
    const tab = input.findTabByDocumentId(documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectDocumentControlBarTabCopyTextColorText(tab)
    if (copyText === null) {
      return
    }

    input.runFaAction('copyOpenedDocumentTabTextColor', { documentId })
  }

  async function onTabCopyBackgroundColorClick (documentId: string): Promise<void> {
    const tab = input.findTabByDocumentId(documentId)
    if (tab === null) {
      return
    }

    const copyText = resolveProjectDocumentControlBarTabCopyBackgroundColorText(tab)
    if (copyText === null) {
      return
    }

    input.runFaAction('copyOpenedDocumentTabBackgroundColor', { documentId })
  }

  async function onTabCopyDocumentClick (documentId: string): Promise<void> {
    const tab = input.findTabByDocumentId(documentId)
    if (tab === null) {
      return
    }

    input.runFaAction('copyOpenedDocumentTabDocument', { documentId })
  }

  async function onTabAddNewDocumentUnderThisClick (documentId: string): Promise<void> {
    const tab = input.findTabByDocumentId(documentId)
    if (tab === null) {
      return
    }

    input.runFaAction('addOpenedDocumentTabChildDocument', { documentId })
  }

  function onTabMoveClick (documentId: string, direction: 'left' | 'right'): void {
    input.moveDocumentTab(documentId, direction)
  }

  return {
    onTabAddNewDocumentUnderThisClick,
    onTabCopyBackgroundColorClick,
    onTabCopyDocumentClick,
    onTabCopyNameClick,
    onTabCopyTextColorClick,
    onTabMoveClick
  }
}
