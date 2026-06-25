import type {
  I_faLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
  T_faPlaywrightDismissStartupTips
} from 'app/types/I_faPlaywrightElectronHarness'

/** Options for launchFaPlaywrightE2eAppWindow. */
export type I_faLaunchFaPlaywrightE2eAppWindowOptions = Omit<
I_faLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
'readiness' | 'renderDelayMs'
> & {
  dismissStartupTips?: T_faPlaywrightDismissStartupTips | undefined
  renderDelayMs?: number | undefined
}
