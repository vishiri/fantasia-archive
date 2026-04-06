import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import T_socialContactButtons from 'app/src/i18n/en-US/components/other/SocialContactButtons/T_socialContactButtons'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import type { T_dialogName } from 'app/types/T_dialogList'

test.beforeEach(() => {
  resetFaPlaywrightIsolatedUserData()
})

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

/**
 * Feed "AboutFantasiaArchive" input and check if all key dialog elements open.
 */
test('Open test "AboutFantasiaArchive" dialog with all elements in it', async ({}, testInfo) => {
  const testString: T_dialogName = 'AboutFantasiaArchive'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selectors for the elements to check
  const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
  const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)

  // Check if all tested elements exist
  await expect(closeButton).toHaveCount(1)
  await expect(socialButtonsWrapper).toHaveCount(1)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

/**
 * Feed "AboutFantasiaArchive" input and check if dialog closes after button click.
 */
test('Open test "AboutFantasiaArchive" dialog and try closing it', async ({}, testInfo) => {
  const testString: T_dialogName = 'AboutFantasiaArchive'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selectors for the elements to check
  const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
  const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)

  // Check if wrapper exists before closing and then close the dialog
  await expect(socialButtonsWrapper).toHaveCount(1)
  await expect(closeButton).toHaveCount(1)
  await closeButton.click()

  // Wait for the popup to close
  await appWindow.waitForTimeout(1500)

  // Check if the content is properly hidden after closing the popup
  expect(await socialButtonsWrapper.isHidden()).toBe(true)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

test('Check correct amount and content of social buttons in AboutFantasiaArchive dialog', async ({}, testInfo) => {
  const testString: T_dialogName = 'AboutFantasiaArchive'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Select all social buttons
  const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)
  const socialButtons = socialButtonsWrapper.locator('[data-test-locator="socialContactSingleButton"]')
  await expect(socialButtons).toHaveCount(7)

  // Check the specific text content for each button
  const expectedButtonLabels = [
    T_socialContactButtons.buttonPatreon.label,
    T_socialContactButtons.buttonKofi.label,
    T_socialContactButtons.buttonWebsite.label,
    T_socialContactButtons.buttonGitHub.label,
    T_socialContactButtons.buttonDiscord.label,
    T_socialContactButtons.buttonReddit.label,
    T_socialContactButtons.buttonTwitter.label
  ]

  for (let i = 0; i < expectedButtonLabels.length; i++) {
    await expect(socialButtons.nth(i)).toHaveText(expectedButtonLabels[i])
  }

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})
