import { expect, test, vi } from 'vitest'

import { migrateFaProjectSchemaV3ToV4 } from '../faProjectDbMigrateV3ToV4'

/**
 * migrateFaProjectSchemaV3ToV4
 * Adds worlds.color_pallete and sets user_version to 4.
 */
test('Test that migrateFaProjectSchemaV3ToV4 adds color_pallete and bumps user_version', () => {
  const exec = vi.fn()
  const pragma = vi.fn()
  const db = {
    exec,
    pragma
  }

  migrateFaProjectSchemaV3ToV4(db as never)

  expect(exec).toHaveBeenCalledOnce()
  const sql = exec.mock.calls[0]![0]! as string
  expect(sql).toContain('ADD COLUMN color_pallete')
  expect(sql).toContain('length(color_pallete) <= 2000')
  expect(pragma).toHaveBeenCalledWith('user_version = 4')
})
