/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const {
  openDialogComponentMock,
  openDialogMarkdownDocumentMock,
  tryDismissFaComponentDialogIfOpenMock,
  tryDismissFaMarkdownDocumentIfOpenMock,
  mockActiveProjectGate,
  canOpenFloatingWindowWhileNoModalMock
} = vi.hoisted(() => {
  return {
    openDialogComponentMock: vi.fn(),
    openDialogMarkdownDocumentMock: vi.fn(),
    tryDismissFaComponentDialogIfOpenMock: vi.fn((): boolean => false),
    tryDismissFaMarkdownDocumentIfOpenMock: vi.fn((): boolean => false),
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
    openDialogMarkdownDocument: openDialogMarkdownDocumentMock,
    tryDismissFaComponentDialogIfOpen: tryDismissFaComponentDialogIfOpenMock,
    tryDismissFaMarkdownDocumentIfOpen: tryDismissFaMarkdownDocumentIfOpenMock
  }
})

import {
  handleOpenActionMonitorDialog,
  handleOpenAdvancedSearchGuideDialog,
  handleOpenAppSettingsDialog,
  handleOpenAppStylingWindow,
  handleOpenKeybindSettingsDialog,
  handleOpenProjectSettingsDialog,
  handleOpenProjectStylingWindow
} from '../faActionDefinitionHandlersDialogs_manager'

beforeEach(() => {
  openDialogComponentMock.mockReset()
  openDialogMarkdownDocumentMock.mockReset()
  tryDismissFaComponentDialogIfOpenMock.mockReset()
  tryDismissFaComponentDialogIfOpenMock.mockReturnValue(false)
  tryDismissFaMarkdownDocumentIfOpenMock.mockReset()
  tryDismissFaMarkdownDocumentIfOpenMock.mockReturnValue(false)
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
  expect(tryDismissFaComponentDialogIfOpenMock).toHaveBeenCalledWith('KeybindSettings')
  expect(openDialogComponentMock).toHaveBeenCalledWith('KeybindSettings')
})

/**
 * handleOpenKeybindSettingsDialog
 * Skips open when tryDismiss reports the dialog already open.
 */
test('Test that handleOpenKeybindSettingsDialog dismisses when already open', async () => {
  tryDismissFaComponentDialogIfOpenMock.mockReturnValue(true)
  await handleOpenKeybindSettingsDialog()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

/**
 * handleOpenAppSettingsDialog
 * Opens the App Settings dialog through openDialogComponent.
 */
test('Test that handleOpenAppSettingsDialog opens AppSettings', async () => {
  await handleOpenAppSettingsDialog()
  expect(tryDismissFaComponentDialogIfOpenMock).toHaveBeenCalledWith('AppSettings')
  expect(openDialogComponentMock).toHaveBeenCalledWith('AppSettings')
})

/**
 * handleOpenAppSettingsDialog
 * Skips open when tryDismiss reports the dialog already open.
 */
test('Test that handleOpenAppSettingsDialog dismisses when already open', async () => {
  tryDismissFaComponentDialogIfOpenMock.mockReturnValue(true)
  await handleOpenAppSettingsDialog()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
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
  expect(tryDismissFaComponentDialogIfOpenMock).toHaveBeenCalledWith('ProjectSettings')
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectSettings')
})

/**
 * handleOpenProjectSettingsDialog
 * Dismisses when already open even without an active project gate check after dismiss.
 */
test('Test that handleOpenProjectSettingsDialog dismisses when already open', async () => {
  tryDismissFaComponentDialogIfOpenMock.mockReturnValue(true)
  mockActiveProjectGate.hasActiveProject = false
  await handleOpenProjectSettingsDialog()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
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

/**
 * handleOpenActionMonitorDialog
 * Opens Action Monitor when it is not already open.
 */
test('Test that handleOpenActionMonitorDialog opens ActionMonitor', async () => {
  await handleOpenActionMonitorDialog()
  expect(tryDismissFaComponentDialogIfOpenMock).toHaveBeenCalledWith('ActionMonitor')
  expect(openDialogComponentMock).toHaveBeenCalledWith('ActionMonitor')
})

/**
 * handleOpenActionMonitorDialog
 * Skips open when tryDismiss reports the dialog already open.
 */
test('Test that handleOpenActionMonitorDialog dismisses when already open', async () => {
  tryDismissFaComponentDialogIfOpenMock.mockReturnValue(true)
  await handleOpenActionMonitorDialog()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

/**
 * handleOpenAdvancedSearchGuideDialog
 * Opens the advanced search guide markdown document when closed.
 */
test('Test that handleOpenAdvancedSearchGuideDialog opens advancedSearchGuide', async () => {
  await handleOpenAdvancedSearchGuideDialog()
  expect(tryDismissFaMarkdownDocumentIfOpenMock).toHaveBeenCalledWith('advancedSearchGuide')
  expect(openDialogMarkdownDocumentMock).toHaveBeenCalledWith('advancedSearchGuide')
})

/**
 * handleOpenAdvancedSearchGuideDialog
 * Skips open when tryDismiss reports the markdown document already open.
 */
test('Test that handleOpenAdvancedSearchGuideDialog dismisses when already open', async () => {
  tryDismissFaMarkdownDocumentIfOpenMock.mockReturnValue(true)
  await handleOpenAdvancedSearchGuideDialog()
  expect(openDialogMarkdownDocumentMock).not.toHaveBeenCalled()
})
