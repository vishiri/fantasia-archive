import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

export function buildProjectDocumentControlBarTabContextMenuClickHandlers (input: {
  onTabCloseAllWithoutChangesClick: () => void
  onTabCloseAllWithoutChangesExceptClick: (documentId: string) => void
  onTabCloseClick: (documentId: string) => void
  onTabCopyNameClick: (documentId: string) => Promise<void>
  onTabDeleteClick: (documentId: string) => void | Promise<void>
  onTabForceCloseAllClick: () => void
  onTabForceCloseAllExceptClick: (documentId: string) => void
  onTabMoveClick: (documentId: string, direction: 'left' | 'right') => void
  resolveDocumentTabLabel: (tab: I_faOpenedDocumentTab) => string
  resolveDocumentTabRoute: (documentId: string) => string
  tab: I_faOpenedDocumentTab
}): {
    onCloseAllTabsWithoutChangesClick: () => void
    onCloseAllTabsWithoutChangesExceptThisOneClick: () => void
    onCloseThisTabClick: () => void
    onCopyNameClick: () => void
    onDeleteThisDocumentClick: () => void
    onForceCloseAllTabsClick: () => void
    onForceCloseAllTabsExceptThisOneClick: () => void
    onMoveTabLeftClick: () => void
    onMoveTabRightClick: () => void
    resolveBrowseTabLabel: (browseTab: I_faOpenedDocumentTab) => string
    resolveBrowseTabRoute: (documentId: string) => string
  } {
  function resolveBrowseTabLabel (browseTab: I_faOpenedDocumentTab): string {
    return input.resolveDocumentTabLabel(browseTab)
  }

  function resolveBrowseTabRoute (documentId: string): string {
    return input.resolveDocumentTabRoute(documentId)
  }

  function onCopyNameClick (): void {
    void input.onTabCopyNameClick(input.tab.documentId)
  }

  function onMoveTabLeftClick (): void {
    input.onTabMoveClick(input.tab.documentId, 'left')
  }

  function onMoveTabRightClick (): void {
    input.onTabMoveClick(input.tab.documentId, 'right')
  }

  function onCloseThisTabClick (): void {
    input.onTabCloseClick(input.tab.documentId)
  }

  function onCloseAllTabsWithoutChangesExceptThisOneClick (): void {
    input.onTabCloseAllWithoutChangesExceptClick(input.tab.documentId)
  }

  function onCloseAllTabsWithoutChangesClick (): void {
    input.onTabCloseAllWithoutChangesClick()
  }

  function onForceCloseAllTabsExceptThisOneClick (): void {
    input.onTabForceCloseAllExceptClick(input.tab.documentId)
  }

  function onForceCloseAllTabsClick (): void {
    input.onTabForceCloseAllClick()
  }

  function onDeleteThisDocumentClick (): void {
    void input.onTabDeleteClick(input.tab.documentId)
  }

  return {
    onCloseAllTabsWithoutChangesClick,
    onCloseAllTabsWithoutChangesExceptThisOneClick,
    onCloseThisTabClick,
    onCopyNameClick,
    onDeleteThisDocumentClick,
    onForceCloseAllTabsClick,
    onForceCloseAllTabsExceptThisOneClick,
    onMoveTabLeftClick,
    onMoveTabRightClick,
    resolveBrowseTabLabel,
    resolveBrowseTabRoute
  }
}
