import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'

/**
 * Extra env settings to trigger testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

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
    /**
     * Dismiss tips stays off: visibility wait can exceed splash opacity asserts when no banner mounts.
     */
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: false,
      renderDelayMs: faFrontendRenderTimer,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
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
