import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV10ToV11 } from '../faProjectDbMigrateV10ToV11'

/**
 * migrateFaProjectSchemaV10ToV11
 * Adds singular JSON columns for template titles and placement nicknames.
 */
test('Test that migrateFaProjectSchemaV10ToV11 adds singular JSON columns and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  migrateFaProjectSchemaV10ToV11(
    {
      exec,
      pragma
    } as never,
    {
      documentTemplatesTableName: 'document_templates',
      worldTemplatePlacementsTableName: 'world_template_placements'
    }
  )

  expect(exec).toHaveBeenCalledTimes(2)
  expect(exec.mock.calls[0][0]).toContain('title_singular_translations_json')
  expect(exec.mock.calls[1][0]).toContain('nickname_singular_translations_json')
  expect(pragma).toHaveBeenCalledWith('user_version = 11')
})
