import { beforeEach, expect, test, vi } from 'vitest'

import { FA_APP_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'

const {
  appGetPathMock,
  dialogShowOpenDialogMock,
  installE2eAppConfigGlobalsMock,
  ipcMainHandleMock,
  runApplyMock,
  runExportMock,
  runPrepareFromPathMock,
  takeNextE2eAppConfigImportPathMock,
  windowFromIpcEventMock
} = vi.hoisted(() => ({
  appGetPathMock: vi.fn((name: string) => (name === 'downloads' ? 'C:\\TestDownloads' : 'C:\\x')),
  dialogShowOpenDialogMock: vi.fn(),
  installE2eAppConfigGlobalsMock: vi.fn(),
  ipcMainHandleMock: vi.fn(),
  runApplyMock: vi.fn(),
  runExportMock: vi.fn(),
  runPrepareFromPathMock: vi.fn(),
  takeNextE2eAppConfigImportPathMock: vi.fn((): string | null => null),
  windowFromIpcEventMock: vi.fn()
}))

vi.mock('electron', () => ({
  app: { getPath: appGetPathMock },
  dialog: { showOpenDialog: dialogShowOpenDialogMock },
  ipcMain: { handle: ipcMainHandleMock }
}))

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc', () => ({
  windowFromIpcEvent: windowFromIpcEventMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/windowManagement_manager', () => ({
  appWindow: undefined
}))

vi.mock('app/src-electron/mainScripts/appConfig/appConfig_manager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('app/src-electron/mainScripts/appConfig/appConfig_manager')>()

  return {
    ...actual,
    installFaAppConfigE2ePathOverrideGlobals: installE2eAppConfigGlobalsMock,
    runApplyStagedAppConfigImport: runApplyMock,
    runExportAppConfigToFile: runExportMock,
    runPrepareImportFromFaconfigFilePath: runPrepareFromPathMock,
    takeNextE2eAppConfigImportPath: takeNextE2eAppConfigImportPathMock
  }
})

beforeEach(() => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  runExportMock.mockReset()
  runPrepareFromPathMock.mockReset()
  runApplyMock.mockReset()
  dialogShowOpenDialogMock.mockReset()
  takeNextE2eAppConfigImportPathMock.mockReset()
  takeNextE2eAppConfigImportPathMock.mockReturnValue(null)
  windowFromIpcEventMock.mockReturnValue(undefined)
  runExportMock.mockResolvedValue({ outcome: 'canceled' })
  runPrepareFromPathMock.mockResolvedValue({ outcome: 'canceled' })
  runApplyMock.mockReturnValue({ appliedParts: ['appSettings'] })
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call![1] as (...args: unknown[]) => unknown
}

test('Test that registerFaAppConfigIpc registers all four app config channels', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const channels = ipcMainHandleMock.mock.calls.map((c) => c[0])
  expect(channels).toContain(FA_APP_CONFIG_IPC.exportToFileAsync)
  expect(channels).toContain(FA_APP_CONFIG_IPC.prepareImportAsync)
  expect(channels).toContain(FA_APP_CONFIG_IPC.applyImportAsync)
  expect(channels).toContain(FA_APP_CONFIG_IPC.disposeImportSessionAsync)
})

test('Test that export handler delegates to runExportAppConfigToFile', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.exportToFileAsync)
  const opts = {
    includeKeybinds: true,
    includeAppNoteboard: true,
    includeAppSettings: true,
    includeAppStyling: true
  }
  await h({}, opts)
  expect(runExportMock).toHaveBeenCalled()
})

test('Test that export handler returns error outcome for invalid export options', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.exportToFileAsync)
  const r = (await h({}, null)) as { outcome: string, errorMessage?: string }
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toContain('export options must be an object')
  expect(runExportMock).not.toHaveBeenCalled()
})

test('Test that export handler stringifies non-Error validation failures', async () => {
  const schemas = await import('app/src-electron/shared/faAppConfigIpcPayloadSchemas')
  const parseSpy = vi.spyOn(schemas, 'parseFaAppConfigExportOptions').mockImplementation(() => {
    // eslint-disable-next-line no-throw-literal -- exercises non-Error catch branch
    throw 'raw failure'
  })
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.exportToFileAsync)
  const r = (await h({}, {})) as { outcome: string, errorMessage?: string }
  expect(r.outcome).toBe('error')
  expect(r.errorMessage).toBe('raw failure')
  parseSpy.mockRestore()
})

test('Test that prepareImport handler returns early when the open dialog is canceled', async () => {
  dialogShowOpenDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePaths: []
  })
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.prepareImportAsync)
  const r = (await h({})) as { outcome: string }
  expect(r.outcome).toBe('canceled')
  expect(runPrepareFromPathMock).not.toHaveBeenCalled()
})

test('Test that prepareImport handler rejects non-faconfig paths', async () => {
  dialogShowOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: ['c:\\a.json']
  })
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.prepareImportAsync)
  const r = (await h({})) as { outcome: string }
  expect(r.outcome).toBe('error')
  expect(runPrepareFromPathMock).not.toHaveBeenCalled()
})

