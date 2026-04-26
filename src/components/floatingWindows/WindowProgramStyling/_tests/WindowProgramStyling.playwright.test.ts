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
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers/playwrightDismissStartupTipsNotify'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import programStylingMessages from 'app/i18n/en-US/floatingWindows/L_programStyling'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
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
 * Help `QMenu` opens after a hover delay on the icon; hover at least this long before asserting.
 * (Implementation uses 500 ms; one second of hover keeps the spec stable under load.)
 */
const programStylingHelpMenuHoverMs = 1000

/**
 * Theme variable rows asserted in the help panel (sorted names from `fa-theme.scss` / DOM scan).
 */
const programStylingHelpFaVarNames = [
  '--fa-color-accent',
  '--fa-color-black',
  '--fa-color-dark',
  '--fa-color-primary',
  '--fa-color-primary-bright'
] as const

/**
 * Component-testing can hydrate `directInput` after `ComponentTesting.vue` resolves `getSnapshot`, so the floating frame may appear later than the initial render timer.
 */
const programStylingWindowReadyMs = 30_000

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'windowProgramStyling-button-close',
  dragHandle: 'windowProgramStyling-dragHandle',
  editorHost: 'windowProgramStyling-editorHost',
  faThemeVarList: 'windowProgramStyling-faThemeVarList',
  frame: 'windowProgramStyling-frame',
  helpIcon: 'windowProgramStyling-helpIcon',
  helpMenu: 'windowProgramStyling-helpMenu',
  helpTooltipBody: 'windowProgramStyling-helpTooltipBody',
  loadingOverlay: 'windowProgramStyling-loadingOverlay',
  saveButton: 'windowProgramStyling-button-save',
  title: 'windowProgramStyling-title'
} as const

const programStylingDirectInput: T_dialogName = 'WindowProgramStyling'

/**
 * Match e2e checkAppStyling: editor host present and Monaco root visible.
 */
async function waitForMonacoEditorMount (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.editorHost}"]`)
  await expect(host).toHaveCount(1)
  await expect(page.locator('.windowProgramStyling .monaco-editor')).toBeVisible({ timeout: 15_000 })
}

/**
 * Mirrors e2e checkAppStyling.waitForProgramStylingWindow: frame and title, transition buffer, cold-load
 * wait, then Monaco. (The window uses Quasar fade on the frame; duration constant matches transition timing.)
 */
async function waitForProgramStylingWindowReady (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.frame}"]`)
  await expect(frame).toHaveCount(1, { timeout: programStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.title}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(programStylingMessages.title)
  await page.waitForTimeout(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 100)
  await page.waitForTimeout(monacoMountSettleMs)
  await waitForMonacoEditorMount(page)
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
    await dismissStartupTipsNotifyIfPresent(appWindow)
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
    await waitForProgramStylingWindowReady(appWindow)
    const loadingOverlay = appWindow.locator(`[data-test-locator="${selectorList.loadingOverlay}"]`)
    await expect(loadingOverlay).toHaveCount(0)
  })

  /**
   * No modal backdrop: Escape and outside clicks must not dismiss the window; only explicit buttons close it.
   */
  test('Program styling window ignores Escape and outside click until a button closes it', async () => {
    await waitForProgramStylingWindowReady(appWindow)
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)

    // Move focus out of Monaco before Escape. Click the title text (not the top-left of the title row:
    // the NW resize handle sits there and intercepts pointer events in Playwright).
    const titleHeading = frame.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(titleHeading).toHaveCount(1)
    await titleHeading.click()

    await appWindow.keyboard.press('Escape')
    await appWindow.waitForTimeout(400)
    await expect(frame).toHaveCount(1, { timeout: 10_000 })

    // Top-left of the page content (outside a centered frame on typical viewports), not a slow hit-target wait.
    await appWindow.mouse.click(5, 5)
    await appWindow.waitForTimeout(400)
    await expect(frame).toHaveCount(1, { timeout: 10_000 })
  })

  /**
   * Help icon opens a sticky `QMenu` after hover; leaving the icon for the title bar does not dismiss it.
   * Body lists English keybind copy and theme variables with 20×20 swatches that resolve a background color.
   */
  test('Program styling help menu opens on hover and lists keybinds and theme variables with swatches', async () => {
    await waitForProgramStylingWindowReady(appWindow)
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const helpIcon = frame.locator(`[data-test-locator="${selectorList.helpIcon}"]`)
    await expect(helpIcon).toHaveCount(1)
    await helpIcon.hover()
    await appWindow.waitForTimeout(programStylingHelpMenuHoverMs)

    const helpMenu = appWindow.locator(`[data-test-locator="${selectorList.helpMenu}"]`)
    await expect(helpMenu).toBeVisible({ timeout: 10_000 })

    const helpBody = appWindow.locator(`[data-test-locator="${selectorList.helpTooltipBody}"]`)
    await expect(helpBody).toContainText(programStylingMessages.helpTooltip.title)
    await expect(helpBody).toContainText('F1')
    await expect(helpBody).toContainText(programStylingMessages.helpTooltip.items.commandPalette)
    await expect(helpBody).toContainText(programStylingMessages.helpTooltip.variableListTitle)

    const varList = appWindow.locator(`[data-test-locator="${selectorList.faThemeVarList}"]`)
    await expect(varList).toBeVisible()

    const titleHeading = frame.locator(`[data-test-locator="${selectorList.title}"]`)
    await titleHeading.hover()
    await appWindow.waitForTimeout(200)
    await expect(helpMenu).toBeVisible()

    for (const varName of programStylingHelpFaVarNames) {
      const item = appWindow.locator(`.windowProgramStyling__helpTooltipFaVarItem[data-test-fa-theme-var="${varName}"]`)
      await expect(item).toHaveCount(1)
      await expect(item).toContainText(varName)
      const swatch = item.locator(`[data-test-fa-theme-var-swatch="${varName}"]`)
      await expect(swatch).toHaveCount(1)
      const box = await swatch.boundingBox()
      expect(box).not.toBeNull()
      if (box !== null) {
        expect(box.width).toBeCloseTo(20, 0)
        expect(box.height).toBeCloseTo(20, 0)
      }
      const backgroundColor = await swatch.evaluate((el) => window.getComputedStyle(el).backgroundColor)
      expect(backgroundColor.trim().length).toBeGreaterThan(0)
      expect(backgroundColor.toLowerCase()).not.toBe('transparent')
    }
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
