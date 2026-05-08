import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'

/**
 * Title and body copy passed through 'COMPONENT_PROPS' for the live ErrorCard shell.
 */
const testTitle = 'Component test error title'

/**
 * Optional details paragraph; must appear when 'details' is set.
 */
const testDetails =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'

/**
 * Card 'width' prop in CSS pixels; rendered box may be smaller when the shell is narrow (max-width: min(100%, …)).
 */
const testWidthPx = 600

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'ErrorCard',
  COMPONENT_PROPS: JSON.stringify({
    details: testDetails,
    imageName: 'reading',
    title: testTitle,
    width: testWidthPx
  })
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
  errorCard: 'errorCard',
  errorCardTitle: 'errorCard-title',
  fantasiaMascotImage: 'fantasiaMascotImage-image'
}

test.describe.serial('Error card (live component shell)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      details: testDetails,
      imageName: 'reading',
      title: testTitle,
      width: testWidthPx
    })
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
   * Root card is present; width cap is asserted from data-test-error-card-width (stable on narrow viewports).
   */
  test('Root contract: error card locator and width cap via data-test-error-card-width', async () => {
    const root = appWindow.locator(`[data-test-locator="${selectorList.errorCard}"]`)

    await expect(root).toHaveCount(1)
    await expect(root).toBeVisible()
    await expect(root).toHaveAttribute('data-test-error-card-width', String(testWidthPx))
  })

  /**
   * Title string from props appears in the live DOM.
   */
  test('Title renders in the live UI', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.errorCardTitle}"]`)

    await expect(title).toHaveCount(1)
    await expect(title).toBeVisible()
    await expect(title).toHaveText(testTitle)
  })

  /**
   * Details paragraph shows the lorem ipsum body when 'details' is provided.
   */
  test('Details paragraph shows lorem ipsum copy', async () => {
    const details = appWindow.locator('[data-test-locator="errorCard-details"]')

    await expect(details).toHaveCount(1)
    await expect(details).toContainText('Lorem ipsum dolor sit amet')
    await expect(details).toContainText('labore et dolore magna aliqua')
  })

  /**
   * Mascot subtree resolves the reading variant (image tag + expected asset path).
   */
  test('Reading mascot image is present with expected src', async () => {
    const root = appWindow.locator(`[data-test-locator="${selectorList.fantasiaMascotImage}"]`)

    await expect(root).toHaveCount(1)

    const isRandom = await root.evaluate(el => el.dataset.testIsRandom)
    expect(isRandom).toBe('false')

    const imageKey = await root.evaluate(el => el.dataset.testImage)
    expect(imageKey).toBe('reading')

    const src = await root.evaluate((el: HTMLImageElement) => el.src)
    expect(src).toContain('fantasia_reading.png')
  })
})
