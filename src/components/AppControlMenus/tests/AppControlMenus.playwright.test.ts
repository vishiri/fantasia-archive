import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'AppControlMenus',
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
  testMenu: 'appControlMenus-testMenu',
  anyMenu: 'appControlMenus-anyMenu'
}

/**
 * Load a custom "Test Title" menu button in the menu and check if it loaded
 */
test('Load "Test Title" menu button sub-component', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const testMenu = appWindow.locator(`[data-test-test-menu="${selectorList.testMenu}"]`)

  // Check if the tested element exists
  await expect(testMenu).toHaveCount(1)

  // Close the app
  await electronApp.close()
})

/**
 * Check if we have exactly one testing menu loaded
 */
test('Check if we have exactly one testing menu loaded', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menus locator
  const anyMenus = appWindow.locator(`[data-test-any-menu="${selectorList.anyMenu}"]`)

  // Check if the tested element exists
  await expect(anyMenus).toHaveCount(1)

  // Close the app
  await electronApp.close()
})
