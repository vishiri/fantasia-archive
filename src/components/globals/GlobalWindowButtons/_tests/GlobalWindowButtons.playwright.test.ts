import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  FA_ELECTRON_MAIN_JS_PATH,
  FA_FRONTEND_RENDER_TIMER
} from 'app/helpers/playwrightHelpers/faPlaywrightElectronLaunchConstants'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'

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
const electronMainFilePath:string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer:number = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  buttonMinimize: 'globalWindowButtons-button-minimize',
  buttonResize: 'globalWindowButtons-button-resize',
  buttonClose: 'globalWindowButtons-button-close'
}

test.describe.serial('Global window buttons', () => {
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
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
  })

  /**
   * Test if the component has three specific HTML element buttons properly mounted in it:
   * - Minimize button
   * - Resize button
   * - Close button
   */
  test('Wrapper should contain three specific buttons', async () => {
    const resizeButton = appWindow.locator(`[data-test-locator="${selectorList.buttonResize}"]`)
    const minimizeButton = appWindow.locator(`[data-test-locator="${selectorList.buttonMinimize}"]`)
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.buttonClose}"]`)

    await expect(resizeButton).toHaveCount(1)
    await expect(minimizeButton).toHaveCount(1)
    await expect(closeButton).toHaveCount(1)
  })

  /**
   * Attempt to click the resize button
   */
  test('Click resize button - "smallify"', async () => {
    const resizeButton = appWindow.locator(`[data-test-locator="${selectorList.buttonResize}"]`)

    await expect(resizeButton).toHaveCount(1)
    await resizeButton.click()

    await appWindow.waitForFunction(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized() === false)
  })

  /**
   * Attempt to click the resize button, second time
   */
  test('Click resize button - "maximize"', async () => {
    const resizeButton = appWindow.locator(`[data-test-locator="${selectorList.buttonResize}"]`)

    await expect(resizeButton).toHaveCount(1)

    const isMaximized = await appWindow.evaluate(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized())

    if (isMaximized) {
      await resizeButton.click()

      await appWindow.waitForFunction(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized() === false)

      await resizeButton.click()
    } else {
      await resizeButton.click()
    }

    await appWindow.waitForFunction(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized() === true)
  })

  /**
   * Attempt to click the minimize button
   */
  test('Click minimize button', async () => {
    const minimizeButton = appWindow.locator(`[data-test-locator="${selectorList.buttonMinimize}"]`)

    await expect(minimizeButton).toHaveCount(1)
    await minimizeButton.click()

    await appWindow.waitForFunction(() => window.faContentBridgeAPIs.faWindowControl.checkWindowMaximized() === false)
  })

  /**
   * Attempt to click the close button
   */
  test('Click close button', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.buttonClose}"]`)

    await expect(closeButton).toHaveCount(1)

    const windowCloseEvent = appWindow.waitForEvent('close')

    await closeButton.click()

    await windowCloseEvent
  })
})
