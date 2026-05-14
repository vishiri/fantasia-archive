import { expect, test, vi } from 'vitest'

import {
  deleteFaProjectNoteboardFrameKv,
  readFaProjectNoteboardRoot,
  upsertFaProjectNoteboardKv
} from '../faProjectNoteboardPersist'

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

test('readFaProjectNoteboardRoot returns defaults when no kv rows exist', () => {
  const { db } = makeKvProjectDb()
  expect(readFaProjectNoteboardRoot(db as never)).toEqual({
    frame: null,
    schemaVersion: 1,
    text: ''
  })
})

test('readFaProjectNoteboardRoot returns text and null frame when measurements are incomplete', () => {
  const { db } = makeKvProjectDb({
    project_noteboard_content: 'hello',
    project_noteboard_x: '10'
  })
  expect(readFaProjectNoteboardRoot(db as never)).toEqual({
    frame: null,
    schemaVersion: 1,
    text: 'hello'
  })
})

test('readFaProjectNoteboardRoot returns a frame when four numeric cells are present', () => {
  const { db } = makeKvProjectDb({
    project_noteboard_height: '120',
    project_noteboard_width: '400',
    project_noteboard_x: ' 12 ',
    project_noteboard_y: '34'
  })
  expect(readFaProjectNoteboardRoot(db as never).frame).toEqual({
    height: 120,
    width: 400,
    x: 12,
    y: 34
  })
})

test('readFaProjectNoteboardRoot treats non-finite coords as a missing frame', () => {
  const { db } = makeKvProjectDb({
    project_noteboard_height: '1',
    project_noteboard_width: '1',
    project_noteboard_x: 'NaN',
    project_noteboard_y: '0'
  })
  expect(readFaProjectNoteboardRoot(db as never).frame).toBeNull()
})

test('readFaProjectNoteboardRoot ignores blank coordinate cells', () => {
  const { db } = makeKvProjectDb({
    project_noteboard_height: '1',
    project_noteboard_width: '2',
    project_noteboard_x: ' ',
    project_noteboard_y: '4'
  })
  expect(readFaProjectNoteboardRoot(db as never).frame).toBeNull()
})

test('upsertFaProjectNoteboardKv writes text only without touching geometry when omitted', () => {
  const { db, kv, upsertRuns } = makeKvProjectDb({
    project_noteboard_height: '9',
    project_noteboard_width: '9',
    project_noteboard_x: '1',
    project_noteboard_y: '2'
  })
  upsertFaProjectNoteboardKv(db as never, { text: 'next' })
  expect(upsertRuns).toEqual([
    {
      name: 'project_noteboard_content',
      value: 'next'
    }
  ])
  expect(readFaProjectNoteboardRoot(db as never).frame).toEqual({
    height: 9,
    width: 9,
    x: 1,
    y: 2
  })
  expect(kv.project_noteboard_content).toBe('next')
})

test('upsertFaProjectNoteboardKv clears frame KV rows when patch.frame is null', () => {
  const { db, kv } = makeKvProjectDb({
    project_noteboard_height: '9',
    project_noteboard_width: '10',
    project_noteboard_x: '3',
    project_noteboard_y: '4'
  })
  upsertFaProjectNoteboardKv(db as never, {
    frame: null
  })
  expect(kv.project_noteboard_x).toBeUndefined()
  expect(readFaProjectNoteboardRoot(db as never).frame).toBeNull()
})

test('upsertFaProjectNoteboardKv writes rectangular frame coordinates', () => {
  const { db, upsertRuns } = makeKvProjectDb()
  upsertFaProjectNoteboardKv(db as never, {
    frame: {
      height: 501,
      width: 701,
      x: -2,
      y: 40
    }
  })
  expect(upsertRuns).toEqual([
    {
      name: 'project_noteboard_x',
      value: '-2'
    },
    {
      name: 'project_noteboard_y',
      value: '40'
    },
    {
      name: 'project_noteboard_width',
      value: '701'
    },
    {
      name: 'project_noteboard_height',
      value: '501'
    }
  ])
})

test('deleteFaProjectNoteboardFrameKv removes the four positioning keys via sql parameters', () => {
  const { db, kv } = makeKvProjectDb({
    project_noteboard_height: '1',
    project_noteboard_width: '2',
    project_noteboard_x: '3',
    project_noteboard_y: '4',
    project_noteboard_content: 'keep'
  })
  deleteFaProjectNoteboardFrameKv(db as never)
  expect(kv.project_noteboard_content).toBe('keep')
  expect(kv.project_noteboard_x).toBeUndefined()
})
