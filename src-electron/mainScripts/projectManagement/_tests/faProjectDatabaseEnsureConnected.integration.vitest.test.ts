import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import {
  closeFaProjectActiveDatabase,
  closeFaProjectActiveDatabaseHandleOnly,
  getFaProjectActiveDatabase,
  getFaProjectLastKnownActiveProjectFilePath
} from '../faProjectActiveDatabase'
import { runWithFaProjectDatabaseForIpcAsync, runWithFaProjectDatabaseSync } from '../faProjectDatabaseEnsureConnected'
import { reconnectFaProjectDatabaseAtKnownPathSync } from '../faProjectReconnectAtKnownPath'

const requestPathMock = vi.hoisted(() => vi.fn(async (): Promise<string | null> => null))
const applyMigrationsMock = vi.hoisted(() => vi.fn())
const quickCheckMock = vi.hoisted(() => vi.fn())
const BetterSqlite3Mock = vi.hoisted(() => vi.fn())

vi.mock('app/src-electron/mainScripts/ipcManagement/faProjectFailsafePathFromRenderer', () => {
  return {
    requestRendererActiveProjectPathForFailsafe: requestPathMock
  }
})

vi.mock('better-sqlite3', () => {
  return {
    default: BetterSqlite3Mock
  }
})

vi.mock('../faProjectDbMigrate', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../faProjectDbMigrate')>()
  return {
    ...mod,
    applyFaProjectMigrations: applyMigrationsMock,
    assertFaProjectDatabaseQuickCheck: quickCheckMock
  }
})

let testPath = ''

afterEach(() => {
  closeFaProjectActiveDatabase()
  requestPathMock.mockReset()
  requestPathMock.mockResolvedValue(null)
  BetterSqlite3Mock.mockReset()
  applyMigrationsMock.mockReset()
  quickCheckMock.mockReset()
  if (testPath.length > 0 && fs.existsSync(testPath)) {
    fs.unlinkSync(testPath)
  }
  testPath = ''
})

beforeEach(() => {
  BetterSqlite3Mock.mockImplementation(function () {
    return {
      close: vi.fn(),
      pragma: vi.fn()
    }
  })
  applyMigrationsMock.mockImplementation(() => {})
  quickCheckMock.mockImplementation(() => {})
})

test('recoverable sqlite error closes handle only, reconnects, then work succeeds', () => {
  testPath = path.join(os.tmpdir(), `fa-ensure-sqlite-retry-${Date.now()}.faproject`)
  expect(reconnectFaProjectDatabaseAtKnownPathSync(testPath)).toBe(true)
  let calls = 0
  const out = runWithFaProjectDatabaseSync(() => {
    calls += 1
    if (calls === 1) {
      const err = new Error('busy')
      ;(err as Error & { code?: string }).code = 'SQLITE_BUSY'
      throw err
    }
    return 42
  })
  expect(calls).toBe(2)
  expect(out).toEqual({
    ok: true,
    value: 42
  })
})

test('SQLITE_CORRUPT errors are not retried', () => {
  testPath = path.join(os.tmpdir(), `fa-ensure-corrupt-${Date.now()}.faproject`)
  expect(reconnectFaProjectDatabaseAtKnownPathSync(testPath)).toBe(true)
  expect(() => {
    runWithFaProjectDatabaseSync(() => {
      const err = new Error('corrupt')
      ;(err as Error & { code?: string }).code = 'SQLITE_CORRUPT'
      throw err
    })
  }).toThrow('corrupt')
})

test('malformed disk image message is not retried', () => {
  testPath = path.join(os.tmpdir(), `fa-ensure-malformed-${Date.now()}.faproject`)
  expect(reconnectFaProjectDatabaseAtKnownPathSync(testPath)).toBe(true)
  expect(() => {
    runWithFaProjectDatabaseSync(() => {
      throw new Error('database disk image is malformed')
    })
  }).toThrow('database disk image is malformed')
})

test('no database when last-known file is missing returns ok false', () => {
  testPath = path.join(os.tmpdir(), `fa-ensure-missing-${Date.now()}.faproject`)
  fs.writeFileSync(testPath, '')
  expect(reconnectFaProjectDatabaseAtKnownPathSync(testPath)).toBe(true)
  closeFaProjectActiveDatabaseHandleOnly()
  fs.unlinkSync(testPath)
  BetterSqlite3Mock.mockImplementation(function (filePath: string) {
    if (!fs.existsSync(filePath)) {
      throw new Error('unable to open database file')
    }
    return {
      close: vi.fn(),
      pragma: vi.fn()
    }
  })
  const missingPath = getFaProjectLastKnownActiveProjectFilePath()
  expect(missingPath).not.toBeNull()
  expect(runWithFaProjectDatabaseSync(() => {
    return 1
  })).toEqual({ ok: false })
  testPath = missingPath ?? ''
})

test('getFaProjectLastKnownActiveProjectFilePath survives handle-only close for reconnect', () => {
  testPath = path.join(os.tmpdir(), `fa-ensure-path-${Date.now()}.faproject`)
  expect(reconnectFaProjectDatabaseAtKnownPathSync(testPath)).toBe(true)
  const stored = getFaProjectLastKnownActiveProjectFilePath()
  expect(stored).toBe(testPath)
  closeFaProjectActiveDatabaseHandleOnly()
  expect(getFaProjectActiveDatabase()).toBeNull()
  expect(getFaProjectLastKnownActiveProjectFilePath()).toBe(testPath)
  expect(
    runWithFaProjectDatabaseSync(() => {
      return 'ok'
    }).ok
  ).toBe(true)
})

test('runWithFaProjectDatabaseForIpcAsync returns false when renderer-driven reconnect fails', async () => {
  testPath = path.join(os.tmpdir(), `fa-ensure-ipc-fail-${Date.now()}.faproject`)
  closeFaProjectActiveDatabase()
  requestPathMock.mockResolvedValueOnce(testPath)
  applyMigrationsMock.mockImplementationOnce(() => {
    throw new Error('migration failed for ipc path')
  })
  const sender = {}
  const out = await runWithFaProjectDatabaseForIpcAsync({ sender } as never, () => {
    return 1
  })
  expect(out).toEqual({ ok: false })
})

test('runWithFaProjectDatabaseForIpcAsync returns false when renderer supplies an invalid extension', async () => {
  closeFaProjectActiveDatabase()
  requestPathMock.mockResolvedValueOnce('D:\\x\\notes.txt')
  const out = await runWithFaProjectDatabaseForIpcAsync({ sender: {} } as never, () => {
    return 1
  })
  expect(out).toEqual({ ok: false })
})
