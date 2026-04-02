import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import { T_dialogName } from 'app/types/T_dialogList'
import T_socialContactButtons from 'app/src/i18n/en-US/components/SocialContactButtons/T_socialContactButtons'

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
 * Extra render timer buffer for tests to start after loading the app
 * - Change here in order manually adjust this component's wait times
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
test('Open test "AboutFantasiaArchive" dialog with all elements in it', async () => {
  const testString: T_dialogName = 'AboutFantasiaArchive'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selectors for the elements to check
  const closeButton = appWindow.locator(`[data-test="${selectorList.closeButton}"]`)
  const socialButtonsWrapper = appWindow.locator(`[data-test="${selectorList.socialButtonsWrapper}"]`)

  // Check if all tested elements exist
  await expect(closeButton).toHaveCount(1)
  await expect(socialButtonsWrapper).toHaveCount(1)

  // Close the app
  await electronApp.close()
})

/**
 * Feed "AboutFantasiaArchive" input and check if dialog closes after button click.
 */
test('Open test "AboutFantasiaArchive" dialog and try closing it', async () => {
  const testString: T_dialogName = 'AboutFantasiaArchive'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selectors for the elements to check
  const closeButton = appWindow.locator(`[data-test="${selectorList.closeButton}"]`)
  const socialButtonsWrapper = appWindow.locator(`[data-test="${selectorList.socialButtonsWrapper}"]`)

  // Check if wrapper exists before closing and then close the dialog
  await expect(socialButtonsWrapper).toHaveCount(1)
  await expect(closeButton).toHaveCount(1)
  await closeButton.click()

  // Wait for the popup to close
  await appWindow.waitForTimeout(1500)

  // Check if the content is properly hidden after closing the popup
  expect(await socialButtonsWrapper.isHidden()).toBe(true)

  // Close the app
  await electronApp.close()
})

test('Check correct amount and content of social buttons in AboutFantasiaArchive dialog', async () => {
  const testString: T_dialogName = 'AboutFantasiaArchive'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Select all social buttons
  const socialButtonsWrapper = appWindow.locator(`[data-test="${selectorList.socialButtonsWrapper}"]`)
  const socialButtons = socialButtonsWrapper.locator('[data-test="socialContactSingleButton"]')
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
  await electronApp.close()
})
