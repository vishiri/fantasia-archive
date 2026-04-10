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
  COMPONENT_NAME: 'AppControlMenus',
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
const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  testMenu: 'appControlMenus-testMenu',
  anyMenu: 'appControlMenus-anyMenu'
}

test.describe.serial('App control menus', () => {
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
   * Load a custom "Test Title" menu button in the menu and check if it loaded
   */
  test('Load "Test Title" menu button sub-component', async () => {
    const testMenu = appWindow.locator(`[data-test-menu-test="${selectorList.testMenu}"]`)

    await expect(testMenu).toHaveCount(1)
  })

  /**
   * Check if we have exactly one testing menu loaded
   */
  test('Check if we have exactly one testing menu loaded', async () => {
    const anyMenus = appWindow.locator(`[data-test-menu-any="${selectorList.anyMenu}"]`)

    await expect(anyMenus).toHaveCount(1)
  })
})
