import type { ElectronApplication, Page } from 'playwright'

import type { I_faLaunchFaPlaywrightComponentHarnessWindowOptions } from 'app/types/I_faPlaywrightComponentHarness'
import type { T_faPlaywrightDismissStartupTips } from 'app/types/I_faPlaywrightElectronHarness'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { launchFaPlaywrightElectronSerialSuiteWindow } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleLaunch'

type T_faPlaywrightComponentHarnessDismissTips =
  Exclude<T_faPlaywrightDismissStartupTips, 'auto'> | 'auto'

function resolveComponentDismiss (
  dismiss?: T_faPlaywrightComponentHarnessDismissTips
): T_faPlaywrightDismissStartupTips {
  if (dismiss === undefined) {
    return false
  }
  if (dismiss === 'auto') {
    return false
  }
  return dismiss
}

/**
 * Opens the component-testing shell with shared serial-suite defaults ('readiness': 'component').
 */
export async function launchFaPlaywrightComponentHarnessWindow (
  options: I_faLaunchFaPlaywrightComponentHarnessWindowOptions
): Promise<{
  electronApp: ElectronApplication
  appWindow: Page
}> {
  const renderDelayMs = options.renderDelayMs ?? FA_FRONTEND_RENDER_TIMER
  const dismissStartupTipsResolved = resolveComponentDismiss(options.dismissStartupTips)
  const testInfoBinding = options.testInfo
  const buildLaunchEnvBinding = options.buildLaunchEnv
  const electronMainJsPathBinding = options.electronMainJsPath
  const resetUserDataBinding = options.resetUserData
  const beforeIsolationResetBinding = options.beforeIsolationReset
  const afterIsolationResetBeforeLaunchBinding = options.afterIsolationResetBeforeLaunch

  return launchFaPlaywrightElectronSerialSuiteWindow({
    afterIsolationResetBeforeLaunch: afterIsolationResetBeforeLaunchBinding,
    beforeIsolationReset: beforeIsolationResetBinding,
    buildLaunchEnv: buildLaunchEnvBinding,
    dismissStartupTips: dismissStartupTipsResolved,
    electronMainJsPath: electronMainJsPathBinding,
    readiness: 'component',
    renderDelayMs,
    resetUserData: resetUserDataBinding,
    testInfo: testInfoBinding
  })
}
