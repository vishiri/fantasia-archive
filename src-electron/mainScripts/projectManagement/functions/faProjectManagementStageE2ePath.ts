/**
 * Normalizes Playwright-staged absolute paths for the next create/open flow (E2E only).
 */
export function parseFaProjectManagementE2eStageFilePath (
  testEnv: string | undefined,
  raw: unknown
): string | null {
  if (testEnv !== 'e2e') {
    return null
  }
  if (typeof raw !== 'string') {
    return null
  }
  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return null
  }
  return trimmed
}
