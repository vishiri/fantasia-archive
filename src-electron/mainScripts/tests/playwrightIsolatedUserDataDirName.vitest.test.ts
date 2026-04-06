import { expect, test } from 'vitest'

import { PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME } from '../playwrightIsolatedUserDataDirName'

/**
 * PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME
 * Stays aligned with the folder segment 'fixAppName' uses for isolated Playwright profiles.
 */
test('Test that PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME matches the playwright-user-data segment', () => {
  expect(PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME).toBe('playwright-user-data')
})
