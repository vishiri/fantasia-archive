import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'FantasiaMascotImage',
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
  image: 'fantasiaMascotImage-image'
}

/**
 * Check if the wrapper contains 'IMG' element
 */
test('Check if the wrapper contains "IMG" element', async () => {
  const testString = 'IMG'

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the tested element
  const imageElement = appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  expect(imageElement).toHaveCount(1)

  // Get the element's tag name
  const elementType = await imageElement.evaluate(el => el.tagName)

  // Check if the tested element is an 'IMG' element
  expect(elementType).toBe(testString)

  // Close the app
  await electronApp.close()
})

/**
 * Attempt to pass "width" and "height" prop to the component and check the results
 */
test('Visually check for proper sizing of the icon', async () => {
  const testStringWidth = '300px'
  const testStringHeight = '300px'

  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ width: testStringWidth, height: testStringHeight })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the tested element
  const imageElement = appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  expect(imageElement).toHaveCount(1)

  const imageBoxData = await imageElement.boundingBox() as unknown as { width: number, height: number }

  // Test if the tested element isn't invisisble for some reason
  expect(imageBoxData).not.toBe(null)

  // Test for proper width
  const roundedImageWidth = Math.round(imageBoxData.width)
  const roundedTestStringWidth = Math.round(parseInt(testStringWidth))
  expect(roundedImageWidth).toBe(roundedTestStringWidth)

  // Test for proper height
  const roundedImageHeight = Math.round(imageBoxData.height)
  const roundedTestStringHeight = Math.round(parseInt(testStringHeight))
  expect(roundedImageHeight).toBe(roundedTestStringHeight)

  // Close the app
  await electronApp.close()
})

/**
 * Test if the component properly determines if the image will be random - YES
 */
test('Check if the image is random: YES', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the tested element
  const imageElement = appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  expect(imageElement).toHaveCount(1)

  // Check if the tested element is random
  const isRandom = await imageElement.evaluate(el => el.dataset.testIsRandom)
  expect(isRandom).toBe('true')

  // Close the app
  await electronApp.close()
})

/**
 * Test if the component properly determines if the image will be random - NO
 */
test('Check if the image is random: NO', async () => {
  const testString = 'flop'

  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ fantasiaImage: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the tested element
  const imageElement = appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  expect(imageElement).toHaveCount(1)

  // Check if the tested element is not random
  const isRandom = await imageElement.evaluate(el => el.dataset.testIsRandom)
  expect(isRandom).toBe('false')

  // Check if the tested element has the correct image
  const imageString = await imageElement.evaluate(el => el.dataset.testImage)
  expect(imageString).toBe(testString)

  // Close the app
  await electronApp.close()
})
