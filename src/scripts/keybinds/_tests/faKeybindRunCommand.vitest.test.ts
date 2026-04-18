import { beforeEach, expect, test, vi } from 'vitest'

const { openDialogMock, openMarkdownMock, toggleMock } = vi.hoisted(() => {
  return {
    openDialogMock: vi.fn(),
    openMarkdownMock: vi.fn(),
    toggleMock: vi.fn()
  }
})

vi.mock('app/src/scripts/appGlobalManagementUI/dialogManagement', () => {
  return {
    openDialogComponent: (...args: unknown[]) => openDialogMock(...args),
    openDialogMarkdownDocument: (...args: unknown[]) => openMarkdownMock(...args)
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
  openMarkdownMock.mockReset()
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

test('faKeybindRunCommand opens keybind settings', () => {
  faKeybindRunCommand('openKeybindSettings')
  expect(openDialogMock).toHaveBeenCalledWith('KeybindSettings')
})

test('faKeybindRunCommand opens advanced search guide markdown', () => {
  faKeybindRunCommand('openAdvancedSearchGuide')
  expect(openMarkdownMock).toHaveBeenCalledWith('advancedSearchGuide')
  expect(openDialogMock).not.toHaveBeenCalled()
})
