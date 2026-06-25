import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV9ToV10 } from '../faProjectDbMigrateV9ToV10'

/**
 * migrateFaProjectSchemaV9ToV10
 * Adds layout group display name and placement nickname translation JSON columns.
 */
test('Test that migrateFaProjectSchemaV9ToV10 adds translation JSON columns and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  migrateFaProjectSchemaV9ToV10(
    {
      exec,
      pragma
    } as never,
    {
      worldTemplateGroupsTableName: 'world_template_groups',
      worldTemplatePlacementsTableName: 'world_template_placements'
    }
  )

  expect(exec).toHaveBeenCalledTimes(4)
  expect(exec.mock.calls[0]![0]!).toContain('display_name_translations_json')
  expect(exec.mock.calls[1]![0]!).toContain("json_object('en-US', display_name)")
  expect(exec.mock.calls[2]![0]!).toContain('nickname_translations_json')
  expect(exec.mock.calls[3]![0]!).toContain("json_object('en-US', nickname)")
  expect(pragma).toHaveBeenCalledWith('user_version = 10')
})
