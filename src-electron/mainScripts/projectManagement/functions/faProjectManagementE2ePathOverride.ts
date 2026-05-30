export const FA_E2E_GLOBAL_SET_NEXT_PROJECT_CREATE_PATH = '__faE2eSetNextProjectCreatePath' as const

export const FA_E2E_GLOBAL_SET_NEXT_PROJECT_OPEN_PATH = '__faE2eSetNextProjectOpenPath' as const

export function isFaProjectManagementE2eTestEnv (testEnv: string | undefined): boolean {
  return testEnv === 'e2e'
}

export function takePendingE2ePath (pending: string | null): string | null {
  return pending !== null && pending.length > 0 ? pending : null
}
