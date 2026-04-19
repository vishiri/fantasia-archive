import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { FA_ELECTRON_MAIN_JS_PATH } from 'app/helpers/playwrightHelpers/faPlaywrightElectronLaunchConstants'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'

/**
 * Extra env settings to trigger testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer before assertions so the window is ready (e2e uses 0 here).
 * - Tune this constant when this spec needs a different wait.
 */
const faFrontendRenderTimer = 0

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  wrapper: 'appSplashScreen-wrapper'
}

test.describe.serial('App splash screen', () => {
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
    // Intentionally omit dismissStartupTipsNotifyIfPresent: its full visibility-timeout wait can outlast
    // the splash opacity assertion in the first test (splash fades while waiting for a missing tips banner).
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
  })

  /**
   * Check if the splash screen displays properly on load of the app
   */
  test('Splash screen works properly', async () => {
    const testSplashscreenTimeout = 3000

    const wrapperElement = appWindow.locator(`[data-test-locator="${selectorList.wrapper}"]`)

    if (await wrapperElement.count() === 0) {
      test.fail()
      return
    }

    const elementOpacityFirstRender = await appWindow.evaluate((selectorListArg) => {
      const element = document.querySelector(`[data-test-locator="${selectorListArg.wrapper}"]`)
      if (element !== null) {
        return window.getComputedStyle(element).opacity
      } else {
        return false
      }
    }, selectorList)
    expect(elementOpacityFirstRender).toBe('1')

    await appWindow.waitForTimeout(testSplashscreenTimeout)

    const elementOpacityAfterAppLoad = await appWindow.evaluate((selectorListArg) => {
      const element = document.querySelector(`[data-test-locator="${selectorListArg.wrapper}"]`)
      if (element !== null) {
        return window.getComputedStyle(element).opacity
      } else {
        return false
      }
    }, selectorList)
    expect(elementOpacityAfterAppLoad).toBe('0')
  })

  /**
   * Check if the splash screen has proper colors in RGB format
   */
  test('Splash screen has proper colors', async () => {
    const testStringBackgroundColorRGB = 'rgb(24, 48, 58)'
    const testStringPathFillColorRGB = 'rgb(215, 172, 71)'

    const wrapperElement = appWindow.locator(`[data-test-locator="${selectorList.wrapper}"]`)

    await expect(wrapperElement).toHaveCount(1)

    const elementBackgroundColor = await appWindow.evaluate((selectorListArg) => {
      const element = document.querySelector(`[data-test-locator="${selectorListArg.wrapper}"]`)
      if (element !== null) return window.getComputedStyle(element).backgroundColor
    }, selectorList)
    expect(elementBackgroundColor).toBe(testStringBackgroundColorRGB)

    const elementPathFillColor = await appWindow.evaluate((selectorListArg) => {
      const element = document.querySelector(`[data-test-locator="${selectorListArg.wrapper}"] path`)
      if (element !== null) return window.getComputedStyle(element).fill
    }, selectorList)
    expect(elementPathFillColor).toBe(testStringPathFillColorRGB)
  })

  /**
   * Check if the splash screen has proper sizings
   */
  test('Splash screen has proper sizings', async () => {
    const testStringWidth = '350px'
    const testStringHeight = '350px'

    const iconElement = appWindow.locator(`[data-test-locator="${selectorList.wrapper}"] svg`)

    await expect(iconElement).toHaveCount(1)
    await expect(iconElement).toHaveAttribute('data-test-layout-width', testStringWidth)
    await expect(iconElement).toHaveAttribute('data-test-layout-height', testStringHeight)
  })
})
