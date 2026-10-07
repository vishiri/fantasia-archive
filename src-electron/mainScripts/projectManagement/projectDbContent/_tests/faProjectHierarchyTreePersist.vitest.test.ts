import Database from 'better-sqlite3'
import { afterEach, expect, test, vi } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../faProjectDbContentSchemaV1Wiring'
import {
  FA_PROJECT_TABLE_DOCUMENTS
} from '../../functions/faProjectDbSchemaDdl'
import {
  createFaProjectDocument,
  deleteFaProjectDocument,
  getFaProjectDocumentById,
  updateFaProjectDocument
} from '../faProjectDocumentsPersistWiring'
import {
  listFaProjectPlacementDocumentChildren,
  listFaProjectWorkspaceHierarchyLayout,
  moveFaProjectDocumentInHierarchy,
  reindexFaProjectHierarchyDocumentSiblings,
  readFaProjectPlacementDocumentChildCount,
  searchFaProjectHierarchy
} from '../faProjectHierarchyTreePersistWiring'
import { createFaProjectDocumentTemplate } from '../faProjectDocumentTemplatesPersistWiring'
import { createFaProjectWorld } from '../faProjectWorldsPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'
import { deleteFaProjectDocumentsForPlacementId } from '../faProjectWorldTemplateLayoutSqlWiring'

let db: Database | null = null

afterEach(() => {
  vi.unstubAllEnvs()
  db?.close()
  db = null
})

function openHierarchyTestDb (): Database {
  const connection = new Database(':memory:')
  applyFaProjectContentSchemaV1(connection)
  return connection
}

function seedWorldPlacement (
  connection: Database,
  worldName: string,
  templateName: string
): { placementId: string, templateId: string, worldId: string } {
  const world = createFaProjectWorld(connection, { displayName: worldName })
  const template = createFaProjectDocumentTemplate(connection, { displayName: templateName })
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
  return {
    placementId,
    templateId: template.id,
    worldId: world.id
  }
}

/**
 * listFaProjectWorkspaceHierarchyLayout
 * Returns worlds with groups, placements, and hasChildren flags.
 */
test('Test that listFaProjectWorkspaceHierarchyLayout returns placement skeleton rows', () => {
  db = openHierarchyTestDb()
  const seeded = seedWorldPlacement(db, 'Realm', 'Character')
  createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Hero',
    sortOrder: 0
  })
  const layout = listFaProjectWorkspaceHierarchyLayout(db)
  expect(layout.worlds).toHaveLength(1)
  expect(layout.worlds[0]?.colorPalette).toBe('')
  expect(layout.worlds[0]?.placements).toHaveLength(1)
  expect(layout.worlds[0]?.placements[0]?.hasChildren).toBe(true)
})

/**
 * listFaProjectPlacementDocumentChildren
 * Lists top-level documents ordered by sort_order.
 */
test('Test that listFaProjectPlacementDocumentChildren returns sibling rows', () => {
  db = openHierarchyTestDb()
  const seeded = seedWorldPlacement(db, 'Realm', 'Character')
  createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Alpha',
    sortOrder: 0
  })
  createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Beta',
    sortOrder: 1
  })
  const children = listFaProjectPlacementDocumentChildren(db, {
    placementId: seeded.placementId
  })
  expect(children.items).toHaveLength(2)
  expect(children.items[0]?.displayName).toBe('Alpha')
  expect(children.items[1]?.displayName).toBe('Beta')
})

/**
 * moveFaProjectDocumentInHierarchy
 * Reorders siblings within the same placement parent bucket.
 */
