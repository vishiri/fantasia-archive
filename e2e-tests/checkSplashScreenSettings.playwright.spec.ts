import fs from 'node:fs'

import type { ElectronApplication, Locator, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreEmpty,
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  expectFaPlaywrightE2eWelcomeShell,
  expectFaPlaywrightE2eHashRoute,
  expectFaPlaywrightE2eWorkspaceShell
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppShellAssertions'
import {
  navigateFaPlaywrightE2eToSplashRoute,
  waitForFaPlaywrightE2eAppShellPageTransitionIdle
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  interpolateFaProjectSessionNotify
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eProjectSessionNotify'
import {
  e2eSetNextProjectCreatePath,
  getE2eFaprojectFixtureAbsolutePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import {
  dismissStartupTipsNotifyIfPresent,
  startupTipsNotificationBanner
} from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import appSettingsMessages from 'app/i18n/en-US/dialogs/L_appSettings'
import L_newProject from 'app/i18n/en-US/dialogs/L_newProject'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'
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
  dialogAppSettingsSave: 'dialogAppSettings-button-save',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  dialogNewProjectCreate: 'dialogNewProject-button-create',
  dialogNewProjectNameInput: 'dialogNewProject-input-name',
  hideRecentProjectTooltipSearchSetting: 'dialogAppSettings-search-setting-hideRecentProjectTooltip',
  hideTooltipsStartSearchSetting: 'dialogAppSettings-search-setting-hideTooltipsStart',
  hideWelcomeScreenSocialsSearchSetting: 'dialogAppSettings-search-setting-hideWelcomeScreenSocials',
  quasarToggle: '.q-toggle',
  quasarTooltip: '[role="tooltip"]',
  skipWelcomeScreenSearchSetting: 'dialogAppSettings-search-setting-skipWelcomeScreen',
  socialContactButtons: 'socialContactButtons',
  splashPageNew: 'splashPage-btn-new',
  splashPageResumeLatest: 'splashPage-btn-resume-latest',
  splashPageSocialSeparator: 'splashPage-socialSeparator'
} as const

/**
 * Playwright ControlOrMeta matches the app primary modifier (Command on macOS, Control on Windows and Linux).
 */
const defaultChord = {
  openAppSettings: 'ControlOrMeta+Alt+Shift+l'
} as const

const hideRecentProjectTooltipTitle =
  appSettingsMessages.appOptions.hideRecentProjectTooltip.title

const hideWelcomeScreenSocialsTitle =
  appSettingsMessages.appOptions.hideWelcomeScreenSocials.title

const hideTooltipsStartTitle =
  appSettingsMessages.appOptions.hideTooltipsStart.title

const skipWelcomeScreenTitle =
  appSettingsMessages.appOptions.skipWelcomeScreen.title

const E2E_SKIP_WELCOME_SUCCESS_NAME = 'E2E skip welcome success'
const E2E_SKIP_WELCOME_SUCCESS_FIXTURE = 'e2e-skip-welcome-success.faproject'

const E2E_SKIP_WELCOME_HEAD_MISSING_NAME = 'E2E skip welcome MRU head missing'
const E2E_SKIP_WELCOME_HEAD_MISSING_FIXTURE = 'e2e-skip-welcome-head-missing.faproject'

const E2E_RESUME_TOOLTIP_NAME = 'E2E resume tooltip'
const E2E_RESUME_TOOLTIP_FIXTURE = 'e2e-resume-tooltip.faproject'

const resumeDropdownBrowseTooltipText = L_splashPage.browseLatestProjects

const resumeDropdownTooltipVisibleTimeoutMs = 12_000

function unlinkSkipWelcomeScreenE2eFixtures (): void {
  tryUnlinkE2eFaprojectFixture(E2E_SKIP_WELCOME_SUCCESS_FIXTURE)
  tryUnlinkE2eFaprojectFixture(E2E_SKIP_WELCOME_HEAD_MISSING_FIXTURE)
  tryUnlinkE2eFaprojectFixture(E2E_RESUME_TOOLTIP_FIXTURE)
}

/**
 * q-input debounce is 300ms; allow slack for Electron paint after the model updates.
 */
const appSettingsSearchDebounceWaitMs = 400

/**
 * Matches dismissStartupTipsNotifyIfPresent absent-banner gate when asserting tips stay off after relaunch.
 */
const startupTipsAbsentWaitMs = 2000

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

async function setQuasarToggleInRow (toggle: Locator, wantOn: boolean): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const isOn = (await toggle.getAttribute('aria-checked')) === 'true'
    if (isOn === wantOn) {
      return
    }
    await toggle.click()
  }
  throw new Error(`Quasar toggle did not reach aria-checked=${String(wantOn)}`)
}

