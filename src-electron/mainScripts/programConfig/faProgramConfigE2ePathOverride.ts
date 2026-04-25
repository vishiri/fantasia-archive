/**
 * E2E-only seam: when 'TEST_ENV' is 'e2e', the next import/export can skip the native file
 * dialog and use an absolute path set from Playwright via 'globalThis' on the main process.
 * Guarded in callers so production builds are unaffected.
 */
export const FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH = '__faE2eSetNextProgramConfigExportPath' as const
export const FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH = '__faE2eSetNextProgramConfigImportPath' as const

let e2eNextExportPath: string | null = null
let e2eNextImportPath: string | null = null

function isE2E (): boolean {
  return process.env.TEST_ENV === 'e2e'
}

/**
 * Returns the next export path, if any, and clears the pending value. Used from the export IPC.
 */
export function takeNextE2eProgramConfigExportPath (): string | null {
  if (!isE2E()) {
    return null
  }
  const p = e2eNextExportPath
  e2eNextExportPath = null
  return p !== null && p.length > 0 ? p : null
}

/**
 * Returns the next import path, if any, and clears the pending value. Used from the prepare-import IPC.
 */
export function takeNextE2eProgramConfigImportPath (): string | null {
  if (!isE2E()) {
    return null
  }
  const p = e2eNextImportPath
  e2eNextImportPath = null
  return p !== null && p.length > 0 ? p : null
}

/**
 * Installs 'globalThis' setters so Playwright can pass paths into the main process. Idempotent.
 */
export function installFaProgramConfigE2ePathOverrideGlobals (): void {
  if (!isE2E()) {
    e2eNextExportPath = null
    e2eNextImportPath = null
    return
  }
  const g = globalThis as typeof globalThis & {
    [FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH]?: (p: string) => void
    [FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH]?: (p: string) => void
  }
  g[FA_E2E_GLOBAL_SET_NEXT_EXPORT_PATH] = (p: string) => {
    e2eNextExportPath = p
  }
  g[FA_E2E_GLOBAL_SET_NEXT_IMPORT_PATH] = (p: string) => {
    e2eNextImportPath = p
  }
}
