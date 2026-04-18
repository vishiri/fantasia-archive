import { _electron as electron } from 'playwright'
import type { ElectronApplication, Locator, Page } from 'playwright'
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
import keybindDialogMessages from 'app/i18n/en-US/dialogs/L_dialogKeybindSettings'
import programSettingsMessages from 'app/i18n/en-US/dialogs/L_programSettings'

/**
 * Extra env settings to trigger E2E testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

/**
 * Electron main filepath
 */
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

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
  dialogProgramSettingsClose: 'dialogProgramSettings-button-close',
  dialogProgramSettingsTitle: 'dialogProgramSettings-title',
  keybindCaptureCard: 'dialogKeybindSettings-capture-card',
  keybindCaptureClear: 'dialogKeybindSettings-capture-clear',
  keybindCaptureField: 'dialogKeybindSettings-capture-qfield',
  keybindCaptureSet: 'dialogKeybindSettings-capture-set'
} as const

/**
 * Default chords match FA_KEYBIND_COMMAND_DEFINITIONS after expanding 'primary'.
 * Playwright 'ControlOrMeta' matches the app primary modifier (Cmd on macOS, Ctrl on Windows and Linux).
 */
const defaultChord = {
  openKeybindSettings: 'ControlOrMeta+Alt+Shift+k',
  openProgramSettings: 'ControlOrMeta+Alt+Shift+l'
} as const

/**
 * User-adjusted chords (explicit Control so behavior matches on macOS hosts too).
 */
const adjustedChord = {
  openKeybindSettings: 'Control+Alt+Shift+F10',
  openProgramSettings: 'Control+Alt+Shift+F11',
  toggleDeveloperTools: 'Control+Alt+Shift+F12'
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
  const primaryShortcut = process.platform === 'darwin' ? 'Meta+F12' : 'Control+F12'
  await page.keyboard.press(primaryShortcut)
}

/**
 * User-adjusted Toggle developer tools chord from this spec (Control plus Alt plus Shift plus F12).
 */
async function pressAdjustedToggleDeveloperToolsChord (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press('Control+Alt+Shift+F12')
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

async function closeProgramSettingsDialog (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.dialogProgramSettingsClose}"]`).click()
  const title = page.locator(`[data-test-locator="${selectorList.dialogProgramSettingsTitle}"]`)
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

test.describe.serial('Global keybinds end-to-end', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
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
   * Default shortcuts open and close dialogs and devtools; custom chords persist; clearing a user override restores the default devtools shortcut.
   */
  test('Keybind defaults, custom chords, clear override, and default restore', async () => {
    const keybindTitle = appWindow.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsTitle}"]`)
    const programTitle = appWindow.locator(`[data-test-locator="${selectorList.dialogProgramSettingsTitle}"]`)

    await expect(
      appWindow.locator('.appHeader'),
      'Global keybinds are registered only under MainLayout; this suite must start on the home route, not ErrorNotFound.vue.'
    ).toBeVisible({
      timeout: 20_000
    })

    await test.step('Default devtools toggle twice: open then close', async () => {
      await pressDefaultDevtoolsTwiceExpectOpenThenClosed(appWindow)
    })

    await test.step('Default program settings opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, defaultChord.openProgramSettings)
      await expect(programTitle).toBeVisible()
      await expect(programTitle).toHaveText(programSettingsMessages.title)
      await closeProgramSettingsDialog(appWindow)
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
        'program settings',
        keybindDialogMessages.commands.openProgramSettings,
        adjustedChord.openProgramSettings
      )
      await captureChordForFilteredCommand(
        appWindow,
        'keybind settings',
        keybindDialogMessages.commands.openKeybindSettings,
        adjustedChord.openKeybindSettings
      )
      await saveKeybindSettingsDialog(appWindow)
    })

    await test.step('Adjusted devtools toggle twice: open then close', async () => {
      await pressAdjustedDevtoolsTwiceExpectOpenThenClosed(appWindow)
    })

    await test.step('Adjusted program settings opens then closes', async () => {
      await triggerGlobalShortcut(appWindow, adjustedChord.openProgramSettings)
      await expect(programTitle).toBeVisible()
      await closeProgramSettingsDialog(appWindow)
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
