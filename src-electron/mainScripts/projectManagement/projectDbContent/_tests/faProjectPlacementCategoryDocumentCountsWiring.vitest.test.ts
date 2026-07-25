import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../functions/faProjectDbSchemaDdl'
import { createFaProjectDocument } from '../faProjectDocumentsPersistWiring'
import { createFaProjectDocumentTemplate } from '../faProjectDocumentTemplatesPersistWiring'
import { listFaProjectPlacementCategoryDocumentCounts } from '../faProjectPlacementCategoryDocumentCountsWiring'
import { createFaProjectWorld } from '../faProjectWorldsPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

function openCountsTestDb (): Database {
  const connection = new Database(':memory:')
  applyFaProjectContentSchemaV1(connection)
  return connection
}

function seedWorldWithPlacement (connection: Database): {
  placementId: string
  templateId: string
  worldId: string
} {
  const world = createFaProjectWorld(connection, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(connection, { displayName: 'Character' })
  const placementId = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  replaceFaProjectWorldTemplateLayoutSnapshot(connection, world.id, {
    groups: [],
    placements: [{
      id: placementId,
      documentTemplateId: template.id,
      groupId: null,
      rootSortOrder: 0,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }]
  })
  return {
    placementId,
    templateId: template.id,
    worldId: world.id
  }
}

/**
 * listFaProjectPlacementCategoryDocumentCounts
 * Empty world yields an empty counts map.
 */
test('Test that listFaProjectPlacementCategoryDocumentCounts returns empty map without documents', () => {
  db = openCountsTestDb()
  const seeded = seedWorldWithPlacement(db)
  const counts = listFaProjectPlacementCategoryDocumentCounts(db, seeded.worldId)
  expect(counts.size).toBe(0)
})

/**
 * listFaProjectPlacementCategoryDocumentCounts
 * Splits category vs document rows per placement for one world.
 */
test('Test that listFaProjectPlacementCategoryDocumentCounts splits category and document counts', () => {
  db = openCountsTestDb()
  const seeded = seedWorldWithPlacement(db)
  createFaProjectDocument(db, {
    displayName: 'Folder',
    isCategory: true,
    placementId: seeded.placementId,
    templateId: seeded.templateId,
    worldId: seeded.worldId
  })
  createFaProjectDocument(db, {
    displayName: 'Doc A',
    placementId: seeded.placementId,
    templateId: seeded.templateId,
    worldId: seeded.worldId
  })
  createFaProjectDocument(db, {
    displayName: 'Doc B',
    placementId: seeded.placementId,
    templateId: seeded.templateId,
    worldId: seeded.worldId
  })

  const counts = listFaProjectPlacementCategoryDocumentCounts(db, seeded.worldId)
  expect(counts.get(seeded.placementId)).toEqual({
    categoryCount: 1,
    documentCount: 2
  })
})

/**
 * listFaProjectPlacementCategoryDocumentCounts
 * Ignores documents belonging to other worlds.
 */
test('Test that listFaProjectPlacementCategoryDocumentCounts scopes to the requested world', () => {
  db = openCountsTestDb()
  const seededA = seedWorldWithPlacement(db)
  const worldB = createFaProjectWorld(db, { displayName: 'Other' })
  const templateB = createFaProjectDocumentTemplate(db, { displayName: 'OtherTpl' })
  const placementB = '7ba7b811-9dad-11d1-80b4-00c04fd430c8'
  replaceFaProjectWorldTemplateLayoutSnapshot(db, worldB.id, {
    groups: [],
    placements: [{
      id: placementB,
      documentTemplateId: templateB.id,
      groupId: null,
      rootSortOrder: 0,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }]
  })
  createFaProjectDocument(db, {
    displayName: 'In A',
    isCategory: true,
    placementId: seededA.placementId,
    templateId: seededA.templateId,
    worldId: seededA.worldId
  })
  createFaProjectDocument(db, {
    displayName: 'In B',
    placementId: placementB,
    templateId: templateB.id,
    worldId: worldB.id
  })

  const countsA = listFaProjectPlacementCategoryDocumentCounts(db, seededA.worldId)
  expect(countsA.size).toBe(1)
  expect(countsA.get(seededA.placementId)).toEqual({
    categoryCount: 1,
    documentCount: 0
  })

  const countsB = listFaProjectPlacementCategoryDocumentCounts(db, worldB.id)
  expect(countsB.get(placementB)).toEqual({
    categoryCount: 0,
    documentCount: 1
  })
})
