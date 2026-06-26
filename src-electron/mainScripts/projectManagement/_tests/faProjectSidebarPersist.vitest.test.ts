import { expect, test, vi } from 'vitest'

import {
  FA_PROJECT_SIDEBAR_KV_KEY,
  readFaProjectSidebarRoot,
  upsertFaProjectSidebarKv
} from '../faProjectSidebarPersistWiring'
import {
  FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX,
  FA_PROJECT_SIDEBAR_MIN_WIDTH_PX
} from 'app/types/I_faProjectSidebarDomain'

interface I_kvBackedDb {
  db: {
    prepare: ReturnType<typeof vi.fn>
  }
  kv: Record<string, string>
  upsertRuns: Array<{ name: string; value: string }>
}

function makeKvProjectDb (initial: Record<string, string> = {}): I_kvBackedDb {
  const kv: Record<string, string> = { ...initial }
  const upsertRuns: Array<{ name: string; value: string }> = []
  const db = {
    prepare: vi.fn((sql: string) => {
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
    })
  }
  return {
    db,
    kv,
    upsertRuns
  }
}

test('readFaProjectSidebarRoot returns default width when sidebar_width is missing', () => {
  const { db } = makeKvProjectDb()
  expect(readFaProjectSidebarRoot(db as never)).toEqual({
    schemaVersion: 1,
    widthPx: FA_PROJECT_SIDEBAR_DEFAULT_WIDTH_PX
  })
})

test('readFaProjectSidebarRoot ceils fractional kv values and enforces minimum width', () => {
  const { db } = makeKvProjectDb({
    [FA_PROJECT_SIDEBAR_KV_KEY]: '400.2'
  })
  expect(readFaProjectSidebarRoot(db as never).widthPx).toBe(401)
})

test('readFaProjectSidebarRoot clamps stored values below minimum up to default floor', () => {
  const { db } = makeKvProjectDb({
    [FA_PROJECT_SIDEBAR_KV_KEY]: '200'
  })
  expect(readFaProjectSidebarRoot(db as never).widthPx).toBe(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX)
})

test('upsertFaProjectSidebarKv writes ceiled sidebar_width', () => {
  const { db, upsertRuns } = makeKvProjectDb()
  upsertFaProjectSidebarKv(db as never, {
    widthPx: 512.4
  })
  expect(upsertRuns).toEqual([
    {
      name: FA_PROJECT_SIDEBAR_KV_KEY,
      value: '513'
    }
  ])
})

test('upsertFaProjectSidebarKv clamps below-minimum writes to minimum', () => {
  const { db, upsertRuns } = makeKvProjectDb()
  upsertFaProjectSidebarKv(db as never, {
    widthPx: 300
  })
  expect(upsertRuns[0]?.value).toBe(String(FA_PROJECT_SIDEBAR_MIN_WIDTH_PX))
})
