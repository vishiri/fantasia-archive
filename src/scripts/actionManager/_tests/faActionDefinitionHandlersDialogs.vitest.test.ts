/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

const openDialogComponentMock = vi.fn()
const openDialogMarkdownDocumentMock = vi.fn()

vi.mock('app/src/scripts/appGlobalManagementUI/dialogManagement', () => {
  return {
    openDialogComponent: openDialogComponentMock,
    openDialogMarkdownDocument: openDialogMarkdownDocumentMock
  }
})

beforeEach(() => {
  openDialogComponentMock.mockReset()
  openDialogMarkdownDocumentMock.mockReset()
})

test('handleOpenKeybindSettingsDialog opens KeybindSettings', async () => {
  const { handleOpenKeybindSettingsDialog } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlersDialogs'
  )
  await handleOpenKeybindSettingsDialog()
  expect(openDialogComponentMock).toHaveBeenCalledWith('KeybindSettings')
})

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
