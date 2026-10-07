import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../faProjectDbContentSchemaV1Wiring'
import { listFaProjectMedia, upsertFaProjectMedia } from '../faProjectMediaPersistWiring'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

function openMediaListTestDb (): Database {
  const connection = new Database(':memory:')
  applyFaProjectContentSchemaV1(connection)
  return connection
}

/**
 * listFaProjectMedia
 * Equal created_at_ms keeps the later insert first (rowid), not id text order.
 */
test('Test that listFaProjectMedia orders equal created times by newest row', () => {
  db = openMediaListTestDb()
  const mediaFields = {
    type: 'external' as const,
    internalType: '' as const,
    externalType: '' as const,
    externalLink: '',
    externalEmbed: '',
    internalLink: ''
  }
  upsertFaProjectMedia(db, {
    ...mediaFields,
    id: 'media-zzz',
    displayName: 'First'
  })
  upsertFaProjectMedia(db, {
    ...mediaFields,
    id: 'media-aaa',
    displayName: 'Second'
  })
  db.prepare('UPDATE media SET created_at_ms = ?').run(1_700_000_000_000)

  const listedIds = listFaProjectMedia(db).items.map((item) => item.id)
  expect(listedIds).toEqual(['media-aaa', 'media-zzz'])
})
