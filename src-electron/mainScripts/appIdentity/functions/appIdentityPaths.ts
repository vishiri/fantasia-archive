/**
 * Determines if the app name will have "-dev" affix at the end for the appData.
 */
export function determineAppName (
  debugging: string | undefined,
  packageName: string
): string {
  if (debugging) {
    return `${packageName}-dev`
  }

  return packageName
}

export function isPlaywrightTestEnv (testEnv: string | undefined): boolean {
  return testEnv === 'components' || testEnv === 'e2e'
}

export function resolveUserDataRootFolderName (
  testEnv: string | undefined,
  packageName: string,
  appName: string
): string {
  return isPlaywrightTestEnv(testEnv) ? packageName : appName
}
