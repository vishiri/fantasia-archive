import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

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

  /**
   * When defined, patches disableAppControlBar on S_FaUserSettings (merged with the current settings object).
   */
  disableAppControlBar?: boolean | undefined

  /**
   * When defined, patches disableAppControlBarGuides on S_FaUserSettings (merged with the current settings object).
   */
  disableAppControlBarGuides?: boolean | undefined

  /**
   * When defined, patches opened document tabs on S_FaOpenedDocuments for workspace tab bar previews.
   */
  openedDocuments?: {
    activeDocumentId: string | null
    tabs: I_faOpenedDocumentTab[]
  } | undefined
}
