import type { ElectronApplication, Locator, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import {
  FA_PLAYWRIGHT_PRESS_ADJUSTED_TOGGLE_DEVTOOLS_F12,
  getFaPlaywrightDefaultActionMonitorOpenPressString,
  getFaPlaywrightDefaultToggleDevtoolsPressString
} from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import actionMonitorMessages from 'app/i18n/en-US/dialogs/L_DialogActionMonitor'
import keybindDialogMessages from 'app/i18n/en-US/dialogs/L_dialogKeybindSettings'
import appSettingsMessages from 'app/i18n/en-US/dialogs/L_appSettings'
import appStylingMessages from 'app/i18n/en-US/floatingWindows/L_appStyling'

/**
 * Extra env settings to trigger E2E testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

/**
 * Buffer before assertions so the window and keybind store are ready.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * q-input debounce is 300ms; allow slack for Electron paint after the model updates.
 */
const keybindSettingsSearchDebounceWaitMs = 400

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  dialogKeybindSettingsSave: 'dialogKeybindSettings-save',
  dialogKeybindSettingsTitle: 'dialogKeybindSettings-title',
  dialogKeybindSettingsUserKeybindButton: 'dialogKeybindSettings-userKeybind-button',
  dialogMarkdownDocumentClose: 'dialogMarkdownDocument-button-close',
  dialogAppSettingsClose: 'dialogAppSettings-button-close',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  appStylingClose: 'windowAppStyling-button-close',
  appStylingTitle: 'windowAppStyling-title',
  keybindCaptureCard: 'dialogKeybindSettings-capture-card',
  keybindCaptureClear: 'dialogKeybindSettings-capture-clear',
  keybindCaptureField: 'dialogKeybindSettings-capture-qfield',
  keybindCaptureSet: 'dialogKeybindSettings-capture-set'
} as const

/**
 * Default chords match FA_KEYBIND_COMMAND_DEFINITIONS after expanding 'primary'.
 * Playwright 'ControlOrMeta' matches the app primary modifier (Cmd on macOS, Ctrl on Windows and Linux).
 * Open Advanced search guide uses literal Ctrl in the app definition, so this suite always sends Control.
 */
const defaultChord = {
  openAdvancedSearchGuide: 'Control+Alt+Shift+G',
  openKeybindSettings: 'ControlOrMeta+Alt+Shift+k',
  openAppSettings: 'ControlOrMeta+Alt+Shift+l',
  openAppStyling: 'ControlOrMeta+Alt+Shift+j'
} as const

/**
 * User-adjusted chords (explicit Control so behavior matches on macOS hosts too).
 */
const adjustedChord = {
  openActionMonitor: 'Control+Alt+Shift+F8',
  openAdvancedSearchGuide: 'Control+Alt+Shift+F9',
  openKeybindSettings: 'Control+Alt+Shift+F10',
  openAppSettings: 'Control+Alt+Shift+F11',
  openAppStyling: 'Control+Alt+Shift+F7',
  toggleDeveloperTools: FA_PLAYWRIGHT_PRESS_ADJUSTED_TOGGLE_DEVTOOLS_F12
} as const

/**
 * Brings the BrowserWindow forward and focuses the Quasar app root so Playwright page.keyboard targets the same document as the capture-phase window keydown listener in MainLayout.vue.
 * Does not click in-page links or inputs: global shortcuts are exercised purely as keyboard input after this prep.
 */
async function prepareRendererForGlobalShortcuts (page: Page): Promise<void> {
  await page.bringToFront()
  await page.evaluate(() => {
    const root = document.querySelector('#q-app')
    if (root instanceof HTMLElement) {
      root.tabIndex = -1
      root.focus()
    }
  })
}

/**
 * Primary modifier plus F12 matches the default Toggle developer tools chord (Ctrl on Windows and Linux, Cmd on macOS).
 */
async function pressDefaultToggleDeveloperToolsChord (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultToggleDevtoolsPressString())
}

/**
 * User-adjusted Toggle developer tools chord from this spec (Control plus Alt plus Shift plus F12).
 */
async function pressAdjustedToggleDeveloperToolsChord (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(FA_PLAYWRIGHT_PRESS_ADJUSTED_TOGGLE_DEVTOOLS_F12)
}

/**
 * Default Open Action Monitor chord: primary modifier + F11 (Ctrl on Windows and Linux, Cmd on macOS).
 */
async function pressDefaultOpenActionMonitorChord (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultActionMonitorOpenPressString())
}

async function closeActionMonitorDialog (page: Page): Promise<void> {
  const root = page.locator('.dialogActionMonitor')
  await root.locator('[data-test-locator="dialogComponent-button-close"]').click()
  await expect(root).toBeHidden({
    timeout: 15_000
  })
}

async function triggerGlobalShortcut (page: Page, playwrightShortcut: string): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(playwrightShortcut)
}

