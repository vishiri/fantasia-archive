import { expect, test, vi } from 'vitest'

import { applyFaProjectDocumentAppearanceEmptyColorSchemaPatch } from '../../projectDbContent/faProjectDocumentAppearanceEmptyColorSchemaPatchWiring'
import {
  FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN,
  FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../faProjectDbSchemaDdl'

const STRICT_NULL_OR_HEX_DOCUMENTS_SQL =
  `CREATE TABLE ${FA_PROJECT_TABLE_DOCUMENTS} (` +
  'id TEXT NOT NULL PRIMARY KEY, ' +
  `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} TEXT CHECK (` +
  `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} IS NULL OR (` +
  `length(${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}) = 7 AND ` +
  `substr(${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}, 1, 1) = '#')), ` +
  `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} TEXT CHECK (` +
  `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} IS NULL OR (` +
  `length(${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}) = 7 AND ` +
  `substr(${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}, 1, 1) = '#')))`

const EMPTY_ALLOWED_DOCUMENTS_SQL =
  `CREATE TABLE ${FA_PROJECT_TABLE_DOCUMENTS} (` +
  'id TEXT NOT NULL PRIMARY KEY, ' +
  `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} TEXT CHECK (` +
  `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} IS NULL OR ` +
  `${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} = '' OR (` +
  `length(${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}) = 7 AND ` +
  `substr(${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN}, 1, 1) = '#')), ` +
  `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} TEXT CHECK (` +
  `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} IS NULL OR ` +
  `${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} = '' OR (` +
  `length(${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}) = 7 AND ` +
  `substr(${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN}, 1, 1) = '#')))`

/**
 * applyFaProjectDocumentAppearanceEmptyColorSchemaPatch
 * Rebuilds documents when appearance color CHECK rejects empty string.
 */
test('Test that applyFaProjectDocumentAppearanceEmptyColorSchemaPatch rebuilds null-or-hex CHECK', () => {
  const exec = vi.fn()
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return { sql: STRICT_NULL_OR_HEX_DOCUMENTS_SQL }
        }
      }
    })
  })
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return { sql: EMPTY_ALLOWED_DOCUMENTS_SQL }
        }
      }
    })
  })

  expect(exec).toHaveBeenCalledOnce()
  const rebuildSql = exec.mock.calls[0]![0]! as string
  expect(rebuildSql).toContain(`${FA_PROJECT_DOCUMENT_TEXT_COLOR_COLUMN} = ''`)
  expect(rebuildSql).toContain(`${FA_PROJECT_DOCUMENT_BACKGROUND_COLOR_COLUMN} = ''`)
  expect(rebuildSql).toContain(`${FA_PROJECT_TABLE_DOCUMENTS}__fa_color_empty`)
  expect(rebuildSql).toContain(`DROP TABLE ${FA_PROJECT_TABLE_DOCUMENTS}`)
  expect(rebuildSql).toMatch(
    /INSERT INTO documents__fa_color_empty \([\s\S]*?\)\s*SELECT[\s\S]*?FROM documents/
  )
  expect(rebuildSql).not.toContain('SELECT * FROM')
})

/**
 * applyFaProjectDocumentAppearanceEmptyColorSchemaPatch
 * No-op when prepare is unavailable.
 */
test('Test that applyFaProjectDocumentAppearanceEmptyColorSchemaPatch skips without prepare', () => {
  const exec = vi.fn()
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn()
  })
  expect(exec).not.toHaveBeenCalled()
})

/**
 * applyFaProjectDocumentAppearanceEmptyColorSchemaPatch
 * No-op when prepare returns a statement without get.
 */
test('Test that applyFaProjectDocumentAppearanceEmptyColorSchemaPatch skips when statement lacks get', () => {
  const exec = vi.fn()
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return null
    })
  } as never)
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {}
    })
  } as never)
  expect(exec).not.toHaveBeenCalled()
})

/**
 * applyFaProjectDocumentAppearanceEmptyColorSchemaPatch
 * No-op when sqlite_master sql is missing or blank.
 */
test('Test that applyFaProjectDocumentAppearanceEmptyColorSchemaPatch skips blank table sql', () => {
  const exec = vi.fn()
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return { sql: '   ' }
        }
      }
    })
  })
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return { sql: 12 }
        }
      }
    })
  } as never)
  expect(exec).not.toHaveBeenCalled()
})

/**
 * applyFaProjectDocumentAppearanceEmptyColorSchemaPatch
 * No-op when documents DDL lacks appearance color columns.
 */
test('Test that applyFaProjectDocumentAppearanceEmptyColorSchemaPatch skips without color columns', () => {
  const exec = vi.fn()
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return {
            sql: `CREATE TABLE ${FA_PROJECT_TABLE_DOCUMENTS} (id TEXT NOT NULL PRIMARY KEY)`
          }
        }
      }
    })
  })
  expect(exec).not.toHaveBeenCalled()
})

/**
 * applyFaProjectDocumentAppearanceEmptyColorSchemaPatch
 * No-op when empty appearance colors already allowed.
 */
test('Test that applyFaProjectDocumentAppearanceEmptyColorSchemaPatch skips when empty already allowed', () => {
  const exec = vi.fn()
  applyFaProjectDocumentAppearanceEmptyColorSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return { sql: EMPTY_ALLOWED_DOCUMENTS_SQL }
        }
      }
    })
  })
  expect(exec).not.toHaveBeenCalled()
})
