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
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  e2eSetNextProjectCreatePath
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import appSettingsMessages from 'app/i18n/en-US/dialogs/L_appSettings'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'
import {
  interpolateFaProjectSessionNotify
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eProjectSessionNotify'

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
  dialogAppSettingsClose: 'dialogAppSettings-button-close',
  dialogAppSettingsSave: 'dialogAppSettings-button-save',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  dialogNewProjectCreate: 'dialogNewProject-button-create',
  dialogNewProjectNameInput: 'dialogNewProject-input-name',
  hideTooltipsProjectSearchSetting: 'dialogAppSettings-search-setting-hideTooltipsProject',
  projectOverviewTipCard: 'projectOverview-tipCard',
  quasarToggle: '.q-toggle',
  splashPageNew: 'splashPage-btn-new'
} as const

/**
 * Playwright ControlOrMeta matches the app primary modifier (Command on macOS, Control on Windows and Linux).
 */
const defaultChord = {
  openAppSettings: 'ControlOrMeta+Alt+Shift+l'
} as const

const hideTooltipsProjectTitle =
  appSettingsMessages.appOptions.hideTooltipsProject.title

const E2E_PROJECT_OVERVIEW_TIPS_NAME = 'E2E project overview tips'
const E2E_PROJECT_OVERVIEW_TIPS_FIXTURE = 'e2e-project-overview-tips.faproject'

/**
 * q-input debounce is 300ms; allow slack for Electron paint after the model updates.
 */
const appSettingsSearchDebounceWaitMs = 400

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

async function fillAppSettingsSearch (page: Page, query: string): Promise<void> {
  const searchInput = page.locator('.dialogAppSettings__settingsSearchWrapper input').first()
  await searchInput.click()
  await searchInput.fill(query)
  await page.waitForTimeout(appSettingsSearchDebounceWaitMs)
}

async function openAppSettingsDialog (page: Page): Promise<void> {
  await triggerGlobalShortcut(page, defaultChord.openAppSettings)
  const title = page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  await expect(title).toBeVisible()
  await expect(title).toHaveText(appSettingsMessages.title)
}

async function saveAppSettingsDialog (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
  const title = page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

async function closeAppSettingsDialog (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.dialogAppSettingsClose}"]`).click()
  const title = page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

async function setQuasarToggleInRow (toggle: ReturnType<Page['locator']>, wantOn: boolean): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const isOn = (await toggle.getAttribute('aria-checked')) === 'true'
    if (isOn === wantOn) {
      return
    }
    await toggle.click()
  }
  throw new Error(`Quasar toggle did not reach aria-checked=${String(wantOn)}`)
}

async function setHideTooltipsProjectInDialog (page: Page, wantOn: boolean): Promise<void> {
  await fillAppSettingsSearch(page, hideTooltipsProjectTitle)
  const settingRow = page.locator(`[data-test-locator="${selectorList.hideTooltipsProjectSearchSetting}"]`)
  await expect(settingRow).toBeVisible()
  await expect(
    settingRow.locator('[data-test-locator="dialogAppSettings-search-settingLabel"]')
  ).toHaveText(hideTooltipsProjectTitle)
  const toggle = settingRow.locator(selectorList.quasarToggle).first()
  await setQuasarToggleInRow(toggle, wantOn)
}

async function createE2eProjectOnHome (
  page: Page,
  electron: ElectronApplication
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electron, E2E_PROJECT_OVERVIEW_TIPS_FIXTURE)
  await page.locator(`[data-test-locator="${selectorList.splashPageNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.dialogNewProjectNameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectNameInput}"]`).fill(
    E2E_PROJECT_OVERVIEW_TIPS_NAME
  )
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectCreate}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, E2E_PROJECT_OVERVIEW_TIPS_NAME)
  await expect(page.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    E2E_PROJECT_OVERVIEW_TIPS_NAME
  ))).toBeVisible()
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

function projectOverviewTipCard (page: Page) {
  return page.locator(`[data-test-locator="${selectorList.projectOverviewTipCard}"]`)
}

let electronApp: ElectronApplication
let appWindow: Page
let suiteTestInfo: TestInfo

test.describe.serial('Project overview tips (App Settings)', () => {
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
   * Fresh project on /home shows the Did you know tips card before the setting is enabled.
   */
  test('project overview shows tips card on home before Hide tips on project overview is enabled', async () => {
    await createE2eProjectOnHome(appWindow, electronApp)
    await expect(projectOverviewTipCard(appWindow)).toBeVisible()
  })

  /**
   * Enabling Hide tips on project overview in App Settings hides the card immediately without saving.
   */
  test('Hide tips on project overview hides the tips card live while App Settings stays open', async () => {
    await expect(projectOverviewTipCard(appWindow)).toBeVisible()
    await openAppSettingsDialog(appWindow)
    await setHideTooltipsProjectInDialog(appWindow, true)
    await expect(projectOverviewTipCard(appWindow)).toBeHidden()
  })

  /**
   * Closing App Settings without saving restores the tips card when the toggle was only a draft.
   */
  test('closing App Settings without saving restores the project overview tips card', async () => {
    await closeAppSettingsDialog(appWindow)
    await expect(projectOverviewTipCard(appWindow)).toBeVisible()
  })

  /**
   * Saving Hide tips on project overview keeps the tips card hidden on the project overview page.
   */
  test('saving Hide tips on project overview keeps the tips card hidden on home', async () => {
    await openAppSettingsDialog(appWindow)
    await setHideTooltipsProjectInDialog(appWindow, true)
    await saveAppSettingsDialog(appWindow)
    await expect(projectOverviewTipCard(appWindow)).toBeHidden()
  })

  /**
   * Turning the setting off again and saving brings the tips card back without restarting the app.
   */
  test('disabling Hide tips on project overview after save restores the tips card on home', async () => {
    await openAppSettingsDialog(appWindow)
    await setHideTooltipsProjectInDialog(appWindow, false)
    await saveAppSettingsDialog(appWindow)
    await expect(projectOverviewTipCard(appWindow)).toBeVisible()
  })
})