test('Test that moveFaProjectDocumentInHierarchy updates sort_order within placement', () => {
  db = openHierarchyTestDb()
  const seeded = seedWorldPlacement(db, 'Realm', 'Character')
  const first = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'First',
    sortOrder: 0
  })
  createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Second',
    sortOrder: 1
  })
  moveFaProjectDocumentInHierarchy(db, {
    documentId: first.id,
    targetParentDocumentId: null,
    targetSortOrder: 1
  })
  const children = listFaProjectPlacementDocumentChildren(db, {
    placementId: seeded.placementId
  })
  expect(children.items[0]?.displayName).toBe('Second')
  expect(children.items[1]?.displayName).toBe('First')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Persists full sibling bucket order from tree drag-and-drop.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings applies ordered sibling ids', () => {
  db = openHierarchyTestDb()
  const seeded = seedWorldPlacement(db, 'Realm', 'Buildings')
  const first = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'First',
    sortOrder: 0
  })
  const second = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Second',
    sortOrder: 1
  })
  const third = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Third',
    sortOrder: 2
  })
  reindexFaProjectHierarchyDocumentSiblings(db, {
    movedDocumentId: first.id,
    orderedDocumentIds: [third.id, first.id, second.id],
    parentDocumentId: null,
    placementId: seeded.placementId
  })
  const children = listFaProjectPlacementDocumentChildren(db, {
    placementId: seeded.placementId
  })
  expect(children.items.map((item) => item.displayName)).toEqual(['Third', 'First', 'Second'])
})

/**
 * searchFaProjectHierarchy
 * Returns LIKE matches with ancestor document ids.
 */
test('Test that searchFaProjectHierarchy returns display_name matches', () => {
  db = openHierarchyTestDb()
  const seeded = seedWorldPlacement(db, 'Realm', 'Character')
  const parent = createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent Doc',
    sortOrder: 0
  })
  createFaProjectDocument(db, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Nested Find Me',
    sortOrder: 0
  })
  const result = searchFaProjectHierarchy(db, 'find')
  expect(result.hits).toHaveLength(1)
  expect(result.hits[0]?.ancestorDocumentIds).toEqual([parent.id])
})

/**
 * searchFaProjectHierarchy
 * Returns empty hits for blank query without hitting LIKE.
 */
test('Test that searchFaProjectHierarchy returns empty hits for blank query', () => {
  db = openHierarchyTestDb()
  const result = searchFaProjectHierarchy(db, '   ')
  expect(result.hits).toEqual([])
})

/**
 * listFaProjectPlacementDocumentChildren
 * Throws when placement id is unknown.
 */
test('Test that listFaProjectPlacementDocumentChildren throws for missing placement', () => {
  const connection = openHierarchyTestDb()
  db = connection
  expect(() => listFaProjectPlacementDocumentChildren(connection, {
    placementId: 'missing-placement'
  })).toThrow('Template placement')
})

/**
 * moveFaProjectDocumentInHierarchy
 * Rejects moving a document under its own descendant.
 */
test('Test that moveFaProjectDocumentInHierarchy rejects ancestor cycle', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  expect(() => moveFaProjectDocumentInHierarchy(connection, {
    documentId: parent.id,
    targetParentDocumentId: child.id,
    targetSortOrder: 0
  })).toThrow()
})

/**
 * moveFaProjectDocumentInHierarchy
 * A pre-existing parent loop must not hang the ancestor walk.
 */
