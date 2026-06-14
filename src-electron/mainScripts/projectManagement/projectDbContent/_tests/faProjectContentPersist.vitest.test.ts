import { expect, test, vi } from 'vitest'

import {
  FA_PROJECT_TABLE_MEDIA,
  FA_PROJECT_WORLD_DEFAULT_COLOR
} from '../../functions/faProjectDbSchemaDdl'
import { FaProjectContentNotFoundError } from '../faProjectContentNotFoundError'
import {
  createFaProjectDocument,
  deleteFaProjectDocument,
  getFaProjectDocumentById,
  listFaProjectDocuments,
  setFaProjectDocumentTemplate,
  setFaProjectDocumentWorld,
  updateFaProjectDocument
} from '../faProjectDocumentsPersistWiring'
import {
  createFaProjectDocumentTemplate,
  getFaProjectDocumentTemplateById
} from '../faProjectDocumentTemplatesPersistWiring'
import {
  linkFaProjectDocumentMedia,
  listFaProjectMediaForDocument,
  unlinkFaProjectDocumentMedia
} from '../faProjectDocumentMediaLinksWiring'
import { createFaProjectNamedEntity } from '../faProjectContentNamedEntitySqlWiring'
import {
  createFaProjectMedia,
  getFaProjectMediaById
} from '../faProjectMediaPersistWiring'
import {
  createFaProjectWorld,
  deleteFaProjectWorld,
  getFaProjectWorldById,
  listFaProjectWorlds,
  listFaProjectWorldsForProjectSettings,
  replaceFaProjectWorldsSnapshot,
  updateFaProjectWorld
} from '../faProjectWorldsPersistWiring'
import {
  deleteFaProjectMedia,
  listFaProjectMedia,
  updateFaProjectMedia
} from '../faProjectMediaPersistWiring'
import {
  deleteFaProjectDocumentTemplate,
  listFaProjectDocumentTemplates,
  updateFaProjectDocumentTemplate
} from '../faProjectDocumentTemplatesPersistWiring'
import {
  linkFaProjectWorldDocumentTemplate,
  listFaProjectDocumentTemplatesForWorld,
  listFaProjectWorldsForDocumentTemplate,
  unlinkFaProjectWorldDocumentTemplate
} from '../faProjectWorldDocumentTemplateLinksWiring'

type T_row = Record<string, string | number | null>

function readMockWorldMaxSortOrder (worlds: Map<string, T_row>): number | null {
  let max: number | null = null
  for (const row of worlds.values()) {
    const sortOrder = row.sort_order as number
    if (max === null || sortOrder > max) {
      max = sortOrder
    }
  }
  return max
}

