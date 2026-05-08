import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_socialContactButtons from 'app/i18n/en-US/components/other/SocialContactButtons/L_socialContactButtons'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogAboutFantasiaArchive',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'dialogComponent-button-close',
  socialButtonsWrapper: 'socialContactButtons'
}

const aboutDialogDirectInput: T_dialogName = 'AboutFantasiaArchive'

/**
 * Close runs last so social-button copy is asserted while the dialog is still open.
 */
test.describe.serial('About Fantasia Archive dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: aboutDialogDirectInput })
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
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
   * Feed "AboutFantasiaArchive" input and check if all key dialog elements open.
   */
  test('Open test "AboutFantasiaArchive" dialog with all elements in it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)

    await expect(closeButton).toHaveCount(1)
    await expect(socialButtonsWrapper).toHaveCount(1)
  })

  test('Check correct amount and content of social buttons in AboutFantasiaArchive dialog', async () => {
    const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)
    const socialButtons = socialButtonsWrapper.locator('[data-test-locator="socialContactSingleButton"]')
    await expect(socialButtons).toHaveCount(7)

    const expectedButtonLabels = [
      L_socialContactButtons.buttonPatreon.label,
      L_socialContactButtons.buttonKofi.label,
      L_socialContactButtons.buttonWebsite.label,
      L_socialContactButtons.buttonGitHub.label,
      L_socialContactButtons.buttonDiscord.label,
      L_socialContactButtons.buttonReddit.label,
      L_socialContactButtons.buttonTwitter.label
    ]

    for (let i = 0; i < expectedButtonLabels.length; i++) {
      const label = expectedButtonLabels[i]
      if (label.length === 0) {
        await expect(
          socialButtons.nth(i).locator('[data-test-locator="socialContactSingleButton-text"]')
        ).toHaveCount(0)
      } else {
        await expect(socialButtons.nth(i)).toHaveText(label)
      }
    }
  })

  /**
   * Feed "AboutFantasiaArchive" input and check if dialog closes after button click.
   */
  test('Open test "AboutFantasiaArchive" dialog and try closing it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const socialButtonsWrapper = appWindow.locator(`[data-test-locator="${selectorList.socialButtonsWrapper}"]`)

    await expect(socialButtonsWrapper).toHaveCount(1)
    await expect(closeButton).toHaveCount(1)
    await closeButton.click()

    await appWindow.waitForTimeout(1500)

    expect(await socialButtonsWrapper.isHidden()).toBe(true)
  })
})