test('Test that moveFaProjectDocumentInHierarchy finishes when the target parent chain already loops', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const first = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'First',
    sortOrder: 0
  })
  const second = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: first.id,
    displayName: 'Second',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_parent_document_id = ? WHERE id = ?`
  ).run(second.id, first.id)
  const outsider = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Outsider',
    sortOrder: 1
  })
  moveFaProjectDocumentInHierarchy(connection, {
    documentId: outsider.id,
    targetParentDocumentId: first.id,
    targetSortOrder: 0
  })
  expect(getFaProjectDocumentById(connection, outsider.id).parentDocumentId).toBe(first.id)
})

/**
 * listFaProjectWorkspaceHierarchyLayout
 * Reports group hasChildren when a placement references the group.
 */
test('Test that listFaProjectWorkspaceHierarchyLayout marks groups with placements', () => {
  db = openHierarchyTestDb()
  const world = createFaProjectWorld(db, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db, { displayName: 'Character' })
  const groupId = 'group-1'
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, {
    groups: [{
      id: groupId,
      displayName: 'People',
      displayNameTranslations: { 'en-US': 'People' },
      rootSortOrder: 0
    }],
    placements: [{
      id: 'placement-grouped',
      documentTemplateId: template.id,
      groupId,
      rootSortOrder: null,
      groupSortOrder: 0,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }]
  })
  const layout = listFaProjectWorkspaceHierarchyLayout(db)
  expect(layout.worlds[0]?.groups[0]?.hasChildren).toBe(true)
})

/**
 * readFaProjectPlacementDocumentChildCount
 * Counts nested documents under a parent document id.
 */
test('Test that readFaProjectPlacementDocumentChildCount counts nested children', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  expect(readFaProjectPlacementDocumentChildCount(connection, seeded.placementId, parent.id)).toBe(1)
})

/**
 * listFaProjectPlacementDocumentChildren
 * Lists nested children when parentDocumentId is set.
 */
test('Test that listFaProjectPlacementDocumentChildren lists nested rows', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Nested',
    sortOrder: 0
  })
  const children = listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId,
    parentDocumentId: parent.id
  })
  expect(children.items).toHaveLength(1)
  expect(children.items[0]?.hasChildren).toBe(false)
})

/**
 * moveFaProjectDocumentInHierarchy
 * Throws when document id is missing.
 */
test('Test that moveFaProjectDocumentInHierarchy throws for missing document', () => {
  const connection = openHierarchyTestDb()
  db = connection
  seedWorldPlacement(connection, 'Realm', 'Character')
  expect(() => moveFaProjectDocumentInHierarchy(connection, {
    documentId: 'missing-doc',
    targetParentDocumentId: null,
    targetSortOrder: 0
  })).toThrow('Document')
})

/**
 * moveFaProjectDocumentInHierarchy
 * Rejects parent from a different placement.
 */
test('Test that moveFaProjectDocumentInHierarchy rejects cross-placement parent', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const otherTemplate = createFaProjectDocumentTemplate(connection, { displayName: 'Location' })
  replaceFaProjectWorldTemplateLayoutSnapshot(connection, seeded.worldId, {
    groups: [],
    placements: [
      {
        id: seeded.placementId,
        documentTemplateId: seeded.templateId,
        groupId: null,
        rootSortOrder: 0,
        groupSortOrder: null,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {}
      },
      {
        id: 'placement-2',
        documentTemplateId: otherTemplate.id,
        groupId: null,
        rootSortOrder: 1,
        groupSortOrder: null,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {}
      }
    ]
  })
  const doc = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Mover',
    sortOrder: 0
  })
  const otherParent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: otherTemplate.id,
    placementId: 'placement-2',
    displayName: 'Other Parent',
    sortOrder: 0
  })
  expect(() => moveFaProjectDocumentInHierarchy(connection, {
    documentId: doc.id,
    targetParentDocumentId: otherParent.id,
    targetSortOrder: 0
  })).toThrow('same template placement')
})

/**
 * searchFaProjectHierarchy
 * Escapes LIKE wildcard characters in the query.
 */
test('Test that searchFaProjectHierarchy escapes LIKE wildcard characters', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: '100% complete',
    sortOrder: 0
  })
  const result = searchFaProjectHierarchy(connection, '100%')
  expect(result.hits).toHaveLength(1)
})

/**
 * moveFaProjectDocumentInHierarchy
 * Rejects documents that are not anchored to a placement.
 */
test('Test that moveFaProjectDocumentInHierarchy rejects unanchored documents', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const doc = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    displayName: 'Loose Doc'
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_placement_id = NULL WHERE id = ?`
  ).run(doc.id)
  expect(() => moveFaProjectDocumentInHierarchy(connection, {
    documentId: doc.id,
    targetParentDocumentId: null,
    targetSortOrder: 0
  })).toThrow('not anchored')
})

/**
 * listFaProjectPlacementDocumentChildren
 * Throws when parent document id does not exist.
 */
test('Test that listFaProjectPlacementDocumentChildren throws for missing parent', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  expect(() => listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId,
    parentDocumentId: 'missing-parent'
  })).toThrow('Document')
})

/**
 * readFaProjectPlacementDocumentChildCount
 * Returns zero for an empty parent bucket.
 */
test('Test that readFaProjectPlacementDocumentChildCount returns zero when empty', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  expect(readFaProjectPlacementDocumentChildCount(connection, seeded.placementId, null)).toBe(0)
})

/**
 * moveFaProjectDocumentInHierarchy
 * Moves a document under a valid parent within the same placement.
 */
