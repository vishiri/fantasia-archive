import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock } = vi.hoisted(() => {
  return {
    runFaActionMock: vi.fn()
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun_manager', () => {
  return {
    runFaAction: (...args: unknown[]) => runFaActionMock(...args),
    runFaActionAwait: vi.fn(async () => true)
  }
})

import { faKeybindRunCommand } from 'app/src/scripts/keybinds/keybinds_manager'

beforeEach(() => {
  runFaActionMock.mockReset()
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
