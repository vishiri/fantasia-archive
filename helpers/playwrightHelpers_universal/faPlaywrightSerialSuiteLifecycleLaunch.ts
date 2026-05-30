import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import type {
  I_faLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
  T_faPlaywrightDismissStartupTips,
  T_faPlaywrightSerialSuiteReadiness
} from 'app/types/I_faPlaywrightElectronHarness'
import { FA_ELECTRON_MAIN_JS_PATH } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { buildFaPlaywrightElectronLaunchEnv } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchEnv'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import {
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers_universal/playwrightElectronRecordVideo'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers_universal/playwrightUserDataReset'
import {
  waitForFaE2eRendererDomReady,
  waitForFaRendererContentBridgeApis
} from 'app/helpers/playwrightHelpers_universal/waitForFaRendererContentBridgeApis'

function resolveDismissStartupTips (
  readiness: T_faPlaywrightSerialSuiteReadiness,
  dismissStartupTips?: T_faPlaywrightDismissStartupTips
): boolean {
  if (dismissStartupTips === undefined || dismissStartupTips === 'auto') {
    return readiness === 'e2e'
  }
  return dismissStartupTips
}

async function applyReadinessWait (
  appWindow: Page,
  readiness: T_faPlaywrightSerialSuiteReadiness
): Promise<void> {
  if (readiness === 'component') {
    await waitForFaRendererContentBridgeApis(appWindow)
    return
  }
  await waitForFaE2eRendererDomReady(appWindow)
}

/**
 * Opens one Electron renderer window for a 'test.describe.serial' group using the shared
 * PLAYwright launch, recordVideo, readiness wait, marker, delay, and optional tips-dismiss flow.
 */
export async function launchFaPlaywrightElectronSerialSuiteWindow (
  options: I_faLaunchFaPlaywrightElectronSerialSuiteWindowOptions
): Promise<{
  electronApp: ElectronApplication
  appWindow: Page
}> {
  const electronMainJsPath = options.electronMainJsPath ?? FA_ELECTRON_MAIN_JS_PATH
  const electronLaunchAdditionalArgsBinding = options.electronLaunchAdditionalArgs ?? []
  const skipResetUserData = options.resetUserData === false
  const dismissTipsResolved = resolveDismissStartupTips(
    options.readiness,
    options.dismissStartupTips
  )
  const beforeIsolationResetBinding = options.beforeIsolationReset
  const afterIsolationResetBeforeLaunchBinding = options.afterIsolationResetBeforeLaunch

  if (beforeIsolationResetBinding !== undefined) {
    await beforeIsolationResetBinding()
  }
  if (!skipResetUserData) {
    resetFaPlaywrightIsolatedUserData()
  }
  if (afterIsolationResetBeforeLaunchBinding !== undefined) {
    await afterIsolationResetBeforeLaunchBinding()
  }

  const mergedEnv = buildFaPlaywrightElectronLaunchEnv(options.buildLaunchEnv())
  const recordVideoPartial = getFaPlaywrightElectronRecordVideoPartial(options.testInfo)

  const electronApp = await electron.launch({
    args: [electronMainJsPath, ...electronLaunchAdditionalArgsBinding],
    env: mergedEnv,
    ...recordVideoPartial
  })
  const appWindow = await electronApp.firstWindow()

  await applyReadinessWait(appWindow, options.readiness)
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(options.renderDelayMs)

  const shouldDismissTips = dismissTipsResolved
  if (shouldDismissTips) {
    await dismissStartupTipsNotifyIfPresent(appWindow)
  }

  const outElectronApp = electronApp
  const outAppWindow = appWindow

  return {
    appWindow: outAppWindow,
    electronApp: outElectronApp
  }
}
