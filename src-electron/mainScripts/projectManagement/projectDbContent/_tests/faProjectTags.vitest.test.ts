import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../faProjectDbContentSchemaV1Wiring'
import { createFaProjectDocument } from '../faProjectDocumentsPersistWiring'
import { createFaProjectDocumentTemplate } from '../faProjectDocumentTemplatesPersistWiring'
import { createFaProjectWorld } from '../faProjectWorldsPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'
import {
  deleteFaProjectTag,
  renameFaProjectTag,
  reorderFaProjectDocumentsUnderTag,
  setFaProjectDocumentTags
} from '../faProjectTagsPersistWiring'
import {
  getFaProjectTagById,
  listFaProjectDocumentTags,
  listFaProjectDocumentsUnderTag,
  listFaProjectTagsForWorld,
  listFaProjectTagsWithDocumentCountsForWorld
} from '../faProjectTagsQueryWiring'
import {
  deleteFaProjectEmptyTagsByIds,
  findFaProjectTagIdByWorldAndNameNocase,
  getFaProjectDocumentWorldIdForTags,
  getFaProjectTagRowById,
  listFaProjectTagIdsForDocument,
  mapFaProjectTagRow
} from '../faProjectTagsSqlHelpersWiring'
import { FaProjectContentNotFoundError } from '../faProjectContentNotFoundError'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

function openTagsTestDb (): Database {
  const connection = new Database(':memory:')
  applyFaProjectContentSchemaV1(connection)
  return connection
}

function seedWorldDoc (
  connection: Database,
  worldName: string,
  docName: string
): {
    documentId: string
    placementId: string
    templateId: string
    worldId: string
  } {
  const world = createFaProjectWorld(connection, { displayName: worldName })
  const template = createFaProjectDocumentTemplate(connection, { displayName: 'Character' })
  const placementId = 'placement-tags-1'
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
  const document = createFaProjectDocument(connection, {
    worldId: world.id,
    templateId: template.id,
    placementId,
    displayName: docName,
    sortOrder: 0
  })
  return {
    documentId: document.id,
    placementId,
    templateId: template.id,
    worldId: world.id
  }
}

/**
 * mapFaProjectTagRow
 * Maps snake_case SQL row to camelCase tag domain object.
 */
test('Test that mapFaProjectTagRow maps SQL columns to domain fields', () => {
  expect(mapFaProjectTagRow({
    id: 'tag-1',
    world_id: 'world-1',
    name: 'Heroes',
    created_at_ms: 1,
    updated_at_ms: 2
  })).toEqual({
    id: 'tag-1',
    worldId: 'world-1',
    name: 'Heroes',
    createdAtMs: 1,
    updatedAtMs: 2
  })
})

/**
 * getFaProjectTagRowById / getFaProjectDocumentWorldIdForTags
 * Throw not-found when rows are missing.
 */
test('Test that tag SQL helpers throw when tag or document is absent', () => {
  db = openTagsTestDb()
  expect(() => getFaProjectTagRowById(db!, 'missing-tag')).toThrow(FaProjectContentNotFoundError)
  expect(() => getFaProjectDocumentWorldIdForTags(db!, 'missing-doc')).toThrow(
    FaProjectContentNotFoundError
  )
})

/**
 * setFaProjectDocumentTags + list helpers
 * Creates tags, lists by world/document, and returns under-tag children.
 */
