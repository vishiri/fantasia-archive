import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { navigateFaPlaywrightE2eToHomeRoute } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_helpInfo from 'app/i18n/en-US/components/globals/AppControlMenus/L_helpInfo'

/**
 * Extra env settings to trigger testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

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
  menuButton: L_helpInfo.title,
  menuItemButton: L_helpInfo.items.toggleDeveloperTools
}

test.describe.serial('Developer tools menu', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
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
   * Check if dev tools toggle properly on and off using the menu button
   */
  test('Dev tools toggle properly', async () => {
    await navigateFaPlaywrightE2eToHomeRoute(appWindow)

    const menuWrapper = appWindow.getByText(selectorList.menuButton)

    const menuButton = appWindow.getByText(selectorList.menuItemButton)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect(menuButton).toHaveCount(1)
    await menuButton.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect.poll(async () => {
      return await appWindow.evaluate(async () => {
        return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
      })
    }, { timeout: 15_000 }).toBe(true)

    await expect(menuWrapper).toHaveCount(1)
    await menuWrapper.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect(menuButton).toHaveCount(1)
    await menuButton.click()

    await appWindow.waitForTimeout(menuAnimationTimer)

    await expect.poll(async () => {
      return await appWindow.evaluate(async () => {
        return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
      })
    }, { timeout: 15_000 }).toBe(false)
  })
})
