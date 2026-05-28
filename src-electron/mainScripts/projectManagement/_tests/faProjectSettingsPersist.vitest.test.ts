import { expect, test, vi } from 'vitest'

import {
  readFaProjectSettingsProjectNameRaw,
  readFaProjectSettingsRoot,
  upsertFaProjectSettingsKv
} from '../faProjectSettingsPersist'

interface I_kvBackedDb {
  db: {
    prepare: ReturnType<typeof vi.fn>
    transaction: (fn: () => void) => () => void
  }
  kv: Record<string, string>
  upsertRuns: Array<{ name: string; value: string }>
}

function makeKvProjectDb (initial: Record<string, string> = {}): I_kvBackedDb {
  const kv: Record<string, string> = { ...initial }
  const upsertRuns: Array<{ name: string; value: string }> = []
  const db = {
    prepare: vi.fn((sql: string) => {
      if (sql.includes('DELETE')) {
        return {
          run: vi.fn((named: Record<string, string>) => {
            Object.values(named).forEach((keyName) => {
              delete kv[keyName]
            })
          })
        }
      }
      if (sql.includes('SELECT')) {
        return {
          get: (key: string) => {
            const v = kv[key]
            if (v === undefined) {
              return undefined
            }
            return {
              v
            }
          }
        }
      }
      return {
        run: vi.fn((params: { name: string; value: string }) => {
          upsertRuns.push({
            name: params.name,
            value: params.value
          })
          kv[params.name] = params.value
        })
      }
    }),
    transaction: (fn: () => void) => {
      return () => {
        fn()
      }
    }
  }
  return {
    db,
    kv,
    upsertRuns
  }
}

/**
 * readFaProjectSettingsRoot
 * Missing project_name KV throws because stored display name is required.
 */
test('Test that readFaProjectSettingsRoot throws when project_name row is absent', () => {
  const { db } = makeKvProjectDb()
  expect(() => readFaProjectSettingsRoot(db as never)).toThrow(
    'Project file is missing project metadata'
  )
})

/**
 * readFaProjectSettingsRoot
 * Reads trimmed display name from project_name KV.
 */
test('Test that readFaProjectSettingsRoot returns projectName from project_name KV', () => {
  const { db } = makeKvProjectDb({
    project_name: '  Arcovia  '
  })
  expect(readFaProjectSettingsRoot(db as never)).toEqual({
    projectName: 'Arcovia',
    schemaVersion: 1
  })
})

/**
 * upsertFaProjectSettingsKv
 * Project-name patch upserts the project_name KV row.
 */
test('Test that upsertFaProjectSettingsKv writes project_name when patch includes projectName', () => {
  const { db, kv, upsertRuns } = makeKvProjectDb()
  upsertFaProjectSettingsKv(db as never, { projectName: 'Renamed' })
  expect(upsertRuns).toEqual([
    {
      name: 'project_name',
      value: 'Renamed'
    }
  ])
  expect(kv.project_name).toBe('Renamed')
  expect(readFaProjectSettingsProjectNameRaw(db as never)).toBe('Renamed')
})

/**
 * upsertFaProjectSettingsKv
 * Empty patch does not touch KV rows.
 */
test('Test that upsertFaProjectSettingsKv no-ops when patch omits projectName', () => {
  const { db, upsertRuns } = makeKvProjectDb({
    project_name: 'Keep'
  })
  upsertFaProjectSettingsKv(db as never, {})
  expect(upsertRuns).toEqual([])
  expect(readFaProjectSettingsProjectNameRaw(db as never)).toBe('Keep')
})
