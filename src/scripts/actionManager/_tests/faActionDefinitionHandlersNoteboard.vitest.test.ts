/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'

const { canOpenFloatingWindowWhileNoModalMock } = vi.hoisted(() => {
  return {
    canOpenFloatingWindowWhileNoModalMock: vi.fn((): boolean => true)
  }
})

vi.mock('app/src/scripts/appNoteboard/faAppNoteboardCanOpen', () => {
  return {
    canOpenFloatingWindowWhileNoModal: canOpenFloatingWindowWhileNoModalMock
  }
})

beforeEach(() => {
  setActivePinia(createPinia())
  vi.resetModules()
  canOpenFloatingWindowWhileNoModalMock.mockReset()
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(true)
  const activeProject = S_FaActiveProject()
  activeProject.clearActiveProject()
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
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(false)
  const { handleToggleAppNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  const s = S_FaAppNoteboard()
  await handleToggleAppNoteboardWindow()
  expect(s.isWindowOpen).toBe(false)
})

test('handleReportProjectNoteboardSaveFailure throws the payload message', async () => {
  const { handleReportProjectNoteboardSaveFailure } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  await expect(handleReportProjectNoteboardSaveFailure({ message: 'pn' })).rejects.toThrow('pn')
})

test('handleToggleProjectNoteboardWindow closes when the window is already open', async () => {
  const { handleToggleProjectNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  const active = S_FaActiveProject()

  active.setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'id',
    name: 'N'
  })
  const s = S_FaProjectNoteboard()
  s.setWindowOpen(true)
  await handleToggleProjectNoteboardWindow()
  expect(s.isWindowOpen).toBe(false)
})

test('handleToggleProjectNoteboardWindow opens when allowed and a project is active', async () => {
  const { handleToggleProjectNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'id',
    name: 'N'
  })
  const s = S_FaProjectNoteboard()
  await handleToggleProjectNoteboardWindow()
  expect(s.isWindowOpen).toBe(true)
})

test('handleToggleProjectNoteboardWindow no-ops when no project is active', async () => {
  const { handleToggleProjectNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  const s = S_FaProjectNoteboard()
  await handleToggleProjectNoteboardWindow()
  expect(s.isWindowOpen).toBe(false)
})

test('handleToggleProjectNoteboardWindow no-ops when the modal stack blocks floating windows', async () => {
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(false)
  const { handleToggleProjectNoteboardWindow } = await import(
    'app/src/scripts/actionManager/faActionDefinitionHandlers'
  )
  S_FaActiveProject().setActiveProject({
    filePath: 'C:\\a.faproject',
    id: 'id',
    name: 'N'
  })
  const s = S_FaProjectNoteboard()
  await handleToggleProjectNoteboardWindow()
  expect(s.isWindowOpen).toBe(false)
})
