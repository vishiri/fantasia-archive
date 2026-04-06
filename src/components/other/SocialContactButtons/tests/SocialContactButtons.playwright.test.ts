import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import type { I_socialContactButtonSet } from 'app/types/I_socialContactButtons'

test.beforeEach(() => {
  resetFaPlaywrightIsolatedUserData()
})

/**
 * Keys exported in '_data/buttons.ts' — keep this list in sync when adding a button.
 * Listed here (not by importing 'buttons.ts') so Playwright’s Node loader stays light.
 */
const socialContactButtonSetKeys: readonly (keyof I_socialContactButtonSet)[] = [
  'buttonPatreon',
  'buttonKofi',
  'buttonWebsite',
  'buttonGitHub',
  'buttonDiscord',
  'buttonReddit',
  'buttonTwitter'
]

const expectedSingleButtonCount = socialContactButtonSetKeys.length

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'SocialContactButtons',
  COMPONENT_PROPS: JSON.stringify({})
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
  buttonListWrapper: 'socialContactButtons',
  singleButton: 'socialContactSingleButton',
  singleButtonImage: 'socialContactSingleButton-image',
  singleButtonText: 'socialContactSingleButton-text'
}

/**
 * Check if the wrapper for all of the buttons exists
 */
test('Check if the main button wrapper exists', async ({}, testInfo) => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the tested element
  const buttonWrapperLocator = appWindow.locator(`[data-test-locator="${selectorList.buttonListWrapper}"]`)

  // Check if the tested element exists
  await expect(buttonWrapperLocator).toHaveCount(1)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

/**
 * Check if we have the proper amount of buttons on the page
 */
test('Check if we have the proper amount of buttons on the page', async ({}, testInfo) => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the tested element
  const buttonWrapperLocator = appWindow.locator(`[data-test-locator="${selectorList.buttonListWrapper}"]`)

  // Check if the tested element exists
  await expect(buttonWrapperLocator).toHaveCount(1)

  // Prepare the expected amount of buttons (DOM attribute must match production button list)
  const expectedButtonCountData = await buttonWrapperLocator.evaluate(el => el.dataset.testButtonNumber)
  const expectedButtonCount = parseInt(expectedButtonCountData || '0')
  expect(expectedButtonCount).toBe(expectedSingleButtonCount)

  // Prepare the selector for the tested elements
  const buttonsSelectorLocator = appWindow.locator(`[data-test-locator="${selectorList.singleButton}"]`)

  // Check if the tested element exists
  await expect(buttonsSelectorLocator).toHaveCount(expectedSingleButtonCount)

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})

/**
 * Check if each button is unique (class comparing)
 */
test('Check if each button is unique', async ({}, testInfo) => {
  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath],
    ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
  })

  const appWindow = await electronApp.firstWindow()
  await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  // Prepare the selector for the tested element
  const buttonWrapperLocator = appWindow.locator(`[data-test-locator="${selectorList.buttonListWrapper}"]`)

  // Check if the tested element exists
  await expect(buttonWrapperLocator).toHaveCount(1)

  // Prepare an emptyu list of stringified button classes
  const buttonClassList: string[] = []

  // Prepare the expected list of buttons
  const buttonList = await appWindow.locator(`[data-test-locator="${selectorList.singleButton}"]`)

  // Assign stringified button classes to the list
  for (let i = 0; i < await buttonList.count(); i++) {
    buttonClassList.push(await buttonList.nth(i).evaluate(el => el.classList.toString()))
  }

  // Check if any of the buttons has a duplicate class
  const hasDuplicateClass = new Set(buttonClassList).size !== buttonClassList.length

  // Check if the ducplicate class test passed or failed
  expect(hasDuplicateClass).not.toBeTruthy()

  // Close the app
  await closeFaElectronAppWithRecordedVideoAttachments(electronApp, testInfo)
})
