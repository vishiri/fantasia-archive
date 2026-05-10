import path from 'node:path'

import { beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/faAppNoteboardStoreDefaults'
import * as appConfigBundle from '../faAppConfigBundle'
import { runExportAppConfigToFile } from '../faAppConfigIpcRunExportToFileDialog'

/** Caught as non-Error to cover `e instanceof Error` false in the export catch. */
class SyntheticZipMockFailure {}

const {
  appGetPathMock,
  dialogShowSaveDialogMock,
  getFaKeybindsMock,
  getFaAppNoteboardMock,
  getFaAppStylingMock,
  getFaUserSettingsMock,
  takeNextE2eAppConfigExportPathMock,
  windowFromIpcEventMock,
  writeFileMock
} = vi.hoisted(() => ({
  appGetPathMock: vi.fn((name: string) => (name === 'downloads' ? 'C:\\TestDownloads' : 'C:\\x')),
  dialogShowSaveDialogMock: vi.fn(),
  getFaKeybindsMock: vi.fn(),
  getFaAppNoteboardMock: vi.fn(),
  getFaAppStylingMock: vi.fn(),
  getFaUserSettingsMock: vi.fn(),
  takeNextE2eAppConfigExportPathMock: vi.fn((): string | null => null),
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

vi.mock('app/src-electron/mainScripts/appNoteboard/faAppNoteboardStore', () => ({
  getFaAppNoteboard: getFaAppNoteboardMock
}))

vi.mock('app/src-electron/mainScripts/appStyling/faAppStylingStore', () => ({
  getFaAppStyling: getFaAppStylingMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => ({
  appWindow: undefined
}))

vi.mock('app/src-electron/mainScripts/appConfig/faAppConfigE2ePathOverride', () => ({
  takeNextE2eAppConfigExportPath: () => takeNextE2eAppConfigExportPathMock()
}))

beforeEach(() => {
  dialogShowSaveDialogMock.mockReset()
  getFaKeybindsMock.mockReset()
  getFaAppNoteboardMock.mockReset()
  getFaAppStylingMock.mockReset()
  getFaUserSettingsMock.mockReset()
  windowFromIpcEventMock.mockReset()
  writeFileMock.mockReset()
  takeNextE2eAppConfigExportPathMock.mockReset()
  takeNextE2eAppConfigExportPathMock.mockReturnValue(null)
  getFaUserSettingsMock.mockReturnValue({ store: { languageCode: 'en-US' } })
  getFaKeybindsMock.mockReturnValue({
    store: {
      overrides: {},
      schemaVersion: 1
    }
  })
  getFaAppStylingMock.mockReturnValue({
    store: {
      css: '',
      schemaVersion: 1
    }
  })
  getFaAppNoteboardMock.mockReturnValue({
    store: { ...FA_APP_NOTEBOARD_STORE_DEFAULTS }
  })
})

const fakeEvent = {} as import('electron').IpcMainInvokeEvent

test('Test runExportAppConfigToFile returns error for non-object options', async () => {
  const r = await runExportAppConfigToFile(fakeEvent, null as never)
  expect(r.outcome).toBe('error')
})

test('Test runExportAppConfigToFile returns error when include flags are not booleans', async () => {
  const r = await runExportAppConfigToFile(
    fakeEvent,
    {
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: 1,
      includeAppStyling: true
    } as never
  )
  expect(r.outcome).toBe('error')
  expect((r as { errorMessage?: string }).errorMessage).toMatch(/boolean/i)
})

test('Test runExportAppConfigToFile returns error when zipping throws a non-Error value', async () => {
  const zipSpy = vi
    .spyOn(appConfigBundle, 'zipAppConfigBundle')
    .mockImplementation((): never => {
      throw new SyntheticZipMockFailure()
    })
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('error')
  expect((r as { errorName?: string }).errorName).toBe('Error')
  zipSpy.mockRestore()
})

test('Test runExportAppConfigToFile returns error when zipping throws an Error instance', async () => {
  const zipSpy = vi
    .spyOn(appConfigBundle, 'zipAppConfigBundle')
    .mockImplementation(() => { throw new Error('zip boom') })
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('error')
  expect((r as { errorName?: string }).errorName).toBe('Error')
  zipSpy.mockRestore()
})

test('Test runExportAppConfigToFile returns error when no part selected', async () => {
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: false,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('error')
})

test('Test runExportAppConfigToFile returns canceled when save dialog is canceled', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePath: undefined
  })
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: true,
    includeAppSettings: true,
    includeAppStyling: true
  })
  expect(r.outcome).toBe('canceled')
})

test('Test runExportAppConfigToFile returns saved on successful write', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: 'C:\\o.faconfig'
  })
  writeFileMock.mockResolvedValueOnce(undefined)
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: false,
    includeAppNoteboard: false,
    includeAppSettings: true,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('saved')
  expect(writeFileMock).toHaveBeenCalled()
})

