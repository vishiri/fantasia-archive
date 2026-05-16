import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const getDbMock = vi.hoisted(() => vi.fn())
const getPathMock = vi.hoisted(() => vi.fn())
const closeHandleOnlyMock = vi.hoisted(() => vi.fn())
const reconnectMock = vi.hoisted(() => vi.fn())
const requestPathMock = vi.hoisted(() => vi.fn(async (): Promise<string | null> => null))

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase', () => {
  return {
    closeFaProjectActiveDatabaseHandleOnly: closeHandleOnlyMock,
    getFaProjectActiveDatabase: () => getDbMock(),
    getFaProjectLastKnownActiveProjectFilePath: () => getPathMock()
  }
})

vi.mock('app/src-electron/mainScripts/projectManagement/faProjectReconnectAtKnownPath', () => {
  return {
    reconnectFaProjectDatabaseAtKnownPathSync: reconnectMock
  }
})

vi.mock('app/src-electron/mainScripts/ipcManagement/faProjectFailsafePathFromRenderer', () => {
  return {
    requestRendererActiveProjectPathForFailsafe: requestPathMock
  }
})

import { runWithFaProjectDatabaseForIpcAsync, runWithFaProjectDatabaseSync } from '../faProjectDatabaseEnsureConnected'

const absoluteProjectPath = path.join(os.tmpdir(), 'fa-ensure-connected-mock.faproject')

beforeEach(() => {
  getDbMock.mockReset()
  getPathMock.mockReset()
  closeHandleOnlyMock.mockReset()
  reconnectMock.mockReset()
  requestPathMock.mockReset()
  requestPathMock.mockResolvedValue(null)
  getPathMock.mockReturnValue(null)
  reconnectMock.mockReturnValue(false)
})

afterEach(() => {
  if (fs.existsSync(absoluteProjectPath)) {
    fs.unlinkSync(absoluteProjectPath)
  }
})

test('runWithFaProjectDatabaseSync returns ok false when there is no handle and no known path', () => {
  getDbMock.mockReturnValue(null)
  const result = runWithFaProjectDatabaseSync(() => {
    return 99
  })
  expect(result).toEqual({ ok: false })
  expect(reconnectMock).not.toHaveBeenCalled()
})

test('runWithFaProjectDatabaseSync runs work when the SQLite handle is already open', () => {
  const fakeDb = { k: 1 }
  getDbMock.mockReturnValue(fakeDb as never)
  const result = runWithFaProjectDatabaseSync(() => {
    return 'done'
  })
  expect(result).toEqual({
    ok: true,
    value: 'done'
  })
})

test('runWithFaProjectDatabaseSync reconnects from last known path when the handle is missing', () => {
  const fakeDb = { k: 2 }
  getDbMock
    .mockReturnValueOnce(null)
    .mockReturnValue(fakeDb as never)
  getPathMock.mockReturnValue(absoluteProjectPath)
  fs.writeFileSync(absoluteProjectPath, '')
  reconnectMock.mockReturnValue(true)
  const result = runWithFaProjectDatabaseSync((db) => {
    return db
  })
  expect(reconnectMock).toHaveBeenCalledWith(absoluteProjectPath)
  expect(result).toEqual({
    ok: true,
    value: fakeDb
  })
})

test('runWithFaProjectDatabaseForIpcAsync uses renderer path when main path and handle are missing', async () => {
  const fakeDb = { k: 3 }
  getDbMock
    .mockReturnValueOnce(null)
    .mockReturnValue(fakeDb as never)
  getPathMock.mockReturnValue(null)
  requestPathMock.mockResolvedValueOnce(absoluteProjectPath)
  reconnectMock.mockReturnValue(true)
  const sender = {}
  const out = await runWithFaProjectDatabaseForIpcAsync({ sender } as never, (_db) => {
    return 7
  })
  expect(requestPathMock).toHaveBeenCalled()
  expect(reconnectMock).toHaveBeenCalledWith(absoluteProjectPath)
  expect(out).toEqual({
    ok: true,
    value: 7
  })
})

test('runWithFaProjectDatabaseSync returns ok false when reconnect reports success but the handle is still missing', () => {
  getDbMock.mockReturnValue(null)
  getPathMock.mockReturnValue(absoluteProjectPath)
  reconnectMock.mockReturnValue(true)
  const result = runWithFaProjectDatabaseSync(() => {
    return 99
  })
  expect(result).toEqual({ ok: false })
})

