import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  e2eSetNextProjectCreatePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import newProjectSettings from 'app/i18n/en-US/dialogs/L_newProjectSettings'

const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

const selectorList = {
  activeProject: 'mainLayout-activeProjectName',
  createBtn: 'dialogNewProjectSettings-button-create',
  nameInput: 'dialogNewProjectSettings-input-name',
  splashNew: 'splashPage-btn-new'
} as const

test.describe.serial('New project creation', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture('e2e-splash-project.faproject')
        tryUnlinkE2eFaprojectFixture('e2e-menu-project.faproject')
      },
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
      async afterClose (): Promise<void> {
        tryUnlinkE2eFaprojectFixture('e2e-splash-project.faproject')
        tryUnlinkE2eFaprojectFixture('e2e-menu-project.faproject')
      },
      electronApp,
      suiteTestInfo
    })
  })

  test('creates a .faproject from the splash New project control', async () => {
    await e2eSetNextProjectCreatePath(electronApp, 'e2e-splash-project.faproject')
    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill('E2E Splash Realm')
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.activeProject}"]`)).toHaveText('E2E Splash Realm')
  })

  test('opens New project from the Project menu and creates a file', async () => {
    await e2eSetNextProjectCreatePath(electronApp, 'e2e-menu-project.faproject')
    const projectTitle = projectMenu.title
    await appWindow.getByRole('button', {
      exact: true,
      name: projectTitle
    }).click()
    await appWindow.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
    await expect(appWindow.locator('#dialogNewProjectSettings-title')).toContainText(newProjectSettings.title)
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill('E2E Menu Realm')
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.activeProject}"]`)).toHaveText('E2E Menu Realm')
  })
})