async function setAppSettingsToggleBySearch (
  page: Page,
  settingTitle: string,
  settingRowLocator: string,
  wantOn: boolean
): Promise<void> {
  await fillAppSettingsSearch(page, settingTitle)
  const settingRow = page.locator(`[data-test-locator="${settingRowLocator}"]`)
  await expect(settingRow).toBeVisible()
  await expect(
    settingRow.locator('[data-test-locator="dialogAppSettings-search-settingLabel"]')
  ).toHaveText(settingTitle)
  const toggle = settingRow.locator(selectorList.quasarToggle).first()
  await setQuasarToggleInRow(toggle, wantOn)
}

async function setHideWelcomeScreenSocialsInDialog (page: Page, wantOn: boolean): Promise<void> {
  await setAppSettingsToggleBySearch(
    page,
    hideWelcomeScreenSocialsTitle,
    selectorList.hideWelcomeScreenSocialsSearchSetting,
    wantOn
  )
}

async function setHideTooltipsStartInDialog (page: Page, wantOn: boolean): Promise<void> {
  await setAppSettingsToggleBySearch(
    page,
    hideTooltipsStartTitle,
    selectorList.hideTooltipsStartSearchSetting,
    wantOn
  )
}

async function setHideRecentProjectTooltipInDialog (page: Page, wantOn: boolean): Promise<void> {
  await setAppSettingsToggleBySearch(
    page,
    hideRecentProjectTooltipTitle,
    selectorList.hideRecentProjectTooltipSearchSetting,
    wantOn
  )
}

async function setSkipWelcomeScreenInDialog (page: Page, wantOn: boolean): Promise<void> {
  await setAppSettingsToggleBySearch(
    page,
    skipWelcomeScreenTitle,
    selectorList.skipWelcomeScreenSearchSetting,
    wantOn
  )
}

