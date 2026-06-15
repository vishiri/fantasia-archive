import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV4ToV5 } from '../faProjectDbMigrateV4ToV5'

/**
 * migrateFaProjectSchemaV4ToV5
 * Adds document_templates columns and sets user_version to 5.
 */
test('Test that migrateFaProjectSchemaV4ToV5 adds template columns and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  const db = {
    exec,
    pragma
  }

  migrateFaProjectSchemaV4ToV5(db as never)

  expect(exec).toHaveBeenCalledOnce()
  const sql = exec.mock.calls[0][0] as string
  expect(sql).toContain('ADD COLUMN sort_order')
  expect(sql).toContain('ADD COLUMN world_appendix')
  expect(sql).toContain('ADD COLUMN icon')
  expect(sql).toContain('idx_document_templates_sort_order')
  expect(sql).toContain('UPDATE document_templates')
  expect(pragma).toHaveBeenCalledWith('user_version = 5')
})
