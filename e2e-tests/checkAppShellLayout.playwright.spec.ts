import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { e2eExpectFaActiveProjectStoreName } from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  expectFaPlaywrightE2eHashRoute,
  expectFaPlaywrightE2eWelcomeShell,
  expectFaPlaywrightE2eWorkspaceShell
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppShellAssertions'
import {
  FA_PLAYWRIGHT_E2E_NONEXISTENT_ROUTE_PATH,
  gotoFaPlaywrightE2eNonexistentRouteFor404
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigate404'
import {
  navigateFaPlaywrightE2eToHomeRoute,
  navigateFaPlaywrightE2eToSplashRoute,
  waitForFaPlaywrightE2eAppShellPageTransitionIdle
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  expectFaPlaywrightE2eNoProjectSessionNotifyForName,
  expectFaPlaywrightE2eProjectAlreadyActiveReuseAfter,
  interpolateFaProjectSessionNotify
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eProjectSessionNotify'
import {
  clickFaPlaywrightE2eSplashResumePrimarySegment,
  expectFaPlaywrightE2eSplashResumePrimaryLabel
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eSplashResume'
import {
  e2eSetNextProjectCreatePath,
  e2eSetNextProjectOpenPath
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'
import L_ErrorNotFound from 'app/i18n/en-US/pages/L_ErrorNotFound'
import L_splashPage from 'app/i18n/en-US/pages/L_splashPage'

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
  createBtn: 'dialogNewProject-button-create',
  errorCardTitle: 'errorCard-title',
  errorNotFoundPage: 'errorNotFoundPage',
  errorNotFoundResumeCurrent: 'errorNotFound-btn-resume-current',
  errorNotFoundReturnToStart: 'errorNotFound-btn-return-to-start',
  globalLanguageSelectorTrigger: 'globalLanguageSelector-trigger',
  mainLayout: 'mainLayout',
  nameInput: 'dialogNewProject-input-name',
  splashNew: 'splashPage-btn-new',
  splashResumeLatest: 'splashPage-btn-resume-latest'
} as const

const E2E_SHELL_404_PROJECT_NAME = 'E2E shell 404 resume current project'

async function createE2eProjectFromSplashWelcome (
  page: Page,
  electronApplication: ElectronApplication,
  fixtureBaseName: string,
  displayName: string
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, fixtureBaseName)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(displayName)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, displayName)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

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
    await gotoFaPlaywrightE2eNonexistentRouteFor404(appWindow)

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
    await expect(appWindow.locator(
      `[data-test-locator="${selectorList.errorNotFoundResumeCurrent}"]`
    )).toHaveCount(0)
  })

  /**
   * Loads a project, opens a nonsense URL, and uses Resume Current Project to return to the workspace with already-active warning.
   */
  test('nonexistent route resume current project reopens active session', async () => {
    await createE2eProjectFromSplashWelcome(
      appWindow,
      electronApp,
      'e2e-shell-404-resume.faproject',
      E2E_SHELL_404_PROJECT_NAME
    )

    await gotoFaPlaywrightE2eNonexistentRouteFor404(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, FA_PLAYWRIGHT_E2E_NONEXISTENT_ROUTE_PATH)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorNotFoundPage}"]`)).toBeVisible()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.errorCardTitle}"]`)).toHaveText(
      L_ErrorNotFound.title
    )

    const resumeLocator = appWindow.locator(
      `[data-test-locator="${selectorList.errorNotFoundResumeCurrent}"]`
    )
    const returnLocator = appWindow.locator(
      `[data-test-locator="${selectorList.errorNotFoundReturnToStart}"]`
    )
    await expect(resumeLocator).toBeVisible()
    await expect(resumeLocator).toHaveText(L_ErrorNotFound.resumeCurrentProject)
    await expect(returnLocator).toBeVisible()
    await expect(returnLocator).toHaveText(L_ErrorNotFound.ctaText)

    const resumeBox = await resumeLocator.boundingBox()
    const returnBox = await returnLocator.boundingBox()
    expect(resumeBox).not.toBeNull()
    expect(returnBox).not.toBeNull()
    if (resumeBox !== null && returnBox !== null) {
      expect(resumeBox.y).toBeLessThan(returnBox.y)
    }

    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_SHELL_404_PROJECT_NAME)
    await resumeLocator.click()
    await waitForFaPlaywrightE2eAppShellPageTransitionIdle(appWindow)

    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_SHELL_404_PROJECT_NAME)
    await expectFaPlaywrightE2eNoProjectSessionNotifyForName(appWindow, E2E_SHELL_404_PROJECT_NAME)
  })

  /**
   * Welcome splash shows Resume Current Project when a session is active; primary segment reopens workspace quietly.
   */
  test('welcome splash resume current project reopens workspace without warning toast', async () => {
    await createE2eProjectFromSplashWelcome(
      appWindow,
      electronApp,
      'e2e-shell-splash-resume-current.faproject',
      'E2E shell splash resume current project'
    )

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.splashResumeLatest}"]`)).toBeVisible()
    await expectFaPlaywrightE2eSplashResumePrimaryLabel(appWindow, L_splashPage.resumeCurrentProject)

    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await expectFaPlaywrightE2eNoProjectSessionNotifyForName(appWindow, 'E2E shell splash resume current project')
    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, 'E2E shell splash resume current project')
  })

  /**
   * Loading the active file from Project menu on a 404 route warns and navigates to workspace.
   */
  test('nonexistent route load existing project reuses active session with warning toast', async () => {
    await createE2eProjectFromSplashWelcome(
      appWindow,
      electronApp,
      'e2e-shell-404-load-reuse.faproject',
      'E2E shell 404 load reuse project'
    )

    await gotoFaPlaywrightE2eNonexistentRouteFor404(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, FA_PLAYWRIGHT_E2E_NONEXISTENT_ROUTE_PATH)

    const loadedNotify = interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      'E2E shell 404 load reuse project'
    )
    await e2eSetNextProjectOpenPath(electronApp, 'e2e-shell-404-load-reuse.faproject')
    await expectFaPlaywrightE2eProjectAlreadyActiveReuseAfter(
      appWindow,
      'E2E shell 404 load reuse project',
      loadedNotify,
      async () => {
        await appWindow.getByRole('button', {
          exact: true,
          name: projectMenu.title
        }).click()
        await appWindow.getByRole('menuitem', { name: projectMenu.items.loadProject }).click()
      }
    )

    await e2eExpectFaActiveProjectStoreName(appWindow, 'E2E shell 404 load reuse project')
    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)
  })
})
