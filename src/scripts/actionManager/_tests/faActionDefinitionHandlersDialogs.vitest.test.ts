/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const {
  openDialogComponentMock,
  openDialogMarkdownDocumentMock,
  mockActiveProjectGate,
  canOpenFloatingWindowWhileNoModalMock
} = vi.hoisted(() => {
  return {
    openDialogComponentMock: vi.fn(),
    openDialogMarkdownDocumentMock: vi.fn(),
    mockActiveProjectGate: {
      hasActiveProject: true
    },
    canOpenFloatingWindowWhileNoModalMock: vi.fn((): boolean => true)
  }
})

vi.mock('app/src/stores/S_FaActiveProject', () => ({
  S_FaActiveProject: () => ({
    get hasActiveProject () {
      return mockActiveProjectGate.hasActiveProject
    }
  })
}))

vi.mock('app/src/scripts/appNoteboard/appNoteboard_manager', () => ({
  canOpenFloatingWindowWhileNoModal: (): boolean => canOpenFloatingWindowWhileNoModalMock()
}))

vi.mock('app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager')>()
  return {
    ...actual,
    openDialogComponent: openDialogComponentMock,
    openDialogMarkdownDocument: openDialogMarkdownDocumentMock
  }
})

import {
  handleOpenAppSettingsDialog,
  handleOpenAppStylingWindow,
  handleOpenKeybindSettingsDialog,
  handleOpenProjectSettingsDialog,
  handleOpenProjectStylingWindow
} from '../faActionDefinitionHandlersDialogs_manager'

beforeEach(() => {
  openDialogComponentMock.mockReset()
  openDialogMarkdownDocumentMock.mockReset()
  mockActiveProjectGate.hasActiveProject = true
  canOpenFloatingWindowWhileNoModalMock.mockReset()
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(true)
})

/**
 * handleOpenKeybindSettingsDialog
 * Opens the Keybind Settings dialog through openDialogComponent.
 */
test('Test that handleOpenKeybindSettingsDialog opens KeybindSettings', async () => {
  await handleOpenKeybindSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('KeybindSettings')
})

/**
 * handleOpenAppSettingsDialog
 * Opens the App Settings dialog through openDialogComponent.
 */
test('Test that handleOpenAppSettingsDialog opens AppSettings', async () => {
  await handleOpenAppSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('AppSettings')
})

/**
 * handleOpenAppStylingWindow
 * Opens the Custom App CSS floating window through openDialogComponent.
 */
test('Test that handleOpenAppStylingWindow opens WindowAppStyling', async () => {
  await handleOpenAppStylingWindow()
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowAppStyling')
})

/**
 * handleOpenProjectStylingWindow
 * Opens the Custom Project CSS window when a project is active and floating windows are allowed.
 */
test('Test that handleOpenProjectStylingWindow opens WindowProjectStyling when allowed', async () => {
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowProjectStyling')
})

/**
 * handleOpenProjectStylingWindow
 * Skips opening when no active project is loaded.
 */
test('Test that handleOpenProjectStylingWindow skips without an active project', async () => {
  mockActiveProjectGate.hasActiveProject = false
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

/**
 * handleOpenProjectStylingWindow
 * Skips opening when another modal blocks floating windows.
 */
test('Test that handleOpenProjectStylingWindow skips when floating windows cannot open', async () => {
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(false)
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

/**
 * handleOpenProjectSettingsDialog
 * Opens Project Settings when a project is active.
 */
test('Test that handleOpenProjectSettingsDialog opens ProjectSettings when a project is active', async () => {
  await handleOpenProjectSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectSettings')
})

/**
 * handleOpenProjectSettingsDialog
 * Skips opening when no active project is loaded.
 */
test('Test that handleOpenProjectSettingsDialog skips without an active project', async () => {
  mockActiveProjectGate.hasActiveProject = false
  await handleOpenProjectSettingsDialog()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})
