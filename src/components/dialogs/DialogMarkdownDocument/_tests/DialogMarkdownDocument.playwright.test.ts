import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { T_documentName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogMarkdownDocument',
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
  markdownWrapper: 'dialogMarkdownDocument-markdown-wrapper',
  markdownContent: 'dialogMarkdownDocument-markdown-content',
  closeButton: 'dialogMarkdownDocument-button-close'
}

const licenseDocumentDirectInput: T_documentName = 'license'
const changeLogDocumentDirectInput: T_documentName = 'changeLog'

test.describe.serial('Dialog markdown document (license)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: licenseDocumentDirectInput })
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
   * Feed 'license' input as the file to open and check if the opened dialog afterwards has all the needed elements in it.
   */
  test('Open test "license" dialog with all elements in it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const markdownWrapper = appWindow.locator(`[data-test-locator="${selectorList.markdownWrapper}"]`)
    const markdownContent = appWindow.locator(`[data-test-locator="${selectorList.markdownContent}"]`)

    await expect(closeButton).toHaveCount(1)
    await expect(markdownWrapper).toHaveCount(1)
    await expect(markdownContent).toHaveCount(1)
  })

  /**
   * Feed 'license' input as the file to open and check if the opened dialog afterwards has all the needed elements in it.
   */
  test('Open test "license" dialog and try closing it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const markdownContent = appWindow.locator(`[data-test-locator="${selectorList.markdownContent}"]`)

    await expect(markdownContent).toHaveCount(1)
    await expect(closeButton).toHaveCount(1)
    await closeButton.click()

    await appWindow.waitForTimeout(1500)

    expect(await markdownContent.isHidden()).toBe(true)
  })
})

test.describe.serial('Dialog markdown document (changeLog)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: changeLogDocumentDirectInput })
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
   * Feed **changeLog** as **directInput** so the en-US changelog markdown loads through **vue-i18n** (catches stray brace placeholder syntax) and the dialog shell renders.
   */
  test('Open test "changeLog" dialog with all elements in it', async () => {
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    const markdownWrapper = appWindow.locator(`[data-test-locator="${selectorList.markdownWrapper}"]`)
    const markdownContent = appWindow.locator(`[data-test-locator="${selectorList.markdownContent}"]`)

    await expect(closeButton).toHaveCount(1)
    await expect(markdownWrapper).toHaveCount(1)
    await expect(markdownContent).toHaveCount(1)
  })
})
