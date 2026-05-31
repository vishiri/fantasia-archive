import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  expectFaPlaywrightE2eHashRoute,
  expectFaPlaywrightE2eWorkspaceShell
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppShellAssertions'
import { gotoFaPlaywrightE2eNonexistentRouteFor404 } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigate404'
import {
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  e2eSetNextProjectCreatePath
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import {
  interpolateFaProjectSessionNotify
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eProjectSessionNotify'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { FA_PLAYWRIGHT_PRESS_DEFAULT_SHOW_PROJECT_DASHBOARD } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

const selectorList = {
  dialogNewProjectCreate: 'dialogNewProject-button-create',
  dialogNewProjectNameInput: 'dialogNewProject-input-name',
  errorNotFoundPage: 'errorNotFoundPage',
  projectOverview: 'projectOverview',
  splashPageNew: 'splashPage-btn-new'
} as const

const E2E_PROJECT_DASHBOARD_KEYBIND_NAME = 'E2E show project dashboard keybind'
const E2E_PROJECT_DASHBOARD_KEYBIND_FIXTURE = 'e2e-show-project-dashboard-keybind.faproject'

async function prepareRendererForGlobalShortcuts (page: Page): Promise<void> {
  await page.bringToFront()
  await page.evaluate(() => {
    const root = document.querySelector('#q-app')
    if (root instanceof HTMLElement) {
      root.tabIndex = -1
      root.focus()
    }
  })
}

async function triggerGlobalShortcut (page: Page, playwrightShortcut: string): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(playwrightShortcut)
}

async function createE2eProjectOnHome (
  page: Page,
  electron: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electron, E2E_PROJECT_DASHBOARD_KEYBIND_FIXTURE)
  await page.locator(`[data-test-locator="${selectorList.splashPageNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.dialogNewProjectNameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectNameInput}"]`).fill(
    E2E_PROJECT_DASHBOARD_KEYBIND_NAME
  )
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectCreate}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, E2E_PROJECT_DASHBOARD_KEYBIND_NAME)
  await expect(page.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    E2E_PROJECT_DASHBOARD_KEYBIND_NAME
  ))).toBeVisible()
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

let electronApp: ElectronApplication
let appWindow: Page
let suiteTestInfo: TestInfo

test.describe.serial('Show Project Dashboard keybind (Ctrl+Shift+Alt+O)', () => {
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

  test('default Control+Alt+Shift+O leaves 404 and shows Project Overview when a project is active', async () => {
    await createE2eProjectOnHome(appWindow, electronApp)
    await gotoFaPlaywrightE2eNonexistentRouteFor404(appWindow)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorNotFoundPage}"]`)).toBeVisible()

    await triggerGlobalShortcut(appWindow, FA_PLAYWRIGHT_PRESS_DEFAULT_SHOW_PROJECT_DASHBOARD)

    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorNotFoundPage}"]`)).toHaveCount(0)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.projectOverview}"]`)).toBeVisible({
      timeout: 15_000
    })
    await expect(
      appWindow.locator('[data-test-locator="projectOverview-projectName"]')
    ).toHaveText(E2E_PROJECT_DASHBOARD_KEYBIND_NAME)
  })
})
