import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import { testData } from './_testData'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'SocialContactSingleButton',
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
  singleButton: 'socialContactSingleButton',
  singleButtonImage: 'socialContactSingleButton-image',
  singleButtonImageQuasarElement: '.q-img__image',
  singleButtonText: 'socialContactSingleButton-text'
}

/**
 * Test if the component exists
 */
test('Test if the component exists', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const buttonElement = appWindow.locator(`[data-test="${selectorList.singleButton}"]`)

  // Check if the tested element exists
  await expect(buttonElement).toHaveCount(1)

  // Close the app
  await electronApp.close()
})

/**
 * Check if the component has proper title, url and classes
 */
test('Check if the component has proper title, url and classes', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const buttonElement = appWindow.locator(`[data-test="${selectorList.singleButton}"]`)

  // Check if the tested element exists
  await expect(buttonElement).toHaveCount(1)

  // Check if the first menu item has text equal to the first data item
  const buttonTitle = await buttonElement.evaluate((el: HTMLElement) => el.title)
  const dataTitle = testData.title
  expect(buttonTitle).toBe(dataTitle)

  // Close the app
  await electronApp.close()
})

/**
 * Check if the component icon has proper src, height and width
 */
test('Check if the component icon has proper src, height and width', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const buttonIconQuasarElement = appWindow.locator(selectorList.singleButtonImageQuasarElement)

  // Check if the tested element exists
  await expect(buttonIconQuasarElement).toHaveCount(1)

  // Check if the icon on the button is the same as the data icon
  const buttonIcon = await buttonIconQuasarElement.evaluate((el: HTMLImageElement) => el.src)
  const dataIcon = testData.icon
  expect(buttonIcon).toContain(dataIcon)

  // Get the button element's bounding box
  const buttonBoxData = await buttonIconQuasarElement.boundingBox() as unknown as { width: number, height: number }

  // Test if the tested element isn't invisisble for some reason
  expect(buttonBoxData).not.toBe(null)

  // Test for proper width
  const roundedImageWidth = Math.round(buttonBoxData.width)
  const roundedTestWidth = Math.round(testData.width)
  expect(roundedImageWidth).toBe(roundedTestWidth)

  // Test for proper height
  const roundedImageHeight = Math.round(buttonBoxData.height)
  const roundedTestHeight = Math.round(testData.height)
  expect(roundedImageHeight).toBe(roundedTestHeight)

  // Close the app
  await electronApp.close()
})

/**
 * Check if the component has proper text content
 */
test('Check if the component has proper text content', async () => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the menu locator
  const buttonIconText = appWindow.locator(`[data-test="${selectorList.singleButtonText}"]`)

  // Check if the tested element exists
  await expect(buttonIconText).toHaveCount(1)

  // Check if the text on the button is the same as the data text
  const buttonText = await buttonIconText.textContent()
  const dataText = testData.label
  expect(buttonText).toBe(dataText)

  // Close the app
  await electronApp.close()
})
