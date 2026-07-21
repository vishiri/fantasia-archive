import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock } = vi.hoisted(() => {
  return {
    runFaActionMock: vi.fn()
  }
})

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
      extraClassesDraft: '',
      savedExtraClasses: '',
      hasUnsavedChanges: true,
      editState: true
    }
  ]
}))

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: (...args: unknown[]) => runFaActionMock(...args),
    runFaActionAwait: vi.fn(async () => true)
  }
})

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

import { faKeybindRunCommand } from 'app/src/scripts/keybinds/keybinds_manager'

beforeEach(() => {
  runFaActionMock.mockReset()
  keybindSaveSession.activeDocumentId = 'doc-1'
})

test('faKeybindRunCommand routes toggleDeveloperTools through the action manager', () => {
  faKeybindRunCommand('toggleDeveloperTools')
  expect(runFaActionMock).toHaveBeenCalledOnce()
  expect(runFaActionMock).toHaveBeenCalledWith('toggleDeveloperTools', undefined)
})

test('faKeybindRunCommand routes openAppSettings to the openAppSettingsDialog action', () => {
  faKeybindRunCommand('openAppSettings')
  expect(runFaActionMock).toHaveBeenCalledWith('openAppSettingsDialog', undefined)
})

test('faKeybindRunCommand routes openKeybindSettings to the openKeybindSettingsDialog action', () => {
  faKeybindRunCommand('openKeybindSettings')
  expect(runFaActionMock).toHaveBeenCalledWith('openKeybindSettingsDialog', undefined)
})

test('faKeybindRunCommand routes openAdvancedSearchGuide to the openAdvancedSearchGuideDialog action', () => {
  faKeybindRunCommand('openAdvancedSearchGuide')
  expect(runFaActionMock).toHaveBeenCalledWith('openAdvancedSearchGuideDialog', undefined)
})

test('faKeybindRunCommand routes openActionMonitor to the openActionMonitorDialog action', () => {
  faKeybindRunCommand('openActionMonitor')
  expect(runFaActionMock).toHaveBeenCalledWith('openActionMonitorDialog', undefined)
})

test('faKeybindRunCommand routes toggleAppNoteboard to the toggleAppNoteboardWindow action', () => {
  faKeybindRunCommand('toggleAppNoteboard')
  expect(runFaActionMock).toHaveBeenCalledWith('toggleAppNoteboardWindow', undefined)
})

test('faKeybindRunCommand routes toggleProjectNoteboard to the toggleProjectNoteboardWindow action', () => {
  faKeybindRunCommand('toggleProjectNoteboard')
  expect(runFaActionMock).toHaveBeenCalledWith('toggleProjectNoteboardWindow', undefined)
})

test('faKeybindRunCommand routes openProjectStyling to the openProjectStylingDialog action', () => {
  faKeybindRunCommand('openProjectStyling')
  expect(runFaActionMock).toHaveBeenCalledWith('openProjectStylingDialog', undefined)
})

test('faKeybindRunCommand routes showProjectDashboard to the showProjectDashboard action', () => {
  faKeybindRunCommand('showProjectDashboard')
  expect(runFaActionMock).toHaveBeenCalledWith('showProjectDashboard', undefined)
})

test('faKeybindRunCommand routes openProjectSettings to the openProjectSettingsDialog action', () => {
  faKeybindRunCommand('openProjectSettings')
  expect(runFaActionMock).toHaveBeenCalledWith('openProjectSettingsDialog', undefined)
})

test('faKeybindRunCommand routes editDocument to the editActiveDocument action', () => {
  faKeybindRunCommand('editDocument')
  expect(runFaActionMock).toHaveBeenCalledWith('editActiveDocument', undefined)
})

test('faKeybindRunCommand routes saveDocumentKeepEditMode with payload captured at dispatch', () => {
  faKeybindRunCommand('saveDocumentKeepEditMode')
  expect(runFaActionMock).toHaveBeenCalledWith('saveOpenedDocumentDisplayName', {
    documentId: 'doc-1',
    keepEditMode: true
  })
})

test('faKeybindRunCommand routes saveDocument with payload captured at dispatch', () => {
  faKeybindRunCommand('saveDocument')
  expect(runFaActionMock).toHaveBeenCalledWith('saveOpenedDocumentDisplayName', {
    documentId: 'doc-1',
    keepEditMode: false
  })
})

test('faKeybindRunCommand skips saveDocument when no active document is open', () => {
  keybindSaveSession.activeDocumentId = null
  faKeybindRunCommand('saveDocument')
  expect(runFaActionMock).not.toHaveBeenCalled()
})

test('faKeybindRunCommand routes focusPreviousDocumentTab to focusPreviousOpenedDocumentTab', () => {
  faKeybindRunCommand('focusPreviousDocumentTab')
  expect(runFaActionMock).toHaveBeenCalledWith('focusPreviousOpenedDocumentTab', undefined)
})

test('faKeybindRunCommand routes focusNextDocumentTab to focusNextOpenedDocumentTab', () => {
  faKeybindRunCommand('focusNextDocumentTab')
  expect(runFaActionMock).toHaveBeenCalledWith('focusNextOpenedDocumentTab', undefined)
})

test('faKeybindRunCommand routes moveDocumentTabLeft to moveActiveOpenedDocumentTabLeft', () => {
  faKeybindRunCommand('moveDocumentTabLeft')
  expect(runFaActionMock).toHaveBeenCalledWith('moveActiveOpenedDocumentTabLeft', undefined)
})

test('faKeybindRunCommand routes moveDocumentTabRight to moveActiveOpenedDocumentTabRight', () => {
  faKeybindRunCommand('moveDocumentTabRight')
  expect(runFaActionMock).toHaveBeenCalledWith('moveActiveOpenedDocumentTabRight', undefined)
})