test('Test that setFaProjectDocumentTags creates tags and query helpers list membership', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Hero')
  const result = setFaProjectDocumentTags(db, seeded.documentId, [
    {
      id: 'draft-1',
      name: ' Heroes ',
      isNew: true
    },
    {
      id: 'draft-2',
      name: 'Villains',
      isNew: true
    }
  ])
  expect(result.items).toHaveLength(2)
  expect(result.items.map((item) => item.name)).toEqual(['Heroes', 'Villains'])

  const worldTags = listFaProjectTagsForWorld(db, seeded.worldId)
  expect(worldTags.items.map((item) => item.name)).toEqual(['Heroes', 'Villains'])

  const withCounts = listFaProjectTagsWithDocumentCountsForWorld(db, seeded.worldId)
  expect(withCounts.items).toEqual([
    {
      id: result.items[0]!.id,
      name: 'Heroes',
      categoryCount: 0,
      documentCount: 1
    },
    {
      id: result.items[1]!.id,
      name: 'Villains',
      categoryCount: 0,
      documentCount: 1
    }
  ])

  const categoryDoc = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Category Folder',
    isCategory: true,
    sortOrder: 1
  })
  const categoryTags = setFaProjectDocumentTags(db, categoryDoc.id, [{
    id: 'draft-cat',
    name: 'Folders',
    isNew: true
  }])
  const countsWithCategory = listFaProjectTagsWithDocumentCountsForWorld(db, seeded.worldId)
  expect(countsWithCategory.items.find((item) => item.name === 'Folders')).toEqual({
    id: categoryTags.items[0]!.id,
    name: 'Folders',
    categoryCount: 1,
    documentCount: 0
  })

  expect(listFaProjectDocumentTags(db, seeded.documentId).items).toEqual(result.items)
  expect(listFaProjectTagIdsForDocument(db, seeded.documentId).sort()).toEqual(
    result.items.map((item) => item.id).sort()
  )

  db.prepare('UPDATE document_templates SET icon = ? WHERE id = ?').run(
    'mdi-account',
    seeded.templateId
  )
  const underTag = listFaProjectDocumentsUnderTag(db, result.items[0]!.id)
  expect(underTag.items).toHaveLength(1)
  expect(underTag.items[0]?.documentId).toBe(seeded.documentId)
  expect(underTag.items[0]?.displayName).toBe('Hero')
  expect(underTag.items[0]?.templateIcon).toBe('mdi-account')
  expect(getFaProjectTagById(db, result.items[0]!.id).name).toBe('Heroes')
})

/**
 * setFaProjectDocumentTags
 * Reuses existing case-insensitive names, keeps prior sort for kept tags, GCs removed empties.
 */
test('Test that setFaProjectDocumentTags reuses names, preserves order, and GCs empty tags', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Hero')
  const first = setFaProjectDocumentTags(db, seeded.documentId, [
    {
      id: 'a',
      name: 'Alpha',
      isNew: true
    },
    {
      id: 'b',
      name: 'Beta',
      isNew: true
    }
  ])
  const alphaId = first.items[0]!.id
  const betaId = first.items[1]!.id

  const second = setFaProjectDocumentTags(db, seeded.documentId, [
    {
      id: 'ignored',
      name: 'alpha',
      isNew: true
    },
    {
      id: betaId,
      name: 'Beta'
    },
    {
      id: 'dup',
      name: 'Beta',
      isNew: true
    },
    {
      id: 'c',
      name: 'Gamma',
      isNew: true
    }
  ])
  expect(second.items.map((item) => item.name)).toEqual(['Alpha', 'Beta', 'Gamma'])
  expect(second.items[0]!.id).toBe(alphaId)
  expect(second.items[1]!.id).toBe(betaId)

  setFaProjectDocumentTags(db, seeded.documentId, [{
    id: second.items[2]!.id,
    name: 'Gamma'
  }])
  expect(listFaProjectTagsForWorld(db, seeded.worldId).items.map((item) => item.name)).toEqual([
    'Gamma'
  ])
  expect(findFaProjectTagIdByWorldAndNameNocase(db, seeded.worldId, 'Alpha')).toBeNull()
})

/**
 * setFaProjectDocumentTags
 * Resolves existing tag by id, rejects wrong-world tags, creates when id missing.
 */
test('Test that setFaProjectDocumentTags resolves by id and creates when id is unknown', () => {
  db = openTagsTestDb()
  const seededA = seedWorldDoc(db, 'World A', 'Doc A')
  const seededB = createFaProjectWorld(db, { displayName: 'World B' })
  const created = setFaProjectDocumentTags(db, seededA.documentId, [{
    id: 'new',
    name: 'Shared',
    isNew: true
  }])
  const tagId = created.items[0]!.id

  expect(() =>
    setFaProjectDocumentTags(db!, seededA.documentId, [{
      id: tagId,
      name: 'Shared',
      isNew: false
    }])
  ).not.toThrow()

  db.prepare(
    'INSERT INTO tags (id, world_id, name, created_at_ms, updated_at_ms) VALUES (?, ?, ?, ?, ?)'
  ).run('foreign-tag', seededB.id, 'Foreign', 1, 1)
  expect(() =>
    setFaProjectDocumentTags(db!, seededA.documentId, [{
      id: 'foreign-tag',
      name: 'Foreign'
    }])
  ).toThrow(/does not belong/)

  const createdFromMissingId = setFaProjectDocumentTags(db, seededA.documentId, [{
    id: 'missing-id',
    name: 'Brand New'
  }])
  expect(createdFromMissingId.items[0]?.name).toBe('Brand New')

  expect(() =>
    setFaProjectDocumentTags(db!, seededA.documentId, [{
      id: 'x',
      name: '   ',
      isNew: true
    }])
  ).toThrow(/must not be empty/)
})

