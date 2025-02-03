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
const faFrontendRenderTimer = 0

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  wrapper: 'appSplashScreen-wrapper'
}

/**
 * Check if the splash screen displays properly on load of the app
 */
test('Splash screen works properly', async () => {
  const testSplashscreenTimeout = 3000

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const wrapperElement = await appWindow.locator(`[data-test="${selectorList.wrapper}"]`)

  // Check if the tested element exists
  if (wrapperElement !== null) {
    // Check if the splash screen is visible on innitial load
    const elementOpacityFirstRender = await appWindow.evaluate((selectorList) => {
      const element = document.querySelector(`[data-test="${selectorList.wrapper}"]`)
      if (element !== null) return window.getComputedStyle(element).opacity
    }, selectorList)
    expect(elementOpacityFirstRender).toBe('1')

    // Wait until the splash screen is supposed to fade away
    await appWindow.waitForTimeout(testSplashscreenTimeout)

    // Check if the splash screen is hidden after the app contents load
    const elementOpacityAfterAppLoad = await appWindow.evaluate((selectorList) => {
      const element = document.querySelector(`[data-test="${selectorList.wrapper}"]`)
      if (element !== null) return window.getComputedStyle(element).opacity
    }, selectorList)
    expect(elementOpacityAfterAppLoad).toBe('0')
  } else {
    // Element doesn't exist
    test.fail()
  }

  await electronApp.close()
})

/**
 * Check if the splash screen has proper colors in RGB format
 */
test('Splash screen has proper colors', async () => {
  const testStringBackgroundColorRGB = 'rgb(24, 48, 58)'
  const testStringPathFillColorRGB = 'rgb(215, 172, 71)'

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const wrapperElement = await appWindow.locator(`[data-test="${selectorList.wrapper}"]`)

  // Check if the tested element exists
  if (wrapperElement !== null) {
    // Check if the background color is correct
    const elementBackgroundColor = await appWindow.evaluate((selectorList) => {
      const element = document.querySelector(`[data-test="${selectorList.wrapper}"]`)
      if (element !== null) return window.getComputedStyle(element).backgroundColor
    }, selectorList)
    expect(elementBackgroundColor).toBe(testStringBackgroundColorRGB)

    // Check if the fill color of the svg path is correct
    const elementPathFillColor = await appWindow.evaluate((selectorList) => {
      const element = document.querySelector(`[data-test="${selectorList.wrapper}"] path`)
      if (element !== null) return window.getComputedStyle(element).fill
    }, selectorList)
    expect(elementPathFillColor).toBe(testStringPathFillColorRGB)
  } else {
    // Element doesn't exist
    test.fail()
  }

  await electronApp.close()
})

/**
 * Check if the splash screen has proper sizings
 */
test('Splash screen has proper sizings', async () => {
  const testStringWidth = '350px'
  const testStringHeight = '350px'

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()

  const iconElement = await appWindow.locator(`[data-test="${selectorList.wrapper}"] svg`)

  // Check if the tested element exists
  if (iconElement !== null) {
    const iconBoxData = await iconElement.boundingBox()

    // Test if the tested element isn't invisisble for some reason
    if (iconBoxData !== null) {
      // Test for proper width
      const roundedFirstValueWidth = Math.round(iconBoxData.width)
      const roundedSecondValueWidth = Math.round(parseInt(testStringWidth))

      expect(roundedFirstValueWidth).toBe(roundedSecondValueWidth)

      // Test for proper height
      const roundedFirstValueHeight = Math.round(iconBoxData.height)
      const roundedSecondValueHeight = Math.round(parseInt(testStringHeight))

      expect(roundedFirstValueHeight).toBe(roundedSecondValueHeight)
    } else {
      // Element is invisible
      test.fail()
    }
  } else {
    // Element doesn't exist
    test.fail()
  }

  await electronApp.close()
})
