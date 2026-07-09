import { expect, test, vi } from 'vitest'

import { buildProjectDocumentControlBarTabContextMenuClickHandlers } from '../projectDocumentControlBarTabContextMenuClickHandlers'

const sampleTab = {
  displayNameDraft: 'Hero',
  documentId: 'doc-hero',
  editState: false,
  hasUnsavedChanges: false,
  savedDisplayName: 'Hero',
  tabLabel: 'Character',
  templateIcon: 'mdi-account'
}

function buildHandlers () {
  const onTabCloseAllWithoutChangesClick = vi.fn()
  const onTabCloseAllWithoutChangesExceptClick = vi.fn()
  const onTabCloseClick = vi.fn()
  const onTabDeleteClick = vi.fn()
  const onTabForceCloseAllClick = vi.fn()
  const onTabForceCloseAllExceptClick = vi.fn()

  const handlers = buildProjectDocumentControlBarTabContextMenuClickHandlers({
    onTabCloseAllWithoutChangesClick,
    onTabCloseAllWithoutChangesExceptClick,
    onTabCloseClick,
    onTabCopyNameClick: vi.fn(async () => undefined),
    onTabDeleteClick,
    onTabForceCloseAllClick,
    onTabForceCloseAllExceptClick,
    onTabMoveClick: vi.fn(),
    resolveDocumentTabLabel: () => 'Hero',
    resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
    tab: sampleTab
  })

  return {
    handlers,
    onTabCloseAllWithoutChangesClick,
    onTabCloseAllWithoutChangesExceptClick,
    onTabCloseClick,
    onTabDeleteClick,
    onTabForceCloseAllClick,
    onTabForceCloseAllExceptClick
  }
}

test('Test that buildProjectDocumentControlBarTabContextMenuClickHandlers move and browse helpers delegate to tab handlers', () => {
  const onTabMoveClick = vi.fn()
  const handlers = buildProjectDocumentControlBarTabContextMenuClickHandlers({
    onTabCloseAllWithoutChangesClick: vi.fn(),
    onTabCloseAllWithoutChangesExceptClick: vi.fn(),
    onTabCloseClick: vi.fn(),
    onTabCopyNameClick: vi.fn(async () => undefined),
    onTabDeleteClick: vi.fn(),
    onTabForceCloseAllClick: vi.fn(),
    onTabForceCloseAllExceptClick: vi.fn(),
    onTabMoveClick,
    resolveDocumentTabLabel: (tab) => tab.displayNameDraft,
    resolveDocumentTabRoute: (documentId: string) => `/home/document/${documentId}`,
    tab: sampleTab
  })

  handlers.onMoveTabLeftClick()
  handlers.onMoveTabRightClick()
  handlers.onCopyNameClick()

  expect(onTabMoveClick).toHaveBeenNthCalledWith(1, 'doc-hero', 'left')
  expect(onTabMoveClick).toHaveBeenNthCalledWith(2, 'doc-hero', 'right')
  expect(handlers.resolveBrowseTabLabel(sampleTab)).toBe('Hero')
  expect(handlers.resolveBrowseTabRoute('doc-hero')).toBe('/home/document/doc-hero')
})

test('Test that buildProjectDocumentControlBarTabContextMenuClickHandlers bulk close actions delegate to tab handlers', () => {
  const {
    handlers,
    onTabCloseAllWithoutChangesClick,
    onTabCloseAllWithoutChangesExceptClick,
    onTabCloseClick
  } = buildHandlers()

  handlers.onCloseThisTabClick()
  handlers.onCloseAllTabsWithoutChangesExceptThisOneClick()
  handlers.onCloseAllTabsWithoutChangesClick()

  expect(onTabCloseClick).toHaveBeenCalledWith('doc-hero')
  expect(onTabCloseAllWithoutChangesExceptClick).toHaveBeenCalledWith('doc-hero')
  expect(onTabCloseAllWithoutChangesClick).toHaveBeenCalledOnce()
})

test('Test that buildProjectDocumentControlBarTabContextMenuClickHandlers destructive actions delegate to tab handlers', () => {
  const {
    handlers,
    onTabDeleteClick,
    onTabForceCloseAllClick,
    onTabForceCloseAllExceptClick
  } = buildHandlers()

  handlers.onForceCloseAllTabsExceptThisOneClick()
  handlers.onForceCloseAllTabsClick()
  handlers.onDeleteThisDocumentClick()

  expect(onTabForceCloseAllExceptClick).toHaveBeenCalledWith('doc-hero')
  expect(onTabForceCloseAllClick).toHaveBeenCalledOnce()
  expect(onTabDeleteClick).toHaveBeenCalledWith('doc-hero')
})
