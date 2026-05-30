import {
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH,
  FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH,
  isFaProjectManagementE2eTestEnv,
  takePendingE2ePath
} from './functions/faProjectManagementE2ePathOverride'

import type { I_projectManagementE2ePathRuntimeDeps } from 'app/types/I_faProjectManagementElectronMain'

export function createProjectManagementE2ePathRuntime (
  deps: I_projectManagementE2ePathRuntimeDeps
): {
    installFaProjectManagementE2ePathOverrideGlobals: () => void
    takeNextE2eProjectCreatePath: () => string | null
    takeNextE2eProjectOpenPath: () => string | null
  } {
  let e2eNextCreatePath: string | null = null
  let e2eNextOpenPath: string | null = null

  const takeNextE2eProjectCreatePath = (): string | null => {
    if (!isFaProjectManagementE2eTestEnv(deps.getTestEnv())) {
      return null
    }
    const p = e2eNextCreatePath
    e2eNextCreatePath = null
    return takePendingE2ePath(p)
  }

  const takeNextE2eProjectOpenPath = (): string | null => {
    if (!isFaProjectManagementE2eTestEnv(deps.getTestEnv())) {
      return null
    }
    const p = e2eNextOpenPath
    e2eNextOpenPath = null
    return takePendingE2ePath(p)
  }

  const installFaProjectManagementE2ePathOverrideGlobals = (): void => {
    if (!isFaProjectManagementE2eTestEnv(deps.getTestEnv())) {
      e2eNextCreatePath = null
      e2eNextOpenPath = null
      return
    }
    const g = globalThis as Record<string, unknown>
    g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH] = (p: string) => {
      e2eNextCreatePath = p
    }
    g[FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH] = (p: string) => {
      e2eNextOpenPath = p
    }
  }

  return {
    installFaProjectManagementE2ePathOverrideGlobals,
    takeNextE2eProjectCreatePath,
    takeNextE2eProjectOpenPath
  }
}
