import { beforeEach, expect, test, vi } from 'vitest'

const { openDialogMock, toggleMock } = vi.hoisted(() => {
  return {
    openDialogMock: vi.fn(),
    toggleMock: vi.fn()
  }
})

vi.mock('app/src/scripts/appGlobalManagementUI/dialogManagement', () => {
  return {
    openDialogComponent: (...args: unknown[]) => openDialogMock(...args)
  }
})

vi.mock('app/src/scripts/appGlobalManagementUI/toggleDevTools', () => {
  return {
    toggleDevTools: (...args: unknown[]) => toggleMock(...args)
  }
})

import { faKeybindRunCommand } from 'app/src/scripts/keybinds/faKeybindRunCommand'

beforeEach(() => {
  openDialogMock.mockReset()
  toggleMock.mockReset()
})

test('faKeybindRunCommand toggles developer tools', () => {
  faKeybindRunCommand('toggleDeveloperTools')
  expect(toggleMock).toHaveBeenCalledOnce()
  expect(openDialogMock).not.toHaveBeenCalled()
})

test('faKeybindRunCommand opens program settings', () => {
  faKeybindRunCommand('openProgramSettings')
  expect(openDialogMock).toHaveBeenCalledWith('ProgramSettings')
})

test('faKeybindRunCommand opens keybind settings by default', () => {
  faKeybindRunCommand('openKeybindSettings')
  expect(openDialogMock).toHaveBeenCalledWith('KeybindSettings')
})
