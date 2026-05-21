import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_splashPage from 'app/i18n/en-US/pages/L_splashPage'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'SplashControls',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  primaryActions: 'splashPage-primaryActions',
  splashLoad: 'splashPage-btn-load',
  splashNew: 'splashPage-btn-new',
  splashResumeLatest: 'splashPage-btn-resume-latest',
  splashTitle: 'splashPage-title',
  splashTitleRow: 'splashPage-titleRow'
}

test.describe.serial('Splash controls', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Isolated harness mounts SplashControls with welcome chrome and primary create/load actions.
   */
  test('renders welcome title row and primary create/load actions', async () => {
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashTitleRow}"]`)).toBeVisible()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashTitle}"]`)).toHaveText(
      L_splashPage.title
    )
    await expect(appWindow.locator(`[data-test-locator="${selectorList.primaryActions}"]`)).toBeVisible()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`)).toHaveText(
      L_splashPage.newProject
    )
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashLoad}"]`)).toHaveText(
      L_splashPage.loadExistingProject
    )
  })

  /**
   * Cold isolated userData has no MRU rows, so the Resume split control stays hidden.
   */
  test('hides Resume split control when recent projects list is empty', async () => {
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashResumeLatest}"]`)).toHaveCount(0)
  })
})
