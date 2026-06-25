/** @vitest-environment node */
import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV7ToV8 } from '../faProjectDbMigrateV7ToV8'

/**
 * migrateFaProjectSchemaV7ToV8
 * Adds title_translations_json and backfills from display_name.
 */
test('Test that migrateFaProjectSchemaV7ToV8 adds title translations column and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  const db = {
    exec,
    pragma
  }

  migrateFaProjectSchemaV7ToV8(db, {
    documentTemplatesTableName: 'document_templates'
  })

  expect(exec).toHaveBeenCalledTimes(2)
  expect(exec.mock.calls[0]![0]!).toContain('ADD COLUMN title_translations_json')
  expect(exec.mock.calls[1]![0]!).toContain("json_object('en-US', display_name)")
  expect(pragma).toHaveBeenCalledWith('user_version = 8')
})