test('Test that moveFaProjectDocumentInHierarchy nests document under parent', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Child',
    sortOrder: 1
  })
  const moved = moveFaProjectDocumentInHierarchy(connection, {
    documentId: child.id,
    targetParentDocumentId: parent.id,
    targetSortOrder: 0
  })
  expect(moved.parentDocumentId).toBe(parent.id)
  const nested = listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId,
    parentDocumentId: parent.id
  })
  expect(nested.items).toHaveLength(1)
})

/**
 * searchFaProjectHierarchy
 * Ignores documents that are not anchored to a placement.
 */
test('Test that searchFaProjectHierarchy ignores documents without placement_id', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const loose = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    displayName: 'Loose Match',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_placement_id = NULL WHERE id = ?`
  ).run(loose.id)
  const result = searchFaProjectHierarchy(connection, 'Loose')
  expect(result.hits).toEqual([])
})

/**
 * deleteFaProjectDocument
 * A placed document with no children deletes without a reparent pass.
 */
test('Test that deleteFaProjectDocument removes a placed document that has no children', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const leaf = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Leaf',
    sortOrder: 0
  })
  deleteFaProjectDocument(connection, leaf.id)
  expect(() => getFaProjectDocumentById(connection, leaf.id)).toThrow('Document')
})

/**
 * deleteFaProjectDocument
 * A child moved to another placement root sorts after siblings already there.
 */
test('Test that deleteFaProjectDocument places a foreign-placement child after existing roots', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const otherTemplate = createFaProjectDocumentTemplate(connection, { displayName: 'Place' })
  const otherPlacementId = 'placement-other-roots'
  replaceFaProjectWorldTemplateLayoutSnapshot(connection, seeded.worldId, {
    groups: [],
    placements: [
      {
        id: seeded.placementId,
        documentTemplateId: seeded.templateId,
        groupId: null,
        rootSortOrder: 0,
        groupSortOrder: null,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {}
      },
      {
        id: otherPlacementId,
        documentTemplateId: otherTemplate.id,
        groupId: null,
        rootSortOrder: 1,
        groupSortOrder: null,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {}
      }
    ]
  })
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const anchor = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: otherTemplate.id,
    placementId: otherPlacementId,
    displayName: 'Anchor',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: otherTemplate.id,
    placementId: otherPlacementId,
    displayName: 'Other child',
    sortOrder: 1
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_parent_document_id = ? WHERE id = ?`
  ).run(parent.id, child.id)
  deleteFaProjectDocument(connection, parent.id)
  const kept = getFaProjectDocumentById(connection, child.id)
  expect(kept.parentDocumentId).toBeNull()
  expect(kept.sortOrder).toBeGreaterThan(getFaProjectDocumentById(connection, anchor.id).sortOrder)
})

/**
 * deleteFaProjectDocument
 * Promotes direct children to top level at the deleted document sort order.
 */
test('Test that deleteFaProjectDocument promotes direct children to top level at deleted sort order', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const sibling = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Sibling',
    sortOrder: 1
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  deleteFaProjectDocument(connection, parent.id)
  const promoted = getFaProjectDocumentById(connection, child.id)
  expect(promoted.parentDocumentId).toBeNull()
  expect(promoted.sortOrder).toBe(0)
  expect(() => getFaProjectDocumentById(connection, parent.id)).toThrow('Document')
  const topLevel = listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId,
    parentDocumentId: null
  })
  expect(topLevel.items.map((row) => row.id)).toEqual([child.id, sibling.id])
})

/**
 * deleteFaProjectDocument
 * Promotes nested children into the deleted parent sibling bucket.
 */
test('Test that deleteFaProjectDocument promotes nested children into deleted parent sibling bucket', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const grandparent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Grandparent',
    sortOrder: 0
  })
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: grandparent.id,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  deleteFaProjectDocument(connection, parent.id)
  const promoted = getFaProjectDocumentById(connection, child.id)
  expect(promoted.parentDocumentId).toBe(grandparent.id)
  expect(promoted.sortOrder).toBe(0)
  expect(() => getFaProjectDocumentById(connection, parent.id)).toThrow('Document')
  const nested = listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId,
    parentDocumentId: grandparent.id
  })
  expect(nested.items.map((row) => row.id)).toEqual([child.id])
})

