import type { ElectronApplication, Page } from 'playwright'

import type {
  IFaLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
  TFaPlaywrightDismissStartupTips
} from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleLaunch'
import { launchFaPlaywrightElectronSerialSuiteWindow } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleLaunch'

export type IFaLaunchFaPlaywrightE2eAppWindowOptions = Omit<
IFaLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
'readiness' | 'dismissStartupTips'
> & {
  dismissStartupTips?: TFaPlaywrightDismissStartupTips
}

/**
 * Opens the full app shell for E2E with shared serial-suite defaults ('readiness': 'e2e');
 * dismiss tips defaults to match E2E unless overridden (use false when the splash hides first).
 */
export async function launchFaPlaywrightE2eAppWindow (
  options: IFaLaunchFaPlaywrightE2eAppWindowOptions
): Promise<{
  electronApp: ElectronApplication
  appWindow: Page
}> {
  const dismissStartupTips = options.dismissStartupTips ?? 'auto'
  const testInfoBinding = options.testInfo
  const buildLaunchEnvBinding = options.buildLaunchEnv
  const electronLaunchAdditionalArgsBinding = options.electronLaunchAdditionalArgs
  const renderDelayMsBinding = options.renderDelayMs
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
