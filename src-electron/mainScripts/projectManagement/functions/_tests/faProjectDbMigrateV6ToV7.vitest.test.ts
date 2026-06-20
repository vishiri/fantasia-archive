import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV6ToV7 } from '../faProjectDbMigrateV6ToV7'

/**
 * migrateFaProjectSchemaV6ToV7
 * Adds nickname column to world_template_placements and sets user_version to 7.
 */
test('Test that migrateFaProjectSchemaV6ToV7 adds nickname column and bumps user_version', () => {
  const db = {
    exec: vi.fn(),
    pragma: vi.fn(),
    prepare: vi.fn()
  }

  migrateFaProjectSchemaV6ToV7(db, {
    worldTemplatePlacementsTableName: 'world_template_placements'
  })

  expect(db.exec).toHaveBeenCalledWith(
    'ALTER TABLE world_template_placements ADD COLUMN nickname TEXT NOT NULL DEFAULT \'\''
  )
  expect(db.pragma).toHaveBeenCalledWith('user_version = 7')
})
