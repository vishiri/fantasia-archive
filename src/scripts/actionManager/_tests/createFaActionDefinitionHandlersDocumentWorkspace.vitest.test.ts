import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { createFaActionDefinitionHandlersDocumentWorkspace } from '../functions/createFaActionDefinitionHandlersDocumentWorkspace'

const enterDocumentEditModeMock = vi.fn()
const saveDocumentDisplayNameMock = vi.fn(async () => undefined)
const focusTabMock = vi.fn(async () => undefined)
const moveActiveDocumentTabMock = vi.fn()
const notifyCreateMock = vi.fn()
const getCurrentRoutePathMock = vi.fn(() => '/home/document/doc-1')
const resolveCanEditActiveDocumentViaKeybindMock = vi.fn(() => true)
const resolveAdjacentOpenedDocumentTabIdMock = vi.fn((
  _tabs: readonly unknown[],
  activeDocumentId: string | null,
  direction: 'previous' | 'next'
) => {
  if (activeDocumentId === 'doc-1' && direction === 'next') {
    return 'doc-2'
  }
  if (activeDocumentId === 'doc-2' && direction === 'previous') {
    return 'doc-1'
  }
  return null
})

const sessionState: {
  activeDocumentId: string | null
  tabs: I_faOpenedDocumentTab[]
} = {
  activeDocumentId: 'doc-1',
  tabs: [
    {
      documentId: 'doc-1',
      persistenceState: 'persisted',
      tabLabel: 'One',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'One',
      savedDisplayName: 'One',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
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
      hasUnsavedChanges: false,
      editState: false
    },
    {
      documentId: 'doc-2',
      persistenceState: 'persisted',
      tabLabel: 'Two',
      templateIcon: 'mdi-feather',
      displayNameDraft: 'Two',
      savedDisplayName: 'Two',
      documentTextColorDraft: '',
      savedDocumentTextColor: '',
      documentBackgroundColorDraft: '',
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
      hasUnsavedChanges: false,
      editState: false
    }
  ]
}

const createTemporaryDocumentMock = vi.fn(async () => 'doc-temp')

const S_FaOpenedDocumentsMock = vi.fn(() => ({
  get activeDocumentId () {
    return sessionState.activeDocumentId
  },
  createTemporaryDocument: createTemporaryDocumentMock,
  enterDocumentEditMode: enterDocumentEditModeMock,
  focusTab: focusTabMock,
  moveActiveDocumentTab: moveActiveDocumentTabMock,
  saveDocumentDisplayName: saveDocumentDisplayNameMock,
  get tabs () {
    return sessionState.tabs
  }
}))

function createHandlers () {
  return createFaActionDefinitionHandlersDocumentWorkspace({
    S_FaOpenedDocuments: S_FaOpenedDocumentsMock,
    getCurrentRoutePath: getCurrentRoutePathMock,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    notifyCreate: notifyCreateMock,
    resolveAdjacentOpenedDocumentTabId: resolveAdjacentOpenedDocumentTabIdMock,
    resolveCanEditActiveDocumentViaKeybind: resolveCanEditActiveDocumentViaKeybindMock,
    resolveFaDocumentWorkspaceRouteDocumentId: () => 'doc-1',
    resolveShowProjectDocumentControlBarEditButton: () => true
  })
}

beforeEach(() => {
  enterDocumentEditModeMock.mockClear()
  saveDocumentDisplayNameMock.mockClear()
  focusTabMock.mockClear()
  moveActiveDocumentTabMock.mockClear()
  createTemporaryDocumentMock.mockClear()
  notifyCreateMock.mockClear()
  getCurrentRoutePathMock.mockReset()
  getCurrentRoutePathMock.mockReturnValue('/home/document/doc-1')
  resolveCanEditActiveDocumentViaKeybindMock.mockReset()
  resolveCanEditActiveDocumentViaKeybindMock.mockReturnValue(true)
  resolveAdjacentOpenedDocumentTabIdMock.mockClear()
  sessionState.activeDocumentId = 'doc-1'
})

