/**
 * E2E-only: skip native save dialog and write to an absolute path from Playwright via globalThis.
 */
export const FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH = '__faE2eSetNextProjectCreatePath' as const

let e2eNextCreatePath: string | null = null

function isE2E (): boolean {
  return process.env.TEST_ENV === 'e2e'
}

/**
 * Returns the next project create path, if any, and clears the pending value.
 */
export function takeNextE2eProjectCreatePath (): string | null {
  if (!isE2E()) {
    return null
  }
  const p = e2eNextCreatePath
  e2eNextCreatePath = null
  return p !== null && p.length > 0 ? p : null
}

/**
 * Installs globalThis setter for Playwright. Idempotent per call; only active in e2e.
 */
export function installFaProjectManagementE2ePathOverrideGlobals (): void {
  if (!isE2E()) {
    e2eNextCreatePath = null
    return
  }
  const g = globalThis as typeof globalThis & {
    [FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH] = (p: string) => {
    e2eNextCreatePath = p
  }
}
