/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const {
  openDialogComponentMock,
  openDialogMarkdownDocumentMock,
  tryDismissFaComponentDialogIfOpenMock,
  tryDismissFaMarkdownDocumentIfOpenMock,
  mockActiveProjectGate,
  canOpenFloatingWindowWhileNoModalMock,
  setProjectSettingsInitialTabMock,
  setProjectMediaRequestedPanelMock,
  listMediaMock
} = vi.hoisted(() => {
  return {
    openDialogComponentMock: vi.fn(),
    openDialogMarkdownDocumentMock: vi.fn(),
    tryDismissFaComponentDialogIfOpenMock: vi.fn((): boolean => false),
    tryDismissFaMarkdownDocumentIfOpenMock: vi.fn((): boolean => false),
    mockActiveProjectGate: {
      hasActiveProject: true
    },
    canOpenFloatingWindowWhileNoModalMock: vi.fn((): boolean => true),
    setProjectSettingsInitialTabMock: vi.fn(),
    setProjectMediaRequestedPanelMock: vi.fn(),
    listMediaMock: vi.fn(async () => ({ items: [{ id: 'm1' }] }))
  }
})

vi.mock('app/src/stores/S_FaActiveProject', () => ({
  S_FaActiveProject: () => ({
    get hasActiveProject () {
      return mockActiveProjectGate.hasActiveProject
    },
    isProjectReplacementInFlight: () => false,
    readProjectContentEpoch: () => 1
  })
}))

vi.mock('app/src/stores/S_Dialog', () => {
  let projectSettingsInitialTab: string | null = null
  let projectMediaRequestedPanel = 'mediaList'
  return {
    S_DialogComponent: () => ({
      get projectSettingsInitialTab () {
        return projectSettingsInitialTab
      },
      set projectSettingsInitialTab (value: string | null) {
        projectSettingsInitialTab = value
        setProjectSettingsInitialTabMock(value)
      },
      get projectMediaRequestedPanel () {
        return projectMediaRequestedPanel
      },
      set projectMediaRequestedPanel (value: string) {
        projectMediaRequestedPanel = value
        setProjectMediaRequestedPanelMock(value)
      }
    })
  }
})

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
  handleOpenProjectMediaDialog,
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
  setProjectSettingsInitialTabMock.mockReset()
  setProjectMediaRequestedPanelMock.mockReset()
  listMediaMock.mockReset()
  listMediaMock.mockImplementation(async () => ({ items: [{ id: 'm1' }] }))
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      projectContent: {
        listMedia: listMediaMock
      }
    }
  })
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
  expect(setProjectSettingsInitialTabMock).toHaveBeenCalledWith(null)
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectSettings')
})

/**
 * handleOpenProjectSettingsDialog
 * Forwards an optional initial category tab into S_DialogComponent before open.
 */
test('Test that handleOpenProjectSettingsDialog sets initial tab when provided', async () => {
  await handleOpenProjectSettingsDialog({ initialTab: 'documentTemplatesSettings' })
  expect(setProjectSettingsInitialTabMock).toHaveBeenCalledWith('documentTemplatesSettings')
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
 * handleOpenProjectMediaDialog
 * Opens Project Media when a project is active. Does not toggle-dismiss.
 */
test('Test that handleOpenProjectMediaDialog opens ProjectMedia when a project is active', async () => {
  await handleOpenProjectMediaDialog()
  expect(tryDismissFaComponentDialogIfOpenMock).not.toHaveBeenCalled()
  expect(setProjectMediaRequestedPanelMock).toHaveBeenCalledWith('mediaList')
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectMedia')
})

/**
 * handleOpenProjectMediaDialog
 * Forwards an optional initial panel into S_DialogComponent before open.
 */
test('Test that handleOpenProjectMediaDialog sets requested panel when provided', async () => {
  await handleOpenProjectMediaDialog({ initialPanel: 'mediaAdd' })
  expect(setProjectMediaRequestedPanelMock).toHaveBeenCalledWith('mediaAdd')
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectMedia')
})

/**
 * handleOpenProjectMediaDialog
 * Invalid initialPanel values use list when the library has media.
 */
test('Test that handleOpenProjectMediaDialog maps invalid initialPanel to list when the library has media', async () => {
  await handleOpenProjectMediaDialog({ initialPanel: 'nope' as never })
  expect(setProjectMediaRequestedPanelMock).toHaveBeenCalledWith('mediaList')
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectMedia')
})

/**
 * handleOpenProjectMediaDialog
 * Empty library defaults to add when no known initialPanel is given.
 */
test('Test that handleOpenProjectMediaDialog defaults to add when the library is empty', async () => {
  listMediaMock.mockImplementation(async () => ({ items: [] }))
  await handleOpenProjectMediaDialog()
  expect(setProjectMediaRequestedPanelMock).toHaveBeenCalledWith('mediaAdd')
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectMedia')
})

/**
 * handleOpenProjectMediaDialog
 * Explicit list panel stays list even when the library is empty.
 */
test('Test that handleOpenProjectMediaDialog keeps explicit list when the library is empty', async () => {
  listMediaMock.mockImplementation(async () => ({ items: [] }))
  await handleOpenProjectMediaDialog({ initialPanel: 'mediaList' })
  expect(setProjectMediaRequestedPanelMock).toHaveBeenCalledWith('mediaList')
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectMedia')
})

/**
 * handleOpenProjectMediaDialog
 * Already-open dialogs still receive a panel update and open call (open is a no-op).
 */
test('Test that handleOpenProjectMediaDialog still opens when tryDismiss would dismiss', async () => {
  tryDismissFaComponentDialogIfOpenMock.mockReturnValue(true)
  await handleOpenProjectMediaDialog()
  expect(tryDismissFaComponentDialogIfOpenMock).not.toHaveBeenCalled()
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectMedia')
})

/**
 * handleOpenProjectMediaDialog
 * Skips opening when no active project is loaded.
 */
test('Test that handleOpenProjectMediaDialog skips without an active project', async () => {
  mockActiveProjectGate.hasActiveProject = false
  await handleOpenProjectMediaDialog()
  expect(setProjectMediaRequestedPanelMock).not.toHaveBeenCalled()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
  expect(listMediaMock).not.toHaveBeenCalled()
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
