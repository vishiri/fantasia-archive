import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV8ToV9 } from '../faProjectDbMigrateV8ToV9'

/**
 * migrateFaProjectSchemaV8ToV9
 * Adds display_name_translations_json and world_appendix_translations_json with backfill.
 */
test('Test that migrateFaProjectSchemaV8ToV9 adds translation JSON columns and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  migrateFaProjectSchemaV8ToV9(
    {
      exec,
      pragma
    } as never,
    {
      documentTemplatesTableName: 'document_templates',
      worldsTableName: 'worlds'
    }
  )

  expect(exec).toHaveBeenCalledTimes(4)
  expect(exec.mock.calls[0]![0]!).toContain('display_name_translations_json')
  expect(exec.mock.calls[1]![0]!).toContain("json_object('en-US', display_name)")
  expect(exec.mock.calls[2]![0]!).toContain('world_appendix_translations_json')
  expect(exec.mock.calls[3]![0]!).toContain("json_object('en-US', world_appendix)")
  expect(pragma).toHaveBeenCalledWith('user_version = 9')
})
