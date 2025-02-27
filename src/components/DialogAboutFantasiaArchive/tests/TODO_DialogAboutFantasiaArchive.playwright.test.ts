import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import { T_documentList } from 'app/types/T_documentList'

// TODO: REDO THIS DOCUMENT

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
 * Extra rended timer buffer for tests to start after loading the app
 * - Change here in order manually adjust this component's wait times
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
 * Feed 'license' input as the file to open and check if the opened dialog afterwars has all the needed elements in it
 */
test('Open test "license" dialog with all elements in it', async () => {
  const testString: T_documentList = 'license'

  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selectors for the elements to check
  const closeButton = appWindow.locator(`[data-test="${selectorList.closeButton}"]`)
  const markdownWrapper = appWindow.locator(`[data-test="${selectorList.markdownWrapper}"]`)
  const markdownContent = appWindow.locator(`[data-test="${selectorList.markdownContent}"]`)

  // Check if all tested elements exist
  await expect(closeButton).toHaveCount(1)
  await expect(markdownWrapper).toHaveCount(1)
  await expect(markdownContent).toHaveCount(1)

  // Close the app
  await electronApp.close()
})

/**
 * Feed 'license' input as the file to open and check if the opened dialog afterwars has all the needed elements in it
 */
test('Open test "license" dialog and try closing it', async () => {
  const testString: T_documentList = 'license'

  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selectors for the elements to check
  const closeButton = appWindow.locator(`[data-test="${selectorList.closeButton}"]`)
  const markdownContent = appWindow.locator(`[data-test="${selectorList.markdownContent}"]`)

  // Check if the markdown concent and close button exist and click it if it does
  await expect(markdownContent).toHaveCount(1)
  await expect(closeButton).toHaveCount(1)
  await closeButton.click()

  // Wait for the popup to close
  await appWindow.waitForTimeout(1500)

  // Check if the content is properly hidden after closing the popup
  expect(await markdownContent.isHidden()).toBe(true)

  // Close the app
  await electronApp.close()
})
