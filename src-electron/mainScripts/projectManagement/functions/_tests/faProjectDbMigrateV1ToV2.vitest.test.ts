import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV1ToV2 } from '../faProjectDbMigrateV1ToV2'

/**
 * migrateFaProjectSchemaV1ToV2
 * Drops legacy world_media and sets user_version to 2.
 */
test('Test that migrateFaProjectSchemaV1ToV2 drops world_media and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  const db = {
    exec,
    pragma
  }

  migrateFaProjectSchemaV1ToV2(db as never)

  expect(exec).toHaveBeenCalledOnce()
  const sql = exec.mock.calls[0][0] as string
  expect(sql).toContain('DROP TABLE IF EXISTS world_media')
  expect(sql).not.toContain('world_document_templates')
  expect(pragma).toHaveBeenCalledWith('user_version = 2')
})
