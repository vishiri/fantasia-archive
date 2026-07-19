import { beforeEach, expect, test, vi } from 'vitest'

import {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredDisplayName,
  readFaProjectStoredProjectUuid
} from '../faProjectDbMigrateWiring'

const seedFaProjectDefaultWorldIfEmptyMock = vi.hoisted(() => vi.fn())
const hierarchySchemaPatchMock = vi.hoisted(() => vi.fn())

vi.mock('../projectDbContent/faProjectWorldBootstrapWiring', () => {
  return {
    seedFaProjectDefaultWorldIfEmpty: seedFaProjectDefaultWorldIfEmptyMock
  }
})

vi.mock('../functions/faProjectDocumentsHierarchySchemaPatch', () => {
  return {
    createApplyFaProjectDocumentsHierarchySchemaPatch: () => hierarchySchemaPatchMock
  }
})

beforeEach(() => {
  seedFaProjectDefaultWorldIfEmptyMock.mockClear()
  hierarchySchemaPatchMock.mockClear()
})

function applyMockUserVersionPragma (
  name: string,
  pragmas: Record<string, unknown>
): void {
  if (name === 'user_version = 1') {
    pragmas.user_version = 1
  }
  if (name === 'user_version = 2') {
    pragmas.user_version = 2
  }
  if (name === 'user_version = 3') {
    pragmas.user_version = 3
  }
}

function createFaProjectMigrationPrepareMock (
  insertRun: ReturnType<typeof vi.fn>,
  getProjectName: () => string,
  getProjectUuid?: () => string | undefined
): ReturnType<typeof vi.fn> {
  return vi.fn((sql: string) => {
    if (sql.includes('INSERT')) {
      return { run: insertRun }
    }
    if (sql.includes('sqlite_master')) {
      return { get: () => undefined }
    }
    return {
      get: (param: string) => {
        if (param === 'project_name') {
          return { v: getProjectName() }
        }
        if (param === 'project_uuid') {
          const uuidValue = getProjectUuid?.()
          if (uuidValue !== undefined) {
            return { v: uuidValue }
          }
          return { v: '550e8400-e29b-41d4-a716-446655440000' }
        }
        return { v: '550e8400-e29b-41d4-a716-446655440000' }
      }
    }
  })
}

test('applyFaProjectMigrations bootstraps schema when user_version is 0', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const pragmas: Record<string, unknown> = { user_version: 0 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      applyMockUserVersionPragma(name, pragmas)
      return undefined
    }),
    prepare: createFaProjectMigrationPrepareMock(insertRun, () => 'Realm'),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Realm')
  expect(db.exec).toHaveBeenCalled()
  expect(insertRun).toHaveBeenCalledTimes(2)
  expect(pragmas.user_version).toBe(3)
  expect(seedFaProjectDefaultWorldIfEmptyMock).toHaveBeenCalledWith(db, 'Realm')
  expect(
    db.exec.mock.calls.some(
      (call) => typeof call[0]! === 'string' && call[0]!.includes('worlds')
    )
  ).toBe(true)
  expect(
    db.exec.mock.calls.some(
      (call) => typeof call[0]! === 'string' && call[0]!.includes('project_data')
    )
  ).toBe(true)
  expect(
    db.exec.mock.calls.some(
      (call) => typeof call[0]! === 'string' && call[0]!.includes('ADD COLUMN')
    )
  ).toBe(false)
})

test('applyFaProjectMigrations rejects unsupported future user_version', () => {
  const db = {
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return 99
      }
      return undefined
    })
  }
  expect(() => applyFaProjectMigrations(db as never, 'x')).toThrow(/newer version/)
})

test('assertFaProjectDatabaseQuickCheck throws when not ok', () => {
  const db = {
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'quick_check' && opts?.simple === true) {
        return 'corrupt'
      }
      return undefined
    })
  }
  expect(() => assertFaProjectDatabaseQuickCheck(db as never)).toThrow(/quick_check/)
})

test('assertFaProjectDatabaseQuickCheck passes when pragma reports ok', () => {
  const db = {
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'quick_check' && opts?.simple === true) {
        return 'ok'
      }
      return undefined
    })
  }
  assertFaProjectDatabaseQuickCheck(db as never)
})

test('applyFaProjectMigrations applies hierarchy patch when user_version already at maximum', () => {
  const db = {
    exec: vi.fn(),
    prepare: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return 3
      }
      return undefined
    }),
    transaction: vi.fn()
  }
  applyFaProjectMigrations(db as never, 'Idle')
  expect(hierarchySchemaPatchMock).toHaveBeenCalledWith(db)
  expect(seedFaProjectDefaultWorldIfEmptyMock).not.toHaveBeenCalled()
})

