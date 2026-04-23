import { strToU8, zipSync } from 'fflate'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import { faProgramConfigImportStagedSessions } from 'app/src-electron/mainScripts/programConfig/faProgramConfigImportStagedState'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { FA_PROGRAM_CONFIG_INNER } from 'app/src-electron/shared/faProgramConfigConstants'
import * as programConfigBundle from '../faProgramConfigBundle'
import { runPrepareImportFromFaconfigFilePath } from '../faProgramConfigIpcRunPrepareImportFromFile'

/** Caught as non-Error in prepare catch for branch coverage. */
class SyntheticUnzipMockFailure {}

const { readFileMock, statMock } = vi.hoisted(() => ({
  readFileMock: vi.fn(),
  statMock: vi.fn()
}))

vi.mock('node:fs/promises', () => ({
  readFile: readFileMock,
  stat: statMock
}))

beforeEach(() => {
  faProgramConfigImportStagedSessions.clear()
  readFileMock.mockReset()
  statMock.mockReset()
  statMock.mockResolvedValue({ size: 10 })
})

afterEach(() => {
  faProgramConfigImportStagedSessions.clear()
})

test('Test runPrepareImportFromFaconfigFilePath returns error when stat throws', async () => {
  statMock.mockRejectedValueOnce(new Error('eacces'))
  const r = await runPrepareImportFromFaconfigFilePath('c:\\x.faconfig')
  expect(r.outcome).toBe('error')
})

test('Test runPrepareImportFromFaconfigFilePath returns error when stat throws a non-Error value', async () => {
  statMock.mockRejectedValueOnce('stat fail')
  const r = await runPrepareImportFromFaconfigFilePath('c:\\x.faconfig')
  expect(r.outcome).toBe('error')
  if (r.outcome === 'error') {
    expect(r.errorName).toBe('Error')
  }
})

test('Test runPrepareImportFromFaconfigFilePath returns error when file is too large by stat', async () => {
  statMock.mockResolvedValueOnce({ size: 4 * 1024 * 1024 })
  const r = await runPrepareImportFromFaconfigFilePath('c:\\x.faconfig')
  expect(r.outcome).toBe('error')
})

test('Test runPrepareImportFromFaconfigFilePath returns error on readFile failure', async () => {
  readFileMock.mockRejectedValueOnce(new Error('io'))
  const r = await runPrepareImportFromFaconfigFilePath('c:\\x.faconfig')
  expect(r.outcome).toBe('error')
})

test('Test runPrepareImportFromFaconfigFilePath returns error on readFile rejection of a non-Error', async () => {
  readFileMock.mockRejectedValueOnce(42)
  const r = await runPrepareImportFromFaconfigFilePath('c:\\x.faconfig')
  expect(r.outcome).toBe('error')
})

test('Test runPrepareImportFromFaconfigFilePath returns error when read buffer is oversized', async () => {
  const buf = Buffer.alloc(4 * 1024 * 1024, 0)
  readFileMock.mockResolvedValueOnce(buf)
  const r = await runPrepareImportFromFaconfigFilePath('c:\\x.faconfig')
  expect(r.outcome).toBe('error')
})

test('Test runPrepareImportFromFaconfigFilePath returns error on invalid zip bytes', async () => {
  readFileMock.mockResolvedValueOnce(Buffer.from([0, 1, 2, 3]))
  const r = await runPrepareImportFromFaconfigFilePath('c:\\bad.faconfig')
  expect(r.outcome).toBe('error')
})

test('Test runPrepareImportFromFaconfigFilePath returns error when unzip throws a non-Error', async () => {
  readFileMock.mockResolvedValueOnce(Buffer.from([0x50, 0x4b]))
  const u = vi
    .spyOn(programConfigBundle, 'unzipProgramConfigBundle')
    .mockImplementation((): never => {
      throw new SyntheticUnzipMockFailure()
    })
  const r = await runPrepareImportFromFaconfigFilePath('c:\\bad.faconfig')
  expect(r.outcome).toBe('error')
  u.mockRestore()
})

test('Test runPrepareImportFromFaconfigFilePath returns ready for valid small zip on disk', async () => {
  const z = zipSync({
    [FA_PROGRAM_CONFIG_INNER.userSettings]: strToU8(
      JSON.stringify(FA_USER_SETTINGS_DEFAULTS),
      false
    )
  })
  readFileMock.mockResolvedValueOnce(Buffer.from(z))
  const r = await runPrepareImportFromFaconfigFilePath('c:\\g.faconfig')
  expect(r.outcome).toBe('ready')
})