test('Test that prepareImport handler delegates to runPrepareImportFromFaconfigFilePath', async () => {
  dialogShowOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: ['c:\\a.faconfig']
  })
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.prepareImportAsync)
  await h({})
  expect(runPrepareFromPathMock).toHaveBeenCalledWith('c:\\a.faconfig')
})

test('Test that prepareImport uses showOpenDialog with window when the IPC sender is attached to a window', async () => {
  const win = { id: 7 } as import('electron').BrowserWindow
  windowFromIpcEventMock.mockReturnValueOnce(win)
  dialogShowOpenDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePaths: []
  })
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.prepareImportAsync)
  const r = (await h({})) as { outcome: string }
  expect(r.outcome).toBe('canceled')
  expect(dialogShowOpenDialogMock).toHaveBeenCalledWith(
    win,
    expect.objectContaining({
      defaultPath: 'C:\\TestDownloads',
      title: 'Import app configuration'
    })
  )
})

test('Test that applyImportAsync handler delegates to runApplyStagedAppConfigImport', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.applyImportAsync)
  const p = {
    applyKeybinds: false,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: 'sid'
  }
  h({}, p)
  expect(runApplyMock).toHaveBeenCalledWith(p)
})

test('Test that applyImportAsync handler throws for invalid input', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.applyImportAsync)
  expect(() => h({}, null)).toThrow(TypeError)
})

test('Test that applyImportAsync handler throws when sessionId is not a string', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.applyImportAsync)
  expect(() =>
    h(
      {},
      {
        applyKeybinds: true,
        applyAppNoteboard: true,
        applyAppSettings: true,
        applyAppStyling: true,
        sessionId: 1
      } as never
    )
  ).toThrow('sessionId')
})

test('Test that applyImportAsync handler throws when apply flags are not booleans', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.applyImportAsync)
  expect(() =>
    h(
      {},
      {
        applyKeybinds: 'yes',
        applyAppNoteboard: true,
        applyAppSettings: true,
        applyAppStyling: true,
        sessionId: 's'
      } as never
    )
  ).toThrow('boolean')
})

test('Test that disposeImportSessionAsync handler deletes the session when id is a non-empty string', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  const { faAppConfigImportStagedSessions } = await import(
    'app/src-electron/mainScripts/appConfig/appConfig_manager'
  )
  registerFaAppConfigIpc()
  faAppConfigImportStagedSessions.set('z', {
    data: {},
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  const h = handlerFor(FA_APP_CONFIG_IPC.disposeImportSessionAsync)
  await h({}, 'z')
  expect(faAppConfigImportStagedSessions.has('z')).toBe(false)
})

test('Test that disposeImportSessionAsync is a no-op for empty and non-string session ids', async () => {
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  const { faAppConfigImportStagedSessions } = await import(
    'app/src-electron/mainScripts/appConfig/appConfig_manager'
  )
  registerFaAppConfigIpc()
  faAppConfigImportStagedSessions.set('keep', {
    data: {},
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      appNoteboard: 'absent',
      appSettings: 'absent',
      appStyling: 'absent'
    }
  })
  const h = handlerFor(FA_APP_CONFIG_IPC.disposeImportSessionAsync)
  await h({}, '')
  await h({}, 1 as never)
  expect(faAppConfigImportStagedSessions.has('keep')).toBe(true)
})

test('Test that prepareImport uses E2E import path and skips the open dialog', async () => {
  takeNextE2eAppConfigImportPathMock.mockReturnValueOnce('c:\\e2e\\only.faconfig')
  runPrepareFromPathMock.mockResolvedValueOnce({ outcome: 'ready' })
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.prepareImportAsync)
  await h({})
  expect(runPrepareFromPathMock).toHaveBeenCalledWith('c:\\e2e\\only.faconfig')
  expect(dialogShowOpenDialogMock).not.toHaveBeenCalled()
})

test('Test that prepareImport E2E path branch errors when the path is not a .faconfig file', async () => {
  takeNextE2eAppConfigImportPathMock.mockReturnValueOnce('c:\\e2e\\bad.txt')
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  const h = handlerFor(FA_APP_CONFIG_IPC.prepareImportAsync)
  const r = (await h({})) as { errorName?: string, outcome: string }
  expect(r.outcome).toBe('error')
  expect(r.errorName).toBe('FileError')
  expect(runPrepareFromPathMock).not.toHaveBeenCalled()
  expect(dialogShowOpenDialogMock).not.toHaveBeenCalled()
})

test('Test that registerFaAppConfigIpc is idempotent on second call', async () => {
  ipcMainHandleMock.mockClear()
  const { registerFaAppConfigIpc } = await import('../registerFaAppConfigIpc')
  registerFaAppConfigIpc()
  registerFaAppConfigIpc()
  expect(
    ipcMainHandleMock.mock.calls.filter((c) => c[0] === FA_APP_CONFIG_IPC.exportToFileAsync).length
  ).toBe(1)
})
