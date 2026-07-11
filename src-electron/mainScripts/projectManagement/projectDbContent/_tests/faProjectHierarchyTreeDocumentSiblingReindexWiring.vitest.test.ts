import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../functions/faProjectDbSchemaDdl'
import { createFaProjectDocument } from '../faProjectDocumentsPersistWiring'
import { createFaProjectDocumentTemplate } from '../faProjectDocumentTemplatesPersistWiring'
import { reindexFaProjectHierarchyDocumentSiblings } from '../faProjectHierarchyTreeDocumentSiblingReindexWiring'
import { listFaProjectPlacementDocumentChildren } from '../faProjectHierarchyTreePersistWiring'
import { createFaProjectWorld } from '../faProjectWorldsPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'

let db: Database | null = null

afterEach(() => {
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
 * reindexFaProjectHierarchyDocumentSiblings
 * Throws when the placement id does not exist.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings throws for missing placement', () => {
  const connection = openHierarchyTestDb()
  db = connection
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: '550e8400-e29b-41d4-a716-446655440000',
    orderedDocumentIds: ['550e8400-e29b-41d4-a716-446655440000'],
    parentDocumentId: null,
    placementId: 'missing-placement'
  })).toThrow('Template placement')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Rejects empty orderedDocumentIds arrays.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings rejects empty ordered ids', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const doc = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Only',
    sortOrder: 0
  })
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: doc.id,
    orderedDocumentIds: [],
    parentDocumentId: null,
    placementId: seeded.placementId
  })).toThrow('orderedDocumentIds must include at least one document id')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Rejects unknown sibling ids that are not the moved document.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings rejects unknown ordered ids', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  const doc = createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Only',
    sortOrder: 0
  })
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: doc.id,
    orderedDocumentIds: [doc.id, '550e8400-e29b-41d4-a716-446655440099'],
    parentDocumentId: null,
    placementId: seeded.placementId
  })).toThrow('Document')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Throws when the moved document id is missing.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings throws for missing moved document', () => {
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: '550e8400-e29b-41d4-a716-446655440000',
    orderedDocumentIds: ['550e8400-e29b-41d4-a716-446655440000'],
    parentDocumentId: null,
    placementId: seeded.placementId
  })).toThrow('Document')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Rejects moved documents anchored to a different placement.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings rejects cross-placement moved document', () => {
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
    templateId: otherTemplate.id,
    placementId: 'placement-2',
    displayName: 'Other placement doc',
    sortOrder: 0
  })
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: doc.id,
    orderedDocumentIds: [doc.id],
    parentDocumentId: null,
    placementId: seeded.placementId
  })).toThrow('same template placement')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Requires every sibling when reordering within the same parent bucket.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings rejects incomplete sibling order', () => {
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
  createFaProjectDocument(connection, {
    worldId: seeded.worldId,
    templateId: seeded.templateId,
    placementId: seeded.placementId,
    displayName: 'Second',
    sortOrder: 1
  })
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: first.id,
    orderedDocumentIds: [first.id],
    parentDocumentId: null,
    placementId: seeded.placementId
  })).toThrow('orderedDocumentIds must include every sibling in the parent bucket')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Rejects parent documents from another placement bucket.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings rejects cross-placement parent', () => {
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
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: doc.id,
    orderedDocumentIds: [doc.id],
    parentDocumentId: otherParent.id,
    placementId: seeded.placementId
  })).toThrow('same template placement')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Rejects moving a document under its own descendant.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings rejects ancestor cycle', () => {
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
  expect(() => reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: parent.id,
    orderedDocumentIds: [parent.id],
    parentDocumentId: child.id,
    placementId: seeded.placementId
  })).toThrow('own descendant')
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Moves a top-level document under a parent and compacts both buckets.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings nests moved document under parent', () => {
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
  const moved = reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: child.id,
    orderedDocumentIds: [child.id],
    parentDocumentId: parent.id,
    placementId: seeded.placementId
  })
  expect(moved.parentDocumentId).toBe(parent.id)
  const topLevel = listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId
  })
  expect(topLevel.items).toHaveLength(1)
  expect(topLevel.items[0]?.id).toBe(parent.id)
  const nested = listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId,
    parentDocumentId: parent.id
  })
  expect(nested.items.map((item) => item.id)).toEqual([child.id])
})

/**
 * reindexFaProjectHierarchyDocumentSiblings
 * Dedupes duplicate ids in orderedDocumentIds before persisting order.
 */
test('Test that reindexFaProjectHierarchyDocumentSiblings dedupes duplicate ordered ids', () => {
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
    displayName: 'Second',
    sortOrder: 1
  })
  reindexFaProjectHierarchyDocumentSiblings(connection, {
    movedDocumentId: second.id,
    orderedDocumentIds: [second.id, first.id, second.id],
    parentDocumentId: null,
    placementId: seeded.placementId
  })
  const children = listFaProjectPlacementDocumentChildren(connection, {
    placementId: seeded.placementId
  })
  expect(children.items.map((item) => item.displayName)).toEqual(['Second', 'First'])
})
