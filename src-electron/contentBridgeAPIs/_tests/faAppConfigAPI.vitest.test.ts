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

import { FA_APP_CONFIG_IPC } from 'app/src-electron/electron-ipc-bridge'

import { faAppConfigAPI } from '../faAppConfigAPI'

beforeEach(() => {
  invokeMock.mockReset()
})

/**
 * faAppConfigAPI
 * 'exportToFile' delegates to the export IPC with options.
 */
test('Test that faAppConfigAPI exportToFile invokes exportToFileAsync', async () => {
  const res = { outcome: 'canceled' as const }
  invokeMock.mockResolvedValueOnce(res)
  await expect(
    faAppConfigAPI.exportToFile({
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: false,
      includeAppStyling: true
    })
  ).resolves.toEqual(res)
  expect(invokeMock).toHaveBeenCalledWith(FA_APP_CONFIG_IPC.exportToFileAsync, {
    includeKeybinds: true,
    includeAppNoteboard: false,
    includeAppSettings: false,
    includeAppStyling: true
  })
})

/**
 * faAppConfigAPI
 * 'prepareImport' delegates to prepare import IPC.
 */
test('Test that faAppConfigAPI prepareImport invokes prepareImportAsync', async () => {
  const res = { outcome: 'canceled' as const }
  invokeMock.mockResolvedValueOnce(res)
  await expect(faAppConfigAPI.prepareImport()).resolves.toEqual(res)
  expect(invokeMock).toHaveBeenCalledWith(FA_APP_CONFIG_IPC.prepareImportAsync)
})

test('Test that faAppConfigAPI applyImport invokes applyImportAsync with payload', async () => {
  const res = { appliedParts: ['appSettings' as const] }
  invokeMock.mockResolvedValueOnce(res)
  const input = {
    applyKeybinds: false,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: 's'
  }
  await expect(faAppConfigAPI.applyImport(input)).resolves.toEqual(res)
  expect(invokeMock).toHaveBeenCalledWith(FA_APP_CONFIG_IPC.applyImportAsync, input)
})

test('Test that faAppConfigAPI disposeImportSession invokes dispose channel', async () => {
  invokeMock.mockResolvedValueOnce(undefined)
  await faAppConfigAPI.disposeImportSession('abc')
  expect(invokeMock).toHaveBeenCalledWith(
    FA_APP_CONFIG_IPC.disposeImportSessionAsync,
    'abc'
  )
})

/**
 * faAppConfigAPI
 * 'stageE2eNextExportPath' delegates to the E2E staging IPC.
 */
test('Test that faAppConfigAPI stageE2eNextExportPath invokes stageE2eNextExportPathAsync', async () => {
  invokeMock.mockResolvedValueOnce(true)
  await expect(faAppConfigAPI.stageE2eNextExportPath('C:\\export.faconfig')).resolves.toBe(true)
  expect(invokeMock).toHaveBeenCalledWith(
    FA_APP_CONFIG_IPC.stageE2eNextExportPathAsync,
    'C:\\export.faconfig'
  )
})

/**
 * faAppConfigAPI
 * 'stageE2eNextImportPath' delegates to the E2E staging IPC.
 */
test('Test that faAppConfigAPI stageE2eNextImportPath invokes stageE2eNextImportPathAsync', async () => {
  invokeMock.mockResolvedValueOnce(false)
  await expect(faAppConfigAPI.stageE2eNextImportPath('C:\\import.faconfig')).resolves.toBe(false)
  expect(invokeMock).toHaveBeenCalledWith(
    FA_APP_CONFIG_IPC.stageE2eNextImportPathAsync,
    'C:\\import.faconfig'
  )
})
