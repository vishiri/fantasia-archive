import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectNoteboardMessages from 'app/i18n/en-US/floatingWindows/L_projectNoteboard'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/keybinds_managerDefaults'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/functions/faQuasarDialogStandardTransition'
import { formatFaKeybindCommandLabelFromSnapshot } from 'app/src/scripts/keybinds/faKeybindsChordUiFormatting_manager'
import type { I_faProjectNoteboardRoot } from 'app/types/I_faProjectNoteboardDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'WindowProjectNoteboard',
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
 * Sample three lines typed into the editor; same corpus as WindowAppNoteboard.playwright.test.ts.
 * The harness never opens a SQLite project handle, so getProjectNoteboard snapshots stay defaulted to empty text while the textarea still reflects edits.
 */
const noteboardThreeLineSample =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, line one.\n' +
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, line two.\n' +
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, line three.'

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'windowProjectNoteboard-button-close',
  closeButtonKeybind: 'windowProjectNoteboard-button-close-keybind',
  editor: 'windowProjectNoteboard-editor',
  frame: 'windowProjectNoteboard-frame',
  title: 'windowProjectNoteboard-title'
} as const

const noteboardDirectInput: T_dialogName = 'WindowProjectNoteboard'

function toggleNoteboardKeybindParenText (): string {
  const chord = formatFaKeybindCommandLabelFromSnapshot({
    commandId: 'toggleProjectNoteboard',
    snapshot: {
      platform: process.platform as NodeJS.Platform,
      store: {
        ...FA_KEYBINDS_STORE_DEFAULTS
      }
    }
  })

  if (chord === null || chord === '') {
    throw new Error('Expected toggleProjectNoteboard chord label for default store')
  }

  return `(${chord})`
}

async function readNoteboardFromBridge (page: Page): Promise<I_faProjectNoteboardRoot> {
  return await page.evaluate(async () => {
    return await window.faContentBridgeAPIs.projectManagement.getProjectNoteboard()
  })
}

/**
 * Frame, title, transition settle, and interactive shell ready for editor assertions.
 */
async function waitForNoteboardWindowReady (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.frame}"]`)
  await expect(frame).toHaveCount(1, {
    timeout: noteboardWindowReadyMs
  })
  const title = frame.locator(`[data-test-locator="${selectorList.title}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(projectNoteboardMessages.title)
  await page.waitForTimeout(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 100)
}

test.describe.serial(
  'Project noteboard floating window chrome, persistence, and close',
  () => {
    test.describe.configure({
      timeout: 120_000
    })

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
     * directInput mounts the window with the Project noteboard title, native textarea, and Close control.
     */
    test('Project noteboard window renders title, textarea, and Close control', async () => {
      await waitForNoteboardWindowReady(appWindow)

      const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
      const editor = frame.locator(`[data-test-locator="${selectorList.editor}"]`)
      await expect(editor).toHaveCount(1)
      await expect(editor).toBeVisible()

      const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)
      await expect(closeButton).toHaveCount(1)
      await expect(closeButton).toContainText(projectNoteboardMessages.close)

      const closeKeybind = frame.locator(`[data-test-locator="${selectorList.closeButtonKeybind}"]`)
      await expect(closeKeybind).toHaveCount(1)
      await expect(closeKeybind).toHaveText(toggleNoteboardKeybindParenText())
    })

    /**
     * Same fill, settle, bridge read, empty editor, settle, Close, and post-close bridge read as WindowAppNoteboard.playwright.test.ts.
     * This harness loads no SQLite project in main so getProjectNoteboard text stays defaulted to empty throughout while the textarea still reflects typing and clearing.
     */
    test('Project noteboard matches app-noteboard textarea fill and clear choreography; bridge text stays defaulted without a loaded .faproject, then closes from Close', async () => {
      await waitForNoteboardWindowReady(appWindow)

      const frame = appWindow.locator(`[data-test-locator="${selectorList.frame}"]`)
      const editor = frame.locator(`[data-test-locator="${selectorList.editor}"]`)
      const closeButton = frame.locator(`[data-test-locator="${selectorList.closeButton}"]`)

      await editor.click()
      await editor.fill(noteboardThreeLineSample)
      await appWindow.waitForTimeout(noteboardTextPersistSettleMs)

      expect(await editor.inputValue()).toBe(noteboardThreeLineSample)

      const afterWrite = await readNoteboardFromBridge(appWindow)
      expect(afterWrite.text).toBe('')
      expect(afterWrite.frame).toBeNull()
      expect(afterWrite.schemaVersion).toBe(1)

      await editor.fill('')
      await appWindow.waitForTimeout(noteboardTextPersistSettleMs)

      expect(await editor.inputValue()).toBe('')

      const afterClear = await readNoteboardFromBridge(appWindow)
      expect(afterClear.text).toBe('')
      expect(afterClear.schemaVersion).toBe(1)

      await closeButton.click()
      await expect(frame).toHaveCount(0, {
        timeout: 15_000
      })

      const afterClose = await readNoteboardFromBridge(appWindow)
      expect(afterClose.text).toBe('')
      expect(afterClose.schemaVersion).toBe(1)
    })
  }
)
