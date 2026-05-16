import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectStylingMessages from 'app/i18n/en-US/floatingWindows/L_projectStyling'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'WindowProjectStyling',
  COMPONENT_PROPS: JSON.stringify({})
}

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
const projectStylingHelpMenuHoverMs = 1000

/**
 * Theme variable rows asserted in the help panel (sorted names from `fa-theme.scss` / DOM scan).
 */
const projectStylingHelpFaVarNames = [
  '--fa-color-accent',
  '--fa-color-black',
  '--fa-color-dark',
  '--fa-color-primary',
  '--fa-color-primary-bright'
] as const

/**
 * Component-testing can hydrate `directInput` after `ComponentTesting.vue` resolves `getSnapshot`, so the floating frame may appear later than the initial render timer.
 */
const projectStylingWindowReadyMs = 30_000

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'windowProjectStyling-button-close',
  dragHandle: 'windowProjectStyling-dragHandle',
  editorHost: 'windowProjectStyling-editorHost',
  faThemeVarList: 'windowProjectStyling-faThemeVarList',
  frame: 'windowProjectStyling-frame',
  helpIcon: 'windowProjectStyling-helpIcon',
  helpMenu: 'windowProjectStyling-helpMenu',
  helpTooltipBody: 'windowProjectStyling-helpTooltipBody',
  loadingOverlay: 'windowProjectStyling-loadingOverlay',
  saveButton: 'windowProjectStyling-button-save',
  title: 'windowProjectStyling-title'
} as const

const projectStylingDirectInput: T_dialogName = 'WindowProjectStyling'

/**
 * Match e2e styling checks: editor host present and Monaco root visible.
 */
async function waitForMonacoEditorMount (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.editorHost}"]`)
  await expect(host).toHaveCount(1)
  await expect(page.locator('.windowProjectStyling .monaco-editor')).toBeVisible({
    timeout: 15_000
  })
}

/**
 * Mirrors e2e app styling wait shape: frame and title, transition buffer, cold-load
 * wait, then Monaco.
 */
async function waitForProjectStylingWindowReady (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.frame}"]`)
  await expect(frame).toHaveCount(1, { timeout: projectStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.title}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(projectStylingMessages.title)
  await page.waitForTimeout(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 100)
  await page.waitForTimeout(monacoMountSettleMs)
  await waitForMonacoEditorMount(page)
}

test.describe.serial('Project styling floating window chrome and persistent close behaviour', () => {
  test.describe.configure({ timeout: 120_000 })

  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: projectStylingDirectInput })
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: true,
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
   * directInput mounts the window with the Custom project CSS title and both action buttons.
   */
  test('Project styling window renders title, save and close-without-saving controls', async () => {
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    await expect(frame).toHaveCount(1, { timeout: projectStylingWindowReadyMs })

    const title = frame.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(title).toHaveCount(1)
    await expect(title).toHaveText(projectStylingMessages.title)

    const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    await expect(closeButton).toHaveCount(1)
    await expect(closeButton).toContainText(projectStylingMessages.closeWithoutSaving)

    const saveButton = frame.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    await expect(saveButton).toHaveCount(1)
    await expect(saveButton).toContainText(projectStylingMessages.saveButton)
  })

  /**
   * Cold-loaded Monaco shell mounts an editor child node into the editor host after the window opens.
   */
  test('Project styling window mounts the cold-loaded Monaco editor host', async () => {
    await waitForProjectStylingWindowReady(appWindow)
    const loadingOverlay = appWindow.locator(`[data-test-locator="${selectorList.loadingOverlay}"]`)
    await expect(loadingOverlay).toHaveCount(0)
  })

  /**
   * No modal backdrop: Escape and outside clicks must not dismiss the window; only explicit buttons close it.
   */
  test('Project styling window ignores Escape and outside click until a button closes it', async () => {
    await waitForProjectStylingWindowReady(appWindow)
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)

    const titleHeading = frame.locator(`[data-test-locator="${selectorList.title}"]`)
    await expect(titleHeading).toHaveCount(1)
    await titleHeading.click()

    await appWindow.keyboard.press('Escape')
    await appWindow.waitForTimeout(400)
    await expect(frame).toHaveCount(1, { timeout: 10_000 })

    await appWindow.mouse.click(5, 5)
    await appWindow.waitForTimeout(400)
    await expect(frame).toHaveCount(1, { timeout: 10_000 })
  })

  /**
   * Help icon opens a sticky `QMenu` after hover; leaving the icon for the title bar does not dismiss it.
   * Body lists English keybind copy and theme variables with 20×20 swatches that resolve a background color.
   */
  test('Project styling help menu opens on hover and lists keybinds and theme variables with swatches', async () => {
    await waitForProjectStylingWindowReady(appWindow)
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const helpIcon = frame.locator(`[data-test-locator="${selectorList.helpIcon}"]`)
    await expect(helpIcon).toHaveCount(1)
    await helpIcon.hover()
    await appWindow.waitForTimeout(projectStylingHelpMenuHoverMs)

    const helpMenu = appWindow.locator(`[data-test-locator="${selectorList.helpMenu}"]`)
    await expect(helpMenu).toBeVisible({ timeout: 10_000 })

    const helpBody = appWindow.locator(`[data-test-locator="${selectorList.helpTooltipBody}"]`)
    await expect(helpBody).toContainText(projectStylingMessages.helpTooltip.title)
    await expect(helpBody).toContainText('F1')
    await expect(helpBody).toContainText(projectStylingMessages.helpTooltip.items.commandPalette)
    await expect(helpBody).toContainText(projectStylingMessages.helpTooltip.variableListTitle)

    const varList = appWindow.locator(`[data-test-locator="${selectorList.faThemeVarList}"]`)
    await expect(varList).toBeVisible()

    const titleHeading = frame.locator(`[data-test-locator="${selectorList.title}"]`)
    await titleHeading.hover()
    await appWindow.waitForTimeout(200)
    await expect(helpMenu).toBeVisible()

    for (const varName of projectStylingHelpFaVarNames) {
      const item = appWindow.locator(
        `.windowProjectStyling__helpTooltipFaVarItem[data-test-fa-theme-var="${varName}"]`
      )
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
   * Close button dismisses the window without writing CSS to project styling persistence when no edits were saved this session.
   */
  test('Project styling Close without saving dismisses the window and leaves stored project css empty', async () => {
    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await expect(frame).toHaveCount(1, { timeout: projectStylingWindowReadyMs })
    await closeButton.click()
    await expect(frame).toHaveCount(0, { timeout: 15_000 })

    const stored = await appWindow.evaluate(async () => {
      return await window.faContentBridgeAPIs.projectManagement.getProjectStyling()
    })
    expect(stored.css).toBe('')
    expect(stored.schemaVersion).toBe(1)
  })
})