function makeProjectContentTestDb (): {
  db: {
    prepare: ReturnType<typeof vi.fn>
  }
  tables: Record<string, Map<string, T_row>>
  junctionDocumentMedia: Set<string>
  junctionWorldDocumentTemplates: Set<string>
} {
  const tables: Record<string, Map<string, T_row>> = {
    worlds: new Map(),
    document_templates: new Map(),
    media: new Map(),
    documents: new Map()
  }
  const junctionDocumentMedia = new Set<string>()
  const junctionWorldDocumentTemplates = new Set<string>()

  const db = {
    transaction: (fn: () => void) => {
      return () => {
        fn()
      }
    },
    prepare: vi.fn((sql: string) => {
      const normalized = sql.replace(/\s+/g, ' ').trim()
      if (normalized.includes('INSERT INTO worlds')) {
        return {
          run: (...args: Array<string | number>) => {
            const row: T_row = {
              id: args[0] as string,
              display_name: args[1] as string,
              color: args[2] as string,
              color_pallete: args[3] as string,
              sort_order: args[4] as number,
              created_at_ms: args[5] as number,
              updated_at_ms: args[6] as number
            }
            tables.worlds.set(row.id as string, row)
          }
        }
      }
      if (normalized.includes('MAX(sort_order)')) {
        return {
          get: () => {
            return { max_sort: readMockWorldMaxSortOrder(tables.worlds) }
          }
        }
      }
      if (normalized.includes('COUNT(*)') && normalized.includes('worlds')) {
        return {
          get: () => ({ c: tables.worlds.size })
        }
      }
      if (normalized.includes('INSERT INTO document_templates')) {
        return {
          run: (...args: Array<string | number>) => {
            const row: T_row = {
              id: args[0] as string,
              display_name: args[1] as string,
              created_at_ms: args[2] as number,
              updated_at_ms: args[3] as number
            }
            tables.document_templates.set(row.id as string, row)
          }
        }
      }
      if (normalized.includes('INSERT INTO media')) {
        return {
          run: (...args: Array<string | number>) => {
            const row: T_row = {
              id: args[0] as string,
              display_name: args[1] as string,
              created_at_ms: args[2] as number,
              updated_at_ms: args[3] as number
            }
            tables.media.set(row.id as string, row)
          }
        }
      }
      if (normalized.includes('INSERT INTO documents')) {
        return {
          run: (...args: Array<string | number | null>) => {
            const row: T_row = {
              id: args[0] as string,
              world_id: args[1] as string,
              template_id: args[2] as string | null,
              display_name: args[3] as string,
              created_at_ms: args[4] as number,
              updated_at_ms: args[5] as number
            }
            tables.documents.set(row.id as string, row)
          }
        }
      }
      if (normalized.includes('INSERT OR IGNORE INTO document_media')) {
        return {
          run: (documentId: string, mediaId: string) => {
            junctionDocumentMedia.add(`${documentId}:${mediaId}`)
          }
        }
      }
      if (normalized.includes('DELETE FROM document_media')) {
        return {
          run: (documentId: string, mediaId: string) => {
            junctionDocumentMedia.delete(`${documentId}:${mediaId}`)
          }
        }
      }
      if (normalized.includes('INSERT OR IGNORE INTO world_document_templates')) {
        return {
          run: (worldId: string, documentTemplateId: string) => {
            junctionWorldDocumentTemplates.add(`${worldId}:${documentTemplateId}`)
          }
        }
      }
      if (normalized.includes('DELETE FROM world_document_templates')) {
        return {
          run: (worldId: string, documentTemplateId: string) => {
            junctionWorldDocumentTemplates.delete(`${worldId}:${documentTemplateId}`)
          }
        }
      }
      if (normalized.includes('DELETE FROM worlds')) {
        return {
          run: (id: string) => {
            const deleted = tables.worlds.delete(id)
            return { changes: deleted ? 1 : 0 }
          }
        }
      }
      if (normalized.includes('DELETE FROM documents')) {
        return {
          run: (id: string) => {
            const deleted = tables.documents.delete(id)
            return { changes: deleted ? 1 : 0 }
          }
        }
      }
      if (normalized.includes('DELETE FROM media')) {
        return {
          run: (id: string) => {
            const deleted = tables.media.delete(id)
            return { changes: deleted ? 1 : 0 }
          }
        }
      }
      if (normalized.includes('DELETE FROM document_templates')) {
        return {
          run: (id: string) => {
            const deleted = tables.document_templates.delete(id)
            return { changes: deleted ? 1 : 0 }
          }
        }
      }
      if (normalized.includes('UPDATE') && normalized.includes('worlds')) {
        return {
          run: (...args: Array<string | number>) => {
            const id = args[args.length - 1] as string
            const existing = tables.worlds.get(id)
            if (existing === undefined) {
              return
            }
            const patch: T_row = { ...existing }
            let argIdx = 0
            if (normalized.includes('display_name = ?')) {
              patch.display_name = args[argIdx++] as string
            }
            if (normalized.includes('color = ?')) {
              patch.color = args[argIdx++] as string
            }
            if (normalized.includes('color_pallete = ?')) {
              patch.color_pallete = args[argIdx++] as string
            }
            if (normalized.includes('sort_order = ?')) {
              patch.sort_order = args[argIdx++] as number
            }
            if (normalized.includes('updated_at_ms = ?')) {
              patch.updated_at_ms = args[argIdx++] as number
            }
            tables.worlds.set(id, patch)
          }
        }
      }
      if (
        normalized.includes('UPDATE') &&
        normalized.includes('SET display_name = ?')
      ) {
        return {
          run: (displayName: string, updatedAtMs: number, id: string) => {
            const tableName = normalized.includes('document_templates')
              ? 'document_templates'
              : normalized.includes('media')
                ? 'media'
                : null
            if (tableName === null) {
              return
            }
            const existing = tables[tableName].get(id)
            if (existing !== undefined) {
              tables[tableName].set(id, {
                ...existing,
                display_name: displayName,
                updated_at_ms: updatedAtMs
              })
            }
          }
        }
      }
      if (normalized.includes('SELECT id FROM worlds WHERE id = ?')) {
        return {
          get: (id: string) => {
            return tables.worlds.has(id) ? { id } : undefined
          }
        }
      }
      if (normalized.includes('SELECT id FROM documents WHERE id = ?')) {
        return {
          get: (id: string) => {
            return tables.documents.has(id) ? { id } : undefined
          }
        }
      }
      if (normalized.includes('FROM media m') && normalized.includes('document_media')) {
        return {
          all: (documentId: string) => {
            const rows: T_row[] = []
            for (const key of junctionDocumentMedia) {
              const [d, m] = key.split(':')
              if (d === documentId) {
                const media = tables.media.get(m)
                if (media !== undefined) {
                  rows.push(media)
                }
              }
            }
            return rows
          }
        }
      }
      if (normalized.includes('GROUP BY world_id')) {
        return {
          all: () => {
            const counts = new Map<string, number>()
            for (const row of tables.documents.values()) {
              const worldId = row.world_id as string
              counts.set(worldId, (counts.get(worldId) ?? 0) + 1)
            }
            return [...counts.entries()].map(([world_id, c]) => ({
              c,
              world_id
            }))
          }
        }
      }
      if (normalized.includes('SELECT') && normalized.includes('FROM documents')) {
        return {
          get: (id: string) => tables.documents.get(id),
          all: (worldId?: string) => {
            const rows = [...tables.documents.values()]
            if (worldId === undefined) {
              return rows
            }
            return rows.filter((row) => row.world_id === worldId)
          }
        }
      }
      if (normalized.includes('SELECT id FROM media WHERE id = ?')) {
        return {
          get: (id: string) => {
            return tables.media.has(id) ? { id } : undefined
          }
        }
      }
      if (normalized.includes('SELECT') && normalized.includes('FROM worlds')) {
        const sortWorldRows = (): T_row[] => {
          return [...tables.worlds.values()].sort((left, right) => {
            const orderDelta = (left.sort_order as number) - (right.sort_order as number)
            if (orderDelta !== 0) {
              return orderDelta
            }
            const createdDelta = (left.created_at_ms as number) - (right.created_at_ms as number)
            if (createdDelta !== 0) {
              return createdDelta
            }
            return String(left.id).localeCompare(String(right.id))
          })
        }
        return {
          get: (id: string) => tables.worlds.get(id),
          all: () => sortWorldRows()
        }
      }
      if (
        normalized.includes('SELECT') &&
        normalized.includes(`FROM ${FA_PROJECT_TABLE_MEDIA}`) &&
        normalized.includes('ORDER BY')
      ) {
        return {
          get: (id: string) => tables.media.get(id),
          all: () => [...tables.media.values()]
        }
      }
      if (normalized.includes('SELECT') && normalized.includes(`FROM ${FA_PROJECT_TABLE_MEDIA}`)) {
        return {
          get: (id: string) => tables.media.get(id)
        }
      }
      if (
        normalized.includes('INNER JOIN') &&
        normalized.includes('world_document_templates') &&
        normalized.includes('FROM document_templates t')
      ) {
        return {
          all: (worldId: string) => {
            const rows: T_row[] = []
            for (const key of junctionWorldDocumentTemplates) {
              const [w, templateId] = key.split(':')
              if (w === worldId) {
                const template = tables.document_templates.get(templateId)
                if (template !== undefined) {
                  rows.push(template)
                }
              }
            }
            return rows
          }
        }
      }
      if (
        normalized.includes('INNER JOIN') &&
        normalized.includes('world_document_templates') &&
        normalized.includes('FROM worlds w')
      ) {
        return {
          all: (documentTemplateId: string) => {
            const rows: T_row[] = []
            for (const key of junctionWorldDocumentTemplates) {
              const [worldId, templateId] = key.split(':')
              if (templateId === documentTemplateId) {
                const world = tables.worlds.get(worldId)
                if (world !== undefined) {
                  rows.push(world)
                }
              }
            }
            return rows
          }
        }
      }
      if (
        normalized.includes('SELECT') &&
        normalized.includes('document_templates') &&
        normalized.includes('ORDER BY')
      ) {
        return {
          get: (id: string) => tables.document_templates.get(id),
          all: () => [...tables.document_templates.values()]
        }
      }
      if (normalized.includes('SELECT') && normalized.includes('document_templates')) {
        return {
          get: (id: string) => tables.document_templates.get(id)
        }
      }
      if (normalized.includes('UPDATE documents')) {
        return {
          run: (...args: Array<string | number | null>) => {
            const id = args[4] as string
            const existing = tables.documents.get(id)
            if (existing !== undefined) {
              tables.documents.set(id, {
                id,
                world_id: args[0] as string,
                template_id: args[1] as string | null,
                display_name: args[2] as string,
                created_at_ms: existing.created_at_ms as number,
                updated_at_ms: args[3] as number
              })
            }
          }
        }
      }
      throw new Error(`Unmocked SQL in test db: ${normalized}`)
    })
  }

  return {
    db,
    junctionDocumentMedia,
    junctionWorldDocumentTemplates,
    tables
  }
}