/**
 * reorderFaProjectDocumentsUnderTag
 * Reorders membership and rejects mismatched or foreign document ids.
 */
test('Test that reorderFaProjectDocumentsUnderTag updates sort_order and validates membership', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Alpha')
  const second = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Beta',
    sortOrder: 1
  })
  const tagged = setFaProjectDocumentTags(db, seeded.documentId, [{
    id: 't',
    name: 'Party',
    isNew: true
  }])
  const tagId = tagged.items[0]!.id
  setFaProjectDocumentTags(db, second.id, [{
    id: tagId,
    name: 'Party'
  }])

  reorderFaProjectDocumentsUnderTag(db, tagId, [second.id, seeded.documentId])
  expect(listFaProjectDocumentsUnderTag(db, tagId).items.map((item) => item.documentId)).toEqual([
    second.id,
    seeded.documentId
  ])

  expect(() =>
    reorderFaProjectDocumentsUnderTag(db!, tagId, [seeded.documentId])
  ).toThrow(/must match current membership/)
  expect(() =>
    reorderFaProjectDocumentsUnderTag(db!, tagId, [seeded.documentId, 'missing-doc'])
  ).toThrow(/not under this tag/)
  expect(() =>
    reorderFaProjectDocumentsUnderTag(db!, tagId, [seeded.documentId, seeded.documentId])
  ).toThrow(/must match current membership/)
  expect(listFaProjectDocumentsUnderTag(db!, tagId).items.map((item) => item.documentId)).toEqual([
    second.id,
    seeded.documentId
  ])
})

/**
 * setFaProjectDocumentTags
 * Keeps each document's under-tag sort_order when membership is re-saved unchanged.
 */
test('Test that setFaProjectDocumentTags preserves under-tag document sort_order on resave', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Alpha')
  const second = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Beta',
    sortOrder: 1
  })
  const third = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Charlie',
    sortOrder: 2
  })
  const tagged = setFaProjectDocumentTags(db, seeded.documentId, [{
    id: 't',
    name: 'Party',
    isNew: true
  }])
  const tagId = tagged.items[0]!.id
  setFaProjectDocumentTags(db, second.id, [{
    id: tagId,
    name: 'Party'
  }])
  setFaProjectDocumentTags(db, third.id, [{
    id: tagId,
    name: 'Party'
  }])
  reorderFaProjectDocumentsUnderTag(db, tagId, [third.id, seeded.documentId, second.id])
  expect(listFaProjectDocumentsUnderTag(db, tagId).items.map((item) => item.documentId)).toEqual([
    third.id,
    seeded.documentId,
    second.id
  ])
  setFaProjectDocumentTags(db, seeded.documentId, [{
    id: tagId,
    name: 'Party'
  }])
  expect(listFaProjectDocumentsUnderTag(db, tagId).items.map((item) => item.documentId)).toEqual([
    third.id,
    seeded.documentId,
    second.id
  ])
})

/**
 * renameFaProjectTag
 * Supports no-op, case-only rename, free rename, and merge into conflict.
 */
test('Test that renameFaProjectTag renames in place or merges case-insensitive conflicts', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Hero')
  const second = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Sidekick',
    sortOrder: 1
  })
  const firstTags = setFaProjectDocumentTags(db, seeded.documentId, [
    {
      id: 'a',
      name: 'Heroes',
      isNew: true
    },
    {
      id: 'b',
      name: 'Allies',
      isNew: true
    }
  ])
  // listFaProjectDocumentTags orders by name NOCASE — do not assume input array order.
  const heroesId = firstTags.items.find((tag) => tag.name === 'Heroes')!.id
  const alliesId = firstTags.items.find((tag) => tag.name === 'Allies')!.id
  setFaProjectDocumentTags(db, second.id, [
    {
      id: heroesId,
      name: 'Heroes'
    },
    {
      id: alliesId,
      name: 'Allies'
    }
  ])

  expect(renameFaProjectTag(db, heroesId, 'Heroes')).toEqual({
    tag: getFaProjectTagById(db, heroesId),
    merged: false,
    mergedFromTagId: null
  })
  expect(renameFaProjectTag(db, heroesId, 'heroes').tag.name).toBe('heroes')
  expect(renameFaProjectTag(db, heroesId, 'Champions').tag.name).toBe('Champions')

  const merge = renameFaProjectTag(db, alliesId, 'champions')
  expect(merge.merged).toBe(true)
  expect(merge.mergedFromTagId).toBe(alliesId)
  expect(merge.tag.id).toBe(heroesId)
  expect(listFaProjectTagsForWorld(db, seeded.worldId).items).toHaveLength(1)
  expect(listFaProjectDocumentsUnderTag(db, heroesId).items).toHaveLength(2)

  expect(() => renameFaProjectTag(db!, heroesId, '  ')).toThrow(/must not be empty/)
})

