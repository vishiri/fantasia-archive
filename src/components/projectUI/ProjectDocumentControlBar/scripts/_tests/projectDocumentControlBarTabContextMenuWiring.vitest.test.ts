import { expect, test, vi } from 'vitest'

import { buildProjectDocumentControlBarTabContextMenuHandlers } from '../projectDocumentControlBarTabContextMenuWiring'

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers copies the resolved tab label', async () => {
  const copyToClipboard = vi.fn(async () => undefined)
  const notifyCreate = vi.fn()
  const moveDocumentTab = vi.fn()

  const handlers = buildProjectDocumentControlBarTabContextMenuHandlers({
    copyToClipboard,
    findTabByDocumentId: (documentId) => {
      if (documentId !== 'doc-a') {
        return null
      }
      return {
        displayNameDraft: ' Draft ',
        documentId: 'doc-a',
        persistenceState: 'persisted',
        editState: false,
        hasUnsavedChanges: false,
        savedDisplayName: 'Saved',
        tabLabel: 'Character',
        templateIcon: 'mdi-account'
      }
    },
    moveDocumentTab,
    notifyCreate,
    requestCloseTab: vi.fn(),
    resolveDocumentTabLabelFromOpenedTab: ({ displayNameDraft, tabLabel }) => {
      return displayNameDraft.trim().length > 0 ? displayNameDraft.trim() : tabLabel
    },
    translateCopyNameFailed: () => 'Copy failed',
    translateCopyNameSuccess: () => 'Copy success'
  })

  await handlers.onTabCopyNameClick('doc-a')

  expect(copyToClipboard).toHaveBeenCalledWith('Draft')
  expect(notifyCreate).toHaveBeenCalledOnce()
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers moveTab calls moveDocumentTab for the clicked tab', () => {
  const moveDocumentTab = vi.fn()

  const handlers = buildProjectDocumentControlBarTabContextMenuHandlers({
    copyToClipboard: vi.fn(),
    findTabByDocumentId: () => null,
    moveDocumentTab,
    notifyCreate: vi.fn(),
    requestCloseTab: vi.fn(),
    resolveDocumentTabLabelFromOpenedTab: () => 'Name',
    translateCopyNameFailed: () => 'Copy failed',
    translateCopyNameSuccess: () => 'Copy success'
  })

  handlers.onTabMoveClick('doc-b', 'right')

  expect(moveDocumentTab).toHaveBeenCalledWith('doc-b', 'right')
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers skips copy when tab is missing', async () => {
  const copyToClipboard = vi.fn()
  const notifyCreate = vi.fn()

  const handlers = buildProjectDocumentControlBarTabContextMenuHandlers({
    copyToClipboard,
    findTabByDocumentId: () => null,
    moveDocumentTab: vi.fn(),
    notifyCreate,
    requestCloseTab: vi.fn(),
    resolveDocumentTabLabelFromOpenedTab: () => 'Name',
    translateCopyNameFailed: () => 'Copy failed',
    translateCopyNameSuccess: () => 'Copy success'
  })

  await handlers.onTabCopyNameClick('missing')

  expect(copyToClipboard).not.toHaveBeenCalled()
  expect(notifyCreate).not.toHaveBeenCalled()
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers skips copy when trimmed name is empty', async () => {
  const copyToClipboard = vi.fn()
  const notifyCreate = vi.fn()

  const handlers = buildProjectDocumentControlBarTabContextMenuHandlers({
    copyToClipboard,
    findTabByDocumentId: () => ({
      displayNameDraft: '   ',
      documentId: 'doc-a',
      persistenceState: 'persisted',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'Saved',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }),
    moveDocumentTab: vi.fn(),
    notifyCreate,
    requestCloseTab: vi.fn(),
    resolveDocumentTabLabelFromOpenedTab: ({ displayNameDraft }) => displayNameDraft,
    translateCopyNameFailed: () => 'Copy failed',
    translateCopyNameSuccess: () => 'Copy success'
  })

  await handlers.onTabCopyNameClick('doc-a')

  expect(copyToClipboard).not.toHaveBeenCalled()
  expect(notifyCreate).not.toHaveBeenCalled()
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers reports clipboard failures', async () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const copyToClipboard = vi.fn(async () => {
    throw new Error('clipboard denied')
  })
  const notifyCreate = vi.fn()

  const handlers = buildProjectDocumentControlBarTabContextMenuHandlers({
    copyToClipboard,
    findTabByDocumentId: () => ({
      displayNameDraft: 'Hero',
      documentId: 'doc-a',
      persistenceState: 'persisted',
      editState: false,
      hasUnsavedChanges: false,
      savedDisplayName: 'Saved',
      tabLabel: 'Character',
      templateIcon: 'mdi-account'
    }),
    moveDocumentTab: vi.fn(),
    notifyCreate,
    requestCloseTab: vi.fn(),
    resolveDocumentTabLabelFromOpenedTab: ({ displayNameDraft }) => displayNameDraft,
    translateCopyNameFailed: () => 'Copy failed',
    translateCopyNameSuccess: () => 'Copy success'
  })

  await handlers.onTabCopyNameClick('doc-a')

  expect(notifyCreate).toHaveBeenCalledWith(expect.objectContaining({
    caption: 'clipboard denied',
    message: 'Copy failed',
    type: 'negative'
  }))

  copyToClipboard.mockRejectedValueOnce('plain failure')
  await handlers.onTabCopyNameClick('doc-a')
  expect(notifyCreate).toHaveBeenLastCalledWith(expect.objectContaining({
    caption: 'plain failure'
  }))

  consoleErrorSpy.mockRestore()
})
