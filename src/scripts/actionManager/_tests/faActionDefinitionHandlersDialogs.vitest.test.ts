/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const openDialogComponentMock = vi.fn()
const openDialogMarkdownDocumentMock = vi.fn()

const mockActiveProjectGate = vi.hoisted(() => ({
  hasActiveProject: true
}))

const canOpenFloatingWindowWhileNoModalMock = vi.hoisted(() => vi.fn((): boolean => true))

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

beforeEach(() => {
  openDialogComponentMock.mockReset()
  openDialogMarkdownDocumentMock.mockReset()
  mockActiveProjectGate.hasActiveProject = true
  canOpenFloatingWindowWhileNoModalMock.mockReset()
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(true)
})

test('handleOpenKeybindSettingsDialog opens KeybindSettings', async () => {
  const { handleOpenKeybindSettingsDialog } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenKeybindSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('KeybindSettings')
}, 15_000)

test('handleOpenAppSettingsDialog opens AppSettings', async () => {
  const { handleOpenAppSettingsDialog } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenAppSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('AppSettings')
})

test('handleOpenAppStylingWindow opens WindowAppStyling', async () => {
  const { handleOpenAppStylingWindow } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenAppStylingWindow()
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowAppStyling')
})

test('handleOpenProjectStylingWindow opens WindowProjectStyling when allowed', async () => {
  const { handleOpenProjectStylingWindow } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowProjectStyling')
})

test('handleOpenProjectStylingWindow skips without an active project', async () => {
  mockActiveProjectGate.hasActiveProject = false
  const { handleOpenProjectStylingWindow } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

test('handleOpenProjectStylingWindow skips when floating windows cannot open', async () => {
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(false)
  const { handleOpenProjectStylingWindow } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

test('handleOpenProjectSettingsDialog opens ProjectSettings when a project is active', async () => {
  const { handleOpenProjectSettingsDialog } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenProjectSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProjectSettings')
})

test('handleOpenProjectSettingsDialog skips without an active project', async () => {
  mockActiveProjectGate.hasActiveProject = false
  const { handleOpenProjectSettingsDialog } = await import(
    'app/src/scripts/actionManager/actionManager_manager'
  )
  await handleOpenProjectSettingsDialog()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})
