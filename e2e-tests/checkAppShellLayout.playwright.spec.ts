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
import L_ErrorNotFound from 'app/i18n/en-US/pages/L_ErrorNotFound'

/**
 * Extra env settings to trigger E2E via Playwright (isolated userData).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  errorCardTitle: 'errorCard-title',
  errorNotFoundPage: 'errorNotFoundPage',
  globalLanguageSelectorTrigger: 'globalLanguageSelector-trigger',
  mainLayout: 'mainLayout'
} as const

const UNKNOWN_ROUTE_PATH = '/e2e-unknown-route-for-404'

test.describe.serial('App shell layout (MainLayout)', () => {
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
   * Cold launch lands on the welcome route with top menus and splash content inside the shared shell.
   */
  test('welcome route shows splash content, top menus, and no workspace drawer', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, '/')
    await expectFaPlaywrightE2eWelcomeShell(appWindow)

    await expect(appWindow.getByRole('button', {
      exact: true,
      name: projectMenu.title
    })).toBeVisible()
    await expect(appWindow.locator(
      `[data-test-locator="${selectorList.globalLanguageSelectorTrigger}"]`
    )).toBeVisible()
  })

  /**
   * Workspace route keeps header chrome and exposes the left drawer band.
   */
  test('workspace route shows the drawer inside MainLayout', async () => {
    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)
    await expect(appWindow.locator('[data-test-locator="splashPage"]')).toHaveCount(0)
  })

  /**
   * Unknown hash paths render ErrorNotFound under the same shell with menus and language switcher.
   */
  test('unknown route shows ErrorNotFound inside MainLayout chrome', async () => {
    const currentUrl = appWindow.url()
    const hashIndex = currentUrl.indexOf('#')
    const baseUrl = hashIndex >= 0 ? currentUrl.slice(0, hashIndex) : currentUrl
    await appWindow.goto(`${baseUrl}#${UNKNOWN_ROUTE_PATH}`, { waitUntil: 'domcontentloaded' })

    await expect(appWindow.locator(`[data-test-locator="${selectorList.mainLayout}"]`)).toBeVisible()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorNotFoundPage}"]`)).toBeVisible()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorCardTitle}"]`)).toHaveText(
      L_ErrorNotFound.title
    )
    await expect(appWindow.getByRole('button', {
      exact: true,
      name: projectMenu.title
    })).toBeVisible()
    await expect(appWindow.locator(
      `[data-test-locator="${selectorList.globalLanguageSelectorTrigger}"]`
    )).toBeVisible()
    await expect(appWindow.locator('.appShellLayout--workspace')).toHaveCount(0)
  })
})
