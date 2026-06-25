import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV5ToV6 } from '../faProjectDbMigrateV5ToV6'

/**
 * migrateFaProjectSchemaV5ToV6
 * Creates layout tables, migrates junction rows, drops junction, sets user_version to 6.
 */
test('Test that migrateFaProjectSchemaV5ToV6 migrates junction rows and bumps user_version', () => {
  const execCalls: string[] = []
  const placementRuns: unknown[][] = []
  const junctionRows = [
    {
      created_at_ms: 100,
      document_template_id: 'template-a',
      sort_order: 0,
      world_id: 'world-a'
    },
    {
      created_at_ms: 0,
      document_template_id: 'template-b',
      sort_order: 1,
      world_id: 'world-a'
    }
  ]
  const db = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    prepare: (sql: string) => {
      const normalized = sql.replace(/\s+/g, ' ').trim()
      if (normalized.includes('sqlite_master')) {
        return {
          get: () => ({ name: 'world_document_templates' })
        }
      }
      if (normalized.includes('FROM world_document_templates')) {
        return {
          all: () => junctionRows
        }
      }
      if (normalized.includes('INSERT INTO world_template_placements')) {
        return {
          run: (...args: unknown[]) => {
            placementRuns.push(args)
          }
        }
      }
      throw new Error(`unexpected prepare: ${normalized}`)
    },
    pragma: vi.fn()
  }

  migrateFaProjectSchemaV5ToV6(db as never, {
    applyLayoutSchema: (targetDb) => {
      targetDb.exec('CREATE TABLE world_template_groups')
    },
    createPlacementId: () => 'placement-id-1',
    junctionTableName: 'world_document_templates'
  })

  expect(execCalls.some((sql) => sql.includes('world_template_groups'))).toBe(true)
  expect(placementRuns).toHaveLength(2)
  expect(placementRuns[0]!?.[0]!).toBe('placement-id-1')
  expect(placementRuns[0]!?.[3]!).toBe(0)
  expect(typeof placementRuns[1]!?.[5]!).toBe('number')
  expect(execCalls.some((sql) => sql.includes('DROP TABLE IF EXISTS world_document_templates'))).toBe(true)
  expect(db.pragma).toHaveBeenCalledWith('user_version = 6')
})

test('Test that migrateFaProjectSchemaV5ToV6 skips junction migration when table is absent', () => {
  const execCalls: string[] = []
  const db = {
    exec: (sql: string) => {
      execCalls.push(sql)
    },
    prepare: (sql: string) => {
      const normalized = sql.replace(/\s+/g, ' ').trim()
      if (normalized.includes('sqlite_master')) {
        return {
          get: () => undefined
        }
      }
      throw new Error(`unexpected prepare: ${normalized}`)
    },
    pragma: vi.fn()
  }

  migrateFaProjectSchemaV5ToV6(db as never, {
    applyLayoutSchema: (targetDb) => {
      targetDb.exec('CREATE TABLE world_template_groups')
    },
    createPlacementId: () => 'placement-id-1',
    junctionTableName: 'world_document_templates'
  })

  expect(execCalls.some((sql) => sql.includes('world_template_groups'))).toBe(true)
  expect(execCalls.some((sql) => sql.includes('DROP TABLE'))).toBe(false)
  expect(db.pragma).toHaveBeenCalledWith('user_version = 6')
})
