/**
 * Reads TEST_ENV from a cached extra-env snapshot when the bridge has not hydrated yet.
 */
import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'

export function readAppControlMenusTestingTypeFromCachedSnapshot (
  snap: I_extraEnvVariablesAPI | null | undefined
): string | false {
  if (!snap) {
    return ''
  }
  const testEnv = snap.TEST_ENV
  if (testEnv === false) {
    return false
  }
  return testEnv ?? ''
}
