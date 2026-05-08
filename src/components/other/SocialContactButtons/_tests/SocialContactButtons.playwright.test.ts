import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_socialContactButtonSet } from 'app/types/I_socialContactButtons'

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
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer:number = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  buttonListWrapper: 'socialContactButtons',
  singleButton: 'socialContactSingleButton',
  singleButtonImage: 'socialContactSingleButton-image',
  singleButtonText: 'socialContactSingleButton-text'
}

test.describe.serial('Social contact buttons', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
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
   * Check if the wrapper for all of the buttons exists
   */
  test('Check if the main button wrapper exists', async () => {
    const buttonWrapperLocator = appWindow.locator(`[data-test-locator="${selectorList.buttonListWrapper}"]`)

    await expect(buttonWrapperLocator).toHaveCount(1)
  })

  /**
   * Check if we have the proper amount of buttons on the page
   */
  test('Check if we have the proper amount of buttons on the page', async () => {
    const buttonWrapperLocator = appWindow.locator(`[data-test-locator="${selectorList.buttonListWrapper}"]`)

    await expect(buttonWrapperLocator).toHaveCount(1)

    const expectedButtonCountData = await buttonWrapperLocator.evaluate(el => el.dataset.testButtonNumber)
    const expectedButtonCount = parseInt(expectedButtonCountData || '0')
    expect(expectedButtonCount).toBe(expectedSingleButtonCount)

    const buttonsSelectorLocator = appWindow.locator(`[data-test-locator="${selectorList.singleButton}"]`)

    await expect(buttonsSelectorLocator).toHaveCount(expectedSingleButtonCount)
  })

  /**
   * Check if each button is unique (class comparing)
   */
  test('Check if each button is unique', async () => {
    const buttonWrapperLocator = appWindow.locator(`[data-test-locator="${selectorList.buttonListWrapper}"]`)

    await expect(buttonWrapperLocator).toHaveCount(1)

    const buttonClassList: string[] = []

    const buttonList = await appWindow.locator(`[data-test-locator="${selectorList.singleButton}"]`)

    for (let i = 0; i < await buttonList.count(); i++) {
      buttonClassList.push(await buttonList.nth(i).evaluate(el => el.classList.toString()))
    }

    const hasDuplicateClass = new Set(buttonClassList).size !== buttonClassList.length

    expect(hasDuplicateClass).not.toBeTruthy()
  })
})
