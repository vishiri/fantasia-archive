import fs from 'node:fs'

import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreEmpty,
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  navigateFaPlaywrightE2eToHomeRoute,
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  clickFaPlaywrightE2eSplashResumePrimarySegment,
  expectFaPlaywrightE2eSplashResumeDropdownLabelsOrdered,
  openFaPlaywrightE2eSplashResumeDropdown
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eSplashResume'
import {
  e2eSetNextProjectCreatePath,
  getE2eFaprojectFixtureAbsolutePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_newProject from 'app/i18n/en-US/dialogs/L_newProject'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
import L_faProjectSettings from 'app/i18n/en-US/globalFunctionality/L_faProjectSettings'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

/**
 * Extra env settings to trigger E2E via Playwright (isolated userData, dialog path overrides).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

const MENU_ANIMATION_MS = 600

const PROJECT_SETTINGS_E2E_FAPROJECT = 'e2e-project-settings.faproject'
const PROJECT_SETTINGS_E2E_INITIAL_NAME = 'E2E Project Settings initial'
const PROJECT_SETTINGS_E2E_RENAMED = 'E2E Project Settings renamed'

const selectorList = {
  dialogCreateBtn: 'dialogNewProject-button-create',
  dialogNameInput: 'dialogNewProject-input-name',
  dialogProjectSettingsInput: 'dialogProjectSettings-input-projectName',
  dialogProjectSettingsSave: 'dialogProjectSettings-button-save',
  dialogProjectSettingsTitle: 'dialogProjectSettings-title',
  submenuItemSubMenu: 'AppControlSingleMenu-menuItem-subMenu',
  submenuItemSubMenuItem: 'AppControlSingleMenu-menuItem-subMenu-item',
  submenuItemSubMenuItemText: 'AppControlSingleMenu-menuItem-subMenu-item-text',
  splashNew: 'splashPage-btn-new'
} as const

function interpolateFaProjectSessionNotify (template: string, projectName: string): string {
  return template.split('{projectName}').join(projectName)
}

function assertE2eFaprojectFixtureHasContentOnDisk (baseName: string): void {
  const absolutePath = getE2eFaprojectFixtureAbsolutePath(baseName)
  expect(fs.existsSync(absolutePath)).toBe(true)
  const stat = fs.statSync(absolutePath)
  expect(stat.isFile()).toBe(true)
  expect(stat.size).toBeGreaterThan(0)
}

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

async function openProjectSettingsFromMenu (page: Page): Promise<void> {
  await openProjectMenu(page)
  const row = page.getByRole('menuitem', {
    exact: true,
    name: projectMenu.items.projectSettings
  })
  await expect(row).toBeVisible()
  await row.click()
  await dismissOpenMenus(page)
}

async function openLoadRecentSubmenu (page: Page): Promise<void> {
  await page.getByRole('menuitem', { name: projectMenu.items.loadRecentProject }).hover({ force: true })
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function expectLoadRecentSubmenuFirstLabel (page: Page, label: string): Promise<void> {
  const panel = page.locator(`[data-test-locator="${selectorList.submenuItemSubMenu}"]`).last()
  const first = panel.locator(`[data-test-locator="${selectorList.submenuItemSubMenuItem}"]`).first()
  await expect(
    first.locator(`[data-test-locator="${selectorList.submenuItemSubMenuItemText}"] span`)
  ).toHaveText(label)
}

async function createProjectViaMenu (
  appWin: Page,
  electron: ElectronApplication,
  projectName: string,
  fixtureBaseName: string
): Promise<void> {
  await e2eSetNextProjectCreatePath(electron, fixtureBaseName)
  await openProjectMenu(appWin)
  await appWin.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
  await expect(appWin.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
  await appWin.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`).fill(projectName)
  await appWin.locator(`[data-test-locator="${selectorList.dialogCreateBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(appWin, projectName)
  await expect(appWin.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    projectName
  ))).toBeVisible()
}

async function relaunchE2eAppWindowKeepingUserData (
  suiteTestInfoBinding: TestInfo,
  currentTestInfo: TestInfo,
  dismissStartupTips: boolean
): Promise<void> {
  await tearDownFaPlaywrightElectronSerialSuite({
    afterAllTestInfo: currentTestInfo,
    electronApp,
    suiteTestInfo: suiteTestInfoBinding
  })
  const launched = await launchFaPlaywrightE2eAppWindow({
    buildLaunchEnv (): Record<string, string> {
      return {
        TEST_ENV: extraEnvSettings.TEST_ENV
      }
    },
    dismissStartupTips,
    renderDelayMs: FA_FRONTEND_RENDER_TIMER,
    resetUserData: false,
    testInfo: suiteTestInfoBinding
  })
  electronApp = launched.electronApp
  appWindow = launched.appWindow
}

let electronApp: ElectronApplication
let appWindow: Page
let suiteTestInfo: TestInfo

test.describe.serial('Project settings E2E — rename via dialog', () => {
  test.describe.configure({ timeout: 240_000 })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture(PROJECT_SETTINGS_E2E_FAPROJECT)
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
      electronApp,
      suiteTestInfo,
      afterClose (): void {
        tryUnlinkE2eFaprojectFixture(PROJECT_SETTINGS_E2E_FAPROJECT)
      }
    })
  })

  /**
   * Creates a project, renames it through Project Settings, and asserts Pinia name, MRU submenu, and splash resume dropdown.
   */
  test('Create project, rename via Project Settings, assert same-session UI sync', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await createProjectViaMenu(
      appWindow,
      electronApp,
      PROJECT_SETTINGS_E2E_INITIAL_NAME,
      PROJECT_SETTINGS_E2E_FAPROJECT
    )
    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_SETTINGS_E2E_FAPROJECT)

    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, PROJECT_SETTINGS_E2E_INITIAL_NAME)

    await openProjectSettingsFromMenu(appWindow)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogProjectSettingsTitle}"]`)
    ).toContainText(L_projectSettings.title)
    const nameField = appWindow.locator(`[data-test-locator="${selectorList.dialogProjectSettingsInput}"]`)
    await expect(nameField).toHaveValue(PROJECT_SETTINGS_E2E_INITIAL_NAME)
    await nameField.fill(PROJECT_SETTINGS_E2E_RENAMED)
    await appWindow.locator(`[data-test-locator="${selectorList.dialogProjectSettingsSave}"]`).click()
    await expect(
      appWindow.getByText(L_faProjectSettings.saveSuccess)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogProjectSettingsTitle}"]`)
    ).toHaveCount(0, { timeout: 15_000 })

    await e2eExpectFaActiveProjectStoreName(appWindow, PROJECT_SETTINGS_E2E_RENAMED)

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuFirstLabel(appWindow, PROJECT_SETTINGS_E2E_RENAMED)
    await dismissOpenMenus(appWindow)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await openFaPlaywrightE2eSplashResumeDropdown(appWindow)
    await expectFaPlaywrightE2eSplashResumeDropdownLabelsOrdered(appWindow, [
      PROJECT_SETTINGS_E2E_RENAMED
    ])
    await dismissOpenMenus(appWindow)
  })

  /**
   * After relaunch without resetting userData, splash and menu MRU show the renamed label before load; reopening settings reads SQLite.
   */
  test('Cold restart: persisted rename in SQLite and MRU; fresh DB read on reopen', async ({}, testInfo) => {
    await relaunchE2eAppWindowKeepingUserData(suiteTestInfo, testInfo, true)
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await e2eExpectFaActiveProjectStoreEmpty(appWindow)

    await openFaPlaywrightE2eSplashResumeDropdown(appWindow)
    await expectFaPlaywrightE2eSplashResumeDropdownLabelsOrdered(appWindow, [
      PROJECT_SETTINGS_E2E_RENAMED
    ])
    await dismissOpenMenus(appWindow)

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuFirstLabel(appWindow, PROJECT_SETTINGS_E2E_RENAMED)
    await dismissOpenMenus(appWindow)

    await clickFaPlaywrightE2eSplashResumePrimarySegment(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, PROJECT_SETTINGS_E2E_RENAMED)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      PROJECT_SETTINGS_E2E_RENAMED
    ))).toBeVisible()

    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, PROJECT_SETTINGS_E2E_RENAMED)

    await openProjectSettingsFromMenu(appWindow)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogProjectSettingsInput}"]`)
    ).toHaveValue(PROJECT_SETTINGS_E2E_RENAMED)
    await dismissOpenMenus(appWindow)
  })
})
