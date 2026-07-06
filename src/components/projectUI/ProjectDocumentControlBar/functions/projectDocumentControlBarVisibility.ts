export const FA_PROJECT_DOCUMENT_CONTROL_BAR_HEADER_MOUNT_SELECTOR =
  '[data-test-locator="mainLayout-documentControlBarHeaderMount"]'

export function resolveShowDocumentTabs (openedTabCount: number): boolean {
  return openedTabCount > 0
}

export function resolveShowDocumentControlBarStrip (input: {
  disableDocumentControlBar: boolean
}): boolean {
  return !input.disableDocumentControlBar
}

export function resolveActiveDocumentTabName (input: {
  activeDocumentId: string | null
  openedTabs: readonly { documentId: string }[]
}): string | undefined {
  const documentId = input.activeDocumentId
  if (documentId === null) {
    return undefined
  }

  const hasOpenTab = input.openedTabs.some((tab) => {
    return tab.documentId === documentId
  })
  if (!hasOpenTab) {
    return undefined
  }

  return documentId
}

export function resolveDocumentTabLabelFromOpenedTab (input: {
  displayNameDraft: string
  tabLabel: string
}): string {
  const draft = input.displayNameDraft.trim()
  if (draft.length > 0) {
    return draft
  }

  return input.tabLabel
}