/**
 * deleteFaProjectDocument
 * A parent loop must not block delete or cascade-remove the other document.
 */
test('Test that deleteFaProjectDocument removes one side of a parent loop and keeps the other', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const first = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'First',
    sortOrder: 0
  })
  const second = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: first.id,
    displayName: 'Second',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_parent_document_id = ? WHERE id = ?`
  ).run(second.id, first.id)
  deleteFaProjectDocument(connection, first.id)
  expect(() => getFaProjectDocumentById(connection, first.id)).toThrow('Document')
  const kept = getFaProjectDocumentById(connection, second.id)
  expect(kept.parentDocumentId).toBeNull()
})

/**
 * deleteFaProjectDocument
 * An unplaced parent must not cascade-delete children that still have a placement.
 */
test('Test that deleteFaProjectDocument keeps children when the deleted parent has no placement', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_placement_id = NULL WHERE id = ?`
  ).run(parent.id)
  deleteFaProjectDocument(connection, parent.id)
  expect(() => getFaProjectDocumentById(connection, parent.id)).toThrow('Document')
  const kept = getFaProjectDocumentById(connection, child.id)
  expect(kept.parentDocumentId).toBeNull()
  expect(kept.placementId).toBe(seeded.placementId)
})

/**
 * deleteFaProjectDocument
 * A child in another placement must survive delete instead of failing the move.
 */
test('Test that deleteFaProjectDocument keeps a child anchored in another placement', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const otherTemplate = createFaProjectDocumentTemplate(connection, { displayName: 'Place' })
  const otherPlacementId = 'placement-other'
  replaceFaProjectWorldTemplateLayoutSnapshot(connection, seeded.worldId, {
    groups: [],
    placements: [
      {
        id: seeded.placementId,
        documentTemplateId: seeded.templateId,
        groupId: null,
        rootSortOrder: 0,
        groupSortOrder: null,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {}
      },
      {
        id: otherPlacementId,
        documentTemplateId: otherTemplate.id,
        groupId: null,
        rootSortOrder: 1,
        groupSortOrder: null,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {}
      }
    ]
  })
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: otherTemplate.id,
    placementId: otherPlacementId,
    displayName: 'Other child',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_parent_document_id = ? WHERE id = ?`
  ).run(parent.id, child.id)
  deleteFaProjectDocument(connection, parent.id)
  expect(() => getFaProjectDocumentById(connection, parent.id)).toThrow('Document')
  const kept = getFaProjectDocumentById(connection, child.id)
  expect(kept.parentDocumentId).toBeNull()
  expect(kept.placementId).toBe(otherPlacementId)
})

/**
 * deleteFaProjectDocument
 * An unplaced child of a placed parent must survive delete.
 */
test('Test that deleteFaProjectDocument keeps an unplaced child of a placed parent', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: null,
    parentDocumentId: parent.id,
    displayName: 'Unplaced child'
  })
  deleteFaProjectDocument(connection, parent.id)
  expect(() => getFaProjectDocumentById(connection, parent.id)).toThrow('Document')
  const kept = getFaProjectDocumentById(connection, child.id)
  expect(kept.parentDocumentId).toBeNull()
  expect(kept.placementId).toBeNull()
})

/**
 * deleteFaProjectDocumentsForPlacementId
 * Documents in another placement must survive when their parent placement is removed.
 */
test('Test that deleteFaProjectDocumentsForPlacementId keeps documents outside that placement', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const otherTemplate = createFaProjectDocumentTemplate(connection, { displayName: 'Location' })
  replaceFaProjectWorldTemplateLayoutSnapshot(connection, seeded.worldId, {
    groups: [],
    placements: [{
      id: seeded.placementId,
      documentTemplateId: seeded.templateId,
      groupId: null,
      rootSortOrder: 0,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }, {
      id: 'placement-2',
      documentTemplateId: otherTemplate.id,
      groupId: null,
      rootSortOrder: 1,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }]
  })
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  const outsider = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: otherTemplate.id,
    placementId: 'placement-2',
    displayName: 'Outsider',
    sortOrder: 0
  })
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET tree_parent_document_id = ? WHERE id = ?`
  ).run(parent.id, outsider.id)
  deleteFaProjectDocumentsForPlacementId(connection, seeded.placementId)
  expect(() => getFaProjectDocumentById(connection, parent.id)).toThrow('Document')
  expect(() => getFaProjectDocumentById(connection, child.id)).toThrow('Document')
  const kept = getFaProjectDocumentById(connection, outsider.id)
  expect(kept.parentDocumentId).toBeNull()
  expect(kept.placementId).toBe('placement-2')
})

