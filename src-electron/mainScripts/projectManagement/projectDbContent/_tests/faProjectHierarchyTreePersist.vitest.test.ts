import Database from 'better-sqlite3'
import { afterEach, expect, test, vi } from 'vitest'

import {
  applyFaProjectContentSchemaV1,
  FA_PROJECT_TABLE_DOCUMENTS,
  FA_PROJECT_TABLE_DOCUMENT_TEMPLATES
} from '../../functions/faProjectDbSchemaDdl'
import { createFaProjectDocument } from '../faProjectDocumentsPersistWiring'
import {
  listFaProjectPlacementDocumentChildren,
  listFaProjectWorkspaceHierarchyLayout,
  moveFaProjectDocumentInHierarchy,
  reindexFaProjectHierarchyDocumentSiblings,
  readFaProjectPlacementDocumentChildCount,
  searchFaProjectHierarchy
} from '../faProjectHierarchyTreePersistWiring'
import {
  planFaProjectHierarchyTestDocumentInserts
} from '../functions/seedFaProjectHierarchyTestDocumentsForPlacements'
import {
  readFaProjectHierarchyTestDocumentSeedEnabled,
  seedFaProjectHierarchyTestDocumentsForPlacements
} from '../faProjectHierarchyTestDocumentSeedWiring'
import { createFaProjectDocumentTemplate } from '../faProjectDocumentTemplatesPersistWiring'
import { createFaProjectWorld } from '../faProjectWorldsPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'

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
 * planFaProjectHierarchyTestDocumentInserts
 * Fills lowest free suffixes up to ten numbered seeds per placement.
 */
test('Test that planFaProjectHierarchyTestDocumentInserts uses lowest free suffixes', () => {
  const plans = planFaProjectHierarchyTestDocumentInserts(
    {
      generateUuid: () => 'uuid-new',
      nowMs: () => 1000
    },
    {
      placementId: 'place-1',
      worldId: 'world-1',
      documentTemplateId: 'tpl-1',
      templateDisplayName: 'Character'
    },
    {
      existingSeedCount: 2,
      usedSuffixes: [1, 2],
      maxSortOrder: 1
    }
  )
  expect(plans).toHaveLength(8)
  expect(plans[0]?.displayName).toBe('Test Document - Character 03')
  expect(plans[0]?.sortOrder).toBe(2)
})

/**
 * seedFaProjectHierarchyTestDocumentsForPlacements
 * Inserts ten numbered seeds when gate enabled and placement is empty.
 */
test('Test that seedFaProjectHierarchyTestDocumentsForPlacements inserts ten rows when enabled', () => {
  vi.stubEnv('NODE_ENV', 'development')
  db = openHierarchyTestDb()
  seedWorldPlacement(db, 'Realm', 'Character')
  const inserted = seedFaProjectHierarchyTestDocumentsForPlacements(db)
  expect(inserted).toBe(10)
  const children = listFaProjectPlacementDocumentChildren(db, {
    placementId: 'placement-1'
  })
  expect(children.items).toHaveLength(10)
  expect(children.items[0]?.displayName).toBe('Test Document - Character 01')
})

/**
 * readFaProjectHierarchyTestDocumentSeedEnabled
 * Respects FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED=0 in non-production.
 */
test('Test that readFaProjectHierarchyTestDocumentSeedEnabled is false when env gate is zero', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED', '0')
  expect(readFaProjectHierarchyTestDocumentSeedEnabled()).toBe(false)
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
 * seedFaProjectHierarchyTestDocumentsForPlacements
 * Skips inserts in production NODE_ENV.
 */
test('Test that seedFaProjectHierarchyTestDocumentsForPlacements returns zero in production', () => {
  vi.stubEnv('NODE_ENV', 'production')
  db = openHierarchyTestDb()
  seedWorldPlacement(db, 'Realm', 'Character')
  expect(seedFaProjectHierarchyTestDocumentsForPlacements(db)).toBe(0)
})

/**
 * readFaProjectHierarchyTestDocumentSeedEnabled
 * Honors FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED=1 in production NODE_ENV.
 */
test('Test that readFaProjectHierarchyTestDocumentSeedEnabled honors force-enable env', () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED', '1')
  expect(readFaProjectHierarchyTestDocumentSeedEnabled()).toBe(true)
})

/**
 * readFaProjectHierarchyTestDocumentSeedEnabled
 * Honors FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED=0 in development NODE_ENV.
 */
