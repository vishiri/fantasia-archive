import type Database from 'better-sqlite3'

/** Path helpers injected into main-process project path validation. */
export interface I_faProjectPathApi {
  sep: string
  basename: (filePath: string) => string
  isAbsolute: (filePath: string) => boolean
  win32: {
    basename: (filePath: string) => string
    isAbsolute: (filePath: string) => boolean
  }
}

/** Result of resolveFaProjectOpenTargetPath before open runs. */
export type I_faProjectOpenResolveResult =
  | { canceled: true }
  | {
    attemptedFilePath?: string | undefined
    errorMessage: string
    errorName: string
    ipcExplicitPathFailed?: boolean | undefined
  }
  | { filePath: string, ipcExplicitPath: boolean }

/** Factory for tests: inject a mock or use real better-sqlite3. */
export type T_faProjectDatabaseOpener = (filePath: string) => Database

/** E2E path override globals wired from main during TEST_ENV=e2e. */
export interface I_projectManagementE2ePathRuntimeDeps {
  getTestEnv: () => string | undefined
}

/** Node path module surface for projectManagement manager wiring. */
export interface I_projectManagementManagerSurfaceDeps {
  path: Pick<typeof import('node:path'), 'basename' | 'isAbsolute' | 'join' | 'sep' | 'win32'>
}
