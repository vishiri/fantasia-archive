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
import {
  FA_PLAYWRIGHT_E2E_NONEXISTENT_ROUTE_PATH,
  gotoFaPlaywrightE2eNonexistentRouteFor404
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigate404'
import {
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  interpolateFaProjectSessionNotify
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eProjectSessionNotify'
import {
  e2eSetNextProjectCreatePath
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

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
  dialogNewProjectCreate: 'dialogNewProject-button-create',
  dialogNewProjectNameInput: 'dialogNewProject-input-name',
  errorNotFoundPage: 'errorNotFoundPage',
  projectOverview: 'projectOverview',
  projectOverviewProjectName: 'projectOverview-projectName',
  splashPageNew: 'splashPage-btn-new'
} as const

const MENU_ANIMATION_MS = 600

const E2E_PROJECT_DASHBOARD_MENU_NAME = 'E2E show project dashboard menu'
const E2E_PROJECT_DASHBOARD_MENU_FIXTURE = 'e2e-show-project-dashboard-menu.faproject'

async function dismissOpenMenus (page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
}

async function openProjectMenu (page: Page): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  await dismissOpenMenus(page)
  const trigger = page.getByRole('button', {
    exact: true,
    name: projectMenu.title
  })
  await expect(trigger).toBeVisible({ timeout: 20_000 })
  await trigger.click()
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function triggerShowProjectDashboardFromMenu (page: Page): Promise<void> {
  await openProjectMenu(page)
  const row = page.getByRole('menuitem', {
    exact: false,
    name: projectMenu.items.showProjectDashboard
  })
  await expect(row).toBeVisible()
  await expect(row).toBeEnabled()
  await row.click()
  await dismissOpenMenus(page)
}

async function expectProjectOverviewForProject (page: Page, projectName: string): Promise<void> {
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expect(page.locator(`[data-test-locator="${selectorList.projectOverview}"]`)).toBeVisible({
    timeout: 15_000
  })
  await expect(
    page.locator(`[data-test-locator="${selectorList.projectOverviewProjectName}"]`)
  ).toHaveText(projectName)
}

async function createE2eProjectOnHome (
  page: Page,
  electron: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electron, E2E_PROJECT_DASHBOARD_MENU_FIXTURE)
  await page.locator(`[data-test-locator="${selectorList.splashPageNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.dialogNewProjectNameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectNameInput}"]`).fill(
    E2E_PROJECT_DASHBOARD_MENU_NAME
  )
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectCreate}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, E2E_PROJECT_DASHBOARD_MENU_NAME)
  await expect(page.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    E2E_PROJECT_DASHBOARD_MENU_NAME
  ))).toBeVisible()
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

let electronApp: ElectronApplication
let appWindow: Page
let suiteTestInfo: TestInfo

test.describe.serial('Show Project Dashboard menu', () => {
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

  test('create project, 404 route, then Show Project Dashboard menu returns to project overview', async () => {
    await createE2eProjectOnHome(appWindow, electronApp)
    await expectProjectOverviewForProject(appWindow, E2E_PROJECT_DASHBOARD_MENU_NAME)

    await gotoFaPlaywrightE2eNonexistentRouteFor404(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, FA_PLAYWRIGHT_E2E_NONEXISTENT_ROUTE_PATH)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorNotFoundPage}"]`)).toBeVisible()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.projectOverview}"]`)).toHaveCount(0)

    await triggerShowProjectDashboardFromMenu(appWindow)

    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorNotFoundPage}"]`)).toHaveCount(0)
    await expectProjectOverviewForProject(appWindow, E2E_PROJECT_DASHBOARD_MENU_NAME)
  })
})
