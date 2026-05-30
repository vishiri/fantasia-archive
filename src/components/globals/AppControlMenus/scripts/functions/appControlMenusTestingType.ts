/**
 * Reads TEST_ENV from a cached extra-env snapshot when the bridge has not hydrated yet.
 */
export function readAppControlMenusTestingTypeFromCachedSnapshot (
  snap: { TEST_ENV?: string | false } | null | undefined
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