test('runWithFaProjectDatabaseForIpcAsync returns the sync success without asking the renderer', async () => {
  const fakeDb = { k: 9 }
  getDbMock.mockReturnValue(fakeDb as never)
  const out = await runWithFaProjectDatabaseForIpcAsync({ sender: {} } as never, () => {
    return 'immediate'
  })
  expect(requestPathMock).not.toHaveBeenCalled()
  expect(out).toEqual({
    ok: true,
    value: 'immediate'
  })
})

test('runWithFaProjectDatabaseSync throws when reconnect fails after a recoverable sqlite error', () => {
  const fakeDb = { k: 4 }
  getDbMock.mockReturnValue(fakeDb as never)
  getPathMock.mockReturnValue(absoluteProjectPath)
  reconnectMock.mockReturnValue(false)
  const busy = new Error('locked')
  ;(busy as Error & { code?: string }).code = 'SQLITE_BUSY'
  expect(() => {
    runWithFaProjectDatabaseSync(() => {
      throw busy
    })
  }).toThrow('locked')
  expect(closeHandleOnlyMock).toHaveBeenCalledOnce()
})

test('runWithFaProjectDatabaseSync throws when reconnect succeeds but the active handle is still missing', () => {
  const fakeDb = { k: 5 }
  getDbMock
    .mockReturnValueOnce(null)
    .mockReturnValueOnce(fakeDb as never)
    .mockReturnValue(null)
  getPathMock.mockReturnValue(absoluteProjectPath)
  reconnectMock.mockReturnValue(true)
  const busy = new Error('locked')
  ;(busy as Error & { code?: string }).code = 'SQLITE_BUSY'
  expect(() => {
    runWithFaProjectDatabaseSync(() => {
      throw busy
    })
  }).toThrow('locked')
})

test('runWithFaProjectDatabaseSync propagates non-Error throws without sqlite retry handling', () => {
  const fakeDb = { k: 6 }
  getDbMock.mockReturnValue(fakeDb as never)
  expect(() => {
    runWithFaProjectDatabaseSync(() => {
      throw Object.assign(Object.create(null) as object, {
        message: 'non-error-throw'
      })
    })
  }).toThrow()
})

test('runWithFaProjectDatabaseSync does not retry SQLITE_NOTFOUND errors', () => {
  const fakeDb = { k: 7 }
  getDbMock.mockReturnValue(fakeDb as never)
  const err = new Error('missing')
  ;(err as Error & { code?: string }).code = 'SQLITE_NOTFOUND'
  expect(() => {
    runWithFaProjectDatabaseSync(() => {
      throw err
    })
  }).toThrow('missing')
  expect(closeHandleOnlyMock).not.toHaveBeenCalled()
})

test('runWithFaProjectDatabaseSync retries when only the database is locked message matches', () => {
  const fakeDb = { k: 8 }
  getDbMock
    .mockReturnValueOnce(fakeDb as never)
    .mockReturnValue(fakeDb as never)
  getPathMock.mockReturnValue(absoluteProjectPath)
  reconnectMock.mockReturnValue(true)
  let calls = 0
  const result = runWithFaProjectDatabaseSync(() => {
    calls += 1
    if (calls === 1) {
      throw new Error('database is locked')
    }
    return 'ok'
  })
  expect(closeHandleOnlyMock).toHaveBeenCalledOnce()
  expect(result).toEqual({
    ok: true,
    value: 'ok'
  })
})

test('runWithFaProjectDatabaseSync retries when the error mentions sqlite without a SQLITE_ code', () => {
  const fakeDb = { k: 10 }
  getDbMock
    .mockReturnValueOnce(fakeDb as never)
    .mockReturnValue(fakeDb as never)
  getPathMock.mockReturnValue(absoluteProjectPath)
  reconnectMock.mockReturnValue(true)
  let calls = 0
  const result = runWithFaProjectDatabaseSync(() => {
    calls += 1
    if (calls === 1) {
      const err = new Error('wrapper text mentions sqlite for this branch')
      ;(err as Error & { code?: string }).code = 'EPERM'
      throw err
    }
    return 'fixed'
  })
  expect(result).toEqual({
    ok: true,
    value: 'fixed'
  })
})

test('runWithFaProjectDatabaseForIpcAsync returns false when renderer path reconnect fails', async () => {
  getDbMock.mockReturnValue(null)
  getPathMock.mockReturnValue(null)
  requestPathMock.mockResolvedValueOnce(absoluteProjectPath)
  reconnectMock.mockReturnValue(false)
  const out = await runWithFaProjectDatabaseForIpcAsync({ sender: {} } as never, () => {
    return 1
  })
  expect(out).toEqual({ ok: false })
})
