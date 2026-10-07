import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../faProjectDbContentSchemaV1Wiring'
import {
  FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN,
  FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../../functions/faProjectDbSchemaDdl'
import {
  assertFaProjectHierarchyNoAncestorCycle,
  collectFaProjectHierarchyAncestorDocumentIds,
  mapFaProjectHierarchyDocumentChildRow,
  readFaProjectDocumentHasChildren,
  shiftFaProjectHierarchySiblingSortOrders
} from '../faProjectHierarchyTreeSqlWiring'
import { createFaProjectDocument } from '../faProjectDocumentsPersistWiring'
import { listFaProjectDocuments } from '../faProjectDocumentsQueryWiring'
import { createFaProjectDocumentTemplate } from '../faProjectDocumentTemplatesPersistWiring'
import { createFaProjectWorld } from '../faProjectWorldsPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

function seedPlacement (connection: Database): string {
  const world = createFaProjectWorld(connection, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(connection, { displayName: 'Character' })
  const placementId = 'placement-1'
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
  createFaProjectDocument(connection, {
    worldId: world.id,
    templateId: template.id,
    placementId,
    displayName: 'Only',
    sortOrder: 0
  })
  return placementId
}

/**
 * shiftFaProjectHierarchySiblingSortOrders
 * No-ops when delta is zero.
 */
test('Test that shiftFaProjectHierarchySiblingSortOrders no-ops when delta is zero', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  const placementId = seedPlacement(db)
  const before = db
    .prepare(
      `SELECT ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ?`
    )
    .get(placementId) as { [key: string]: number }
  shiftFaProjectHierarchySiblingSortOrders(db, placementId, null, 0, 0)
  const after = db
    .prepare(
      `SELECT ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ?`
    )
    .get(placementId) as { [key: string]: number }
  expect(after[FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN])
    .toBe(before[FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN])
})

/**
 * collectFaProjectHierarchyAncestorDocumentIds
 * Stops when parent chain references a missing row.
 */
test('Test that collectFaProjectHierarchyAncestorDocumentIds stops on broken parent chain', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  const ancestors = collectFaProjectHierarchyAncestorDocumentIds(db, 'missing-parent-id')
  expect(ancestors).toEqual(['missing-parent-id'])
})

/**
 * collectFaProjectHierarchyAncestorDocumentIds
 * A parent loop must stop instead of walking forever.
 */
