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

  const imageElement = await appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  if (imageElement !== null) {
    const elementType = await imageElement.evaluate(el => el.tagName)

    await expect(elementType).toBe(testString)
    await electronApp.close()
  } else {
    // Element doesn't exist
    test.fail()
  }

  await electronApp.close()
})

/**
 * Attempt to pass "width" prop to the component and check the result
 */
test('Visually check "width" prop', async () => {
  const testString = '300px'

  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ width: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const imageElement = await appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  if (imageElement !== null) {
    const imageBoxData = await imageElement.boundingBox()

    // Test if the tested element isn't invisisble for some reason
    if (imageBoxData !== null) {
      const roundedFirstValue = Math.round(imageBoxData.width)
      const roundedSecondValue = Math.round(parseInt(testString))

      await expect(roundedFirstValue).toBe(roundedSecondValue)
      await electronApp.close()
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

/**
 * Attempt to pass "height" prop to the component and check the result
 */
test('Visually check "height" prop', async () => {
  const testString = '300px'

  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ height: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const imageElement = await appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  if (imageElement !== null) {
    const imageBoxData = await imageElement.boundingBox()

    // Test if the tested element isn't invisisble for some reason
    if (imageBoxData !== null) {
      const roundedFirstValue = Math.round(imageBoxData.height)
      const roundedSecondValue = Math.round(parseInt(testString))

      await expect(roundedFirstValue).toBe(roundedSecondValue)
      await electronApp.close()
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

  const imageElement = await appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  if (imageElement !== null) {
    const isRandom = await imageElement.evaluate(el => el.dataset.testIsRandom)

    await expect(isRandom).toBe('true')
    await electronApp.close()
  } else {
    // Element doesn't exist
    test.fail()
  }

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

  const imageElement = await appWindow.locator(`[data-test="${selectorList.image}"]`)

  // Check if the tested element exists
  if (imageElement !== null) {
    const isRandom = await imageElement.evaluate(el => el.dataset.testIsRandom)
    const imageString = await imageElement.evaluate(el => el.dataset.testImage)

    await expect.soft(imageString).toBe(testString)
    await expect(isRandom).toBe('false')
    await electronApp.close()
  } else {
    // Element doesn't exist
    test.fail()
  }

  await electronApp.close()
})
