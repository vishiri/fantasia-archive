import type { ElectronApplication, Page } from 'playwright'

import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import type {
  IFaLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
  TFaPlaywrightDismissStartupTips
} from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleLaunch'
import { launchFaPlaywrightElectronSerialSuiteWindow } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleLaunch'

type THarnessDismissTips = Exclude<TFaPlaywrightDismissStartupTips, 'auto'> | 'auto'

export type IFaLaunchFaPlaywrightComponentHarnessWindowOptions =
  Omit<
  IFaLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
  'readiness' | 'renderDelayMs' | 'dismissStartupTips'
  > & {
    dismissStartupTips?: THarnessDismissTips
    renderDelayMs?: number
  }

function resolveComponentDismiss (
  dismiss?: THarnessDismissTips
): TFaPlaywrightDismissStartupTips {
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
  options: IFaLaunchFaPlaywrightComponentHarnessWindowOptions
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