/**
 * Project content persist
 * Exercises CRUD and junction helpers against an in-memory mock database.
 */
test('Test that project content persist modules create and link rows', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'World' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  const media = createFaProjectMedia(db as never, { displayName: 'Art' })
  const document = createFaProjectDocument(db as never, {
    displayName: 'Doc',
    templateId: template.id,
    worldId: world.id
  })
  linkFaProjectDocumentMedia(db as never, document.id, media.id)
  expect(listFaProjectWorlds(db as never).items).toHaveLength(1)
  expect(listFaProjectMediaForDocument(db as never, document.id).items).toHaveLength(1)
  setFaProjectDocumentWorld(db as never, document.id, world.id)
  setFaProjectDocumentTemplate(db as never, document.id, null)
  expect(getFaProjectDocumentById(db as never, document.id).templateId).toBeNull()
  expect(listFaProjectDocuments(db as never, { worldId: world.id }).items).toHaveLength(1)
})

/**
 * FaProjectContentNotFoundError
 * Missing ids surface a not-found error from getters.
 */
test('Test that getFaProjectWorldById throws FaProjectContentNotFoundError when absent', () => {
  const { db } = makeProjectContentTestDb()
  expect(() => getFaProjectWorldById(db as never, '550e8400-e29b-41d4-a716-446655440000')).toThrow(
    FaProjectContentNotFoundError
  )
})