test('Test that readFaProjectHierarchyTestDocumentSeedEnabled honors force-disable env', () => {
  vi.stubEnv('NODE_ENV', 'development')
  vi.stubEnv('FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED', '0')
  expect(readFaProjectHierarchyTestDocumentSeedEnabled()).toBe(false)
})

/**
 * readFaProjectHierarchyTestDocumentSeedEnabled
 * Treats unpackaged Electron as dev even when NODE_ENV is production.
 */
test('Test that readFaProjectHierarchyTestDocumentSeedEnabled treats unpackaged electron as dev', () => {
  vi.stubEnv('NODE_ENV', 'production')
  expect(readFaProjectHierarchyTestDocumentSeedEnabled({
    isPackagedOverride: false
  })).toBe(true)
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
 * planFaProjectHierarchyTestDocumentInserts
 * Returns no plans when template display name is blank.
 */
test('Test that planFaProjectHierarchyTestDocumentInserts skips blank template names', () => {
  const plans = planFaProjectHierarchyTestDocumentInserts(
    {
      generateUuid: () => 'uuid-new',
      nowMs: () => 1000
    },
    {
      placementId: 'place-1',
      worldId: 'world-1',
      documentTemplateId: 'tpl-1',
      templateDisplayName: '   '
    },
    {
      existingSeedCount: 0,
      usedSuffixes: [],
      maxSortOrder: null
    }
  )
  expect(plans).toEqual([])
})

/**
 * planFaProjectHierarchyTestDocumentInserts
 * Returns no plans when placement already has ten seeds.
 */
test('Test that planFaProjectHierarchyTestDocumentInserts stops at ten seeds', () => {
  const plans = planFaProjectHierarchyTestDocumentInserts(
    {
      generateUuid: () => 'uuid-new',
      nowMs: () => 1000
    },
    {
      placementId: 'place-1',
      worldId: 'world-1',
      documentTemplateId: 'tpl-1',
      templateDisplayName: 'Character'
    },
    {
      existingSeedCount: 10,
      usedSuffixes: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      maxSortOrder: 9
    }
  )
  expect(plans).toEqual([])
})

/**
 * seedFaProjectHierarchyTestDocumentsForPlacements
 * Skips re-seeding when ten numbered test documents already exist.
 */
test('Test that seedFaProjectHierarchyTestDocumentsForPlacements skips full placements', () => {
  vi.stubEnv('NODE_ENV', 'development')
  const connection = openHierarchyTestDb()
  db = connection
  seedWorldPlacement(connection, 'Realm', 'Character')
  expect(seedFaProjectHierarchyTestDocumentsForPlacements(connection)).toBe(10)
  expect(seedFaProjectHierarchyTestDocumentsForPlacements(connection)).toBe(0)
})

/**
 * seedFaProjectHierarchyTestDocumentsForPlacements
 * Skips placements whose template display name is blank after trim.
 */
test('Test that seedFaProjectHierarchyTestDocumentsForPlacements skips blank template names', () => {
  vi.stubEnv('NODE_ENV', 'development')
  const connection = openHierarchyTestDb()
  db = connection
  const seeded = seedWorldPlacement(connection, 'Realm', 'Character')
  connection.prepare(
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENT_TEMPLATES} SET display_name = ? WHERE id = ?`
  ).run('   ', seeded.templateId)
  expect(seedFaProjectHierarchyTestDocumentsForPlacements(connection)).toBe(0)
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
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET placement_id = NULL WHERE id = ?`
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
    `UPDATE ${FA_PROJECT_TABLE_DOCUMENTS} SET placement_id = NULL WHERE id = ?`
  ).run(loose.id)
  const result = searchFaProjectHierarchy(connection, 'Loose')
  expect(result.hits).toEqual([])
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

/**
 * readFaProjectHierarchyTestDocumentSeedEnabled
 * Assumes packaged when the Electron app object is missing.
 */
test('Test that readFaProjectHierarchyTestDocumentSeedEnabled treats missing electron app as packaged', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('FA_ENABLE_HIERARCHY_TEST_DOCUMENT_SEED', '')
  vi.doMock('electron', () => ({}))
  vi.resetModules()
  const { readFaProjectHierarchyTestDocumentSeedEnabled: readEnabled } = await import('../faProjectHierarchyTestDocumentSeedWiring')
  expect(readEnabled()).toBe(false)
  vi.doUnmock('electron')
  vi.resetModules()
})
