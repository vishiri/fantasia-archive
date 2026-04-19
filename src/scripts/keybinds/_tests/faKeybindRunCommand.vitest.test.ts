import { beforeEach, expect, test, vi } from 'vitest'

const { runFaActionMock } = vi.hoisted(() => {
  return {
    runFaActionMock: vi.fn()
  }
})

vi.mock('app/src/scripts/actionManager/faActionManagerRun', () => {
  return {
    runFaAction: (...args: unknown[]) => runFaActionMock(...args),
    runFaActionAwait: vi.fn(async () => true)
  }
})

import { faKeybindRunCommand } from 'app/src/scripts/keybinds/faKeybindRunCommand'

beforeEach(() => {
  runFaActionMock.mockReset()
})

test('faKeybindRunCommand routes toggleDeveloperTools through the action manager', () => {
  faKeybindRunCommand('toggleDeveloperTools')
  expect(runFaActionMock).toHaveBeenCalledOnce()
  expect(runFaActionMock).toHaveBeenCalledWith('toggleDeveloperTools', undefined)
})

test('faKeybindRunCommand routes openProgramSettings to the openProgramSettingsDialog action', () => {
  faKeybindRunCommand('openProgramSettings')
  expect(runFaActionMock).toHaveBeenCalledWith('openProgramSettingsDialog', undefined)
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
