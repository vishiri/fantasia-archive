import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

import {
  closeFaProjectActiveDatabase,
  getFaProjectActiveDatabase
} from '../faProjectActiveDatabaseWiring'
import { reconnectFaProjectDatabaseAtKnownPathSync } from '../faProjectReconnectAtKnownPathWiring'

const applyMigrationsMock = vi.hoisted(() => vi.fn())
const quickCheckMock = vi.hoisted(() => vi.fn())
const BetterSqlite3Mock = vi.hoisted(() => vi.fn())

vi.mock('better-sqlite3', () => {
  return {
    default: BetterSqlite3Mock
  }
})

vi.mock('../faProjectDbMigrateWiring', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../faProjectDbMigrateWiring')>()
  return {
    ...mod,
    applyFaProjectMigrations: applyMigrationsMock,
    assertFaProjectDatabaseQuickCheck: quickCheckMock
  }
})

let absoluteProject = ''

afterEach(() => {
  closeFaProjectActiveDatabase()
  BetterSqlite3Mock.mockReset()
  applyMigrationsMock.mockReset()
  quickCheckMock.mockReset()
  if (absoluteProject.length > 0 && fs.existsSync(absoluteProject)) {
    fs.unlinkSync(absoluteProject)
  }
  absoluteProject = ''
})

beforeEach(() => {
  absoluteProject = path.join(os.tmpdir(), `fa-reconnect-${Date.now()}.faproject`)
  fs.writeFileSync(absoluteProject, '')
  BetterSqlite3Mock.mockImplementation(function () {
    return {
      close: vi.fn(),
      pragma: vi.fn()
    }
  })
  applyMigrationsMock.mockImplementation(() => {})
  quickCheckMock.mockImplementation(() => {})
})

test('reconnectFaProjectDatabaseAtKnownPathSync opens a new project file and registers the active handle', () => {
  const ok = reconnectFaProjectDatabaseAtKnownPathSync(absoluteProject)
  expect(ok).toBe(true)
  expect(getFaProjectActiveDatabase()).not.toBeNull()
  expect(applyMigrationsMock).toHaveBeenCalled()
  expect(quickCheckMock).toHaveBeenCalled()
})

test('reconnectFaProjectDatabaseAtKnownPathSync returns false when better-sqlite3 construction throws', () => {
  BetterSqlite3Mock.mockImplementation(function () {
    throw new Error('native sqlite unavailable')
  })
  const ok = reconnectFaProjectDatabaseAtKnownPathSync(absoluteProject)
  expect(ok).toBe(false)
  expect(getFaProjectActiveDatabase()).toBeNull()
})

test('reconnectFaProjectDatabaseAtKnownPathSync returns false when migrations fail after open', () => {
  applyMigrationsMock.mockImplementation(() => {
    throw new Error('migration failed')
  })
  const ok = reconnectFaProjectDatabaseAtKnownPathSync(absoluteProject)
  expect(ok).toBe(false)
  expect(getFaProjectActiveDatabase()).toBeNull()
})

test('reconnectFaProjectDatabaseAtKnownPathSync ignores close errors while unwinding after migration failure', () => {
  const noisyClose = vi.fn(() => {
    throw new Error('close ignored')
  })
  BetterSqlite3Mock.mockImplementation(function () {
    return {
      close: noisyClose,
      pragma: vi.fn()
    }
  })
  applyMigrationsMock.mockImplementation(() => {
    throw new Error('migration failed')
  })
  const ok = reconnectFaProjectDatabaseAtKnownPathSync(absoluteProject)
  expect(ok).toBe(false)
  expect(noisyClose).toHaveBeenCalled()
})
