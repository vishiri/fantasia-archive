import { vi, expect, test, beforeEach } from 'vitest'

const { invokeMock } = vi.hoisted(() => {
  return {
    invokeMock: vi.fn()
  }
})

vi.mock('electron', () => {
  return {
    ipcRenderer: {
      invoke: invokeMock
    }
  }
})

import { FA_PROGRAM_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'

import { faProgramConfigAPI } from '../faProgramConfigAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

/**
 * faProgramConfigAPI
 * 'exportToFile' delegates to the export IPC with options.
 */
test('Test that faProgramConfigAPI exportToFile invokes exportToFileAsync', async () => {
  const res = { outcome: 'canceled' as const }
  invokeMock.mockResolvedValueOnce(res)
  await expect(
    faProgramConfigAPI.exportToFile({
      includeKeybinds: true,
      includeProgramSettings: false,
      includeProgramStyling: true
    })
  ).resolves.toEqual(res)
  expect(invokeMock).toHaveBeenCalledWith(FA_PROGRAM_CONFIG_IPC.exportToFileAsync, {
    includeKeybinds: true,
    includeProgramSettings: false,
    includeProgramStyling: true
  })
})

/**
 * faProgramConfigAPI
 * 'prepareImport' delegates to prepare import IPC.
 */
test('Test that faProgramConfigAPI prepareImport invokes prepareImportAsync', async () => {
  const res = { outcome: 'canceled' as const }
  invokeMock.mockResolvedValueOnce(res)
  await expect(faProgramConfigAPI.prepareImport()).resolves.toEqual(res)
  expect(invokeMock).toHaveBeenCalledWith(FA_PROGRAM_CONFIG_IPC.prepareImportAsync)
})

test('Test that faProgramConfigAPI applyImport invokes applyImportAsync with payload', async () => {
  const res = { appliedParts: ['programSettings' as const] }
  invokeMock.mockResolvedValueOnce(res)
  const input = {
    applyKeybinds: false,
    applyProgramSettings: true,
    applyProgramStyling: false,
    sessionId: 's'
  }
  await expect(faProgramConfigAPI.applyImport(input)).resolves.toEqual(res)
  expect(invokeMock).toHaveBeenCalledWith(FA_PROGRAM_CONFIG_IPC.applyImportAsync, input)
})

test('Test that faProgramConfigAPI disposeImportSession invokes dispose channel', async () => {
  invokeMock.mockResolvedValueOnce(undefined)
  await faProgramConfigAPI.disposeImportSession('abc')
  expect(invokeMock).toHaveBeenCalledWith(
    FA_PROGRAM_CONFIG_IPC.disposeImportSessionAsync,
    'abc'
  )
})