test('Test that handleCreateTemporaryOpenedDocument delegates to the opened documents store', async () => {
  const { handleCreateTemporaryOpenedDocument } = createHandlers()
  const payload = {
    displayName: 'Aria',
    templateId: 'tpl-1',
    worldId: 'world-1'
  }

  await handleCreateTemporaryOpenedDocument(payload)

  expect(createTemporaryDocumentMock).toHaveBeenCalledWith(payload)
})

test('Test that handleEditActiveDocument enters edit mode when guards pass', () => {
  const { handleEditActiveDocument } = createHandlers()

  handleEditActiveDocument()

  expect(enterDocumentEditModeMock).toHaveBeenCalledWith('doc-1')
})

test('Test that handleEditActiveDocument skips when no active document is selected', () => {
  sessionState.activeDocumentId = null
  const { handleEditActiveDocument } = createHandlers()

  handleEditActiveDocument()

  expect(enterDocumentEditModeMock).not.toHaveBeenCalled()
  expect(resolveCanEditActiveDocumentViaKeybindMock).not.toHaveBeenCalled()
})

test('Test that handleEditActiveDocument skips when guards fail', () => {
  resolveCanEditActiveDocumentViaKeybindMock.mockReturnValue(false)
  const { handleEditActiveDocument } = createHandlers()

  handleEditActiveDocument()

  expect(enterDocumentEditModeMock).not.toHaveBeenCalled()
})

test('Test that handleSaveOpenedDocumentDisplayName saves and shows success toast', async () => {
  const { handleSaveOpenedDocumentDisplayName } = createHandlers()

  await handleSaveOpenedDocumentDisplayName({
    documentId: 'doc-1',
    keepEditMode: true
  })

  expect(saveDocumentDisplayNameMock).toHaveBeenCalledWith('doc-1', { keepEditMode: true })
  expect(notifyCreateMock).toHaveBeenCalledWith({
    group: false,
    type: 'positive',
    message: 'globalFunctionality.faOpenedDocuments.saveSuccess'
  })
})

test('Test that handleSaveOpenedDocumentDisplayName propagates store failures', async () => {
  saveDocumentDisplayNameMock.mockRejectedValueOnce(new Error('save failed'))
  const { handleSaveOpenedDocumentDisplayName } = createHandlers()

  await expect(handleSaveOpenedDocumentDisplayName({
    documentId: 'doc-1',
    keepEditMode: false
  })).rejects.toThrow('save failed')

  expect(notifyCreateMock).not.toHaveBeenCalled()
})

test('Test that handleFocusPreviousOpenedDocumentTab focuses the left neighbor', async () => {
  sessionState.activeDocumentId = 'doc-2'
  const { handleFocusPreviousOpenedDocumentTab } = createHandlers()

  await handleFocusPreviousOpenedDocumentTab()

  expect(focusTabMock).toHaveBeenCalledWith('doc-1')
})

test('Test that handleFocusNextOpenedDocumentTab focuses the right neighbor', async () => {
  const { handleFocusNextOpenedDocumentTab } = createHandlers()

  await handleFocusNextOpenedDocumentTab()

  expect(focusTabMock).toHaveBeenCalledWith('doc-2')
})

test('Test that handleFocusNextOpenedDocumentTab skips when no adjacent tab exists', async () => {
  sessionState.activeDocumentId = 'doc-2'
  const { handleFocusNextOpenedDocumentTab } = createHandlers()

  await handleFocusNextOpenedDocumentTab()

  expect(focusTabMock).not.toHaveBeenCalled()
})

test('Test that tab focus handlers skip when no adjacent tab exists', async () => {
  sessionState.activeDocumentId = 'doc-1'
  const { handleFocusPreviousOpenedDocumentTab } = createHandlers()

  await handleFocusPreviousOpenedDocumentTab()

  expect(focusTabMock).not.toHaveBeenCalled()
})

test('Test that move tab handlers delegate to the opened documents store', () => {
  const {
    handleMoveActiveOpenedDocumentTabLeft,
    handleMoveActiveOpenedDocumentTabRight
  } = createHandlers()

  handleMoveActiveOpenedDocumentTabLeft()
  handleMoveActiveOpenedDocumentTabRight()

  expect(moveActiveDocumentTabMock).toHaveBeenNthCalledWith(1, 'left')
  expect(moveActiveDocumentTabMock).toHaveBeenNthCalledWith(2, 'right')
})
