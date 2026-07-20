import { beforeEach, expect, test, vi } from 'vitest'

const keybindSaveSession = vi.hoisted(() => ({
  activeDocumentId: 'doc-1' as string | null,
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
      treeOrderNumberDraft: '',
      savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
      hasUnsavedChanges: true,
      editState: true
    }
  ]
}))

vi.mock('app/src/stores/S_FaOpenedDocuments', () => ({
  S_FaOpenedDocuments: () => ({
    get activeDocumentId () {
      return keybindSaveSession.activeDocumentId
    },
    get tabs () {
      return keybindSaveSession.tabs
    }
  })
}))

vi.mock('app/src/scripts/appInternals/faAppRouterSession_manager', () => ({
  resolveFaAppRouterCurrentPath: () => '/home/document/doc-1'
}))

import { tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch } from '../faKeybindDocumentWorkspaceSaveDispatchWiring'

beforeEach(() => {
  keybindSaveSession.activeDocumentId = 'doc-1'
  keybindSaveSession.tabs[0] = {
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
    treeOrderNumberDraft: '',
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
    hasUnsavedChanges: true,
    editState: true
  }
})

/**
 * tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch
 * Ignores commands that are not document save keybinds.
 */
test('Test that tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch returns null for unrelated commands', () => {
  expect(tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch('editDocument')).toBeNull()
})

test('Test that tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch returns null without an active document', () => {
  keybindSaveSession.activeDocumentId = null
  expect(tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch('saveDocument')).toBeNull()
})

test('Test that tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch returns null when save is not allowed', () => {
  keybindSaveSession.tabs[0] = {
    ...keybindSaveSession.tabs[0]!,
    editState: false
  }
  expect(tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch('saveDocument')).toBeNull()
})

test('Test that tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch resolves saveDocument dispatch', () => {
  expect(tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch('saveDocument')).toEqual({
    actionId: 'saveOpenedDocumentDisplayName',
    payload: {
      documentId: 'doc-1',
      keepEditMode: false
    }
  })
})

test('Test that tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch resolves saveDocumentKeepEditMode dispatch', () => {
  expect(tryResolveFaKeybindDocumentWorkspaceSaveActionDispatch('saveDocumentKeepEditMode')).toEqual({
    actionId: 'saveOpenedDocumentDisplayName',
    payload: {
      documentId: 'doc-1',
      keepEditMode: true
    }
  })
})