test('Test runExportAppConfigToFile writes to e2e path without opening the save dialog', async () => {
  takeNextE2eAppConfigExportPathMock.mockImplementationOnce(
    () => 'C:\\e2e\\out.faconfig'
  )
  writeFileMock.mockResolvedValueOnce(undefined)
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('saved')
  expect((r as { filePath?: string }).filePath).toBe('C:\\e2e\\out.faconfig')
  expect(dialogShowSaveDialogMock).not.toHaveBeenCalled()
  expect(writeFileMock).toHaveBeenCalledWith('C:\\e2e\\out.faconfig', expect.any(Uint8Array))
})

test('Test runExportAppConfigToFile returns error when e2e path write fails', async () => {
  takeNextE2eAppConfigExportPathMock.mockImplementationOnce(
    () => 'C:\\e2e\\bad.faconfig'
  )
  writeFileMock.mockRejectedValueOnce(new Error('e2e disk full'))
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('error')
  expect((r as { errorMessage?: string }).errorMessage).toBe('e2e disk full')
  expect(dialogShowSaveDialogMock).not.toHaveBeenCalled()
})

test('Test runExportAppConfigToFile treats a non-Error e2e write rejection as Error', async () => {
  takeNextE2eAppConfigExportPathMock.mockImplementationOnce(
    () => 'C:\\e2e\\bad2.faconfig'
  )
  writeFileMock.mockRejectedValueOnce(404)
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('error')
  if (r.outcome === 'error') {
    expect(r.errorName).toBe('Error')
  }
  expect(dialogShowSaveDialogMock).not.toHaveBeenCalled()
})

test('Test runExportAppConfigToFile uses showSaveDialog with window when one is available', async () => {
  const win = { id: 42 } as import('electron').BrowserWindow
  windowFromIpcEventMock.mockReturnValueOnce(win)
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePath: undefined
  })
  const r = await runExportAppConfigToFile({} as import('electron').IpcMainInvokeEvent, {
    includeKeybinds: false,
    includeAppNoteboard: false,
    includeAppSettings: true,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('canceled')
  expect(dialogShowSaveDialogMock).toHaveBeenCalledWith(
    win,
    expect.objectContaining({
      defaultPath: path.join('C:\\TestDownloads', 'faConfigExport.faconfig')
    })
  )
})

test('Test runExportAppConfigToFile returns error when writeFile fails', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: 'C:\\o.faconfig'
  })
  writeFileMock.mockRejectedValueOnce(new Error('disk full'))
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('error')
})

test('Test runExportAppConfigToFile returns error when writeFile rejects a non-Error', async () => {
  dialogShowSaveDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePath: 'C:\\o.faconfig'
  })
  writeFileMock.mockRejectedValueOnce(404)
  const r = await runExportAppConfigToFile(fakeEvent, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: false
  })
  expect(r.outcome).toBe('error')
  if (r.outcome === 'error') {
    expect(r.errorName).toBe('Error')
  }
})
