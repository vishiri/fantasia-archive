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
 * Buffer before assertions so the window and menus are ready.
 * - Tune this constant when this spec needs a different wait (currently 1000 ms).
 */
const faFrontendRenderTimer = 1000

/**
 * Menu animation timer for tests to wait for the menu animation to finish
 */
const menuAnimationTimer = 600

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  menuButton: 'Help & Info',
  menuItemButton: 'Toggle developer tools'
}

test.describe.serial('Developer tools menu', () => {
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
   * Check if dev tools toggle properly on and off using the menu button
   */
  test('Dev tools toggle properly', async () => {
    const menuWrapper = appWindow.getByText(selectorList.menuButton)

    const menuButton = appWindow.getByText(selectorList.menuItemButton)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect(menuButton).toHaveCount(1)
    await menuButton.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
      })
    }, { timeout: 15_000 }).toBe(true)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect(menuButton).toHaveCount(1)
    await menuButton.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
      })
    }, { timeout: 15_000 }).toBe(false)
  })
})
