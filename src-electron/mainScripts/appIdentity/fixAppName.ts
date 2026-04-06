import { app } from 'electron'
import path from 'path'
import packageJSON from '../../../package.json' with { type: 'json' }

import { PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME } from './playwrightIsolatedUserDataDirName'

export { PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME }

/**
 * Determines if the app name will have "-dev" affix at the end for the appData.
 */
export const determineAppName = () => {
  if (process.env.DEBUGGING) {
    return `${packageJSON.name}-dev`
  }

  return packageJSON.name
}

function isPlaywrightTestEnv (): boolean {
  const testEnv = process.env.TEST_ENV
  return testEnv === 'components' || testEnv === 'e2e'
}

/**
 * Fix the name and pathing of the app.
 * - This function exists mostly due to dev-mode returning "Electron" instead of the app name.
 * - When TEST_ENV is 'components' or 'e2e', userData is nested under PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME so Playwright runs do not read or write the normal profile.
 * - Playwright spawns with a minimal env (often no DEBUGGING), so the app name is usually packageJSON.name, not the *-dev folder Quasar dev uses. The isolated folder is always parented on packageJSON.name so it is stable and easy to find: e.g. %APPDATA%/fantasia-archive/playwright-user-data, not under fantasia-archive-dev.
 */
export const fixAppName = () => {
  const appName = determineAppName()
  if (appName) {
    app.setName(appName)
    const appData = app.getPath('appData')
    const userDataRootFolderName = isPlaywrightTestEnv()
      ? packageJSON.name
      : appName
    let userDataDir = path.join(appData, userDataRootFolderName)
    if (isPlaywrightTestEnv()) {
      userDataDir = path.join(userDataDir, PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME)
    }
    app.setPath('userData', userDataDir)
  }
}
