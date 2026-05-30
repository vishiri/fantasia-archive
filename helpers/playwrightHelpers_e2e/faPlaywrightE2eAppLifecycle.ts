import type { ElectronApplication, Page } from 'playwright'

import type { I_faLaunchFaPlaywrightE2eAppWindowOptions } from 'app/types/I_faPlaywrightE2eApp'
import { launchFaPlaywrightElectronSerialSuiteWindow } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleLaunch'

/**
 * Opens the full app shell for E2E with shared serial-suite defaults ('readiness': 'e2e');
 * dismiss tips defaults to match E2E unless overridden (use false when the splash hides first).
 */
export async function launchFaPlaywrightE2eAppWindow (
  options: I_faLaunchFaPlaywrightE2eAppWindowOptions
): Promise<{
  electronApp: ElectronApplication
  appWindow: Page
}> {
  const dismissStartupTips = options.dismissStartupTips ?? 'auto'
  const testInfoBinding = options.testInfo
  const buildLaunchEnvBinding = options.buildLaunchEnv
  const electronLaunchAdditionalArgsBinding = options.electronLaunchAdditionalArgs
  const renderDelayMsBinding = options.renderDelayMs ?? 0
  const electronMainJsPathBinding = options.electronMainJsPath
  const resetUserDataBinding = options.resetUserData
  const beforeIsolationResetBinding = options.beforeIsolationReset
  const afterIsolationResetBeforeLaunchBinding = options.afterIsolationResetBeforeLaunch

  return launchFaPlaywrightElectronSerialSuiteWindow({
    afterIsolationResetBeforeLaunch: afterIsolationResetBeforeLaunchBinding,
    beforeIsolationReset: beforeIsolationResetBinding,
    buildLaunchEnv: buildLaunchEnvBinding,
    dismissStartupTips,
    electronLaunchAdditionalArgs: electronLaunchAdditionalArgsBinding,
    electronMainJsPath: electronMainJsPathBinding,
    readiness: 'e2e',
    renderDelayMs: renderDelayMsBinding,
    resetUserData: resetUserDataBinding,
    testInfo: testInfoBinding
  })
}