/**
 * getFaProjectWorldById
 * Returns a world row that was created in the mock database.
 */
test('Test that getFaProjectWorldById returns a created world row', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Found' })
  expect(getFaProjectWorldById(db as never, world.id).displayName).toBe('Found')
})

/**
 * deleteFaProjectDocument
 * Deleting a document succeeds when the row exists.
 */
test('Test that deleteFaProjectDocument removes an existing document row', () => {
  const { db, tables } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'W' })
  const document = createFaProjectDocument(db as never, {
    displayName: 'D',
    worldId: world.id
  })
  deleteFaProjectDocument(db as never, document.id)
  expect(tables.documents.has(document.id)).toBe(false)
})

/**
 * getFaProjectMediaById
 * Resolves a media row after create.
 */
test('Test that getFaProjectMediaById returns a created media row', () => {
  const { db } = makeProjectContentTestDb()
  const media = createFaProjectMedia(db as never, { displayName: 'Pic' })
  expect(getFaProjectMediaById(db as never, media.id).displayName).toBe('Pic')
})

/**
 * deleteFaProjectWorld
 * delete reports not found when the id never existed.
 */
test('Test that deleteFaProjectWorld throws when the world id is unknown', () => {
  const { db } = makeProjectContentTestDb()
  const prepare = db.prepare as ReturnType<typeof vi.fn>
  prepare.mockImplementationOnce(() => ({
    run: () => ({ changes: 0 })
  }))
  expect(() => deleteFaProjectWorld(db as never, '550e8400-e29b-41d4-a716-446655440000')).toThrow(
    FaProjectContentNotFoundError
  )
})

