/**
 * Subfolder under the normal app userData root when TEST_ENV is 'components' or 'e2e'.
 * Lives in a module with no 'electron' import so Node-side Playwright helpers can share the same string as 'fixAppName'.
 */
export const PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME = 'playwright-user-data'
