/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'

const canOpenAppNoteboardFloatingWindowMock = vi.fn((): boolean => true)

vi.mock('app/src/scripts/appNoteboard/faAppNoteboardCanOpen', () => {
  return {
    canOpenAppNoteboardFloatingWindow: canOpenAppNoteboardFloatingWindowMock
  }
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetModules()
  canOpenAppNoteboardFloatingWindowMock.mockReset()
  canOpenAppNoteboardFloatingWindowMock.mockReturnValue(true)
})

test('handleReportAppNoteboardSaveFailure throws the payload message', async () => {
  const { handleReportAppNoteboardSaveFailure } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  await expect(handleReportAppNoteboardSaveFailure({ message: 'x' })).rejects.toThrow('x')
})

test('handleToggleAppNoteboardWindow closes when the window is already open', async () => {
  const { handleToggleAppNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  const s = S_FaAppNoteboard()
  s.setWindowOpen(true)
  await handleToggleAppNoteboardWindow()
  expect(s.isWindowOpen).toBe(false)
})

test('handleToggleAppNoteboardWindow opens when allowed', async () => {
  const { handleToggleAppNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  const s = S_FaAppNoteboard()
  await handleToggleAppNoteboardWindow()
  expect(s.isWindowOpen).toBe(true)
})

test('handleToggleAppNoteboardWindow no-ops when the modal stack blocks floating windows', async () => {
  canOpenAppNoteboardFloatingWindowMock.mockReturnValue(false)
  const { handleToggleAppNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  const s = S_FaAppNoteboard()
  await handleToggleAppNoteboardWindow()
  expect(s.isWindowOpen).toBe(false)
})
