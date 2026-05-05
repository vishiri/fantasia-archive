import { expect, test, vi } from 'vitest'

import { applyFaProjectMigrations, assertFaProjectDatabaseQuickCheck } from '../faProjectDbMigrate'

test('applyFaProjectMigrations runs ddl when user_version is 0', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const selectGet = vi.fn(() => ({ v: 'Realm' }))
  const pragmas: Record<string, unknown> = { user_version: 0 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      if (name === 'user_version = 1') {
        pragmas.user_version = 1
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      return { get: selectGet }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Realm')
  expect(db.exec).toHaveBeenCalled()
  expect(insertRun).toHaveBeenCalled()
  expect(selectGet).toHaveBeenCalled()
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
        return 1
      }
      return undefined
    }),
    transaction: vi.fn()
  }
  applyFaProjectMigrations(db as never, 'Idle')
  expect(db.exec).not.toHaveBeenCalled()
})

test('applyFaProjectMigrations throws when post-migration read does not match', () => {
  const run = vi.fn((fn: () => void) => {
    return () => {
      fn()
    }
  })
  const insertRun = vi.fn()
  const selectGet = vi.fn(() => ({ v: 'Wrong' }))
  const pragmas: Record<string, unknown> = { user_version: 0 }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      if (name === 'user_version = 1') {
        pragmas.user_version = 1
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      return { get: selectGet }
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
  const selectGet = vi.fn(() => ({ v: 'Fresh' }))
  const pragmas: Record<string, unknown> = { user_version: 'not-a-number' }
  const db = {
    exec: vi.fn(),
    pragma: vi.fn((name: string, opts?: { simple?: boolean }) => {
      if (name === 'user_version' && opts?.simple === true) {
        return pragmas.user_version
      }
      if (name === 'user_version = 1') {
        pragmas.user_version = 1
        return undefined
      }
      return undefined
    }),
    prepare: vi.fn((sql: string) => {
      if (sql.includes('INSERT')) {
        return { run: insertRun }
      }
      return { get: selectGet }
    }),
    transaction: run
  }
  applyFaProjectMigrations(db as never, 'Fresh')
  expect(insertRun).toHaveBeenCalled()
})
