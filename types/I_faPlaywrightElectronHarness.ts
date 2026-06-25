import type { TestInfo } from '@playwright/test'

/** Which Playwright serial suite readiness gate to wait for after launch. */
export type T_faPlaywrightSerialSuiteReadiness = 'component' | 'e2e'

/** Whether to dismiss startup tips after launch; 'auto' follows suite defaults. */
export type T_faPlaywrightDismissStartupTips = boolean | 'auto'

/** Options shared by component and E2E Playwright Electron serial suite launches. */
export interface I_faLaunchFaPlaywrightElectronSerialSuiteWindowOptions {
  testInfo: TestInfo
  buildLaunchEnv: () => Record<string, string>
  readiness: T_faPlaywrightSerialSuiteReadiness
  renderDelayMs: number
  /**
   * Extra strings appended after packaged main-process entry (cold OS-open tests pass an absolute '.faproject' path).
   */
  electronLaunchAdditionalArgs?: readonly string[] | undefined
  electronMainJsPath?: string | undefined
  resetUserData?: boolean | undefined
  dismissStartupTips?: T_faPlaywrightDismissStartupTips | undefined
  beforeIsolationReset?: () => void | Promise<void>
  afterIsolationResetBeforeLaunch?: () => void | Promise<void>
}
