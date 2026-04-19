import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { FA_ELECTRON_MAIN_JS_PATH } from 'app/helpers/playwrightHelpers/faPlaywrightElectronLaunchConstants'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers/playwrightDismissStartupTipsNotify'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import L_aboutFantasiaArchiveDe from 'app/i18n/de/dialogs/L_aboutFantasiaArchive'
import L_helpInfoDe from 'app/i18n/de/components/globals/AppControlMenus/L_helpInfo'
import L_aboutFantasiaArchiveEnUs from 'app/i18n/en-US/dialogs/L_aboutFantasiaArchive'
import L_helpInfoEnUs from 'app/i18n/en-US/components/globals/AppControlMenus/L_helpInfo'

/**
 * Extra env settings to trigger E2E testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

/**
 * Electron main filepath
 */
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer before assertions so the window and menus are ready.
 */
const faFrontendRenderTimer = 1000

/**
 * Menu animation timer for tests to wait for the menu animation to finish
 */
const menuAnimationTimer = 600

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  closeAboutButton: 'dialogComponent-button-close',
  dialogAboutTitle: '#dialogAboutFantasiaArchive-title',
  languageMenuPanel: '.globalLanguageSelector__menu',
  languageOptionDe: 'globalLanguageSelector-option-de',
  languageSelectorRoot: 'globalLanguageSelector-root',
  languageSelectorTrigger: 'globalLanguageSelector-trigger'
} as const

async function waitMenuAnimation (page: Page): Promise<void> {
  await page.waitForTimeout(menuAnimationTimer)
}

async function openHelpAboutDialog (
  page: Page,
  helpMenuTitle: string,
  aboutMenuItemLabel: string
): Promise<void> {
  await page.getByText(helpMenuTitle, { exact: true }).click()
  await waitMenuAnimation(page)
  await expect(page.getByText(aboutMenuItemLabel, { exact: true })).toBeVisible()
  await page.getByText(aboutMenuItemLabel, { exact: true }).click()
}

async function expectAboutDialogTitle (page: Page, expected: string): Promise<void> {
  const title = page.locator(selectorList.dialogAboutTitle)
  await expect(title).toHaveText(expected)
}

async function closeAboutDialog (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.closeAboutButton}"]`).click()
}

async function switchInterfaceLanguageToGerman (page: Page): Promise<void> {
  const root = page.locator(`[data-test-locator="${selectorList.languageSelectorRoot}"]`)
  await page.locator(`[data-test-locator="${selectorList.languageSelectorTrigger}"]`).click()
  await expect(page.locator(selectorList.languageMenuPanel)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.languageOptionDe}"]`).click()
  await expect(root).toHaveAttribute('data-test-i18n-locale', 'de', { timeout: 15_000 })
}

test.describe.serial('Interface language and About dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    resetFaPlaywrightIsolatedUserData()
    electronApp = await electron.launch({
      env: extraEnvSettings,
      args: [electronMainFilePath],
      ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
    })
    appWindow = await electronApp.firstWindow()
    await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
    await appWindow.waitForTimeout(faFrontendRenderTimer)
    await dismissStartupTipsNotifyIfPresent(appWindow)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
  })

  /**
   * About dialog title matches en-US, then Deutsch after switching via the language control; Help menu labels follow the active locale.
   */
  test('About dialog title tracks interface locale en-US then de', async () => {
    await openHelpAboutDialog(
      appWindow,
      L_helpInfoEnUs.title,
      L_helpInfoEnUs.items.aboutFantasiaArchive
    )
    await expectAboutDialogTitle(appWindow, L_aboutFantasiaArchiveEnUs.title)
    await closeAboutDialog(appWindow)

    await switchInterfaceLanguageToGerman(appWindow)

    await expect(
      appWindow.getByText(L_helpInfoDe.title, { exact: true })
    ).toBeVisible()

    await openHelpAboutDialog(
      appWindow,
      L_helpInfoDe.title,
      L_helpInfoDe.items.aboutFantasiaArchive
    )
    await expectAboutDialogTitle(appWindow, L_aboutFantasiaArchiveDe.title)
  })
})
