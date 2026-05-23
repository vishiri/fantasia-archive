/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const openDialogComponentMock = vi.fn()
const openDialogMarkdownDocumentMock = vi.fn()

const mockActiveProjectGate = vi.hoisted(() => ({
  hasActiveProject: true
}))

const canOpenAppNoteboardFloatingWindowMock = vi.hoisted(() => vi.fn((): boolean => true))

vi.mock('app/src/stores/S_FaActiveProject', () => ({
  S_FaActiveProject: () => ({
    get hasActiveProject () {
      return mockActiveProjectGate.hasActiveProject
    }
  })
}))

vi.mock('app/src/scripts/appNoteboard/faAppNoteboardCanOpen', () => ({
  canOpenAppNoteboardFloatingWindow: (): boolean => canOpenAppNoteboardFloatingWindowMock()
}))

vi.mock('app/src/scripts/appGlobalManagementUI/dialogManagement', () => {
  return {
    openDialogComponent: openDialogComponentMock,
    openDialogMarkdownDocument: openDialogMarkdownDocumentMock
  }
})

beforeEach(() => {
  openDialogComponentMock.mockReset()
  openDialogMarkdownDocumentMock.mockReset()
  mockActiveProjectGate.hasActiveProject = true
  canOpenAppNoteboardFloatingWindowMock.mockReset()
  canOpenAppNoteboardFloatingWindowMock.mockReturnValue(true)
})

test('handleOpenKeybindSettingsDialog opens KeybindSettings', async () => {
  const { handleOpenKeybindSettingsDialog } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
  )
  await handleOpenKeybindSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('KeybindSettings')
}, 15_000)

test('handleOpenAppSettingsDialog opens AppSettings', async () => {
  const { handleOpenAppSettingsDialog } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
  )
  await handleOpenAppSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('AppSettings')
})

test('handleOpenAppStylingWindow opens WindowAppStyling', async () => {
  const { handleOpenAppStylingWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
  )
  await handleOpenAppStylingWindow()
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowAppStyling')
})

test('handleOpenProjectStylingWindow opens WindowProjectStyling when allowed', async () => {
  const { handleOpenProjectStylingWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
  )
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowProjectStyling')
})

test('handleOpenProjectStylingWindow skips without an active project', async () => {
  mockActiveProjectGate.hasActiveProject = false
  const { handleOpenProjectStylingWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
  )
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

test('handleOpenProjectStylingWindow skips when floating windows cannot open', async () => {
  canOpenAppNoteboardFloatingWindowMock.mockReturnValue(false)
  const { handleOpenProjectStylingWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
  )
  await handleOpenProjectStylingWindow()
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})
