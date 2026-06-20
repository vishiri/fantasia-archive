export const FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH = '__faE2eSetNextProjectCreatePath' as const

export const FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH = '__faE2eSetNextProjectOpenPath' as const

export const FA_E2E_GLOBAL_PENDING_PROJECT_CREATE_PATH = '__faE2ePendingProjectCreatePath' as const

export const FA_E2E_GLOBAL_PENDING_PROJECT_OPEN_PATH = '__faE2ePendingProjectOpenPath' as const

function faE2ePathGlobalRecord (): Record<string, unknown> {
  return globalThis as Record<string, unknown>
}

export function isFaProjectManagementE2eTestEnv (testEnv: string | undefined): boolean {
  return testEnv === 'e2e'
}

export function takePendingE2ePath (pending: string | null): string | null {
  return pending !== null && pending.length > 0 ? pending : null
}

export function readFaE2ePendingProjectCreatePath (): string | null {
  const pending = faE2ePathGlobalRecord()[FA_E2E_GLOBAL_PENDING_PROJECT_CREATE_PATH]
  return typeof pending === 'string' ? pending : null
}

export function writeFaE2ePendingProjectCreatePath (filePath: string | null): void {
  const g = faE2ePathGlobalRecord()
  if (filePath === null) {
    delete g[FA_E2E_GLOBAL_PENDING_PROJECT_CREATE_PATH]
    return
  }
  g[FA_E2E_GLOBAL_PENDING_PROJECT_CREATE_PATH] = filePath
}

export function readFaE2ePendingProjectOpenPath (): string | null {
  const pending = faE2ePathGlobalRecord()[FA_E2E_GLOBAL_PENDING_PROJECT_OPEN_PATH]
  return typeof pending === 'string' ? pending : null
}

export function writeFaE2ePendingProjectOpenPath (filePath: string | null): void {
  const g = faE2ePathGlobalRecord()
  if (filePath === null) {
    delete g[FA_E2E_GLOBAL_PENDING_PROJECT_OPEN_PATH]
    return
  }
  g[FA_E2E_GLOBAL_PENDING_PROJECT_OPEN_PATH] = filePath
}
