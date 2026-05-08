import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'FantasiaMascotImage',
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
  image: 'fantasiaMascotImage-image'
}

/**
 * Default 'COMPONENT_PROPS': IMG tag and random-image flag share one launch.
 */
test.describe.serial('Fantasia mascot image (default props)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({})
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
   * The hook lives on the native img (no nested img); assert tag on that node.
   */
  test('Check if the wrapper contains "IMG" element', async () => {
    const testString = 'IMG'

    const root = appWindow.locator(`[data-test-locator="${selectorList.image}"]`)
    await expect(root).toHaveCount(1)

    const elementType = await root.evaluate(el => el.tagName)
    expect(elementType).toBe(testString)
  })

  /**
   * Test if the component properly determines if the image will be random - YES
   */
  test('Check if the image is random: YES', async () => {
    const imageElement = appWindow.locator(`[data-test-locator="${selectorList.image}"]`)

    await expect(imageElement).toHaveCount(1)

    const isRandom = await imageElement.evaluate(el => el.dataset.testIsRandom)
    expect(isRandom).toBe('true')
  })
})

/**
 * Fixed width and height require their own launch env snapshot.
 */
test.describe.serial('Fantasia mascot image (explicit dimensions)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const testStringWidth = '300px'
    const testStringHeight = '300px'
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      width: testStringWidth,
      height: testStringHeight
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
   * Declared width/height props surface on data-test-layout-* so CI stays stable when the window is narrow.
   */
  test('Visually check for proper sizing of the icon', async () => {
    const testStringWidth = '300px'
    const testStringHeight = '300px'

    const imageElement = appWindow.locator(`[data-test-locator="${selectorList.image}"]`)

    await expect(imageElement).toHaveCount(1)
    await expect(imageElement).toHaveAttribute('data-test-layout-width', testStringWidth)
    await expect(imageElement).toHaveAttribute('data-test-layout-height', testStringHeight)
  })
})

/**
 * Fixed 'fantasiaImage' id requires its own launch env snapshot.
 */
test.describe.serial('Fantasia mascot image (fixed fantasiaImage id)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const testString = 'flop'
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ fantasiaImage: testString })
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
   * Test if the component properly determines if the image will be random - NO
   */
  test('Check if the image is random: NO', async () => {
    const testString = 'flop'

    const imageElement = appWindow.locator(`[data-test-locator="${selectorList.image}"]`)

    await expect(imageElement).toHaveCount(1)

    const isRandom = await imageElement.evaluate(el => el.dataset.testIsRandom)
    expect(isRandom).toBe('false')

    const imageString = await imageElement.evaluate(el => el.dataset.testImage)
    expect(imageString).toBe(testString)
  })
})
