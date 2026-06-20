import {
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH,
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH,
  isFaProjectManagementE2eTestEnv,
  readFaE2ePendingProjectCreatePath,
  readFaE2ePendingProjectOpenPath,
  takePendingE2ePath,
  writeFaE2ePendingProjectCreatePath,
  writeFaE2ePendingProjectOpenPath
} from './functions/faProjectManagementE2ePathOverride'

import type { I_projectManagementE2ePathRuntimeDeps } from 'app/types/I_faProjectManagementElectronMain'

export function createProjectManagementE2ePathRuntime (
  deps: I_projectManagementE2ePathRuntimeDeps
): {
    installFaProjectManagementE2ePathOverrideGlobals: () => void
    takeNextE2eProjectCreatePath: () => string | null
    takeNextE2eProjectOpenPath: () => string | null
  } {
  const takeNextE2eProjectCreatePath = (): string | null => {
    if (!isFaProjectManagementE2eTestEnv(deps.getTestEnv())) {
      return null
    }
    const p = readFaE2ePendingProjectCreatePath()
    writeFaE2ePendingProjectCreatePath(null)
    return takePendingE2ePath(p)
  }

  const takeNextE2eProjectOpenPath = (): string | null => {
    if (!isFaProjectManagementE2eTestEnv(deps.getTestEnv())) {
      return null
    }
    const p = readFaE2ePendingProjectOpenPath()
    writeFaE2ePendingProjectOpenPath(null)
    return takePendingE2ePath(p)
  }

  const installFaProjectManagementE2ePathOverrideGlobals = (): void => {
    if (!isFaProjectManagementE2eTestEnv(deps.getTestEnv())) {
      writeFaE2ePendingProjectCreatePath(null)
      writeFaE2ePendingProjectOpenPath(null)
      return
    }
    const g = globalThis as Record<string, unknown>
    g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH] = (p: string) => {
      writeFaE2ePendingProjectCreatePath(p)
    }
    g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH] = (p: string) => {
      writeFaE2ePendingProjectOpenPath(p)
    }
  }

  return {
    installFaProjectManagementE2ePathOverrideGlobals,
    takeNextE2eProjectCreatePath,
    takeNextE2eProjectOpenPath
  }
}
