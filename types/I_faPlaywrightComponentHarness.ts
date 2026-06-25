import type {
  I_faLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
  T_faPlaywrightDismissStartupTips
} from 'app/types/I_faPlaywrightElectronHarness'

type T_faPlaywrightComponentHarnessDismissTips =
  Exclude<T_faPlaywrightDismissStartupTips, 'auto'> | 'auto'

/** Options for launchFaPlaywrightComponentHarnessWindow. */
export type I_faLaunchFaPlaywrightComponentHarnessWindowOptions =
  Omit<
  I_faLaunchFaPlaywrightElectronSerialSuiteWindowOptions,
  'readiness' | 'renderDelayMs' | 'dismissStartupTips'
  > & {
    dismissStartupTips?: T_faPlaywrightComponentHarnessDismissTips | undefined
    renderDelayMs?: number | undefined
  }
