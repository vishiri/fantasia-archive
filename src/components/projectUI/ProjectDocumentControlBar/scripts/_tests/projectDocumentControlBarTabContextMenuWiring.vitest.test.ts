import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { buildProjectDocumentControlBarTabContextMenuHandlers } from '../projectDocumentControlBarTabContextMenuWiring'

function createPersistedTab (overrides: Partial<I_faOpenedDocumentTab> = {}): I_faOpenedDocumentTab {
  return {
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '',
    documentId: 'doc-a',
    documentTextColorDraft: '',
    editState: false,
    hasUnsavedChanges: false,
    persistenceState: 'persisted',
    savedDisplayName: 'Saved',
    savedDocumentBackgroundColor: '',
    isCategoryDraft: false,
    savedIsCategory: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    isDeadDraft: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedIsDead: false,
    parentDocumentIdDraft: '',
    savedParentDocumentId: '',
    savedDocumentTextColor: '',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    ...overrides
  }
}

function createHandlers (input: {
  findTabByDocumentId?: (documentId: string) => I_faOpenedDocumentTab | null
  moveDocumentTab?: (documentId: string, direction: 'left' | 'right') => void
  runFaAction?: (id: string, payload: unknown) => void
} = {}) {
  return buildProjectDocumentControlBarTabContextMenuHandlers({
    findTabByDocumentId: input.findTabByDocumentId ?? (() => createPersistedTab()),
    moveDocumentTab: input.moveDocumentTab ?? vi.fn(),
    resolveDocumentTabLabelFromOpenedTab: ({ displayNameDraft, tabLabel }) => {
      return displayNameDraft.trim().length > 0 ? displayNameDraft.trim() : tabLabel
    },
    runFaAction: input.runFaAction ?? vi.fn()
  })
}

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers dispatches copy name through runFaAction', async () => {
  const runFaAction = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => createPersistedTab({ displayNameDraft: ' Draft ' }),
    runFaAction
  })

  await handlers.onTabCopyNameClick('doc-a')

  expect(runFaAction).toHaveBeenCalledWith('copyOpenedDocumentTabName', { documentId: 'doc-a' })
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers moveTab calls moveDocumentTab for the clicked tab', () => {
  const moveDocumentTab = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => null,
    moveDocumentTab
  })

  handlers.onTabMoveClick('doc-b', 'right')

  expect(moveDocumentTab).toHaveBeenCalledWith('doc-b', 'right')
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers skips copy when tab is missing', async () => {
  const runFaAction = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => null,
    runFaAction
  })

  await handlers.onTabCopyNameClick('missing')

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers skips copy when resolved label is empty', async () => {
  const runFaAction = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => createPersistedTab({
      displayNameDraft: '   ',
      tabLabel: ''
    }),
    runFaAction
  })

  await handlers.onTabCopyNameClick('doc-a')

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers dispatches text color copy through runFaAction', async () => {
  const runFaAction = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => createPersistedTab({ documentTextColorDraft: '  #AABBCC  ' }),
    runFaAction
  })

  await handlers.onTabCopyTextColorClick('doc-a')

  expect(runFaAction).toHaveBeenCalledWith('copyOpenedDocumentTabTextColor', { documentId: 'doc-a' })
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers dispatches background color copy through runFaAction', async () => {
  const runFaAction = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => createPersistedTab({ documentBackgroundColorDraft: ' #112233 ' }),
    runFaAction
  })

  await handlers.onTabCopyBackgroundColorClick('doc-a')

  expect(runFaAction).toHaveBeenCalledWith(
    'copyOpenedDocumentTabBackgroundColor',
    { documentId: 'doc-a' }
  )
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers skips color copy when tab is missing', async () => {
  const runFaAction = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => null,
    runFaAction
  })

  await handlers.onTabCopyTextColorClick('missing')
  await handlers.onTabCopyBackgroundColorClick('missing')

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers skips color copy when draft is empty', async () => {
  const runFaAction = vi.fn()

  const handlers = createHandlers({
    findTabByDocumentId: () => createPersistedTab({
      documentBackgroundColorDraft: '',
      documentTextColorDraft: '   ',
      savedDocumentBackgroundColor: '#112233',
      isCategoryDraft: false,
      savedIsCategory: false,
      isFinishedDraft: false,
      isMinorDraft: false,
      isDeadDraft: false,
      savedIsFinished: false,
      savedIsMinor: false,
      savedIsDead: false,
      parentDocumentIdDraft: '',
      savedParentDocumentId: '',
      savedDocumentTextColor: '#AABBCC'
    }),
    runFaAction
  })

  await handlers.onTabCopyTextColorClick('doc-a')
  await handlers.onTabCopyBackgroundColorClick('doc-a')

  expect(runFaAction).not.toHaveBeenCalled()
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers dispatches copy document through runFaAction', async () => {
  const runFaAction = vi.fn()
  const handlers = createHandlers({ runFaAction })

  await handlers.onTabCopyDocumentClick('doc-a')

  expect(runFaAction).toHaveBeenCalledWith('copyOpenedDocumentTabDocument', { documentId: 'doc-a' })
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers dispatches add child document through runFaAction', async () => {
  const runFaAction = vi.fn()
  const handlers = createHandlers({ runFaAction })

  await handlers.onTabAddNewDocumentUnderThisClick('doc-a')

  expect(runFaAction).toHaveBeenCalledWith('addOpenedDocumentTabChildDocument', { documentId: 'doc-a' })
})

test('Test that buildProjectDocumentControlBarTabContextMenuHandlers skips document actions when tab is missing', async () => {
  const runFaAction = vi.fn()
  const handlers = createHandlers({
    findTabByDocumentId: () => null,
    runFaAction
  })

  await handlers.onTabCopyDocumentClick('missing')
  await handlers.onTabAddNewDocumentUnderThisClick('missing')

  expect(runFaAction).not.toHaveBeenCalled()
})