/**
 * deleteFaProjectWorld
 * Removes an existing world row from the mock store.
 */
test('Test that deleteFaProjectWorld removes an existing world row', () => {
  const { db, tables } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Gone' })
  deleteFaProjectWorld(db as never, world.id)
  expect(tables.worlds.has(world.id)).toBe(false)
})

/**
 * getFaProjectDocumentTemplateById
 * Loads a template row created earlier in the mock database.
 */
test('Test that getFaProjectDocumentTemplateById returns a template row', () => {
  const { db } = makeProjectContentTestDb()
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Sheet' })
  expect(getFaProjectDocumentTemplateById(db as never, template.id).displayName).toBe('Sheet')
})

/**
 * unlinkFaProjectDocumentMedia
 * Unlink is a no-op run on the mock junction set.
 */
test('Test that unlinkFaProjectDocumentMedia invokes delete on the junction table', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'W' })
  const media = createFaProjectMedia(db as never, { displayName: 'M' })
  const document = createFaProjectDocument(db as never, {
    displayName: 'D',
    worldId: world.id
  })
  linkFaProjectDocumentMedia(db as never, document.id, media.id)
  unlinkFaProjectDocumentMedia(db as never, document.id, media.id)
  expect(listFaProjectMediaForDocument(db as never, document.id).items).toHaveLength(0)
})

/**
 * deleteFaProjectDocumentTemplate
 * Template delete removes the row from the mock store.
 */
test('Test that deleteFaProjectDocumentTemplate succeeds for an existing template', () => {
  const { db, tables } = makeProjectContentTestDb()
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'T' })
  deleteFaProjectDocumentTemplate(db as never, template.id)
  expect(tables.document_templates.has(template.id)).toBe(false)
})

/**
 * updateFaProjectWorld
 * Empty patch re-reads the row without mutating display_name.
 */
test('Test that updateFaProjectWorld with an empty patch keeps display name', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Stable' })
  const updated = updateFaProjectWorld(db as never, world.id, {})
  expect(updated.displayName).toBe('Stable')
})

/**
 * updateFaProjectMedia
 * Renames a media row through the shared named-entity update path.
 */
test('Test that updateFaProjectMedia changes display name', () => {
  const { db } = makeProjectContentTestDb()
  const media = createFaProjectMedia(db as never, { displayName: 'Old' })
  const updated = updateFaProjectMedia(db as never, media.id, { displayName: 'New' })
  expect(updated.displayName).toBe('New')
})

/**
 * updateFaProjectDocumentTemplate
 * Renames a template through the shared named-entity update helper.
 */
