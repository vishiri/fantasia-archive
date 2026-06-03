import { expect, test, vi } from 'vitest'

import {
  applyFaProjectContentSchemaV4,
  FA_PROJECT_TABLE_DOCUMENTS
} from '../faProjectDbSchemaDdl'

/**
 * applyFaProjectContentSchemaV4
 * Executes DDL that creates the worlds table and related content schema.
 */
test('Test that applyFaProjectContentSchemaV4 runs exec with worlds table DDL', () => {
  const exec = vi.fn()
  applyFaProjectContentSchemaV4({ exec })
  expect(exec).toHaveBeenCalledOnce()
  const sql = exec.mock.calls[0][0] as string
  expect(sql).toContain(FA_PROJECT_TABLE_DOCUMENTS)
  expect(sql).toContain('world_media')
})
