import { expect, test, vi } from 'vitest'

import {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredDisplayName,
  readFaProjectStoredProjectUuid
} from '../faProjectDbMigrate'

test('applyFaProjectMigrations runs ddl when user_version is 0', () => {
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
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      return {
        get: (param: string) => {
          if (param === 'project_name') {
            return { v: 'Realm' }
          }
          return { v: '550e8400-e29b-41d4-a716-446655440000' }
        }
      }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Realm')
  expect(db.exec).toHaveBeenCalled()
  expect(insertRun).toHaveBeenCalledTimes(2)
  expect(pragmas.user_version).toBe(3)
  expect(db.exec.mock.calls.some((call) => typeof call[0] === 'string' && call[0].includes('project_data'))).toBe(
    true
  )
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

test('applyFaProjectMigrations is a no-op when user_version already at maximum', () => {
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
  expect(db.exec).not.toHaveBeenCalled()
})

test('applyFaProjectMigrations throws when post-migration project_name read does not match after v0 bootstrap', () => {
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
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      return {
        get: (param: string) => {
          if (param === 'project_name') {
            return { v: 'Wrong' }
          }
          return { v: '550e8400-e29b-41d4-a716-446655440000' }
        }
      }
    }),
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
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      return {
        get: (param: string) => {
          if (param === 'project_name') {
            return { v: 'Fresh' }
          }
          return { v: '650e8400-e29b-41d4-a716-446655440001' }
        }
      }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Fresh')
  expect(insertRun).toHaveBeenCalled()
})

test('applyFaProjectMigrations upgrades v1 to v3 when project_uuid is missing', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const selectGetUuidBefore = vi.fn().mockReturnValueOnce(undefined)
  const pragmas: Record<string, unknown> = { user_version: 1 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      if (sql.includes('project_options')) {
        return {
          get: (param: string) => {
            if (param === 'project_uuid') {
              return selectGetUuidBefore()
            }
            return undefined
          }
        }
      }
      return {
        get: (): { v: string } => {
          return { v: '850e8400-e29b-41d4-a716-446655440003' }
        }
      }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Legacy')
  expect(insertRun).toHaveBeenCalled()
  expect(db.exec.mock.calls.some((call) => typeof call[0] === 'string' && call[0].includes('RENAME TO'))).toBe(true)
  expect(pragmas.user_version).toBe(3)
})

test('applyFaProjectMigrations upgrades v1 without insert when project_uuid already exists', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const pragmas: Record<string, unknown> = { user_version: 1 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      if (sql.includes('project_options')) {
        return {
          get: (param: string) => {
            if (param === 'project_uuid') {
              return { v: '750e8400-e29b-41d4-a716-446655440002' }
            }
            return undefined
          }
        }
      }
      return {
        get: (): { v: string } => ({
          v: '750e8400-e29b-41d4-a716-446655440002'
        })
      }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'HasUuid')
  expect(insertRun).not.toHaveBeenCalled()
  expect(pragmas.user_version).toBe(3)
})

test('applyFaProjectMigrations upgrades v2 to v3 renaming project_options', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const pragmas: Record<string, unknown> = { user_version: 2 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn(() => {
      return {
        get: (): { v: string } => ({
          v: '550e8400-e29b-41d4-a716-446655440000'
        })
      }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'V2Realm')
  expect(db.exec.mock.calls.some((call) => typeof call[0] === 'string' && call[0].includes('RENAME TO'))).toBe(true)
  expect(pragmas.user_version).toBe(3)
})

test('applyFaProjectMigrations inserts uuid on v1 when project_uuid row is only whitespace', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const selectUuid = vi
    .fn()
    .mockReturnValueOnce({ v: '   ' })
    .mockReturnValueOnce({ v: '950e8400-e29b-41d4-a716-446655440044' })
  const pragmas: Record<string, unknown> = { user_version: 1 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      if (sql.includes('project_options')) {
        return {
          get: (param: string) => {
            if (param === 'project_uuid') {
              return selectUuid()
            }
            return undefined
          }
        }
      }
      return {
        get: (): { v: string } => ({ v: '950e8400-e29b-41d4-a716-446655440044' })
      }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'WhitespaceUuid')
  expect(insertRun).toHaveBeenCalled()
  expect(pragmas.user_version).toBe(3)
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
      if (name === 'user_version = 3') {
        pragmas.user_version = 3
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      return {
        get: (param: string) => {
          if (param === 'project_name') {
            return { v: 'Realm' }
          }
          if (param === 'project_uuid') {
            return { v: '   ' }
          }
          return undefined
        }
      }
    }),
    transaction: run
  }
  expect(() => applyFaProjectMigrations(db as never, 'Realm')).toThrow(
    /project_uuid row after migration/
  )
})

test('applyFaProjectMigrations throws for unexpected user_version between 0 and max', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const db = {
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return 0.5
      }
      return undefined
    }),
    transaction: run
  }
  expect(() => applyFaProjectMigrations(db as never, 'Odd')).toThrow(
    /Unexpected project file schema state/
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