test('applyFaProjectMigrations migrates user_version 1 to 3', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const execCalls: string[] = []
  const pragmas: Record<string, unknown> = { user_version: 1 }
  const db = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    prepare: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      applyMockUserVersionPragma(name, pragmas)
      if (name.startsWith('table_info(')) {
        return []
      }
      return undefined
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Realm')
  expect(pragmas.user_version).toBe(3)
  expect(execCalls.some((sql) => sql.includes('is_category'))).toBe(true)
})

test('applyFaProjectMigrations throws when post-migration project_name read does not match after bootstrap', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const pragmas: Record<string, unknown> = { user_version: 0 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      applyMockUserVersionPragma(name, pragmas)
      return undefined
    }),
    prepare: createFaProjectMigrationPrepareMock(insertRun, () => 'Wrong'),
    transaction: run
  }
  expect(() => applyFaProjectMigrations(db as never, 'Right')).toThrow(/verify/)
})

test('applyFaProjectMigrations treats invalid user_version pragma as zero', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const pragmas: Record<string, unknown> = { user_version: 'not-a-number' }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      applyMockUserVersionPragma(name, pragmas)
      return undefined
    }),
    prepare: createFaProjectMigrationPrepareMock(insertRun, () => 'Fresh'),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Fresh')
  expect(insertRun).toHaveBeenCalled()
})

test('applyFaProjectMigrations throws for unexpected non-zero user_version below max', () => {
  const db = {
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return 0.5
      }
      return undefined
    }),
    transaction: vi.fn()
  }
  expect(() => applyFaProjectMigrations(db as never, 'Odd')).toThrow(
    /Unexpected project file schema state/
  )
})

test('applyFaProjectMigrations throws when final project_uuid verification is empty', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const pragmas: Record<string, unknown> = { user_version: 0 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      applyMockUserVersionPragma(name, pragmas)
      return undefined
    }),
    prepare: createFaProjectMigrationPrepareMock(insertRun, () => 'Realm', () => '   '),
    transaction: run
  }
  expect(() => applyFaProjectMigrations(db as never, 'Realm')).toThrow(
    /project_uuid row after migration/
  )
})

/**
 * readFaProjectStoredDisplayName
 * Returns trimmed option_value for project_name.
 */
test('Test that readFaProjectStoredDisplayName returns trimmed project_name row', () => {
  const get = vi.fn(() => ({ v: '  My Realm  ' }))
  const db = {
    prepare: vi.fn(() => ({ get }))
  }
  expect(readFaProjectStoredDisplayName(db as never)).toBe('My Realm')
})

/**
 * readFaProjectStoredDisplayName
 * Throws when the metadata row is absent or empty.
 */
test('Test that readFaProjectStoredDisplayName throws when row is missing', () => {
  const db = {
    prepare: vi.fn(() => ({ get: vi.fn(() => undefined) }))
  }
  expect(() => readFaProjectStoredDisplayName(db as never)).toThrow(/metadata/)
})

/**
 * readFaProjectStoredProjectUuid
 * Returns canonical uuid string when valid.
 */
test('Test that readFaProjectStoredProjectUuid returns trimmed valid uuid', () => {
  const get = vi.fn(() => ({ v: '  550e8400-e29b-41d4-a716-446655440000  ' }))
  const db = {
    prepare: vi.fn(() => ({ get }))
  }
  expect(readFaProjectStoredProjectUuid(db as never)).toBe(
    '550e8400-e29b-41d4-a716-446655440000'
  )
})

/**
 * readFaProjectStoredProjectUuid
 * Rejects values that are not RFC UUID v1–v5 shaped.
 */
test('Test that readFaProjectStoredProjectUuid throws when value is not a valid UUID', () => {
  const get = vi.fn(() => ({ v: 'not-a-uuid' }))
  const db = {
    prepare: vi.fn(() => ({ get }))
  }
  expect(() => readFaProjectStoredProjectUuid(db as never)).toThrow(/invalid project_uuid/)
})

/**
 * readFaProjectStoredProjectUuid
 * Throws when the row is missing.
 */
test('Test that readFaProjectStoredProjectUuid throws when project_uuid row is absent', () => {
  const db = {
    prepare: vi.fn(() => ({ get: vi.fn(() => undefined) }))
  }
  expect(() => readFaProjectStoredProjectUuid(db as never)).toThrow(/missing project_uuid/)
})
