import { app } from 'electron'
import path from 'path'
import packageJSON from '../../../package.json' with { type: 'json' }

import {
  determineAppName as determineAppNameFromEnv,
  isPlaywrightTestEnv,
  resolveUserDataRootFolderName
} from './functions/appIdentityPaths'
import { createAppIdentityElectronApi } from './functions/appIdentityElectronApi'
import { PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME } from './playwrightIsolatedUserDataDirName'

const appIdentityApi = createAppIdentityElectronApi({
  app,
  determineAppNameFromEnv,
  getDebugging: () => process.env.DEBUGGING,
  getTestEnv: () => process.env.TEST_ENV,
  isPlaywrightTestEnv,
  packageName: packageJSON.name,
  pathJoin: path.join,
  playwrightIsolatedUserDataDirName: PLAYWRIGHT_ISOLATED_USER_DATA_DIR_NAME,
  resolveUserDataRootFolderName
})

export const determineAppName = appIdentityApi.determineAppName

export const fixAppName = appIdentityApi.fixAppName
