import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'GlobalWindowButtons',
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
const faFrontendRenderTimer:number = extraEnvVariablesAPI.FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  buttonMinimize: 'globalWindowButtons-button-minimize',
  buttonResize: 'globalWindowButtons-button-resize',
  buttonClose: 'globalWindowButtons-button-close'
}

/**
 * Test if the component has three specific HTML element buttons properly mounted in it:
 * - Minimize button
 * - Resize button
 * - Close button
 */
test('Wrapper should contain three specific buttons', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selectors for the buttons
  const resizeButton = appWindow.locator(`[data-test="${selectorList.buttonResize}"]`)
  const minimizeButton = appWindow.locator(`[data-test="${selectorList.buttonMinimize}"]`)
  const closeButton = appWindow.locator(`[data-test="${selectorList.buttonClose}"]`)

  // Check if the tested elements exists
  await expect(resizeButton).toHaveCount(1)
  await expect(minimizeButton).toHaveCount(1)
  await expect(closeButton).toHaveCount(1)

  // Close the app
  await electronApp.close()
})

/**
 * Attempt to click the resize button
 */
test('Click resize button - "smallify"', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the button
  const resizeButton = appWindow.locator(`[data-test="${selectorList.buttonResize}"]`)

  // Check if the tested element exists and if so, click it
  await expect(resizeButton).toHaveCount(1)
  await resizeButton.click()

  // Wait for the window to resize
  await appWindow.waitForTimeout(600)

  // Check if the window is maximized or not
  const isMaximized = await appWindow.evaluate(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized())
  expect(isMaximized).toBe(false)

  // Close the app
  await electronApp.close()
})

/**
 * Attempt to click the resize button, twice
 */
test('Click resize button - "maximize"', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the button
  const resizeButton = appWindow.locator(`[data-test="${selectorList.buttonResize}"]`)

  // Check if the tested element exists
  await expect(resizeButton).toHaveCount(1)

  // In order to avoid situations where the window somehow opens in non-maximized state, we first check if it is maximized or not and react accordingly
  let isMaximized = await appWindow.evaluate(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized())

  // Check if the window if maximized of not, react accordingly
  if (isMaximized) {
    // Minimize first
    await resizeButton.click()

    // Wait for the window to minimize
    await appWindow.waitForTimeout(600)

    // Maximize again
    await resizeButton.click()
  } else {
    // Maximize to begin with
    await resizeButton.click()
  }

  // Wait for the window to maximize
  await appWindow.waitForTimeout(600)

  // Check if the window is maximized
  isMaximized = await appWindow.evaluate(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized())
  expect(isMaximized).toBe(true)

  // Close the app
  await electronApp.close()
})

/**
 * Attempt to click the minimize button
 */
test('Click minimize button', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the button
  const minimizeButton = appWindow.locator(`[data-test="${selectorList.buttonMinimize}"]`)

  // Check if the tested element exists, and if so, click it
  await expect(minimizeButton).toHaveCount(1)
  await minimizeButton.click()

  // Wait for the window to minimize
  await appWindow.waitForTimeout(600)

  // Check if the window is minimized
  const isMaximized = await appWindow.evaluate(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized())
  expect(isMaximized).toBe(false)

  // Close the app
  await electronApp.close()
})

/**
 * Attempt to click the close button
 */
test('Click close button', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the button
  const closeButton = appWindow.locator(`[data-test="${selectorList.buttonClose}"]`)

  // Check if the tested element exists
  await expect(closeButton).toHaveCount(1)

  // Prapere the variable and listen to window close event
  let windowIsClosed = false
  appWindow.on('close', () => {
    windowIsClosed = true
  })

  // Click the close button
  await closeButton.click()

  // Check if the window is closed
  expect(windowIsClosed).toBe(true)

  // Close the app
  await electronApp.close()
})
