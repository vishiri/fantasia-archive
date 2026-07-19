import { expect, test, vi } from 'vitest'

import { applyFaProjectWorldColorEmptyAllowedSchemaPatch } from '../../projectDbContent/faProjectWorldColorEmptyAllowedSchemaPatchWiring'
import {
  applyFaProjectContentSchemaV1,
  FA_PROJECT_TABLE_WORLDS,
  FA_PROJECT_WORLD_COLOR_CHECK_SQL
} from '../faProjectDbSchemaDdl'

const STRICT_HEX_WORLDS_SQL =
  `CREATE TABLE ${FA_PROJECT_TABLE_WORLDS} (` +
  'id TEXT NOT NULL PRIMARY KEY, ' +
  "color TEXT NOT NULL DEFAULT '#808080' " +
  "CHECK (length(color) = 7 AND substr(color, 1, 1) = '#'))"

const EMPTY_ALLOWED_WORLDS_SQL =
  `CREATE TABLE ${FA_PROJECT_TABLE_WORLDS} (` +
  'id TEXT NOT NULL PRIMARY KEY, ' +
  `color TEXT NOT NULL DEFAULT '#808080' CHECK ${FA_PROJECT_WORLD_COLOR_CHECK_SQL})`

/**
 * applyFaProjectWorldColorEmptyAllowedSchemaPatch
 * Rebuilds worlds when color CHECK still rejects empty string.
 */
test('Test that applyFaProjectWorldColorEmptyAllowedSchemaPatch rebuilds strict hex color CHECK', () => {
  const exec = vi.fn()
  const prepare = vi.fn(() => {
    return {
      get: () => {
        return { sql: STRICT_HEX_WORLDS_SQL }
      }
    }
  })

  applyFaProjectWorldColorEmptyAllowedSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare
  })
  applyFaProjectWorldColorEmptyAllowedSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return { sql: EMPTY_ALLOWED_WORLDS_SQL }
        }
      }
    })
  })

  expect(exec).toHaveBeenCalledOnce()
  const rebuildSql = exec.mock.calls[0]![0]! as string
  expect(rebuildSql).toContain("color = '' OR")
  expect(rebuildSql).toContain(`${FA_PROJECT_TABLE_WORLDS}__fa_color_empty`)
  expect(rebuildSql).toContain(`DROP TABLE ${FA_PROJECT_TABLE_WORLDS}`)
  expect(rebuildSql).not.toContain('SELECT * FROM')
})

/**
 * applyFaProjectWorldColorEmptyAllowedSchemaPatch
 * No-op when worlds table SQL already allows empty color.
 */
test('Test that applyFaProjectWorldColorEmptyAllowedSchemaPatch skips when empty color already allowed', () => {
  const exec = vi.fn()
  applyFaProjectWorldColorEmptyAllowedSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => {
      return {
        get: () => {
          return { sql: EMPTY_ALLOWED_WORLDS_SQL }
        }
      }
    })
  })
  expect(exec).not.toHaveBeenCalled()
})

/**
 * applyFaProjectWorldColorEmptyAllowedSchemaPatch
 * No-op when prepare cannot read sqlite_master (migrate mocks).
 */
test('Test that applyFaProjectWorldColorEmptyAllowedSchemaPatch skips without usable prepare', () => {
  const exec = vi.fn()
  applyFaProjectWorldColorEmptyAllowedSchemaPatch({
    exec,
    pragma: vi.fn()
  })
  applyFaProjectWorldColorEmptyAllowedSchemaPatch({
    exec,
    pragma: vi.fn(),
    prepare: vi.fn(() => undefined as never)
  })
  expect(exec).not.toHaveBeenCalled()
})

/**
 * applyFaProjectContentSchemaV1
 * Fresh bootstrap DDL includes optional empty worlds.color CHECK.
 */
test('Test that applyFaProjectContentSchemaV1 DDL allows empty worlds.color', () => {
  const exec = vi.fn()
  applyFaProjectContentSchemaV1({
    exec,
    pragma: vi.fn()
  })
  const sql = `${exec.mock.calls[0]![0] as string}${exec.mock.calls[1]![0] as string}${exec.mock.calls[2]![0] as string}`
  expect(sql).toContain(FA_PROJECT_TABLE_WORLDS)
  expect(sql).toContain("color = '' OR")
  expect(sql).toContain(FA_PROJECT_WORLD_COLOR_CHECK_SQL)
})
