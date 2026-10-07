import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../faProjectDbContentSchemaV1Wiring'
import { createFaProjectDocument, updateFaProjectDocument } from '../faProjectDocumentsPersistWiring'
import {
  createFaProjectDocumentTemplate,
  updateFaProjectDocumentTemplate
} from '../faProjectDocumentTemplatesPersistWiring'
import { createFaProjectWorld, updateFaProjectWorld } from '../faProjectWorldsPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'
import { listFaProjectDocumentDistribution } from '../faProjectDocumentDistributionQueryWiring'
import { recordFaProjectDocumentLastOpened } from '../faProjectDocumentLastOpenedPersistWiring'
import { listFaProjectDocumentLastOpened } from '../faProjectDocumentLastOpenedQueryWiring'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

function openQueryTestDb (): Database {
  const connection = new Database(':memory:')
  applyFaProjectContentSchemaV1(connection)
  return connection
}

/**
 * listFaProjectDocumentDistribution
 * Returns placed templates, worlds, per-cell counts, and total document count.
 */
test('Test that listFaProjectDocumentDistribution aggregates placed templates and counts', () => {
  db = openQueryTestDb()
  const worldA = createFaProjectWorld(db, { displayName: 'Alpha' })
  const worldB = createFaProjectWorld(db, { displayName: 'Beta' })
  updateFaProjectWorld(db, worldA.id, { color: '#112233' })
  updateFaProjectWorld(db, worldB.id, { color: '#445566' })
  const template = createFaProjectDocumentTemplate(db, {
    displayName: 'Character',
    icon: 'mdi-account'
  })
  const placementId = 'placement-dist-1'
  for (const world of [worldA, worldB]) {
    replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, {
      groups: [],
      placements: [{
        id: `${placementId}-${world.id}`,
        documentTemplateId: template.id,
        groupId: null,
        rootSortOrder: 0,
        groupSortOrder: null,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {}
      }]
    })
  }
  createFaProjectDocument(db, {
    worldId: worldA.id,
    templateId: template.id,
    placementId: `${placementId}-${worldA.id}`,
    displayName: 'Hero',
    sortOrder: 0
  })
  createFaProjectDocument(db, {
    worldId: worldA.id,
    templateId: template.id,
    placementId: `${placementId}-${worldA.id}`,
    displayName: 'Sidekick',
    sortOrder: 1
  })
  createFaProjectDocument(db, {
    worldId: worldB.id,
    templateId: template.id,
    placementId: `${placementId}-${worldB.id}`,
    displayName: 'Villain',
    sortOrder: 0
  })

  const result = listFaProjectDocumentDistribution(db)
  expect(result.totalDocumentCount).toBe(3)
  expect(result.documentTemplateTotalCount).toBe(1)
  expect(result.templates).toHaveLength(1)
  expect(result.templates[0]!.templateId).toBe(template.id)
  expect(result.templates[0]!.icon).toBe('mdi-account')
  expect(result.templates[0]!.sortOrder).toBe(0)
  expect(result.worlds.map((world) => world.worldId)).toEqual([worldA.id, worldB.id])
  expect(result.worlds[0]!.color.toLowerCase()).toBe('#112233')
  expect(result.counts).toEqual(expect.arrayContaining([
    {
      templateId: template.id,
      worldId: worldA.id,
      documentCount: 2
    },
    {
      templateId: template.id,
      worldId: worldB.id,
      documentCount: 1
    }
  ]))
})

/**
 * listFaProjectDocumentDistribution
 * Empty project returns zero totals and no count cells.
 */
test('Test that listFaProjectDocumentDistribution returns empty aggregates for blank project', () => {
  db = openQueryTestDb()
  const result = listFaProjectDocumentDistribution(db)
  expect(result.templates).toEqual([])
  expect(result.worlds).toEqual([])
  expect(result.counts).toEqual([])
  expect(result.documentTemplateTotalCount).toBe(0)
  expect(result.totalDocumentCount).toBe(0)
})

/**
 * listFaProjectDocumentDistribution
 * Counts all document templates even when none are placed on a world.
 */
test('Test that listFaProjectDocumentDistribution counts unassigned document templates', () => {
  db = openQueryTestDb()
  createFaProjectDocumentTemplate(db, {
    displayName: 'Unassigned',
    icon: 'mdi-file'
  })
  createFaProjectWorld(db, { displayName: 'Solo' })

  const result = listFaProjectDocumentDistribution(db)
  expect(result.documentTemplateTotalCount).toBe(1)
  expect(result.templates).toEqual([])
  expect(result.totalDocumentCount).toBe(0)
})

