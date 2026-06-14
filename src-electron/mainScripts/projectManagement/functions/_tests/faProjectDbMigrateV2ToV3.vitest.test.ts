import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV2ToV3 } from '../faProjectDbMigrateV2ToV3'

/**
 * migrateFaProjectSchemaV2ToV3
 * Recreates world_document_templates and sets user_version to 3.
 */
test('Test that migrateFaProjectSchemaV2ToV3 restores world_document_templates and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  const db = {
    exec,
    pragma
  }

  migrateFaProjectSchemaV2ToV3(db as never)

  expect(exec).toHaveBeenCalledOnce()
  const sql = exec.mock.calls[0][0] as string
  expect(sql).toContain('CREATE TABLE IF NOT EXISTS world_document_templates')
  expect(sql).toContain('idx_world_document_templates_document_template_id')
  expect(pragma).toHaveBeenCalledWith('user_version = 3')
})
