import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import L_socialContactButtons from 'app/i18n/en-US/components/other/SocialContactButtons/L_socialContactButtons'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import type { T_dialogName } from 'app/types/T_dialogList'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogAboutFantasiaArchive',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer = extraEnvVariablesAPI.FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'dialogComponent-button-close',
  socialButtonsWrapper: 'socialContactButtons'
}

const aboutDialogDirectInput: T_dialogName = 'AboutFantasiaArchive'

/**
 * Close runs last so social-button copy is asserted while the dialog is still open.
 */
test.describe.serial('About Fantasia Archive dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: aboutDialogDirectInput })
    resetFaPlaywrightIsolatedUserData()
    electronApp = await electron.launch({
      env: extraEnvSettings,
      args: [electronMainFilePath],
      ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
    })
    appWindow = await electronApp.firstWindow()
    await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
    await appWindow.waitForTimeout(faFrontendRenderTimer)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
  })

  /**
   * Feed "AboutFantasiaArchive" input and check if all key dialog elements open.
   */
  test('Open test "AboutFantasiaArchive" dialog with all elements in it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)

    await expect(closeButton).toHaveCount(1)
    await expect(socialButtonsWrapper).toHaveCount(1)
  })

  test('Check correct amount and content of social buttons in AboutFantasiaArchive dialog', async () => {
    const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)
    const socialButtons = socialButtonsWrapper.locator('[data-test-locator="socialContactSingleButton"]')
    await expect(socialButtons).toHaveCount(7)

    const expectedButtonLabels = [
      L_socialContactButtons.buttonPatreon.label,
      L_socialContactButtons.buttonKofi.label,
      L_socialContactButtons.buttonWebsite.label,
      L_socialContactButtons.buttonGitHub.label,
      L_socialContactButtons.buttonDiscord.label,
      L_socialContactButtons.buttonReddit.label,
      L_socialContactButtons.buttonTwitter.label
    ]

    for (let i = 0; i < expectedButtonLabels.length; i++) {
      await expect(socialButtons.nth(i)).toHaveText(expectedButtonLabels[i])
    }
  })

  /**
   * Feed "AboutFantasiaArchive" input and check if dialog closes after button click.
   */
  test('Open test "AboutFantasiaArchive" dialog and try closing it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)

    await expect(socialButtonsWrapper).toHaveCount(1)
    await expect(closeButton).toHaveCount(1)
    await closeButton.click()

    await appWindow.waitForTimeout(1500)

    expect(await socialButtonsWrapper.isHidden()).toBe(true)
  })
})