async function createE2eProjectFromSplash (
  page: Page,
  electron: ElectronApplication,
  projectName: string,
  fixtureBaseName: string
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electron, fixtureBaseName)
  await page.locator(`[data-test-locator="${selectorList.splashPageNew}"]`).click()
  await expect(page.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectNameInput}"]`).fill(projectName)
  await page.locator(`[data-test-locator="${selectorList.dialogNewProjectCreate}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, projectName)
}

async function expectProjectLoadedNotifyAbsent (page: Page, projectName: string): Promise<void> {
  const loadedNotify = interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectLoaded,
    projectName
  )
  await expect(page.getByText(loadedNotify)).toHaveCount(0)
}

function splashResumeDropdownArrowLocator (page: Page): Locator {
  return page
    .locator(`[data-test-locator="${selectorList.splashPageResumeLatest}"]`)
    .locator('.q-btn-dropdown__arrow-container')
    .first()
}

async function expectResumeDropdownBrowseTooltipVisible (
  page: Page,
  visible: boolean
): Promise<void> {
  const arrow = splashResumeDropdownArrowLocator(page)
  await expect(arrow).toBeVisible()

  if (visible) {
    await expect(async () => {
      await arrow.hover({ force: true })
      const liveTooltip = page
        .locator(selectorList.quasarTooltip)
        .filter({ hasText: resumeDropdownBrowseTooltipText })
        .last()
      await expect(liveTooltip).toBeVisible({
        timeout: 4000
      })
      await expect(liveTooltip).toHaveText(resumeDropdownBrowseTooltipText)
    }).toPass({
      timeout: resumeDropdownTooltipVisibleTimeoutMs
    })
    await page.mouse.move(0, 0)
    return
  }

  await arrow.hover({ force: true })
  await page.waitForTimeout(500)
  const liveTooltip = page
    .locator(selectorList.quasarTooltip)
    .filter({ hasText: resumeDropdownBrowseTooltipText })
  await expect(liveTooltip).toHaveCount(0)
  await page.mouse.move(0, 0)
}

async function expectSplashSocialChromeVisible (page: Page, visible: boolean): Promise<void> {
  const separator = page.locator(`[data-test-locator="${selectorList.splashPageSocialSeparator}"]`)
  const socialButtons = page.locator(`[data-test-locator="${selectorList.socialContactButtons}"]`)
  if (visible) {
    await expect(separator).toBeVisible()
    await expect(socialButtons).toBeVisible()
  } else {
    await expect(separator).toHaveCount(0)
    await expect(socialButtons).toHaveCount(0)
  }
}

async function expectStartupTipsBannerAbsent (page: Page): Promise<void> {
  const banner = startupTipsNotificationBanner(page)
  await expect(banner).toHaveCount(0, {
    timeout: startupTipsAbsentWaitMs
  })
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

test.describe.serial('Splash screen settings (App Settings)', () => {
  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: false,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    unlinkSkipWelcomeScreenE2eFixtures()
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Isolated Playwright userData defaults hideTooltipsStart to off; cold launch shows the Did you know notify.
   */
  test('cold launch shows startup tips notification before the setting is enabled', async () => {
    const banner = startupTipsNotificationBanner(appWindow)
    await expect(banner).toBeVisible({
      timeout: 10_000
    })
    await dismissStartupTipsNotifyIfPresent(appWindow)
    await expectStartupTipsBannerAbsent(appWindow)
  })

  /**
   * Isolated Playwright userData defaults hideWelcomeScreenSocials to off; splash shows divider and social rows.
   */
  test('welcome route shows social contact block before the setting is enabled', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await expectFaPlaywrightE2eHashRoute(appWindow, '/')
    await expectFaPlaywrightE2eWelcomeShell(appWindow)
    await expectSplashSocialChromeVisible(appWindow, true)
  })

  /**
   * Enabling Hide welcome screen social links in App Settings removes splash divider and social rows after save.
   */
  test('Hide welcome screen social links setting hides splash social chrome', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await openAppSettingsDialog(appWindow)
    await setHideWelcomeScreenSocialsInDialog(appWindow, true)
    await saveAppSettingsDialog(appWindow)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await waitForFaPlaywrightE2eAppShellPageTransitionIdle(appWindow)
    await expectSplashSocialChromeVisible(appWindow, false)
  })

  /**
   * Turning the setting off again restores splash divider and social rows without restarting the app.
   */
  test('disabling Hide welcome screen social links restores splash social chrome', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await openAppSettingsDialog(appWindow)
    await setHideWelcomeScreenSocialsInDialog(appWindow, false)
    await saveAppSettingsDialog(appWindow)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await waitForFaPlaywrightE2eAppShellPageTransitionIdle(appWindow)
    await expectSplashSocialChromeVisible(appWindow, true)
  })

  /**
   * When the MRU head file is missing, skip welcome screen shows an error and must not auto-open the next recent row.
   */
  test('Skip welcome screen stays on welcome when MRU head file is missing and does not load the next recent project', async ({}, testInfo) => {
    test.setTimeout(120_000)
    unlinkSkipWelcomeScreenE2eFixtures()
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await createE2eProjectFromSplash(
      appWindow,
      electronApp,
      E2E_SKIP_WELCOME_HEAD_MISSING_NAME,
      E2E_SKIP_WELCOME_HEAD_MISSING_FIXTURE
    )

    await openAppSettingsDialog(appWindow)
    await setSkipWelcomeScreenInDialog(appWindow, true)
    await saveAppSettingsDialog(appWindow)

    await expect.poll(async () => {
      const rows = await appWindow.evaluate(async () => {
        const bridge = window.faContentBridgeAPIs?.projectManagement
        if (bridge?.getRecentProjects === undefined) {
          return []
        }
        return await bridge.getRecentProjects()
      })
      return rows.length > 0 && rows[0]?.name === E2E_SKIP_WELCOME_HEAD_MISSING_NAME
    }).toBe(true)

    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo: testInfo,
      electronApp,
      suiteTestInfo
    })
    tryUnlinkE2eFaprojectFixture(E2E_SKIP_WELCOME_HEAD_MISSING_FIXTURE)
    expect(fs.existsSync(getE2eFaprojectFixtureAbsolutePath(
      E2E_SKIP_WELCOME_HEAD_MISSING_FIXTURE
    ))).toBe(false)

    const relaunched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: true,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
      resetUserData: false,
      testInfo: suiteTestInfo
    })
    electronApp = relaunched.electronApp
    appWindow = relaunched.appWindow

    await expectFaPlaywrightE2eHashRoute(appWindow, '/')
    await expectFaPlaywrightE2eWelcomeShell(appWindow)
    await e2eExpectFaActiveProjectStoreEmpty(appWindow)
    await expectProjectLoadedNotifyAbsent(appWindow, E2E_SKIP_WELCOME_HEAD_MISSING_NAME)
  })

  /**
   * Resume Latest split caret shows Browse latest projects tooltip until Hide tooltip setting is enabled.
   */
  test('Hide recent project tooltip setting hides and restores resume dropdown caret tooltip', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await createE2eProjectFromSplash(
      appWindow,
      electronApp,
      E2E_RESUME_TOOLTIP_NAME,
      E2E_RESUME_TOOLTIP_FIXTURE
    )

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await waitForFaPlaywrightE2eAppShellPageTransitionIdle(appWindow)
    await expect(async () => {
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.splashPageResumeLatest}"]`)
      ).toBeVisible({
        timeout: 5000
      })
    }).toPass({
      timeout: 15_000
    })
    await expectResumeDropdownBrowseTooltipVisible(appWindow, true)

    await openAppSettingsDialog(appWindow)
    await setHideRecentProjectTooltipInDialog(appWindow, true)
    await saveAppSettingsDialog(appWindow)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await waitForFaPlaywrightE2eAppShellPageTransitionIdle(appWindow)
    await expectResumeDropdownBrowseTooltipVisible(appWindow, false)

    await openAppSettingsDialog(appWindow)
    await setHideRecentProjectTooltipInDialog(appWindow, false)
    await saveAppSettingsDialog(appWindow)

    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await waitForFaPlaywrightE2eAppShellPageTransitionIdle(appWindow)
    await expectResumeDropdownBrowseTooltipVisible(appWindow, true)
  })

  /**
   * Skip welcome screen opens the MRU head on cold launch and navigates to the workspace route.
   */
  test('Skip welcome screen setting loads latest project and opens workspace after relaunch', async ({}, testInfo) => {
    test.setTimeout(120_000)
    unlinkSkipWelcomeScreenE2eFixtures()
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await createE2eProjectFromSplash(
      appWindow,
      electronApp,
      E2E_SKIP_WELCOME_SUCCESS_NAME,
      E2E_SKIP_WELCOME_SUCCESS_FIXTURE
    )

    await openAppSettingsDialog(appWindow)
    await setSkipWelcomeScreenInDialog(appWindow, true)
    await saveAppSettingsDialog(appWindow)

    await relaunchE2eAppWindowKeepingUserData(suiteTestInfo, testInfo, true)

    await expectFaPlaywrightE2eHashRoute(appWindow, '/home')
    await expectFaPlaywrightE2eWorkspaceShell(appWindow)
    await expect(appWindow.locator('[data-test-locator="splashPage"]')).toHaveCount(0)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_SKIP_WELCOME_SUCCESS_NAME)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      E2E_SKIP_WELCOME_SUCCESS_NAME
    ))).toBeVisible({
      timeout: 10_000
    })
  })

  /**
   * Hide tips popup on start screen is read once at boot; after save the next launch must not show the notify.
   */
  test('Hide tips popup on start screen setting suppresses startup tips after app relaunch', async ({}, testInfo) => {
    test.setTimeout(120_000)
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await openAppSettingsDialog(appWindow)
    await setSkipWelcomeScreenInDialog(appWindow, false)
    await setHideTooltipsStartInDialog(appWindow, true)
    await saveAppSettingsDialog(appWindow)

    await relaunchE2eAppWindowKeepingUserData(suiteTestInfo, testInfo, false)
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await expectFaPlaywrightE2eWelcomeShell(appWindow)
    await expectStartupTipsBannerAbsent(appWindow)
  })
})
