import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'

/**
 * Extra env settings to trigger testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH

/**
 * Extra rended timer buffer for tests to start after loading the app
 * - Change here in order manually adjust this component's wait times
 */
const faFrontendRenderTimer = 1000

/**
 * Menu animation timer for tests to wait for the menu animation to finish
 */
const menuAnimationTimer = 600

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  menuButton: 'Help & Info',
  menuItemButton: 'Toggle developer tools'
}

/**
 * Check if dev tools toggle properly on and off using the menu button
 */
test('Dev tools toggle properly', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  let devToolsStatus

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu wrapper locator
  const menuWrapper = appWindow.getByText(selectorList.menuButton)

  // Prepare the menu button locator
  const menuButton = appWindow.getByText(selectorList.menuItemButton)

  // --- Toggle dev tools - ON---

  // Open the menu
  await expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Wait for the menu animation to finish
  await appWindow.waitForTimeout(menuAnimationTimer)

  // Click on the dev tools menu button
  await expect(menuButton).toHaveCount(1)
  await menuButton.click()

  // Wait for the menu animation to finish
  await appWindow.waitForTimeout(menuAnimationTimer)

  // Check if dev tools are open
  devToolsStatus = await appWindow.evaluate(async () => {
    return window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
  })
  expect(devToolsStatus).toBe(true)

  // --- Toggle dev tools - OFF ---

  // Open the menu
  await expect(menuWrapper).toHaveCount(1)
  await menuWrapper.click()

  // Wait for the menu animation to finish
  await appWindow.waitForTimeout(menuAnimationTimer)

  // Click on the dev tools menu button
  await expect(menuButton).toHaveCount(1)
  await menuButton.click()

  // Wait for the menu animation to finish
  await appWindow.waitForTimeout(menuAnimationTimer)

  // Check if dev tools are closed
  devToolsStatus = await appWindow.evaluate(async () => {
    return window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
  })
  expect(devToolsStatus).toBe(false)

  // Close the app
  await electronApp.close()
})
