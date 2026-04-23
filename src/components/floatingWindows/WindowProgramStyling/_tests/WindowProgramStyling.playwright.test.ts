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
import programStylingMessages from 'app/i18n/en-US/floatingWindows/L_programStyling'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'WindowProgramStyling',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer so the component-testing shell finishes rendering before assertions.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * Monaco editor is cold-loaded: the window open triggers a dynamic import that bundles workers.
 * This buffer gives the worker registration plus first paint enough time before assertions.
 */
const monacoMountSettleMs = 2500

/**
 * Component-testing can hydrate `directInput` after `ComponentTesting.vue` resolves `getSnapshot`, so the floating frame may appear later than the initial render timer.
 */
const programStylingWindowReadyMs = 30_000

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'windowProgramStyling-button-close',
  editorHost: 'windowProgramStyling-editorHost',
  frame: 'windowProgramStyling-frame',
  loadingOverlay: 'windowProgramStyling-loadingOverlay',
  saveButton: 'windowProgramStyling-button-save',
  title: 'windowProgramStyling-title'
}

const programStylingDirectInput: T_dialogName = 'WindowProgramStyling'

/**
 * If Monaco owns focus, Escape can be consumed by the editor; blur any focused node inside the host.
 */
async function blurProgramStylingMonacoIfFocused (page: Page): Promise<void> {
  await page.evaluate(() => {
    const host = document.querySelector('[data-test-locator="windowProgramStyling-editorHost"]')
    const ae = document.activeElement
    if (host !== null && ae !== null && host.contains(ae)) {
      (ae as HTMLElement).blur()
    }
  })
}

/**
 * Wait helper for the cold-loaded Monaco shell to mount inside the editor host.
 * Treats either the loading overlay disappearing or the host getting non-zero height as 'ready'.
 */
async function waitForMonacoEditorMount (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.editorHost}"]`)
  await expect(host).toHaveCount(1, { timeout: programStylingWindowReadyMs })
  await expect(async () => {
    const handle = await host.elementHandle()
    if (handle === null) {
      throw new Error('editor host detached before Monaco mount')
    }
    const childCount = await handle.evaluate((node: Element) => node.childElementCount)
    expect(childCount).toBeGreaterThan(0)
  }).toPass({ timeout: 15_000 })
}

test.describe.serial('Program styling floating window chrome and persistent close behaviour', () => {
  test.describe.configure({ timeout: 120_000 })

  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: programStylingDirectInput })
    resetFaPlaywrightIsolatedUserData()
    electronApp = await electron.launch({
      env: extraEnvSettings,
      args: [electronMainFilePath],
      ...getFaPlaywrightElectronRecordVideoPartial(testInfo)
    })
    appWindow = await electronApp.firstWindow()
    await installFaPlaywrightCursorMarkerIfVideoEnabled(appWindow)
    await appWindow.waitForTimeout(faFrontendRenderTimer)
    await appWindow.waitForTimeout(monacoMountSettleMs)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
  })

  /**
   * directInput mounts the window with the Custom program CSS title and both action buttons.
   */
  test('Program styling window renders title, save and close-without-saving controls', async () => {
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    await expect(frame).toHaveCount(1, { timeout: programStylingWindowReadyMs })

    const title = frame.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toHaveCount(1)
    await expect(title).toHaveText(programStylingMessages.title)

    const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    await expect(closeButton).toHaveCount(1)
    await expect(closeButton).toContainText(programStylingMessages.closeWithoutSaving)

    const saveButton = frame.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await expect(saveButton).toHaveCount(1)
    await expect(saveButton).toContainText(programStylingMessages.saveButton)
  })

  /**
   * Cold-loaded Monaco shell mounts an editor child node into the editor host after the window opens.
   */
  test('Program styling window mounts the cold-loaded Monaco editor host', async () => {
    await waitForMonacoEditorMount(appWindow)
    const loadingOverlay = appWindow.locator(`[data-test-locator="${selectorList.loadingOverlay}"]`)
    await expect(loadingOverlay).toHaveCount(0)
  })

  /**
   * No modal backdrop: Escape and outside clicks must not dismiss the window; only explicit buttons close it.
   */
  test('Program styling window ignores Escape and outside click until a button closes it', async () => {
    // Assert on the frame root: the title node can satisfy toHaveText while Playwright still treats it as
    // not "visible" (transition/stacking), but v-if removes the whole frame when the window closes.
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    await expect(frame).toHaveCount(1, { timeout: programStylingWindowReadyMs })

    // Monaco may own focus after mount; blur the editor so Escape is not handled inside Monaco.
    await blurProgramStylingMonacoIfFocused(appWindow)

    await appWindow.keyboard.press('Escape')
    await appWindow.waitForTimeout(400)
    await expect(frame).toHaveCount(1, { timeout: 10_000 })

    await appWindow.mouse.click(5, 5)
    await appWindow.waitForTimeout(400)
    await expect(frame).toHaveCount(1, { timeout: 10_000 })
  })

  /**
   * Close button dismisses the window without writing CSS to the persistent store.
   */
  test('Program styling Close without saving dismisses the window and leaves stored css empty', async () => {
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await expect(frame).toHaveCount(1, { timeout: programStylingWindowReadyMs })
    await closeButton.click()
    await expect(frame).toHaveCount(0, { timeout: 15_000 })

    const stored = await appWindow.evaluate(async () => {
      return await window.faContentBridgeAPIs.faProgramStyling.getProgramStyling()
    })
    expect(stored.css).toBe('')
    expect(stored.schemaVersion).toBe(1)
  })
})
