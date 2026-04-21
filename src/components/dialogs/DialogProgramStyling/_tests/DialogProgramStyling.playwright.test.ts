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
import programStylingMessages from 'app/i18n/en-US/dialogs/L_programStyling'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogProgramStyling',
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
 * Monaco editor is cold-loaded: the dialog open triggers a dynamic import that bundles workers.
 * This buffer gives the worker registration plus first paint enough time before assertions.
 */
const monacoMountSettleMs = 2500

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'dialogProgramStyling-button-close',
  editorHost: 'dialogProgramStyling-editorHost',
  loadingOverlay: 'dialogProgramStyling-loadingOverlay',
  saveButton: 'dialogProgramStyling-button-save',
  title: 'dialogProgramStyling-title'
}

const programStylingDirectInput: T_dialogName = 'ProgramStyling'

/**
 * Wait helper for the cold-loaded Monaco shell to mount inside the editor host.
 * Treats either the loading overlay disappearing or the host getting non-zero height as 'ready'.
 */
async function waitForMonacoEditorMount (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.editorHost}"]`)
  await expect(host).toHaveCount(1)
  await expect(async () => {
    const handle = await host.elementHandle()
    if (handle === null) {
      throw new Error('editor host detached before Monaco mount')
    }
    const childCount = await handle.evaluate((node: Element) => node.childElementCount)
    expect(childCount).toBeGreaterThan(0)
  }).toPass({ timeout: 15_000 })
}

test.describe.serial('Program styling dialog chrome and persistent close behaviour', () => {
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
   * directInput mounts the dialog with the Custom program CSS title and both action buttons.
   */
  test('Program styling dialog renders title, save and close-without-saving controls', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toHaveCount(1)
    await expect(title).toHaveText(programStylingMessages.title)

    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    await expect(closeButton).toHaveCount(1)
    await expect(closeButton).toContainText(programStylingMessages.closeWithoutSaving)

    const saveButton = appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await expect(saveButton).toHaveCount(1)
    await expect(saveButton).toContainText(programStylingMessages.saveButton)
  })

  /**
   * Cold-loaded Monaco shell mounts an editor child node into the editor host after the dialog opens.
   */
  test('Program styling dialog mounts the cold-loaded Monaco editor host', async () => {
    await waitForMonacoEditorMount(appWindow)
    const loadingOverlay = appWindow.locator(`[data-test-locator="${selectorList.loadingOverlay}"]`)
    await expect(loadingOverlay).toHaveCount(0)
  })

  /**
   * Persistent QDialog must ignore Escape and outside clicks; the dialog stays visible until an explicit button click.
   */
  test('Program styling dialog ignores Escape and outside click (persistent)', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toBeVisible()

    await appWindow.keyboard.press('Escape')
    await appWindow.waitForTimeout(400)
    await expect(title).toBeVisible()

    await appWindow.mouse.click(5, 5)
    await appWindow.waitForTimeout(400)
    await expect(title).toBeVisible()
  })

  /**
   * Close button dismisses the dialog without writing CSS to the persistent store.
   */
  test('Program styling Close without saving dismisses the dialog and leaves stored css empty', async () => {
    const title = appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    const closeButton = appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await expect(title).toBeVisible()
    await closeButton.click()
    await expect(title).toBeHidden({ timeout: 15_000 })

    const stored = await appWindow.evaluate(async () => {
      return await window.faContentBridgeAPIs.faProgramStyling.getProgramStyling()
    })
    expect(stored.css).toBe('')
    expect(stored.schemaVersion).toBe(1)
  })
})