test('Test that collectFaProjectHierarchyAncestorDocumentIds stops when the parent chain loops', () => {
  const connection = new Database(':memory:')
  db = connection
  applyFaProjectContentSchemaV1(connection)
  const placementId = seedPlacement(connection)
  const world = connection.prepare('SELECT world_id FROM documents LIMIT 1').get() as { world_id: string }
  const template = connection.prepare('SELECT template_id FROM documents LIMIT 1').get() as { template_id: string }
  const first = createFaProjectDocument(connection, {
    worldId: world.world_id,
    templateId: template.template_id,
    placementId,
    displayName: 'First',
    sortOrder: 1
  })
  const second = createFaProjectDocument(connection, {
    worldId: world.world_id,
    templateId: template.template_id,
    placementId,
    parentDocumentId: first.id,
    displayName: 'Second',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET ${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} = ? WHERE id = ?`
  ).run(second.id, first.id)
  const ancestors = collectFaProjectHierarchyAncestorDocumentIds(connection, second.id)
  expect(ancestors).toEqual([first.id, second.id])
})

/**
 * shiftFaProjectHierarchySiblingSortOrders
 * Shifts siblings when delta is non-zero without an exclude document id.
 */
test('Test that shiftFaProjectHierarchySiblingSortOrders shifts without exclude id', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  const placementId = seedPlacement(db)
  shiftFaProjectHierarchySiblingSortOrders(db, placementId, null, 0, 1)
  const after = db
    .prepare(
      `SELECT ${FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN} FROM ${FA_PROJECT_TABLE_DOCUMENTS} ` +
        `WHERE ${FA_PROJECT_DOCUMENT_TREE_PLACEMENT_ID_COLUMN} = ?`
    )
    .get(placementId) as { [key: string]: number }
  expect(after[FA_PROJECT_DOCUMENT_TREE_CUSTOM_SORT_ORDER_COLUMN]).toBe(1)
})

/**
 * assertFaProjectHierarchyNoAncestorCycle
 * Tolerates a broken ancestor chain when validating move targets.
 */
test('Test that assertFaProjectHierarchyNoAncestorCycle tolerates broken ancestor chain', () => {
  const connection = new Database(':memory:')
  db = connection
  applyFaProjectContentSchemaV1(connection)
  const placementId = seedPlacement(connection)
  const world = connection.prepare('SELECT world_id FROM documents LIMIT 1').get() as { world_id: string }
  const template = connection.prepare('SELECT template_id FROM documents LIMIT 1').get() as { template_id: string }
  const parent = createFaProjectDocument(connection, {
    worldId: world.world_id,
    templateId: template.template_id,
    placementId,
    displayName: 'Parent',
    sortOrder: 1
  })
  connection.pragma('foreign_keys = OFF')
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET ${FA_PROJECT_DOCUMENT_TREE_PARENT_DOCUMENT_ID_COLUMN} = ? WHERE id = ?`
  ).run('ghost-parent', parent.id)
  expect(() => assertFaProjectHierarchyNoAncestorCycle(connection, parent.id, parent.id)).toThrow()
  assertFaProjectHierarchyNoAncestorCycle(connection, 'other-doc', parent.id)
})

/**
 * mapFaProjectHierarchyDocumentChildRow
 * Maps nullable tree_placement_id to an empty string in child rows.
 */
test('Test that mapFaProjectHierarchyDocumentChildRow maps null placement id to empty string', () => {
  db = new Database(':memory:')
  applyFaProjectContentSchemaV1(db)
  const mapped = mapFaProjectHierarchyDocumentChildRow(db, {
    id: 'doc-1',
    world_id: 'world-1',
    template_id: 'tpl-1',
    tree_placement_id: null,
    tree_parent_document_id: null,
    tree_custom_sort_order: 0,
    display_name: 'Row',
    document_text_color: null,
    document_background_color: null,
    is_category: 0,
    is_finished: 0,
    is_minor: 0,
    is_dead: 0,
    tree_order_number: Number.MIN_SAFE_INTEGER,
    extra_classes: '',
    created_at_ms: 1,
    updated_at_ms: 1
  })
  expect(mapped.placementId).toBe('')
  expect(mapped.documentTextColor).toBeNull()
  expect(mapped.documentBackgroundColor).toBeNull()
  expect(mapped.hasChildren).toBe(false)
  expect(mapped.isFinished).toBe(false)
  expect(mapped.isMinor).toBe(false)
  expect(mapped.isDead).toBe(false)
  expect(readFaProjectDocumentHasChildren(db, 'missing-doc')).toBe(false)
})

/**
 * readFaProjectDocumentHasChildren
 * Ignores children whose placement does not match the parent.
 */
test('Test that readFaProjectDocumentHasChildren ignores a cross-placement child', () => {
  const connection = new Database(':memory:')
  db = connection
  applyFaProjectContentSchemaV1(connection)
  const placementId = seedPlacement(connection)
  const world = connection.prepare('SELECT world_id FROM documents LIMIT 1').get() as { world_id: string }
  const template = connection.prepare('SELECT template_id FROM documents LIMIT 1').get() as { template_id: string }
  const parent = createFaProjectDocument(connection, {
    worldId: world.world_id,
    templateId: template.template_id,
    placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  createFaProjectDocument(connection, {
    worldId: world.world_id,
    templateId: template.template_id,
    placementId: null,
    parentDocumentId: parent.id,
    displayName: 'Unplaced child',
    sortOrder: 0
  })
  expect(readFaProjectDocumentHasChildren(connection, parent.id)).toBe(false)
  createFaProjectDocument(connection, {
    worldId: world.world_id,
    templateId: template.template_id,
    placementId,
    parentDocumentId: parent.id,
    displayName: 'Same placement child',
    sortOrder: 1
  })
  expect(readFaProjectDocumentHasChildren(connection, parent.id)).toBe(true)
})

/**
 * listFaProjectDocuments
 * Equal sort, name, and created time stay in id order (later insert with a smaller id first).
 */
test('Test that listFaProjectDocuments orders equal sort and name by id', () => {
  const connection = new Database(':memory:')
  db = connection
  applyFaProjectContentSchemaV1(connection)
  const world = createFaProjectWorld(connection, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(connection, { displayName: 'Character' })
  createFaProjectDocument(connection, {
    id: 'doc-zzz',
    worldId: world.id,
    templateId: template.id,
    displayName: 'Same',
    sortOrder: 0
  })
  createFaProjectDocument(connection, {
    id: 'doc-aaa',
    worldId: world.id,
    templateId: template.id,
    displayName: 'Same',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET created_at_ms = 1700000000000`
  ).run()
  expect(listFaProjectDocuments(connection).items.map((item) => item.id)).toEqual([
    'doc-aaa',
    'doc-zzz'
  ])
})