test('Test that updateFaProjectDocumentTemplate changes display name', () => {
  const { db } = makeProjectContentTestDb()
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Old' })
  const updated = updateFaProjectDocumentTemplate(db as never, template.id, {
    displayName: 'New'
  })
  expect(updated.displayName).toBe('New')
})

/**
 * listFaProjectDocuments
 * Unfiltered list returns every document row.
 */
test('Test that listFaProjectDocuments without filter returns all documents', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'W' })
  createFaProjectDocument(db as never, {
    displayName: 'A',
    worldId: world.id
  })
  createFaProjectDocument(db as never, {
    displayName: 'B',
    worldId: world.id
  })
  expect(listFaProjectDocuments(db as never).items).toHaveLength(2)
})

/**
 * updateFaProjectDocument
 * Patch can update display name on an existing document.
 */
test('Test that updateFaProjectDocument updates display name', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'W' })
  const document = createFaProjectDocument(db as never, {
    displayName: 'Before',
    worldId: world.id
  })
  const updated = updateFaProjectDocument(db as never, document.id, {
    displayName: 'After'
  })
  expect(updated.displayName).toBe('After')
})

/**
 * linkFaProjectDocumentMedia
 * Throws when the document id does not exist.
 */
test('Test that linkFaProjectDocumentMedia throws for a missing document', () => {
  const { db } = makeProjectContentTestDb()
  const media = createFaProjectMedia(db as never, { displayName: 'M' })
  expect(() =>
    linkFaProjectDocumentMedia(
      db as never,
      '550e8400-e29b-41d4-a716-446655440000',
      media.id
    )
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * linkFaProjectDocumentMedia
 * Throws when the media id does not exist.
 */
test('Test that linkFaProjectDocumentMedia throws for a missing media row', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'W' })
  const document = createFaProjectDocument(db as never, {
    displayName: 'D',
    worldId: world.id
  })
  expect(() =>
    linkFaProjectDocumentMedia(
      db as never,
      document.id,
      '550e8400-e29b-41d4-a716-446655440000'
    )
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * listFaProjectMediaForDocument
 * Throws when listing media for a missing document.
 */
test('Test that listFaProjectMediaForDocument throws for a missing document', () => {
  const { db } = makeProjectContentTestDb()
  expect(() =>
    listFaProjectMediaForDocument(db as never, '550e8400-e29b-41d4-a716-446655440000')
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * listFaProjectMedia and listFaProjectDocumentTemplates
 * Named-entity list helpers return created rows.
 */
test('Test that listFaProjectMedia and listFaProjectDocumentTemplates return items', () => {
  const { db } = makeProjectContentTestDb()
  createFaProjectMedia(db as never, { displayName: 'One' })
  createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  expect(listFaProjectMedia(db as never).items).toHaveLength(1)
  expect(listFaProjectDocumentTemplates(db as never).items).toHaveLength(1)
})

/**
 * deleteFaProjectMedia
 * Throws when the media id does not exist.
 */
test('Test that deleteFaProjectMedia throws when the media id is unknown', () => {
  const { db } = makeProjectContentTestDb()
  expect(() =>
    deleteFaProjectMedia(db as never, '550e8400-e29b-41d4-a716-446655440000')
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * deleteFaProjectMedia
 * Media delete removes the row when present.
 */
test('Test that deleteFaProjectMedia removes an existing media row', () => {
  const { db, tables } = makeProjectContentTestDb()
  const media = createFaProjectMedia(db as never, { displayName: 'X' })
  deleteFaProjectMedia(db as never, media.id)
  expect(tables.media.has(media.id)).toBe(false)
})

/**
 * updateFaProjectWorld
 * Display name patch updates the stored world row.
 */
test('Test that updateFaProjectWorld changes display name', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Old' })
  const updated = updateFaProjectWorld(db as never, world.id, { displayName: 'New' })
  expect(updated.displayName).toBe('New')
})

/**
 * updateFaProjectWorld
 * An empty patch returns the existing row without running UPDATE.
 */
test('Test that updateFaProjectWorld with an empty patch returns the existing row', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Stable' })
  const updated = updateFaProjectWorld(db as never, world.id, {})
  expect(updated.displayName).toBe('Stable')
})

/**
 * updateFaProjectMedia
 * An empty patch returns the existing row without running UPDATE.
 */
test('Test that updateFaProjectMedia with an empty patch returns the existing row', () => {
  const { db } = makeProjectContentTestDb()
  const media = createFaProjectMedia(db as never, { displayName: 'Still' })
  const updated = updateFaProjectMedia(db as never, media.id, {})
  expect(updated.displayName).toBe('Still')
})

/**
 * getFaProjectDocumentById
 * Missing document ids throw FaProjectContentNotFoundError.
 */
test('Test that getFaProjectDocumentById throws for a missing document', () => {
  const { db } = makeProjectContentTestDb()
  expect(() =>
    getFaProjectDocumentById(db as never, '550e8400-e29b-41d4-a716-446655440000')
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * deleteFaProjectDocument
 * Delete throws when no row was removed.
 */
test('Test that deleteFaProjectDocument throws when the document is absent', () => {
  const { db } = makeProjectContentTestDb()
  expect(() =>
    deleteFaProjectDocument(db as never, '550e8400-e29b-41d4-a716-446655440000')
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * createFaProjectDocument
 * Creating with a template id validates the template foreign key.
 */
test('Test that createFaProjectDocument accepts a template id', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'W' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  const document = createFaProjectDocument(db as never, {
    displayName: 'Doc',
    templateId: template.id,
    worldId: world.id
  })
  expect(document.templateId).toBe(template.id)
})

/**
 * createFaProjectWorld
 * Assigns default color, zero-based sort_order, and increments order for later worlds.
 */
test('Test that createFaProjectNamedEntity throws when the insert read-back row is missing', () => {
  const db = {
    prepare: vi.fn((sql: string) => {
      const normalized = sql.replace(/\s+/g, ' ').trim()
      if (normalized.includes('INSERT INTO media')) {
        return { run: vi.fn() }
      }
      if (normalized.includes('SELECT') && normalized.includes('FROM media')) {
        return { get: () => undefined }
      }
      throw new Error(`Unmocked SQL: ${normalized}`)
    })
  }
  const mediaSpec = {
    entityLabel: 'Media',
    tableName: FA_PROJECT_TABLE_MEDIA
  }
  expect(() =>
    createFaProjectNamedEntity(db as never, mediaSpec, 'Ghost')
  ).toThrow(FaProjectContentNotFoundError)
})

test('Test that createFaProjectWorld assigns sortOrder and default color', () => {
  const { db } = makeProjectContentTestDb()
  const first = createFaProjectWorld(db as never, { displayName: 'Alpha' })
  const second = createFaProjectWorld(db as never, { displayName: 'Beta' })
  expect(first.sortOrder).toBe(0)
  expect(first.color).toBe(FA_PROJECT_WORLD_DEFAULT_COLOR)
  expect(first.colorPallete).toBe('')
  expect(second.sortOrder).toBe(1)
  expect(listFaProjectWorlds(db as never).items.map((world) => world.displayName)).toEqual([
    'Alpha',
    'Beta'
  ])
})

/**
 * updateFaProjectWorld
 * Persists color and sort_order patches for an existing world row.
 */
test('Test that updateFaProjectWorld persists color and sortOrder', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const updated = updateFaProjectWorld(db as never, world.id, {
    color: '#aabbcc',
    colorPallete: '#112233;#445566',
    displayName: 'Realm 2',
    sortOrder: 4
  })
  expect(updated.displayName).toBe('Realm 2')
  expect(updated.color).toBe('#aabbcc')
  expect(updated.colorPallete).toBe('#112233;#445566')
  expect(updated.sortOrder).toBe(4)
})

/**
 * listFaProjectWorldsForProjectSettings
 * Merges document counts into each world row for Project Settings.
 */
test('Test that listFaProjectWorldsForProjectSettings includes document counts', () => {
  const { db } = makeProjectContentTestDb()
  const emptyWorld = createFaProjectWorld(db as never, { displayName: 'Empty' })
  const busyWorld = createFaProjectWorld(db as never, { displayName: 'Realm' })
  createFaProjectDocument(db as never, {
    displayName: 'Doc A',
    worldId: busyWorld.id
  })
  createFaProjectDocument(db as never, {
    displayName: 'Doc B',
    worldId: busyWorld.id
  })
  const result = listFaProjectWorldsForProjectSettings(db as never)
  expect(result.items).toHaveLength(2)
  const emptyRow = result.items.find((item) => item.id === emptyWorld.id)
  const busyRow = result.items.find((item) => item.id === busyWorld.id)
  expect(emptyRow?.documentCount).toBe(0)
  expect(busyRow?.documentCount).toBe(2)
})

const SAMPLE_WORLD_UUID = '550e8400-e29b-41d4-a716-446655440000'

/**
 * replaceFaProjectWorldsSnapshot
 * Reorders worlds, inserts new ids, and deletes worlds omitted from the snapshot.
 */
test('Test that replaceFaProjectWorldsSnapshot replaces the ordered worlds list', () => {
  const { db, tables } = makeProjectContentTestDb()
  const first = createFaProjectWorld(db as never, { displayName: 'Keep' })
  const second = createFaProjectWorld(db as never, { displayName: 'Remove' })
  replaceFaProjectWorldsSnapshot(db as never, [
    {
      color: '#112233',
      colorPallete: '#aabbcc;#ddeeff',
      displayName: 'Keep renamed',
      id: first.id
    },
    {
      displayName: 'Brand new',
      id: SAMPLE_WORLD_UUID
    }
  ])
  expect(tables.worlds.has(second.id)).toBe(false)
  expect(tables.worlds.has(SAMPLE_WORLD_UUID)).toBe(true)
  const listed = listFaProjectWorlds(db as never).items
  expect(listed.map((world) => world.displayName)).toEqual(['Keep renamed', 'Brand new'])
  expect(listed[0].sortOrder).toBe(0)
  expect(listed[1].sortOrder).toBe(1)
  expect(listed[0].color).toBe('#112233')
  expect(listed[0].colorPallete).toBe('#AABBCC;#DDEEFF')
})

/**
 * replaceFaProjectWorldsSnapshot
 * Rejects an empty snapshot because a project must retain at least one world.
 */
test('Test that replaceFaProjectWorldsSnapshot throws when items is empty', () => {
  const { db } = makeProjectContentTestDb()
  expect(() => replaceFaProjectWorldsSnapshot(db as never, [])).toThrow(
    'Project must contain at least one world'
  )
})

/**
 * faProjectWorldDocumentTemplateLinksWiring
 * Links worlds and document templates through the junction table.
 */
test('Test that world document template link helpers manage junction rows', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  linkFaProjectWorldDocumentTemplate(db as never, world.id, template.id)
  expect(listFaProjectDocumentTemplatesForWorld(db as never, world.id).items[0]?.id).toBe(
    template.id
  )
  expect(listFaProjectWorldsForDocumentTemplate(db as never, template.id).items[0]?.id).toBe(
    world.id
  )
  unlinkFaProjectWorldDocumentTemplate(db as never, world.id, template.id)
  expect(listFaProjectDocumentTemplatesForWorld(db as never, world.id).items).toHaveLength(0)
  linkFaProjectWorldDocumentTemplate(db as never, world.id, template.id)
  expect(listFaProjectDocumentTemplatesForWorld(db as never, world.id).items).toHaveLength(1)
})
