import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import type { I_socialContactButton } from 'app/types/I_socialContactButtons'

/**
 * Button payload for this spec — must match what the app receives via 'COMPONENT_PROPS.dataInput'.
 */
const testData: I_socialContactButton = {
  title: 'Patreon - Title',
  label: 'Patreon - Label',
  url: 'https://www.patreon.com/c/vishiri',
  icon: 'patreon_logo.png',
  width: 26,
  height: 26,
  cssClass: 'patreon'
}

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'SocialContactSingleButton',
  COMPONENT_PROPS: JSON.stringify({ dataInput: testData })
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
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

test.describe.serial('Social contact single button', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ dataInput: testData })
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
   * Test if the component exists
   */
  test('Test if the component exists', async () => {
    const buttonElement = appWindow.locator(`[data-test-locator="${selectorList.singleButton}"]`)

    await expect(buttonElement).toHaveCount(1)
  })

  /**
   * Check if the component has proper title, url and classes
   */
  test('Check if the component has proper title, url and classes', async () => {
    const buttonElement = appWindow.locator(`[data-test-locator="${selectorList.singleButton}"]`)

    await expect(buttonElement).toHaveCount(1)

    const buttonTitle = await buttonElement.evaluate((el: HTMLElement) => el.title)
    const dataTitle = testData.title
    expect(buttonTitle).toBe(dataTitle)
  })

  /**
   * Check if the component icon has proper src, height and width
   */
  test('Check if the component icon has proper src, height and width', async () => {
    const buttonIconQuasarElement = appWindow.locator(selectorList.singleButtonImageQuasarElement)

    await expect(buttonIconQuasarElement).toHaveCount(1)

    const buttonIcon = await buttonIconQuasarElement.evaluate((el: HTMLImageElement) => el.src)
    const dataIcon = testData.icon
    expect(buttonIcon).toContain(dataIcon)

    const buttonBoxData = await buttonIconQuasarElement.boundingBox() as unknown as { width: number, height: number }

    expect(buttonBoxData).not.toBe(null)

    const roundedImageWidth = Math.round(buttonBoxData.width)
    const roundedTestWidth = Math.round(testData.width)
    expect(roundedImageWidth).toBe(roundedTestWidth)

    const roundedImageHeight = Math.round(buttonBoxData.height)
    const roundedTestHeight = Math.round(testData.height)
    expect(roundedImageHeight).toBe(roundedTestHeight)
  })

  /**
   * Check if the component has proper text content
   */
  test('Check if the component has proper text content', async () => {
    const buttonIconText = appWindow.locator(`[data-test-locator="${selectorList.singleButtonText}"]`)

    await expect(buttonIconText).toHaveCount(1)

    const buttonText = await buttonIconText.textContent()
    const dataText = testData.label
    expect(buttonText).toBe(dataText)
  })
})
