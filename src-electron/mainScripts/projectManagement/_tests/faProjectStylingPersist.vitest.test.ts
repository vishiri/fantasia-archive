import { expect, test, vi } from 'vitest'

import {
  deleteFaProjectStylingFrameKv,
  readFaProjectStylingRoot,
  upsertFaProjectStylingKv
} from '../faProjectStylingPersistWiring'

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
 * readFaProjectStylingRoot
 * Empty KV yields default root with empty css and null frame.
 */
test('Test that readFaProjectStylingRoot returns defaults when no kv rows exist', () => {
  const { db } = makeKvProjectDb()
  expect(readFaProjectStylingRoot(db as never)).toEqual({
    css: '',
    frame: null,
    schemaVersion: 1
  })
})

/**
 * readFaProjectStylingRoot
 * Partial geometry yields css but frame stays null until all edges exist.
 */
test('Test that readFaProjectStylingRoot returns css and null frame when measurements are incomplete', () => {
  const { db } = makeKvProjectDb({
    project_styling_content: '.x{}',
    project_styling_x: '10'
  })
  expect(readFaProjectStylingRoot(db as never)).toEqual({
    css: '.x{}',
    frame: null,
    schemaVersion: 1
  })
})

/**
 * readFaProjectStylingRoot
 * Four finite coordinates produce a persisted frame rect.
 */
test('Test that readFaProjectStylingRoot returns a frame when four numeric cells are present', () => {
  const { db } = makeKvProjectDb({
    project_styling_height: '120',
    project_styling_width: '400',
    project_styling_x: ' 12 ',
    project_styling_y: '34'
  })
  expect(readFaProjectStylingRoot(db as never).frame).toEqual({
    height: 120,
    width: 400,
    x: 12,
    y: 34
  })
})

/**
 * readFaProjectStylingRoot
 * Non-finite coordinate text drops the reconstructed frame.
 */
test('Test that readFaProjectStylingRoot treats non-finite coords as a missing frame', () => {
  const { db } = makeKvProjectDb({
    project_styling_height: '1',
    project_styling_width: '1',
    project_styling_x: 'NaN',
    project_styling_y: '0'
  })
  expect(readFaProjectStylingRoot(db as never).frame).toBeNull()
})

/**
 * readFaProjectStylingRoot
 * Blank coordinate cells invalidate the rectangle.
 */
test('Test that readFaProjectStylingRoot ignores blank coordinate cells', () => {
  const { db } = makeKvProjectDb({
    project_styling_height: '1',
    project_styling_width: '2',
    project_styling_x: ' ',
    project_styling_y: '4'
  })
  expect(readFaProjectStylingRoot(db as never).frame).toBeNull()
})

/**
 * upsertFaProjectStylingKv
 * Css-only patch skips frame keys yet preserves prior geometry reads.
 */
test('Test that upsertFaProjectStylingKv writes css only without touching geometry when omitted', () => {
  const { db, kv, upsertRuns } = makeKvProjectDb({
    project_styling_height: '9',
    project_styling_width: '9',
    project_styling_x: '1',
    project_styling_y: '2'
  })
  upsertFaProjectStylingKv(db as never, { css: 'next' })
  expect(upsertRuns).toEqual([
    {
      name: 'project_styling_content',
      value: 'next'
    }
  ])
  expect(readFaProjectStylingRoot(db as never).frame).toEqual({
    height: 9,
    width: 9,
    x: 1,
    y: 2
  })
  expect(kv.project_styling_content).toBe('next')
})

/**
 * upsertFaProjectStylingKv
 * Null frame removes the four geometry KV rows without deleting css body.
 */
test('Test that upsertFaProjectStylingKv clears frame KV rows when patch.frame is null', () => {
  const { db, kv } = makeKvProjectDb({
    project_styling_height: '9',
    project_styling_width: '10',
    project_styling_x: '3',
    project_styling_y: '4'
  })
  upsertFaProjectStylingKv(db as never, {
    frame: null
  })
  expect(kv.project_styling_x).toBeUndefined()
  expect(readFaProjectStylingRoot(db as never).frame).toBeNull()
})

/**
 * upsertFaProjectStylingKv
 * Frame patch upserts rectangular coordinates.
 */
test('Test that upsertFaProjectStylingKv writes rectangular frame coordinates', () => {
  const { db, upsertRuns } = makeKvProjectDb()
  upsertFaProjectStylingKv(db as never, {
    frame: {
      height: 501,
      width: 701,
      x: -2,
      y: 40
    }
  })
  expect(upsertRuns).toEqual([
    {
      name: 'project_styling_x',
      value: '-2'
    },
    {
      name: 'project_styling_y',
      value: '40'
    },
    {
      name: 'project_styling_width',
      value: '701'
    },
    {
      name: 'project_styling_height',
      value: '501'
    }
  ])
})

/**
 * deleteFaProjectStylingFrameKv
 * DELETE targets the four frame keys parameterized by SQLite bind names while keeping css row.
 */
test('Test that deleteFaProjectStylingFrameKv removes the four positioning keys via sql parameters', () => {
  const { db, kv } = makeKvProjectDb({
    project_styling_height: '1',
    project_styling_width: '2',
    project_styling_x: '3',
    project_styling_y: '4',
    project_styling_content: 'keep'
  })
  deleteFaProjectStylingFrameKv(db as never)
  expect(kv.project_styling_content).toBe('keep')
  expect(kv.project_styling_x).toBeUndefined()
})
