import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/customContentBridgeAPIs/extraEnvVariablesAPI'
import { T_documentList } from 'app/interfaces/T_documentList'

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

  const closeButton = await appWindow.$(`[data-test="${selectorList.closeButton}"]`)
  const markdownWrapper = await appWindow.$(`[data-test="${selectorList.markdownWrapper}"]`)
  const markdownContent = await appWindow.$(`[data-test="${selectorList.markdownContent}"]`)

  // Check if the tested elements exists
  if (closeButton !== null && markdownWrapper !== null && markdownContent !== null) {
    expect(true).toBe(true)
  } else {
    // Elements don't exist
    test.fail()
  }
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

  const closeButton = await appWindow.$(`[data-test="${selectorList.closeButton}"]`)
  const markdownContent = await appWindow.$(`[data-test="${selectorList.markdownContent}"]`)

  // Check if the close button exists
  if (closeButton !== null && markdownContent !== null) {
    await closeButton.click()
    await appWindow.waitForTimeout(1500)

    // Check if the content is properly hidden after closing the popup
    await expect(await markdownContent.isHidden()).toBe(true)
    await electronApp.close()
  } else {
    // Close button doesn't exist
    test.fail()
  }
})
