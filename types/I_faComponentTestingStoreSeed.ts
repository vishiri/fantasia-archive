/**
 * Payload for the component-testing Playwright store seed probe (TEST_ENV components only).
 */
export interface I_faComponentTestingStoreSeed {
  /**
   * When set to null, clears S_FaActiveProject. When omitted, leaves the active project unchanged.
   */
  activeProject?: {
    filePath: string
    id: string
    name: string
  } | null | undefined

  /**
   * When defined, patches hidePlushes on S_FaUserSettings (merged with the current settings object).
   */
  hidePlushes?: boolean | undefined

  /**
   * When defined, patches hideTooltipsProject on S_FaUserSettings (merged with the current settings object).
   */
  hideTooltipsProject?: boolean | undefined
}