/**
 * updateFaProjectDocument
 * Parent edits must reject a descendant the same way hierarchy move does.
 */
test('Test that updateFaProjectDocument rejects a parent that is a descendant', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  expect(() => updateFaProjectDocument(connection, parent.id, {
    parentDocumentId: child.id
  })).toThrow('own descendant')
  expect(getFaProjectDocumentById(connection, parent.id).parentDocumentId).toBeNull()
  const outsider = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Outsider',
    sortOrder: 1
  })
  const nested = updateFaProjectDocument(connection, outsider.id, {
    parentDocumentId: parent.id
  })
  expect(nested.parentDocumentId).toBe(parent.id)
})

/**
 * createFaProjectDocument
 * A parent from another placement would hide the new document from both trees.
 */
test('Test that createFaProjectDocument rejects a parent from another placement', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const otherTemplate = createFaProjectDocumentTemplate(connection, { displayName: 'Location' })
  replaceFaProjectWorldTemplateLayoutSnapshot(connection, seeded.worldId, {
    groups: [],
    placements: [{
      id: seeded.placementId,
      documentTemplateId: seeded.templateId,
      groupId: null,
      rootSortOrder: 0,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }, {
      id: 'placement-2',
      documentTemplateId: otherTemplate.id,
      groupId: null,
      rootSortOrder: 1,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }]
  })
  const otherParent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: otherTemplate.id,
    placementId: 'placement-2',
    displayName: 'Other Parent',
    sortOrder: 0
  })
  expect(() => createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: otherParent.id,
    displayName: 'Hidden Child',
    sortOrder: 0
  })).toThrow('same template placement')
})

/**
 * updateFaProjectDocument
 * Moving only the placement while a parent stays behind hides the document.
 */
test('Test that updateFaProjectDocument rejects a placement that leaves the parent behind', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const otherTemplate = createFaProjectDocumentTemplate(connection, { displayName: 'Location' })
  replaceFaProjectWorldTemplateLayoutSnapshot(connection, seeded.worldId, {
    groups: [],
    placements: [{
      id: seeded.placementId,
      documentTemplateId: seeded.templateId,
      groupId: null,
      rootSortOrder: 0,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }, {
      id: 'placement-2',
      documentTemplateId: otherTemplate.id,
      groupId: null,
      rootSortOrder: 1,
      groupSortOrder: null,
      nickname: '',
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {}
    }]
  })
  const parent = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Parent',
    sortOrder: 0
  })
  const child = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    parentDocumentId: parent.id,
    displayName: 'Child',
    sortOrder: 0
  })
  expect(() => updateFaProjectDocument(connection, child.id, {
    placementId: 'placement-2',
    templateId: otherTemplate.id
  })).toThrow('same template placement')
  expect(getFaProjectDocumentById(connection, child.id).placementId).toBe(seeded.placementId)
  const moved = updateFaProjectDocument(connection, child.id, {
    parentDocumentId: null,
    placementId: 'placement-2',
    templateId: otherTemplate.id
  })
  expect(moved.placementId).toBe('placement-2')
  expect(moved.parentDocumentId).toBeNull()
})

/**
 * readFaProjectPlacementDocumentChildCount
 * Returns zero when SQLite count row is absent.
 */
test('Test that readFaProjectPlacementDocumentChildCount returns zero without count row', () => {
  const connection = {
    prepare: vi.fn(() => ({
      get: vi.fn(() => undefined)
    }))
  }
  expect(readFaProjectPlacementDocumentChildCount(connection as never, 'placement-1', null)).toBe(0)
})