async function assertDevToolsOpen (page: Page, open: boolean): Promise<void> {
  await expect.poll(async () => {
    return await page.evaluate(async () => {
      return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
    })
  }, { timeout: 15_000 }).toBe(open)
}

async function pressDefaultDevtoolsTwiceExpectOpenThenClosed (page: Page): Promise<void> {
  await pressDefaultToggleDeveloperToolsChord(page)
  await assertDevToolsOpen(page, true)
  await pressDefaultToggleDeveloperToolsChord(page)
  await assertDevToolsOpen(page, false)
}

async function pressAdjustedDevtoolsTwiceExpectOpenThenClosed (page: Page): Promise<void> {
  await pressAdjustedToggleDeveloperToolsChord(page)
  await assertDevToolsOpen(page, true)
  await pressAdjustedToggleDeveloperToolsChord(page)
  await assertDevToolsOpen(page, false)
}

async function fillKeybindSettingsFilter (page: Page, query: string): Promise<void> {
  const searchInput = page.getByPlaceholder(keybindDialogMessages.filterPlaceholder)
  await searchInput.focus()
  await searchInput.fill(query)
  await page.waitForTimeout(keybindSettingsSearchDebounceWaitMs)
}

async function rowForCommandLabel (page: Page, commandLabel: string): Promise<Locator> {
  const tableRoot = page.locator('.dialogKeybindSettings__table')
  return tableRoot.locator('tbody tr').filter({
    hasText: commandLabel
  })
}

async function captureChordForFilteredCommand (
  page: Page,
  filterQuery: string,
  commandLabel: string,
  chord: string
): Promise<void> {
  await fillKeybindSettingsFilter(page, filterQuery)
  const row = await rowForCommandLabel(page, commandLabel)
  await expect(row).toHaveCount(1)
  await row.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsUserKeybindButton}"]`).click()

  const captureCard = page.locator(`[data-test-locator="${selectorList.keybindCaptureCard}"]`)
  await expect(captureCard).toBeVisible()
  const captureField = page.locator(`[data-test-locator="${selectorList.keybindCaptureField}"]`)
  await captureField.focus()
  await captureField.press(chord)
  const setButton = page.locator(`[data-test-locator="${selectorList.keybindCaptureSet}"]`)
  await expect(setButton).toBeEnabled()
  await setButton.click()
  await expect(captureCard).toBeHidden()
}

async function saveKeybindSettingsDialog (page: Page): Promise<void> {
  const title = page.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsTitle}"]`)
  await page.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsSave}"]`).click()
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

async function closeAppSettingsDialog (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.dialogAppSettingsClose}"]`).click()
  const title = page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

/**
 * Custom app CSS dialog is persistent: only the explicit Close without saving button dismisses it.
 */
async function closeAppStylingDialog (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.appStylingClose}"]`).click()
  const title = page.locator(`[data-test-locator="${selectorList.appStylingTitle}"]`)
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

function locatorMarkdownAdvancedSearchGuideDialog (page: Page): Locator {
  return page.locator('.q-dialog.dialogMarkdownDocument.advancedSearchGuide')
}

async function closeMarkdownAdvancedSearchGuideDialog (page: Page): Promise<void> {
  const root = locatorMarkdownAdvancedSearchGuideDialog(page)
  await page.locator(`[data-test-locator="${selectorList.dialogMarkdownDocumentClose}"]`).click()
  await expect(root).toBeHidden({
    timeout: 15_000
  })
}

