import {
  markWelcomeScreenAutoLoadBootAttempted,
  markWelcomeScreenAutoLoadBootCompletion
} from 'app/src/scripts/projectManagement/functions/faWelcomeScreenAutoLoadSession'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun_manager'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import {
  isFantasiaStorybookCanvas,
  setFantasiaStorybookCanvasFlag
} from './functions/faFantasiaStorybookCanvas'
import {
  applyFaI18nLocaleFromLanguageCode,
  applyFaUserSettingsLanguageSelection
} from './faAppInternalsLocale_manager'
import { tryRunSkipWelcomeScreenOnLaunch } from './rendererAppInternalsTryRunSkipWelcomeScreenWiring'
import { createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch } from './functions/createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch'
import { createRendererAppInternals } from './functions/createRendererAppInternals'
import { isFaSkipWelcomeScreenBridgeReady } from './functions/isFaSkipWelcomeScreenBridgeReady'
import { createWaitForFaSkipWelcomeScreenBridgeWhenElectron } from './functions/waitForFaSkipWelcomeScreenBridgeWhenElectron'

const waitForSkipWelcomeScreenBridgeWhenElectron =
  createWaitForFaSkipWelcomeScreenBridgeWhenElectron({
    getMode: () => process.env.MODE,
    isSkipWelcomeScreenBridgeReady: isFaSkipWelcomeScreenBridgeReady,
    nowMs: () => Date.now(),
    sleepMs: (ms) => new Promise((resolve) => {
      globalThis.setTimeout(resolve, ms)
    })
  })

const refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch =
  createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch({
    refreshUserSettings: () => S_FaUserSettings().refreshSettings()
  })

const rendererAppInternalsApi = createRendererAppInternals({
  applyFaI18nLocaleFromLanguageCode,
  applyFaUserSettingsLanguageSelection,
  isFantasiaStorybookCanvas,
  markWelcomeScreenAutoLoadBootAttempted,
  markWelcomeScreenAutoLoadBootCompletion,
  refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch,
  runFaAction,
  setFantasiaStorybookCanvasFlag,
  tryRunSkipWelcomeScreenOnLaunch,
  waitForSkipWelcomeScreenBridgeWhenElectron
})

export {
  isFantasiaStorybookCanvas,
  setFantasiaStorybookCanvasFlag
} from './functions/faFantasiaStorybookCanvas'

export const resolveVitePublicAssetPath = rendererAppInternalsApi.resolveVitePublicAssetPath

export const determineTestingComponentName = rendererAppInternalsApi.determineTestingComponentName

export const runAppStartupRouting = rendererAppInternalsApi.runAppStartupRouting