/**
 * listFaProjectDocumentDistribution
 * Returns placed templates in Project Settings sort_order (not A-Z display name).
 */
test('Test that listFaProjectDocumentDistribution orders templates by sort_order', () => {
  db = openQueryTestDb()
  const world = createFaProjectWorld(db, { displayName: 'Realm' })
  const zebra = createFaProjectDocumentTemplate(db, {
    displayName: 'Zebras',
    icon: 'mdi-z'
  })
  const apples = createFaProjectDocumentTemplate(db, {
    displayName: 'Apples',
    icon: 'mdi-a'
  })
  // Create appends sort_order; flip so A-Z name would disagree with settings order.
  updateFaProjectDocumentTemplate(db, zebra.id, { sortOrder: 0 })
  updateFaProjectDocumentTemplate(db, apples.id, { sortOrder: 1 })
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, {
    groups: [],
    placements: [zebra, apples].map((template, index) => ({
      id: `placement-${template.id}`,
      documentTemplateId: template.id,
      groupId: null,
      rootSortOrder: index,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }))
  })

  const result = listFaProjectDocumentDistribution(db)
  expect(result.templates.map((row) => row.templateId)).toEqual([zebra.id, apples.id])
  expect(result.templates.map((row) => row.sortOrder)).toEqual([0, 1])
})

/**
 * listFaProjectDocumentDistribution
 * Equal sort_order follows created_at_ms, then id — same as the template list.
 */
test('Test that listFaProjectDocumentDistribution orders equal template sort by created time', () => {
  db = openQueryTestDb()
  const world = createFaProjectWorld(db, { displayName: 'Realm' })
  const zebra = createFaProjectDocumentTemplate(db, {
    displayName: 'Zebras',
    icon: 'mdi-z'
  })
  const apples = createFaProjectDocumentTemplate(db, {
    displayName: 'Apples',
    icon: 'mdi-a'
  })
  updateFaProjectDocumentTemplate(db, zebra.id, { sortOrder: 0 })
  updateFaProjectDocumentTemplate(db, apples.id, { sortOrder: 0 })
  const zebraCreated = db.prepare(
    'SELECT created_at_ms AS created_at_ms FROM document_templates WHERE id = ?'
  ).get(zebra.id) as { created_at_ms: number }
  db.prepare('UPDATE document_templates SET created_at_ms = ? WHERE id = ?').run(
    zebraCreated.created_at_ms + 1000,
    apples.id
  )
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, {
    groups: [],
    placements: [zebra, apples].map((template, index) => ({
      id: `placement-tie-${template.id}`,
      documentTemplateId: template.id,
      groupId: null,
      rootSortOrder: index,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }))
  })

  const result = listFaProjectDocumentDistribution(db)
  expect(result.templates.map((row) => row.templateId)).toEqual([zebra.id, apples.id])
})

/**
 * listFaProjectDocumentDistribution
 * Equal world sort_order follows created_at_ms, then id — same as the hierarchy layout.
 */
test('Test that listFaProjectDocumentDistribution orders equal world sort by created time', () => {
  db = openQueryTestDb()
  const earlier = createFaProjectWorld(db, { displayName: 'Later name' })
  const later = createFaProjectWorld(db, { displayName: 'Earlier name' })
  updateFaProjectWorld(db, earlier.id, { sortOrder: 4 })
  updateFaProjectWorld(db, later.id, { sortOrder: 4 })
  const laterCreated = db.prepare(
    'SELECT created_at_ms AS created_at_ms FROM worlds WHERE id = ?'
  ).get(later.id) as { created_at_ms: number }
  db.prepare('UPDATE worlds SET created_at_ms = ? WHERE id = ?').run(
    laterCreated.created_at_ms + 1000,
    earlier.id
  )

  const result = listFaProjectDocumentDistribution(db)
  expect(result.worlds.map((world) => world.worldId)).toEqual([later.id, earlier.id])
})

/**
 * listFaProjectDocumentLastOpened
 * Maps category/dead flags, colors, and null template icon after template delete path.
 */