test.describe.serial('Global keybinds end-to-end', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
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
   * Default shortcuts open and close dialogs, markdown guide, and devtools; custom chords persist; clearing a user override restores the default devtools shortcut.
   */
  test('Keybind defaults, custom chords, clear override, and default restore', async () => {
    const keybindTitle = appWindow.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsTitle}"]`)
    const appSettingsTitle = appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
    const appStylingTitle = appWindow.locator(`[data-test-locator="${selectorList.appStylingTitle}"]`)

    await expect(
      appWindow.locator('.appHeader'),
      'Global keybinds are registered only under MainLayout; this suite must start on the home route, not ErrorNotFound.vue.'
    ).toBeVisible({
      timeout: 20_000
    })

    await test.step('Default devtools toggle twice: open then close', async () => {
      await pressDefaultDevtoolsTwiceExpectOpenThenClosed(appWindow)
    })

    await test.step('Default action monitor opens then closes', async () => {
      await pressDefaultOpenActionMonitorChord(appWindow)
      const root = appWindow.locator('.dialogActionMonitor')
      await expect(root).toBeVisible({
        timeout: 15_000
      })
      await expect(appWindow.locator('#dialogActionMonitor-title')).toHaveText(actionMonitorMessages.title)
      await closeActionMonitorDialog(appWindow)
    })

    await test.step('Default app settings opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, defaultChord.openAppSettings)
      await expect(appSettingsTitle).toBeVisible()
      await expect(appSettingsTitle).toHaveText(appSettingsMessages.title)
      await closeAppSettingsDialog(appWindow)
    })

    await test.step('Default custom app CSS opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, defaultChord.openAppStyling)
      await expect(appStylingTitle).toBeVisible({
        timeout: 15_000
      })
      await expect(appStylingTitle).toHaveText(appStylingMessages.title)
      await closeAppStylingDialog(appWindow)
    })

    await test.step('Default advanced search guide opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, defaultChord.openAdvancedSearchGuide)
      await expect(locatorMarkdownAdvancedSearchGuideDialog(appWindow)).toBeVisible({
        timeout: 15_000
      })
      await expect(
        appWindow.locator('[data-test-locator="dialogMarkdownDocument-markdown-wrapper"]')
      ).toBeVisible()
      await closeMarkdownAdvancedSearchGuideDialog(appWindow)
    })

    await test.step('Default keybind settings opens', async () => {
      await triggerGlobalShortcut(appWindow, defaultChord.openKeybindSettings)
      await expect(keybindTitle).toBeVisible()
      await expect(keybindTitle).toHaveText(keybindDialogMessages.title)
    })

    await test.step('Set custom chords and save', async () => {
      await captureChordForFilteredCommand(
        appWindow,
        'developer tools',
        keybindDialogMessages.commands.toggleDeveloperTools,
        adjustedChord.toggleDeveloperTools
      )
      await captureChordForFilteredCommand(
        appWindow,
        'action monitor',
        keybindDialogMessages.commands.openActionMonitor,
        adjustedChord.openActionMonitor
      )
      await captureChordForFilteredCommand(
        appWindow,
        'app settings',
        keybindDialogMessages.commands.openAppSettings,
        adjustedChord.openAppSettings
      )
      await captureChordForFilteredCommand(
        appWindow,
        'custom app css',
        keybindDialogMessages.commands.openAppStyling,
        adjustedChord.openAppStyling
      )
      await captureChordForFilteredCommand(
        appWindow,
        'keybind settings',
        keybindDialogMessages.commands.openKeybindSettings,
        adjustedChord.openKeybindSettings
      )
      await captureChordForFilteredCommand(
        appWindow,
        'advanced search guide',
        keybindDialogMessages.commands.openAdvancedSearchGuide,
        adjustedChord.openAdvancedSearchGuide
      )
      await saveKeybindSettingsDialog(appWindow)
    })

    await test.step('Adjusted devtools toggle twice: open then close', async () => {
      await pressAdjustedDevtoolsTwiceExpectOpenThenClosed(appWindow)
    })

    await test.step('Adjusted app settings opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, adjustedChord.openAppSettings)
      await expect(appSettingsTitle).toBeVisible()
      await closeAppSettingsDialog(appWindow)
    })

    await test.step('Adjusted custom app CSS opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, adjustedChord.openAppStyling)
      await expect(appStylingTitle).toBeVisible({
        timeout: 15_000
      })
      await closeAppStylingDialog(appWindow)
    })

    await test.step('Adjusted advanced search guide opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, adjustedChord.openAdvancedSearchGuide)
      await expect(locatorMarkdownAdvancedSearchGuideDialog(appWindow)).toBeVisible({
        timeout: 15_000
      })
      await closeMarkdownAdvancedSearchGuideDialog(appWindow)
    })

    await test.step('Adjusted action monitor opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, adjustedChord.openActionMonitor)
      const root = appWindow.locator('.dialogActionMonitor')
      await expect(root).toBeVisible({
        timeout: 15_000
      })
      await expect(appWindow.locator('#dialogActionMonitor-title')).toHaveText(actionMonitorMessages.title)
      await closeActionMonitorDialog(appWindow)
    })

    await test.step('Adjusted keybind settings opens', async () => {
      await triggerGlobalShortcut(appWindow, adjustedChord.openKeybindSettings)
      await expect(keybindTitle).toBeVisible()
    })

    await test.step('Clear devtools user keybind and save', async () => {
      await fillKeybindSettingsFilter(appWindow, 'developer tools')
      const devRow = await rowForCommandLabel(appWindow, keybindDialogMessages.commands.toggleDeveloperTools)
      await devRow.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsUserKeybindButton}"]`).click()
      const captureCard = appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureCard}"]`)
      await expect(captureCard).toBeVisible()
      await appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureClear}"]`).click()
      await expect(captureCard).toBeHidden()
      await saveKeybindSettingsDialog(appWindow)
    })

    await test.step('Former adjusted devtools chord does not open devtools', async () => {
      await pressAdjustedToggleDeveloperToolsChord(appWindow)
      await expect.poll(async () => {
        return await appWindow.evaluate(async () => {
          return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
        })
      }, { timeout: 10_000 }).toBe(false)
    })

    await test.step('Default devtools toggle twice again: open then close', async () => {
      await pressDefaultDevtoolsTwiceExpectOpenThenClosed(appWindow)
    })
  })
})
