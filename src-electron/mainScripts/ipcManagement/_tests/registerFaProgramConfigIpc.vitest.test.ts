import { beforeEach, expect, test, vi } from 'vitest'

import { FA_PROGRAM_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'

const {
  dialogShowOpenDialogMock,
  ipcMainHandleMock,
  runApplyMock,
  runExportMock,
  runPrepareFromPathMock,
  windowFromIpcEventMock
} = vi.hoisted(() => ({
  dialogShowOpenDialogMock: vi.fn(),
  ipcMainHandleMock: vi.fn(),
  runApplyMock: vi.fn(),
  runExportMock: vi.fn(),
  runPrepareFromPathMock: vi.fn(),
  windowFromIpcEventMock: vi.fn()
}))

vi.mock('electron', () => ({
  dialog: { showOpenDialog: dialogShowOpenDialogMock },
  ipcMain: { handle: ipcMainHandleMock }
}))

vi.mock('app/src-electron/mainScripts/ipcManagement/registerFaWindowControlIpc', () => ({
  windowFromIpcEvent: windowFromIpcEventMock
}))

vi.mock('app/src-electron/mainScripts/windowManagement/mainWindowCreation', () => ({
  appWindow: undefined
}))

vi.mock('app/src-electron/mainScripts/programConfig/faProgramConfigIpcRunExportToFileDialog', () => ({
  runExportProgramConfigToFile: runExportMock
}))

vi.mock('app/src-electron/mainScripts/programConfig/faProgramConfigIpcRunPrepareImportFromFile', () => ({
  runPrepareImportFromFaconfigFilePath: runPrepareFromPathMock
}))

vi.mock('app/src-electron/mainScripts/programConfig/faProgramConfigIpcRunApplyStagedImport', () => ({
  runApplyStagedProgramConfigImport: runApplyMock
}))

beforeEach(() => {
  vi.resetModules()
  ipcMainHandleMock.mockReset()
  runExportMock.mockReset()
  runPrepareFromPathMock.mockReset()
  runApplyMock.mockReset()
  dialogShowOpenDialogMock.mockReset()
  windowFromIpcEventMock.mockReturnValue(undefined)
  runExportMock.mockResolvedValue({ outcome: 'canceled' })
  runPrepareFromPathMock.mockResolvedValue({ outcome: 'canceled' })
  runApplyMock.mockReturnValue({ appliedParts: ['programSettings'] })
})

function handlerFor (channel: string): (...args: unknown[]) => unknown {
  const call = ipcMainHandleMock.mock.calls.find((c) => c[0] === channel)
  expect(call).toBeDefined()
  return call![1] as (...args: unknown[]) => unknown
}

test('Test that registerFaProgramConfigIpc registers all four program config channels', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const channels = ipcMainHandleMock.mock.calls.map((c) => c[0])
  expect(channels).toContain(FA_PROGRAM_CONFIG_IPC.exportToFileAsync)
  expect(channels).toContain(FA_PROGRAM_CONFIG_IPC.prepareImportAsync)
  expect(channels).toContain(FA_PROGRAM_CONFIG_IPC.applyImportAsync)
  expect(channels).toContain(FA_PROGRAM_CONFIG_IPC.disposeImportSessionAsync)
})

test('Test that export handler delegates to runExportProgramConfigToFile', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.exportToFileAsync)
  const opts = {
    includeKeybinds: true,
    includeProgramSettings: true,
    includeProgramStyling: true
  }
  await h({}, opts)
  expect(runExportMock).toHaveBeenCalled()
})

test('Test that prepareImport handler returns early when the open dialog is canceled', async () => {
  dialogShowOpenDialogMock.mockResolvedValueOnce({
    canceled: true,
    filePaths: []
  })
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.prepareImportAsync)
  const r = (await h({})) as { outcome: string }
  expect(r.outcome).toBe('canceled')
  expect(runPrepareFromPathMock).not.toHaveBeenCalled()
})

test('Test that prepareImport handler rejects non-faconfig paths', async () => {
  dialogShowOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: ['c:\\a.json']
  })
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.prepareImportAsync)
  const r = (await h({})) as { outcome: string }
  expect(r.outcome).toBe('error')
  expect(runPrepareFromPathMock).not.toHaveBeenCalled()
})

test('Test that prepareImport handler delegates to runPrepareImportFromFaconfigFilePath', async () => {
  dialogShowOpenDialogMock.mockResolvedValueOnce({
    canceled: false,
    filePaths: ['c:\\a.faconfig']
  })
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.prepareImportAsync)
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
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.prepareImportAsync)
  const r = (await h({})) as { outcome: string }
  expect(r.outcome).toBe('canceled')
  expect(dialogShowOpenDialogMock).toHaveBeenCalledWith(
    win,
    expect.objectContaining({ title: 'Import program configuration' })
  )
})

test('Test that applyImportAsync handler delegates to runApplyStagedProgramConfigImport', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.applyImportAsync)
  const p = {
    applyKeybinds: false,
    applyProgramSettings: true,
    applyProgramStyling: false,
    sessionId: 'sid'
  }
  h({}, p)
  expect(runApplyMock).toHaveBeenCalledWith(p)
})

test('Test that applyImportAsync handler throws for invalid input', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.applyImportAsync)
  expect(() => h({}, null)).toThrow(TypeError)
})

test('Test that applyImportAsync handler throws when sessionId is not a string', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.applyImportAsync)
  expect(() =>
    h(
      {},
      {
        applyKeybinds: true,
        applyProgramSettings: true,
        applyProgramStyling: true,
        sessionId: 1
      } as never
    )
  ).toThrow('sessionId')
})

test('Test that applyImportAsync handler throws when apply flags are not booleans', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.applyImportAsync)
  expect(() =>
    h(
      {},
      {
        applyKeybinds: 'yes',
        applyProgramSettings: true,
        applyProgramStyling: true,
        sessionId: 's'
      } as never
    )
  ).toThrow('boolean')
})

test('Test that disposeImportSessionAsync handler deletes the session when id is a non-empty string', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  const { faProgramConfigImportStagedSessions } = await import(
    'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
  )
  registerFaProgramConfigIpc()
  faProgramConfigImportStagedSessions.set('z', {
    data: {},
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.disposeImportSessionAsync)
  await h({}, 'z')
  expect(faProgramConfigImportStagedSessions.has('z')).toBe(false)
})

test('Test that disposeImportSessionAsync is a no-op for empty and non-string session ids', async () => {
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  const { faProgramConfigImportStagedSessions } = await import(
    'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
  )
  registerFaProgramConfigIpc()
  faProgramConfigImportStagedSessions.set('keep', {
    data: {},
    expiresAt: Date.now() + 60_000,
    parts: {
      keybinds: 'absent',
      programSettings: 'absent',
      programStyling: 'absent'
    }
  })
  const h = handlerFor(FA_PROGRAM_CONFIG_IPC.disposeImportSessionAsync)
  await h({}, '')
  await h({}, 1 as never)
  expect(faProgramConfigImportStagedSessions.has('keep')).toBe(true)
})

test('Test that registerFaProgramConfigIpc is idempotent on second call', async () => {
  ipcMainHandleMock.mockClear()
  const { registerFaProgramConfigIpc } = await import('../registerFaProgramConfigIpc')
  registerFaProgramConfigIpc()
  registerFaProgramConfigIpc()
  expect(
    ipcMainHandleMock.mock.calls.filter((c) => c[0] === FA_PROGRAM_CONFIG_IPC.exportToFileAsync).length
  ).toBe(1)
})
