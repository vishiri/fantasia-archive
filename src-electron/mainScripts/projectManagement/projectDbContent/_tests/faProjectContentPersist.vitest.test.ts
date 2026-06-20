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
  deleteFaProjectDocumentTemplate,
  getFaProjectDocumentTemplateById,
  listFaProjectDocumentTemplates,
  listFaProjectDocumentTemplatesForProjectSettings,
  replaceFaProjectDocumentTemplatesSnapshot,
  updateFaProjectDocumentTemplate
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
import { assertFaProjectDocumentTemplateExists } from '../faProjectDocumentTemplatesSqlWiring'
import { replaceFaProjectWorldTemplateLayoutSnapshot } from '../faProjectWorldTemplateLayoutSnapshotWiring'

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

function readMockDocumentTemplateMaxSortOrder (
  documentTemplates: Map<string, T_row>
): number | null {
  let max: number | null = null
  for (const row of documentTemplates.values()) {
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
} {
  const tables: Record<string, Map<string, T_row>> = {
    document_templates: new Map(),
    documents: new Map(),
    media: new Map(),
    world_template_groups: new Map(),
    world_template_placements: new Map(),
    worlds: new Map()
  }
  const junctionDocumentMedia = new Set<string>()

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
            if (normalized.includes('document_templates')) {
              return {
                max_sort: readMockDocumentTemplateMaxSortOrder(tables.document_templates)
              }
            }
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
              sort_order: args[2] as number,
              world_appendix: args[3] as string,
              icon: args[4] as string,
              created_at_ms: args[5] as number,
              updated_at_ms: args[6] as number
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
      if (normalized.includes('INSERT INTO world_template_groups')) {
        return {
          run: (...args: Array<string | number>) => {
            const row: T_row = {
              created_at_ms: args[4] as number,
              display_name: args[2] as string,
              id: args[0] as string,
              root_sort_order: args[3] as number,
              updated_at_ms: args[5] as number,
              world_id: args[1] as string
            }
            tables.world_template_groups.set(row.id as string, row)
          }
        }
      }
      if (normalized.includes('INSERT INTO world_template_placements')) {
        return {
          run: (...args: Array<string | number | null>) => {
            const row: T_row = {
              created_at_ms: args[7] as number,
              document_template_id: args[2] as string,
              group_id: args[3] as string | null,
              group_sort_order: args[5] as number | null,
              id: args[0] as string,
              nickname: args[6] as string,
              root_sort_order: args[4] as number | null,
              updated_at_ms: args[8] as number,
              world_id: args[1] as string
            }
            tables.world_template_placements.set(row.id as string, row)
          }
        }
      }
      if (normalized.includes('DELETE FROM world_template_placements')) {
        return {
          run: (worldId: string) => {
            for (const [id, row] of tables.world_template_placements) {
              if (row.world_id === worldId) {
                tables.world_template_placements.delete(id)
              }
            }
          }
        }
      }
      if (normalized.includes('DELETE FROM world_template_groups')) {
        return {
          run: (worldId: string) => {
            for (const [id, row] of tables.world_template_groups) {
              if (row.world_id === worldId) {
                tables.world_template_groups.delete(id)
              }
            }
          }
        }
      }
      if (normalized.includes('FROM world_template_groups')) {
        return {
          all: (worldId: string) => {
            return [...tables.world_template_groups.values()]
              .filter((row) => row.world_id === worldId)
              .sort((left, right) => {
                return (left.root_sort_order as number) - (right.root_sort_order as number)
              })
          }
        }
      }
      if (
        normalized.includes('FROM world_template_placements') &&
        normalized.includes('INNER JOIN')
      ) {
        return {
          all: (worldId: string) => {
            return [...tables.world_template_placements.values()]
              .filter((row) => row.world_id === worldId)
              .map((row) => {
                const template = tables.document_templates.get(row.document_template_id as string)
                return {
                  ...row,
                  display_name: template?.display_name ?? '',
                  icon: template?.icon ?? '',
                  world_appendix: template?.world_appendix ?? ''
                }
              })
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
      if (normalized.includes('UPDATE') && normalized.includes('document_templates')) {
        return {
          run: (...args: Array<string | number>) => {
            const id = args[args.length - 1] as string
            const existing = tables.document_templates.get(id)
            if (existing === undefined) {
              return
            }
            const patch: T_row = { ...existing }
            let argIdx = 0
            if (normalized.includes('display_name = ?')) {
              patch.display_name = args[argIdx++] as string
            }
            if (normalized.includes('world_appendix = ?')) {
              patch.world_appendix = args[argIdx++] as string
            }
            if (normalized.includes('icon = ?')) {
              patch.icon = args[argIdx++] as string
            }
            if (normalized.includes('sort_order = ?')) {
              patch.sort_order = args[argIdx++] as number
            }
            if (normalized.includes('updated_at_ms = ?')) {
              patch.updated_at_ms = args[argIdx++] as number
            }
            tables.document_templates.set(id, patch)
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
      if (normalized.includes('GROUP BY template_id')) {
        return {
          all: (worldId?: string) => {
            const counts = new Map<string, number>()
            for (const row of tables.documents.values()) {
              if (worldId !== undefined && row.world_id !== worldId) {
                continue
              }
              const templateId = row.template_id as string | null
              if (templateId === null) {
                continue
              }
              counts.set(templateId, (counts.get(templateId) ?? 0) + 1)
            }
            return [...counts.entries()].map(([template_id, c]) => ({
              c,
              template_id
            }))
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
      if (normalized === 'SELECT id FROM document_templates') {
        return {
          all: () => [...tables.document_templates.keys()].map((id) => ({ id }))
        }
      }
      if (normalized.includes('SELECT id FROM document_templates WHERE id = ?')) {
        return {
          get: (id: string) => {
            return tables.document_templates.has(id) ? { id } : undefined
          }
        }
      }
      if (
        normalized.includes('SELECT') &&
        normalized.includes('document_templates') &&
        normalized.includes('ORDER BY')
      ) {
        const sortTemplateRows = (): T_row[] => {
          return [...tables.document_templates.values()].sort((left, right) => {
            const orderDelta = (left.sort_order as number) - (right.sort_order as number)
            if (orderDelta !== 0) {
              return orderDelta
            }
            const createdDelta =
              (left.created_at_ms as number) - (right.created_at_ms as number)
            if (createdDelta !== 0) {
              return createdDelta
            }
            return String(left.id).localeCompare(String(right.id))
          })
        }
        return {
          get: (id: string) => tables.document_templates.get(id),
          all: () => sortTemplateRows()
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
 * getFaProjectDocumentTemplateById
 * Missing template ids throw FaProjectContentNotFoundError.
 */
test('Test that getFaProjectDocumentTemplateById throws for a missing template', () => {
  const { db } = makeProjectContentTestDb()
  expect(() =>
    getFaProjectDocumentTemplateById(db as never, '550e8400-e29b-41d4-a716-446655440000')
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * assertFaProjectDocumentTemplateExists
 * Throws when the template id is absent.
 */
test('Test that assertFaProjectDocumentTemplateExists throws for a missing template', () => {
  const { db } = makeProjectContentTestDb()
  expect(() =>
    assertFaProjectDocumentTemplateExists(db as never, '550e8400-e29b-41d4-a716-446655440000')
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * assertFaProjectDocumentTemplateExists
 * Resolves without error when the template row exists.
 */
test('Test that assertFaProjectDocumentTemplateExists passes for an existing template', () => {
  const { db } = makeProjectContentTestDb()
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Sheet' })
  expect(() => assertFaProjectDocumentTemplateExists(db as never, template.id)).not.toThrow()
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
 * An empty patch returns the existing row without running UPDATE.
 */
test('Test that updateFaProjectDocumentTemplate with an empty patch returns the existing row', () => {
  const { db } = makeProjectContentTestDb()
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Stable' })
  const updated = updateFaProjectDocumentTemplate(db as never, template.id, {})
  expect(updated.displayName).toBe('Stable')
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
  expect(emptyRow?.templateLayout.placements).toEqual([])
  expect(busyRow?.templateLayout.groups).toEqual([])
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
 * replaceFaProjectWorldTemplateLayoutSnapshot
 * Persists per-world template groups and placements for Project Settings.
 */
test('Test that replaceFaProjectWorldTemplateLayoutSnapshot persists layout rows', () => {
  const { db, tables } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  const groupId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  const placementId = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  replaceFaProjectWorldTemplateLayoutSnapshot(db as never, world.id, {
    groups: [
      {
        displayName: 'Creatures',
        id: groupId,
        rootSortOrder: 0
      }
    ],
    placements: [
      {
        documentTemplateId: template.id,
        groupId: null,
        groupSortOrder: null,
        id: placementId,
        rootSortOrder: 1,
        nickname: ''
      }
    ]
  })
  expect(tables.world_template_groups.size).toBe(1)
  expect(tables.world_template_placements.size).toBe(1)
  const listed = listFaProjectWorldsForProjectSettings(db as never)
  expect(listed.items[0]?.templateLayout.groups[0]?.displayName).toBe('Creatures')
  expect(listed.items[0]?.templateLayout.placements[0]?.documentTemplateId).toBe(template.id)
})

/**
 * replaceFaProjectWorldTemplateLayoutSnapshot
 * Rejects invalid root and grouped placement sort fields.
 */
test('Test that replaceFaProjectWorldTemplateLayoutSnapshot throws on invalid placement sort fields', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  const placementId = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  expect(() => replaceFaProjectWorldTemplateLayoutSnapshot(db as never, world.id, {
    groups: [],
    placements: [
      {
        documentTemplateId: template.id,
        groupId: null,
        groupSortOrder: 0,
        id: placementId,
        rootSortOrder: 0,
        nickname: ''
      }
    ]
  })).toThrow(/Root template placement/)
  expect(() => replaceFaProjectWorldTemplateLayoutSnapshot(db as never, world.id, {
    groups: [],
    placements: [
      {
        documentTemplateId: template.id,
        groupId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        groupSortOrder: null,
        id: placementId,
        rootSortOrder: null,
        nickname: ''
      }
    ]
  })).toThrow(/Grouped template placement/)
})

/**
 * replaceFaProjectWorldTemplateLayoutSnapshot
 * Rejects unknown group ids and blank group names.
 */
test('Test that replaceFaProjectWorldTemplateLayoutSnapshot validates groups and references', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  const placementId = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  expect(() => replaceFaProjectWorldTemplateLayoutSnapshot(db as never, world.id, {
    groups: [],
    placements: [
      {
        documentTemplateId: template.id,
        groupId: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        groupSortOrder: 0,
        id: placementId,
        rootSortOrder: null,
        nickname: ''
      }
    ]
  })).toThrow(/unknown group id/)
  expect(() => replaceFaProjectWorldTemplateLayoutSnapshot(db as never, world.id, {
    groups: [
      {
        displayName: '   ',
        id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        rootSortOrder: 0
      }
    ],
    placements: []
  })).toThrow(/display name must not be empty/)
})

/**
 * replaceFaProjectWorldTemplateLayoutSnapshot
 * Persists grouped template placements under a world group row.
 */
test('Test that replaceFaProjectWorldTemplateLayoutSnapshot persists grouped placements', () => {
  const { db, tables } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  const groupId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  const placementId = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  replaceFaProjectWorldTemplateLayoutSnapshot(db as never, world.id, {
    groups: [
      {
        displayName: 'Creatures',
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
        rootSortOrder: null,
        nickname: ''
      }
    ]
  })
  expect(tables.world_template_placements.get(placementId)?.group_id).toBe(groupId)
})

/**
 * replaceFaProjectWorldsSnapshot
 * Persists per-world template layout when the snapshot item includes templateLayout.
 */
test('Test that replaceFaProjectWorldsSnapshot persists templateLayout on each world item', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  const groupId = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
  const placementId = '6ba7b811-9dad-11d1-80b4-00c04fd430c8'
  replaceFaProjectWorldsSnapshot(db as never, [
    {
      displayName: 'Realm',
      id: world.id,
      templateLayout: {
        groups: [
          {
            displayName: 'Group',
            id: groupId,
            rootSortOrder: 0
          }
        ],
        placements: [
          {
            documentTemplateId: template.id,
            groupId: null,
            groupSortOrder: null,
            id: placementId,
            rootSortOrder: 0,
            nickname: ''
          }
        ]
      }
    }
  ])
  const listed = listFaProjectWorldsForProjectSettings(db as never)
  expect(listed.items[0]?.templateLayout.groups).toHaveLength(1)
  expect(listed.items[0]?.templateLayout.placements[0]?.documentTemplateId).toBe(template.id)
})

/**
 * listFaProjectWorldsForProjectSettings
 * Includes per-placement document counts for the selected world.
 */
test('Test that listFaProjectWorldsForProjectSettings includes placement document counts', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Tpl' })
  createFaProjectDocument(db as never, {
    displayName: 'Doc',
    templateId: template.id,
    worldId: world.id
  })
  replaceFaProjectWorldTemplateLayoutSnapshot(db as never, world.id, {
    groups: [],
    placements: [
      {
        documentTemplateId: template.id,
        groupId: null,
        groupSortOrder: null,
        id: '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        rootSortOrder: 0,
        nickname: ''
      }
    ]
  })
  const listed = listFaProjectWorldsForProjectSettings(db as never)
  expect(listed.items[0]?.templateLayout.placements[0]?.documentCountInWorld).toBe(1)
})

test('Test that createFaProjectDocumentTemplate stores worldAppendix and icon', () => {
  const { db } = makeProjectContentTestDb()
  const template = createFaProjectDocumentTemplate(db as never, {
    displayName: 'Character',
    icon: 'person',
    worldAppendix: ' of Middle-earth'
  })
  expect(template.worldAppendix).toBe('of Middle-earth')
  expect(template.icon).toBe('person')
  expect(template.sortOrder).toBe(0)
})

/**
 * updateFaProjectDocumentTemplate
 * Persists sortOrder, worldAppendix, and icon patches.
 */
test('Test that updateFaProjectDocumentTemplate persists extended fields', () => {
  const { db } = makeProjectContentTestDb()
  const template = createFaProjectDocumentTemplate(db as never, { displayName: 'Sheet' })
  const updated = updateFaProjectDocumentTemplate(db as never, template.id, {
    icon: 'article',
    sortOrder: 3,
    worldAppendix: ' notes'
  })
  expect(updated.icon).toBe('article')
  expect(updated.sortOrder).toBe(3)
  expect(updated.worldAppendix).toBe('notes')
})

/**
 * deleteFaProjectDocumentTemplate
 * Throws when the template id does not exist.
 */
test('Test that deleteFaProjectDocumentTemplate throws when the template is absent', () => {
  const { db } = makeProjectContentTestDb()
  expect(() =>
    deleteFaProjectDocumentTemplate(db as never, '550e8400-e29b-41d4-a716-446655440000')
  ).toThrow(FaProjectContentNotFoundError)
})

/**
 * listFaProjectDocumentTemplatesForProjectSettings
 * Merges document counts into each template row for Project Settings.
 */
test('Test that listFaProjectDocumentTemplatesForProjectSettings includes document counts', () => {
  const { db } = makeProjectContentTestDb()
  const world = createFaProjectWorld(db as never, { displayName: 'Realm' })
  const unused = createFaProjectDocumentTemplate(db as never, { displayName: 'Unused' })
  const busy = createFaProjectDocumentTemplate(db as never, { displayName: 'Busy' })
  createFaProjectDocument(db as never, {
    displayName: 'Doc',
    templateId: busy.id,
    worldId: world.id
  })
  const result = listFaProjectDocumentTemplatesForProjectSettings(db as never)
  expect(result.items).toHaveLength(2)
  const unusedRow = result.items.find((item) => item.id === unused.id)
  const busyRow = result.items.find((item) => item.id === busy.id)
  expect(unusedRow?.documentCount).toBe(0)
  expect(busyRow?.documentCount).toBe(1)
})

const SAMPLE_TEMPLATE_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

/**
 * replaceFaProjectDocumentTemplatesSnapshot
 * Reorders templates, inserts new ids, deletes omitted rows, and allows an empty list.
 */
test('Test that replaceFaProjectDocumentTemplatesSnapshot replaces the ordered templates list', () => {
  const { db, tables } = makeProjectContentTestDb()
  const first = createFaProjectDocumentTemplate(db as never, { displayName: 'Keep' })
  const second = createFaProjectDocumentTemplate(db as never, { displayName: 'Remove' })
  replaceFaProjectDocumentTemplatesSnapshot(db as never, [
    {
      displayName: 'Keep renamed',
      icon: 'star',
      id: first.id,
      worldAppendix: ' appendix'
    },
    {
      displayName: 'Brand new',
      id: SAMPLE_TEMPLATE_UUID
    }
  ])
  expect(tables.document_templates.has(second.id)).toBe(false)
  expect(tables.document_templates.has(SAMPLE_TEMPLATE_UUID)).toBe(true)
  const listed = listFaProjectDocumentTemplates(db as never).items
  expect(listed.map((template) => template.displayName)).toEqual(['Keep renamed', 'Brand new'])
  expect(listed[0].sortOrder).toBe(0)
  expect(listed[1].sortOrder).toBe(1)
  expect(listed[0].icon).toBe('star')
  expect(listed[0].worldAppendix).toBe('appendix')
})

/**
 * replaceFaProjectDocumentTemplatesSnapshot
 * Accepts an empty snapshot (unlike worlds).
 */
test('Test that replaceFaProjectDocumentTemplatesSnapshot allows an empty items array', () => {
  const { db, tables } = makeProjectContentTestDb()
  createFaProjectDocumentTemplate(db as never, { displayName: 'Gone' })
  replaceFaProjectDocumentTemplatesSnapshot(db as never, [])
  expect(tables.document_templates.size).toBe(0)
})
