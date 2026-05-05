import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  FA_ELECTRON_MAIN_JS_PATH,
  FA_FRONTEND_RENDER_TIMER
} from 'app/helpers/playwrightHelpers/faPlaywrightElectronLaunchConstants'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import {
  e2eSetNextProjectCreatePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers/playwrightE2eProjectPaths'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers/playwrightDismissStartupTipsNotify'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import newProjectSettings from 'app/i18n/en-US/dialogs/L_newProjectSettings'

const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

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
    resetFaPlaywrightIsolatedUserData()
    tryUnlinkE2eFaprojectFixture('e2e-splash-project.faproject')
    tryUnlinkE2eFaprojectFixture('e2e-menu-project.faproject')
    electronApp = await electron.launch({
      args: [electronMainFilePath],
      env: extraEnvSettings,
      ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
    })
    appWindow = await electronApp.firstWindow()
    await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
    await appWindow.waitForTimeout(FA_FRONTEND_RENDER_TIMER)
    await dismissStartupTipsNotifyIfPresent(appWindow)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
    tryUnlinkE2eFaprojectFixture('e2e-splash-project.faproject')
    tryUnlinkE2eFaprojectFixture('e2e-menu-project.faproject')
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