/**
 * renameFaProjectTag
 * Tied source membership sort stays in document id order after merge.
 */
test('Test that renameFaProjectTag merge keeps tied source rows in document id order', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Keeper')
  const laterId = createFaProjectDocument(db, {
    id: 'doc-zzz',
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Later',
    sortOrder: 1
  }).id
  const earlierId = createFaProjectDocument(db, {
    id: 'doc-aaa',
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Earlier',
    sortOrder: 2
  }).id
  const sourceTags = setFaProjectDocumentTags(db, laterId, [{
    id: 'source',
    name: 'Source',
    isNew: true
  }])
  const sourceId = sourceTags.items[0]!.id
  setFaProjectDocumentTags(db, earlierId, [{
    id: sourceId,
    name: 'Source'
  }])
  db.prepare('UPDATE document_tags SET sort_order = 0 WHERE tag_id = ?').run(sourceId)
  const targetTags = setFaProjectDocumentTags(db, seeded.documentId, [{
    id: 'target',
    name: 'Target',
    isNew: true
  }])
  const targetId = targetTags.items[0]!.id
  renameFaProjectTag(db, sourceId, 'target')
  expect(listFaProjectDocumentsUnderTag(db, targetId).items.map((item) => item.documentId)).toEqual([
    seeded.documentId,
    earlierId,
    laterId
  ])
})

/**
 * listFaProjectDocumentsUnderTag
 * Equal tag sort and name stay in document creation order, then id.
 */
test('Test that listFaProjectDocumentsUnderTag orders equal sort and name by created time', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Keeper')
  const laterId = createFaProjectDocument(db, {
    id: 'doc-aaa',
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Same',
    sortOrder: 1
  }).id
  const earlierId = createFaProjectDocument(db, {
    id: 'doc-zzz',
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Same',
    sortOrder: 2
  }).id
  const tags = setFaProjectDocumentTags(db, laterId, [{
    id: 'shared',
    name: 'Shared',
    isNew: true
  }])
  const tagId = tags.items[0]!.id
  setFaProjectDocumentTags(db, earlierId, [{
    id: tagId,
    name: 'Shared'
  }])
  db.prepare('UPDATE document_tags SET sort_order = 0 WHERE tag_id = ?').run(tagId)
  db.prepare('UPDATE documents SET created_at_ms = ? WHERE id = ?').run(2000, laterId)
  db.prepare('UPDATE documents SET created_at_ms = ? WHERE id = ?').run(1000, earlierId)
  const items = listFaProjectDocumentsUnderTag(db, tagId).items
  expect(items.map((item) => item.documentId)).toEqual([earlierId, laterId])
  expect(items.map((item) => item.createdAtMs)).toEqual([1000, 2000])
})

/**
 * setFaProjectDocumentTags
 * When assignment id is unknown but the trimmed name already exists, reuses that tag.
 */
test('Test that setFaProjectDocumentTags reuses existing name when assignment id is unknown', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Hero')
  const created = setFaProjectDocumentTags(db, seeded.documentId, [{
    id: 'new',
    name: 'Reuse Me',
    isNew: true
  }])
  const existingId = created.items[0]!.id
  const again = setFaProjectDocumentTags(db, seeded.documentId, [{
    id: 'unknown-id',
    name: 'reuse me'
  }])
  expect(again.items).toHaveLength(1)
  expect(again.items[0]!.id).toBe(existingId)
})

/**
 * deleteFaProjectTag / deleteFaProjectEmptyTagsByIds
 * Deletes tag rows and no-ops empty id lists.
 */
test('Test that deleteFaProjectTag removes membership and empty-tag GC no-ops empty lists', () => {
  db = openTagsTestDb()
  const seeded = seedWorldDoc(db, 'Realm', 'Hero')
  const created = setFaProjectDocumentTags(db, seeded.documentId, [{
    id: 't',
    name: 'Temp',
    isNew: true
  }])
  const tagId = created.items[0]!.id
  deleteFaProjectEmptyTagsByIds(db, [])
  deleteFaProjectEmptyTagsByIds(db, [tagId])
  expect(listFaProjectTagsForWorld(db, seeded.worldId).items).toHaveLength(1)
  deleteFaProjectTag(db, tagId)
  expect(listFaProjectTagsForWorld(db, seeded.worldId).items).toHaveLength(0)
  expect(() => getFaProjectTagById(db!, tagId)).toThrow(FaProjectContentNotFoundError)
})
