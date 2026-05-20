import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import type { TestInfo } from '@playwright/test'

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

export type TFaPlaywrightSerialSuiteReadiness = 'component' | 'e2e'

export type TFaPlaywrightDismissStartupTips = boolean | 'auto'

export interface IFaLaunchFaPlaywrightElectronSerialSuiteWindowOptions {
  testInfo: TestInfo
  buildLaunchEnv: () => Record<string, string>
  readiness: TFaPlaywrightSerialSuiteReadiness
  renderDelayMs: number
  /**
   * Extra strings appended after packaged main-process entry (cold OS-open tests pass an absolute `.faproject` path).
   */
  electronLaunchAdditionalArgs?: readonly string[]
  electronMainJsPath?: string
  resetUserData?: boolean
  dismissStartupTips?: TFaPlaywrightDismissStartupTips
  beforeIsolationReset?: () => void | Promise<void>
  afterIsolationResetBeforeLaunch?: () => void | Promise<void>
}

function resolveDismissStartupTips (
  readiness: TFaPlaywrightSerialSuiteReadiness,
  dismissStartupTips?: TFaPlaywrightDismissStartupTips
): boolean {
  if (dismissStartupTips === undefined || dismissStartupTips === 'auto') {
    return readiness === 'e2e'
  }
  return dismissStartupTips
}

async function applyReadinessWait (
  appWindow: Page,
  readiness: TFaPlaywrightSerialSuiteReadiness
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
  options: IFaLaunchFaPlaywrightElectronSerialSuiteWindowOptions
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
