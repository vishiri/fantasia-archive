/**
 * App update check (GitHub Releases) — shared types for check-only flow.
 */

/**
 * Who triggered the update check. Controls fail UX and already-newest toast.
 */
export type T_faAppUpdateCheckSource = 'startup' | 'menu'

/**
 * Payload for the checkForAppUpdates action.
 */
export interface I_faAppUpdateCheckPayload {
  source: T_faAppUpdateCheckSource
}

/**
 * GitHub Releases API URL for the latest published release (no drafts/prereleases).
 */
export const FA_APP_UPDATE_GITHUB_LATEST_API_URL =
  'https://api.github.com/repos/vishiri/fantasia-archive/releases/latest'

/**
 * Public releases page opened by the Download CTA.
 */
export const FA_APP_UPDATE_GITHUB_RELEASES_PAGE_URL =
  'https://github.com/vishiri/fantasia-archive/releases'
