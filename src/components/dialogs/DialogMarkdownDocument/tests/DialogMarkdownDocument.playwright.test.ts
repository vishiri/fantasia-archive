import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import type { T_documentName } from 'app/types/T_documentList'

test.beforeEach(() => {
  resetFaPlaywrightIsolatedUserData()
})

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogMarkdownDocument',
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
  markdownWrapper: 'dialogMarkdownDocument-markdown-wrapper',
  markdownContent: 'dialogMarkdownDocument-markdown-content',
  closeButton: 'dialogMarkdownDocument-button-close'
}

/**
 * Feed 'license' input as the file to open and check if the opened dialog afterwards has all the needed elements in it.
 */
test('Open test "license" dialog with all elements in it', async ({}, testInfo) => {
  const testString: T_documentName = 'license'

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
  const markdownWrapper = appWindow.locator(`[data-test-locator="${selectorList.markdownWrapper}"]`)
  const markdownContent = appWindow.locator(`[data-test-locator="${selectorList.markdownContent}"]`)

  // Check if all tested elements exist
  await expect(closeButton).toHaveCount(1)
  await expect(markdownWrapper).toHaveCount(1)
  await expect(markdownContent).toHaveCount(1)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

/**
 * Feed 'license' input as the file to open and check if the opened dialog afterwards has all the needed elements in it.
 */
test('Open test "license" dialog and try closing it', async ({}, testInfo) => {
  const testString: T_documentName = 'license'

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
  const markdownContent = appWindow.locator(`[data-test-locator="${selectorList.markdownContent}"]`)

  // Check if the markdown content and close button exist and click it if they do
  await expect(markdownContent).toHaveCount(1)
  await expect(closeButton).toHaveCount(1)
  await closeButton.click()

  // Wait for the popup to close
  await appWindow.waitForTimeout(1500)

  // Check if the content is properly hidden after closing the popup
  expect(await markdownContent.isHidden()).toBe(true)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})
