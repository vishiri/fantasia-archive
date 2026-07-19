import { expect, test, vi } from 'vitest'

import { applyFaProjectDocumentAppearanceSchemaPatch } from '../../projectDbContent/faProjectDocumentAppearanceSchemaPatchWiring'
import {
  applyFaProjectContentSchemaV1,
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../faProjectDbSchemaDdl'

/**
 * applyFaProjectDocumentAppearanceSchemaPatch
 * Adds nullable appearance color columns on legacy documents tables.
 */
test('Test that applyFaProjectDocumentAppearanceSchemaPatch adds color columns idempotently', () => {
  const columnNames = new Set<string>([
    'id',
    'world_id',
    'template_id',
    'display_name',
    'created_at_ms',
    'updated_at_ms'
  ])
  const exec = vi.fn((sql: string) => {
    if (sql.includes(`ADD COLUMN ${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}`)) {
      columnNames.add(FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN)
    }
    if (sql.includes(`ADD COLUMN ${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}`)) {
      columnNames.add(FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN)
    }
  })
  const pragma = vi.fn(() => {
    return Array.from(columnNames).map((name) => {
      return { name }
    })
  })
  const db = {
    exec,
    pragma
  }

  applyFaProjectDocumentAppearanceSchemaPatch(db)
  applyFaProjectDocumentAppearanceSchemaPatch(db)

  expect(exec).toHaveBeenCalledTimes(2)
  expect(columnNames.has(FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN)).toBe(true)
  expect(columnNames.has(FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN)).toBe(true)
  const addedSql = `${exec.mock.calls[0]![0] as string}${exec.mock.calls[1]![0] as string}`
  expect(addedSql).toContain(`${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} = ''`)
  expect(addedSql).toContain(`${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} = ''`)
})

/**
 * applyFaProjectContentSchemaV1
 * Fresh bootstrap includes document appearance color columns with empty-allowed CHECK.
 */
test('Test that applyFaProjectContentSchemaV1 creates document appearance color columns', () => {
  const exec = vi.fn()
  applyFaProjectContentSchemaV1({
    exec,
    pragma: vi.fn()
  })
  const sql = `${exec.mock.calls[0]![0] as string}${exec.mock.calls[1]![0] as string}${exec.mock.calls[2]![0] as string}`
  expect(sql).toContain(FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN)
  expect(sql).toContain(FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN)
  expect(sql).toContain(`${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} = ''`)
  expect(sql).toContain(`${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} = ''`)
  expect(sql).toContain(FA_PROJECT_TABLE_DOCUMENTS)
})
