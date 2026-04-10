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
 * Electron main filepath
 */
const electronMainFilePath:string = FA_ELECTRON_MAIN_JS_PATH

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
    const heading = appWindow.getByRole('heading', {
      level: 2,
      name: testTitle
    })

    await expect(heading).toHaveCount(1)
    await expect(heading).toBeVisible()
  })

  /**
   * Details paragraph shows the lorem ipsum body when 'details' is provided.
   */
  test('Details paragraph shows lorem ipsum copy', async () => {
    const details = appWindow.locator('.errorCard__details')

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
