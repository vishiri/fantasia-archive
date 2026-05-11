import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import noteboardMessages from 'app/i18n/en-US/floatingWindows/L_appNoteboard'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/faKeybindsStoreDefaults'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'WindowAppNoteboard',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer so the component-testing shell finishes rendering before assertions.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * Component-testing can hydrate directInput after ComponentTesting resolves getSnapshot, so the floating frame may appear later than the initial render timer.
 */
const noteboardWindowReadyMs = 30_000

/**
 * Note text persistence debounces at 380 ms in production; allow margin for IPC and main-process merge.
 */
const noteboardTextPersistSettleMs = 900

/**
 * Sample three lines typed into the editor; main-process store must match this string after debounced save.
 */
const noteboardThreeLineSample =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, line one.\n' +
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, line two.\n' +
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, line three.'

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'windowAppNoteboard-button-close',
  closeButtonKeybind: 'windowAppNoteboard-button-close-keybind',
  editor: 'windowAppNoteboard-editor',
  frame: 'windowAppNoteboard-frame',
  title: 'windowAppNoteboard-title'
} as const

const noteboardDirectInput: T_dialogName = 'WindowAppNoteboard'

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

async function readNoteboardFromBridge (page: Page): Promise<I_faAppNoteboardRoot> {
  return await page.evaluate(async () => {
    return await window.faContentBridgeAPIs.faAppNoteboard.getNoteboard()
  })
}

/**
 * Frame, title, transition settle, and interactive shell ready for editor assertions.
 */
async function waitForNoteboardWindowReady (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.frame}"]`)
  await expect(frame).toHaveCount(1, { timeout: noteboardWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.title}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(noteboardMessages.title)
  await page.waitForTimeout(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 100)
}

test.describe.serial('App noteboard floating window chrome, persistence, and close', () => {
  test.describe.configure({ timeout: 120_000 })

  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: noteboardDirectInput })
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
   * directInput mounts the window with the App noteboard title, native textarea, and Close control.
   */
  test('App noteboard window renders title, textarea, and Close control', async () => {
    await waitForNoteboardWindowReady(appWindow)

    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const editor = frame.locator(`[data-test-locator="${selectorList.editor}"]`)
    await expect(editor).toHaveCount(1)
    await expect(editor).toBeVisible()

    const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    await expect(closeButton).toHaveCount(1)
    await expect(closeButton).toContainText(noteboardMessages.close)

    const closeKeybind = frame.locator(`[data-test-locator="${selectorList.closeButtonKeybind}"]`)
    await expect(closeKeybind).toHaveCount(1)
    await expect(closeKeybind).toHaveText(toggleNoteboardKeybindParenText())
  })

  /**
   * Typing three lines persists through the bridge; clearing the editor persists empty text; Close removes the frame.
   */
  test('App noteboard saves and clears note text in the desktop store then closes from Close', async () => {
    await waitForNoteboardWindowReady(appWindow)

    const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
    const editor = frame.locator(`[data-test-locator="${selectorList.editor}"]`)
    const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)

    await editor.click()
    await editor.fill(noteboardThreeLineSample)
    await appWindow.waitForTimeout(noteboardTextPersistSettleMs)

    const afterWrite = await readNoteboardFromBridge(appWindow)
    expect(afterWrite.text).toBe(noteboardThreeLineSample)
    expect(afterWrite.schemaVersion).toBe(1)

    await editor.fill('')
    await appWindow.waitForTimeout(noteboardTextPersistSettleMs)

    const afterClear = await readNoteboardFromBridge(appWindow)
    expect(afterClear.text).toBe('')

    await closeButton.click()
    await expect(frame).toHaveCount(0, { timeout: 15_000 })

    const afterClose = await readNoteboardFromBridge(appWindow)
    expect(afterClose.text).toBe('')
    expect(afterClose.schemaVersion).toBe(1)
  })
})
