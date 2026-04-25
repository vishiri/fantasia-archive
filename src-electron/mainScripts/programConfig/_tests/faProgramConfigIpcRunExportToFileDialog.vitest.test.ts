import path from 'node:path'

import { beforeEach, expect, test, vi } from 'vitest'

import * as programConfigBundle from '../faProgramConfigBundle'
import { runExportProgramConfigToFile } from '../faProgramConfigIpcRunExportToFileDialog'

/** Caught as non-Error to cover `e instanceof Error` false in the export catch. */
class SyntheticZipMockFailure {}

const {
  appGetPathMock,
  dialogShowSaveDialogMock,
  getFaKeybindsMock,
  getFaProgramStylingMock,
  getFaUserSettingsMock,
  windowFromIpcEventMock,
  writeFileMock
} = vi.hoisted(() => ({
  appGetPathMock: vi.fn((name: string) => (name === 'downloads' ? 'C:\\TestDownloads' : 'C:\\x')),
  dialogShowSaveDialogMock: vi.fn(),
  getFaKeybindsMock: vi.fn(),
  getFaProgramStylingMock: vi.fn(),
  getFaUserSettingsMock: vi.fn(),
  windowFromIpcEventMock: vi.fn(),
  writeFileMock: vi.fn()
}))

vi.mock('electron', () => ({
  app: { getPath: appGetPathMock },
  dialog: { showSaveDialog: dialogShowSaveDialogMock }
}))

vi.mock('node:fs/promises', () => ({
  writeFile: writeFileMock
}))

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc', () => ({
  windowFromIpcEvent: windowFromIpcEventMock
}))

vi.mock('app/src-electron/mainScripts/userSettings/userSettingsStore', () => ({
  getFaUserSettings: getFaUserSettingsMock
}))

vi.mock('app/src-electron/mainScripts/keybinds/faKeybindsStore', () => ({
  getFaKeybinds: getFaKeybindsMock
}))

vi.mock('app/src-electron/mainScripts/programStyling/faProgramStylingStore', () => ({
  getFaProgramStyling: getFaProgramStylingMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => ({
  appWindow: undefined
}))

beforeEach(() => {
  dialogShowSaveDialogMock.mockReset()
  getFaKeybindsMock.mockReset()
  getFaProgramStylingMock.mockReset()
  getFaUserSettingsMock.mockReset()
  windowFromIpcEventMock.mockReset()
  writeFileMock.mockReset()
  getFaUserSettingsMock.mockReturnValue({ store: { languageCode: 'en-US' } })
  getFaKeybindsMock.mockReturnValue({
    store: {
      overrides: {},
      schemaVersion: 1
    }
  })
  getFaProgramStylingMock.mockReturnValue({
    store: {
      css: '',
      schemaVersion: 1
    }
  })
})

const fakeEvent = {} as import('electron').IpcMainInvokeEvent

test('Test runExportProgramConfigToFile returns error for non-object options', async () => {
  const r = await runExportProgramConfigToFile(fakeEvent, null as never)
  expect(r.outcome).toBe('error')
})

test('Test runExportProgramConfigToFile returns error when include flags are not booleans', async () => {
  const r = await runExportProgramConfigToFile(
    fakeEvent,
    {
      includeKeybinds: true,
      includeProgramSettings: 1,
      includeProgramStyling: true
    } as never
  )
  expect(r.outcome).toBe('error')
  expect((r as { errorMessage?: string }).errorMessage).toMatch(/boolean/i)
})

test('Test runExportProgramConfigToFile returns error when zipping throws a non-Error value', async () => {
  const zipSpy = vi
    .spyOn(programConfigBundle, 'zipProgramConfigBundle')
    .mockImplementation((): never => {
      throw new SyntheticZipMockFailure()
    })
  const r = await runExportProgramConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeProgramSettings: false,
    includeProgramStyling: false
  })
  expect(r.outcome).toBe('error')
  expect((r as { errorName?: string }).errorName).toBe('Error')
  zipSpy.mockRestore()
})

test('Test runExportProgramConfigToFile returns error when zipping throws an Error instance', async () => {
  const zipSpy = vi
    .spyOn(programConfigBundle, 'zipProgramConfigBundle')
    .mockImplementation(() => { throw new Error('zip boom') })
  const r = await runExportProgramConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeProgramSettings: false,
    includeProgramStyling: false
  })
  expect(r.outcome).toBe('error')
  expect((r as { errorName?: string }).errorName).toBe('Error')
  zipSpy.mockRestore()
})

test('Test runExportProgramConfigToFile returns error when no part selected', async () => {
  const r = await runExportProgramConfigToFile(fakeEvent, {
    includeKeybinds: false,
    includeProgramSettings: false,
    includeProgramStyling: false
  })
  expect(r.outcome).toBe('error')
})

test('Test runExportProgramConfigToFile returns canceled when save dialog is canceled', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePath: undefined
  })
  const r = await runExportProgramConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeProgramSettings: true,
    includeProgramStyling: true
  })
  expect(r.outcome).toBe('canceled')
})

test('Test runExportProgramConfigToFile returns saved on successful write', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: 'C:\\o.faconfig'
  })
  writeFileMock.mockResolvedValueOnce(undefined)
  const r = await runExportProgramConfigToFile(fakeEvent, {
    includeKeybinds: false,
    includeProgramSettings: true,
    includeProgramStyling: false
  })
  expect(r.outcome).toBe('saved')
  expect(writeFileMock).toHaveBeenCalled()
})

test('Test runExportProgramConfigToFile uses showSaveDialog with window when one is available', async () => {
  const win = { id: 42 } as import('electron').BrowserWindow
  windowFromIpcEventMock.mockReturnValueOnce(win)
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePath: undefined
  })
  const r = await runExportProgramConfigToFile({} as import('electron').IpcMainInvokeEvent, {
    includeKeybinds: false,
    includeProgramSettings: true,
    includeProgramStyling: false
  })
  expect(r.outcome).toBe('canceled')
  expect(dialogShowSaveDialogMock).toHaveBeenCalledWith(
    win,
    expect.objectContaining({
      defaultPath: path.join('C:\\TestDownloads', 'faConfigExport.faconfig')
    })
  )
})

test('Test runExportProgramConfigToFile returns error when writeFile fails', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: 'C:\\o.faconfig'
  })
  writeFileMock.mockRejectedValueOnce(new Error('disk full'))
  const r = await runExportProgramConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeProgramSettings: false,
    includeProgramStyling: false
  })
  expect(r.outcome).toBe('error')
})

test('Test runExportProgramConfigToFile returns error when writeFile rejects a non-Error', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: 'C:\\o.faconfig'
  })
  writeFileMock.mockRejectedValueOnce(404)
  const r = await runExportProgramConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeProgramSettings: false,
    includeProgramStyling: false
  })
  expect(r.outcome).toBe('error')
  if (r.outcome === 'error') {
    expect(r.errorName).toBe('Error')
  }
})