test('Test that listFaProjectDocumentLastOpened maps flags colors and missing template icon', () => {
  db = openQueryTestDb()
  const world = createFaProjectWorld(db, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db, {
    displayName: 'Note',
    icon: 'mdi-note'
  })
  const placementId = 'placement-query-1'
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, {
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
  const withIcon = createFaProjectDocument(db, {
    worldId: world.id,
    templateId: template.id,
    placementId,
    displayName: 'Alive note',
    sortOrder: 0,
    documentTextColor: '#ff0000',
    documentBackgroundColor: '#00ff00'
  })
  const categoryDead = createFaProjectDocument(db, {
    worldId: world.id,
    templateId: template.id,
    placementId,
    displayName: 'Folder',
    sortOrder: 1,
    isCategory: true,
    isDead: true
  })
  const orphanTemplate = createFaProjectDocument(db, {
    worldId: world.id,
    templateId: null,
    placementId: null,
    displayName: 'No template',
    sortOrder: 2
  })

  recordFaProjectDocumentLastOpened(db, withIcon.id)
  recordFaProjectDocumentLastOpened(db, categoryDead.id)
  recordFaProjectDocumentLastOpened(db, orphanTemplate.id)

  const listed = listFaProjectDocumentLastOpened(db)
  expect(listed.items).toHaveLength(3)

  const orphanItem = listed.items.find((item) => item.documentId === orphanTemplate.id)
  expect(orphanItem).toMatchObject({
    templateId: null,
    templateIcon: '',
    isCategory: false,
    isDead: false
  })

  const flagsItem = listed.items.find((item) => item.documentId === categoryDead.id)
  expect(flagsItem).toMatchObject({
    isCategory: true,
    isDead: true
  })

  const coloredItem = listed.items.find((item) => item.documentId === withIcon.id)
  expect(coloredItem).toMatchObject({
    templateIcon: 'mdi-note',
    documentTextColor: '#FF0000',
    documentBackgroundColor: '#00FF00',
    isCategory: false,
    isDead: false
  })
})

/**
 * listFaProjectDocumentLastOpened
 * Returns empty items when MRU table has no rows.
 */
test('Test that listFaProjectDocumentLastOpened returns empty items when none recorded', () => {
  db = openQueryTestDb()
  expect(listFaProjectDocumentLastOpened(db).items).toEqual([])
})

/**
 * updateFaProjectDocument + listFaProjectDocumentLastOpened
 * Reflects flag updates on subsequent list after record.
 */
test('Test that listFaProjectDocumentLastOpened reflects updated category and dead flags', () => {
  db = openQueryTestDb()
  const world = createFaProjectWorld(db, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db, { displayName: 'Character' })
  const placementId = 'placement-query-2'
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, {
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
  const document = createFaProjectDocument(db, {
    worldId: world.id,
    templateId: template.id,
    placementId,
    displayName: 'Mutable',
    sortOrder: 0
  })
  recordFaProjectDocumentLastOpened(db, document.id)
  updateFaProjectDocument(db, document.id, {
    isCategory: true,
    isDead: true
  })
  const listed = listFaProjectDocumentLastOpened(db)
  expect(listed.items[0]).toMatchObject({
    documentId: document.id,
    isCategory: true,
    isDead: true
  })
})

/**
 * listFaProjectDocumentLastOpened
 * Same opened_at_ms keeps the later row first, matching the MRU trim.
 */
test('Test that listFaProjectDocumentLastOpened orders equal timestamps by newest row', () => {
  db = openQueryTestDb()
  const world = createFaProjectWorld(db, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db, { displayName: 'Character' })
  const placementId = 'placement-query-tie'
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, {
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
  const earlier = createFaProjectDocument(db, {
    worldId: world.id,
    templateId: template.id,
    placementId,
    displayName: 'Earlier',
    sortOrder: 0
  })
  const later = createFaProjectDocument(db, {
    worldId: world.id,
    templateId: template.id,
    placementId,
    displayName: 'Later',
    parentDocumentId: earlier.id,
    sortOrder: 1
  })
  const openedAtMs = 1_700_000_000_000
  db.prepare(
    'INSERT INTO document_last_opened (document_id, opened_at_ms) VALUES (?, ?)'
  ).run(earlier.id, openedAtMs)
  db.prepare(
    'INSERT INTO document_last_opened (document_id, opened_at_ms) VALUES (?, ?)'
  ).run(later.id, openedAtMs)

  const listed = listFaProjectDocumentLastOpened(db)
  expect(listed.items.map((item) => item.documentId)).toEqual([later.id, earlier.id])
})
