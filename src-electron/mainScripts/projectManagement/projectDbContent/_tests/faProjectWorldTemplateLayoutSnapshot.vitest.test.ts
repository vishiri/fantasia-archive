import Database from 'better-sqlite3'
import { afterEach, expect, test } from 'vitest'

import { applyFaProjectContentSchemaV1 } from '../../faProjectDbContentSchemaV1Wiring'
import { createFaProjectDocument } from '../faProjectDocumentsPersistWiring'
import { getFaProjectDocumentById } from '../faProjectDocumentsQueryWiring'
import { createFaProjectDocumentTemplate } from '../faProjectDocumentTemplatesPersistWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'
import {
  createFaProjectWorld,
  listFaProjectWorldsForProjectSettings
} from '../faProjectWorldsPersistWiring'

let db: Database | null = null

afterEach(() => {
  db?.close()
  db = null
})

/**
 * replaceFaProjectWorldTemplateLayoutSnapshot
 * Removing a group keeps its placements. Those rows must leave the group before the group row is deleted.
 */
test('Test that replaceFaProjectWorldTemplateLayoutSnapshot keeps placements when a group is removed', () => {
  db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  applyFaProjectContentSchemaV1(db)
  const world = createFaProjectWorld(db, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db, { displayName: 'Character' })
  const groupId = 'group-layout-1'
  const placementId = 'placement-layout-1'
  const groupedLayout = {
    groups: [
      {
        displayName: 'Creatures',
        displayNameTranslations: { 'en-US': 'Creatures' },
        id: groupId,
        rootSortOrder: 0
      }
    ],
    placements: [
      {
        documentTemplateId: template.id,
        groupId,
        groupSortOrder: 0,
        id: placementId,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        rootSortOrder: null
      }
    ]
  }
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, groupedLayout)
  const document = createFaProjectDocument(db, {
    displayName: 'Hero',
    placementId,
    sortOrder: 0,
    templateId: template.id,
    worldId: world.id
  })
  const rootLayout = {
    groups: [],
    placements: [
      {
        documentTemplateId: template.id,
        groupId: null,
        groupSortOrder: null,
        id: placementId,
        nickname: '',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        rootSortOrder: 0
      }
    ]
  }
  replaceFaProjectWorldTemplateLayoutSnapshot(db, world.id, rootLayout)
  const listed = listFaProjectWorldsForProjectSettings(db)
  const layout = listed.items[0]?.templateLayout
  const placement = layout?.placements[0]
  expect(layout?.groups).toEqual([])
  expect(placement?.id).toBe(placementId)
  expect(placement?.groupId).toBeNull()
  expect(placement?.rootSortOrder).toBe(0)
  expect(getFaProjectDocumentById(db, document.id).id).toBe(document.id)
})
