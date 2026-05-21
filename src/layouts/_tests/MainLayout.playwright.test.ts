import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  expectFaPlaywrightE2eHashRoute,
  expectFaPlaywrightE2eWelcomeShell,
  expectFaPlaywrightE2eWorkspaceShell
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppShellAssertions'
import {
  navigateFaPlaywrightE2eToHomeRoute,
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'

/**
 * Extra env settings to exercise MainLayout through the full Electron shell (same as E2E).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

/**
 * Object of string data selectors for the layout shell
 */
const selectorList = {
  mainLayout: 'mainLayout',
  splashPage: 'splashPage'
} as const

test.describe.serial('MainLayout shell routes', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: true,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
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
   * Welcome route mounts SplashPage under persistent header chrome without opening the workspace drawer.
   */
  test('Check if welcome route keeps splash visible and workspace drawer closed', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, '/')
    await expectFaPlaywrightE2eWelcomeShell(appWindow)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.mainLayout}"]`)).toBeVisible()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashPage}"]`)).toBeVisible()
    await expect(appWindow.getByRole('button', {
      exact: true,
      name: projectMenu.title
    })).toBeVisible()
  })

  /**
   * Workspace route toggles the drawer band while keeping the same MainLayout instance.
   */
  test('Check if workspace route shows the drawer and hides splash', async () => {
    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashPage}"]`)).toHaveCount(0)
  })
})
