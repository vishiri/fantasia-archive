import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { getFaPlaywrightMonacoSelectAllPressString } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import toolsMenuMessages from 'app/i18n/en-US/components/globals/AppControlMenus/L_tools'
import noteboardMessages from 'app/i18n/en-US/floatingWindows/L_appNoteboard'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'

/**
 * Extra env settings to trigger E2E testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

/**
 * Buffer before assertions so the window and menus are ready.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * Menu animation timer for tests to wait for the menu animation to finish
 */
const menuAnimationTimer = 600

/**
 * Floating noteboard chrome can appear shortly after Tools menu dismissal.
 */
const noteboardWindowReadyMs = 30_000

/**
 * Matches production debounced main-process writes for note text plus IPC slack.
 */
const noteboardTextPersistSettleMs = 900

/**
 * Sample paragraphs saved in phase one and expected again after an app restart.
 */
const phaseOneNoteSample =
  'E2E app noteboard line one alpha.\n' +
  'E2E app noteboard line two bravo.\n' +
  'E2E app noteboard line three charlie.'

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  closeButton: 'windowAppNoteboard-button-close',
  closeButtonKeybind: 'windowAppNoteboard-button-close-keybind',
  editor: 'windowAppNoteboard-editor',
  frame: 'windowAppNoteboard-frame',
  title: 'windowAppNoteboard-title'
} as const

function toggleNoteboardKeybindParenText (): string {
  const chord = formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'toggleAppNoteboard',
    snapshot: {
      platform: process.platform as NodeJS.Platform,
      store: {
        ...FA_KEYBINDS_STORE_DEFAULTS
      }
    }
  })

  if (chord === null || chord === '') {
    throw new Error('Expected toggleAppNoteboard chord label for default store')
  }

  return `(${chord})`
}

async function openAppNoteboardFromToolsMenu (page: Page): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  const toolsTrigger = page.getByText(toolsMenuMessages.title, { exact: true })
  await expect(toolsTrigger).toBeVisible({ timeout: 20_000 })
  await toolsTrigger.click()
  await page.waitForTimeout(menuAnimationTimer)
  const row = page.getByText(toolsMenuMessages.items.appNoteBoard, { exact: true })
  await expect(row).toBeVisible()
  await row.click()
  await page.waitForTimeout(menuAnimationTimer)
}

async function waitForNoteboardFloatingWindow (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.frame}"]`)
  await expect(frame).toHaveCount(1, { timeout: noteboardWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.title}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(noteboardMessages.title)
  await page.waitForTimeout(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 100)
  const editor = frame.locator(`[data-test-locator="${selectorList.editor}"]`)
  await expect(editor).toBeVisible()

  const closeKeybind = frame.locator(`[data-test-locator="${selectorList.closeButtonKeybind}"]`)
  await expect(closeKeybind).toHaveCount(1)
  await expect(closeKeybind).toHaveText(toggleNoteboardKeybindParenText())
}

test.describe.serial('App noteboard E2E persistence phase one (fresh Playwright profile)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 120_000
  })

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
   * Types sample notes while the floating window stays open long enough for debounced persistence, then hides the window via Close without clearing the textarea first.
   * - Subsequent phases launch the real app shell again against the same on-disk isolated profile with no reset between launches.
   */
  test('Open App noteboard, type sample notes, Close', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Menus live on MainLayout; phases must exercise the splash or home chrome.'
    ).toBeVisible({
      timeout: 20_000
    })

    await test.step('Open App noteboard from Tools menu', async () => {
      await openAppNoteboardFromToolsMenu(appWindow)
      await waitForNoteboardFloatingWindow(appWindow)
    })

    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const editor = frame.locator(`[data-test-locator="${selectorList.editor}"]`)
    await editor.click()
    await editor.fill(phaseOneNoteSample)
    await appWindow.waitForTimeout(noteboardTextPersistSettleMs)

    await frame.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()
    await expect(frame).toHaveCount(0, { timeout: 15_000 })
  })
})

test.describe.serial('App noteboard E2E persistence phase two (reuse profile, no isolation reset)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 120_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      resetUserData: false,
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
   * After a cold start on the warmed profile from phase one the textarea replays persisted characters.
   * - Clearing the textarea and allowing the debouncer to idle writes an empty string for the phase three reopen.
   */
  test('Reopen App noteboard and confirm persisted text, clear all notes, Close', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Menus live on MainLayout; phases must exercise the splash or home chrome.'
    ).toBeVisible({
      timeout: 20_000
    })

    await openAppNoteboardFromToolsMenu(appWindow)
    await waitForNoteboardFloatingWindow(appWindow)

    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const editor = frame.locator(`[data-test-locator="${selectorList.editor}"]`)

    await expect(editor).toHaveValue(phaseOneNoteSample)

    await editor.click()
    await appWindow.keyboard.press(getFaPlaywrightMonacoSelectAllPressString())
    await appWindow.keyboard.press('Backspace')

    await appWindow.waitForTimeout(noteboardTextPersistSettleMs)
    await expect(editor).toHaveValue('')

    await frame.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()
    await expect(frame).toHaveCount(0, { timeout: 15_000 })
  })
})

test.describe.serial('App noteboard E2E persistence phase three (reuse profile again, no isolation reset)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 120_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      resetUserData: false,
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
   * A third cold start confirms the empty document from phase two remains empty when the Tools entry opens the chrome again.
   */
  test('Reopen App noteboard confirms empty textarea', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Menus live on MainLayout; phases must exercise the splash or home chrome.'
    ).toBeVisible({
      timeout: 20_000
    })

    await openAppNoteboardFromToolsMenu(appWindow)
    await waitForNoteboardFloatingWindow(appWindow)

    const editor = appWindow.locator(`[data-test-locator="${selectorList.editor}"]`)
    await expect(editor).toHaveValue('')

    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    await frame.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()
    await expect(frame).toHaveCount(0, { timeout: 15_000 })
  })
})
