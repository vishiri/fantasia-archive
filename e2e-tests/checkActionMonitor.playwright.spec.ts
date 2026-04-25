import { _electron as electron } from 'playwright'
import type { ElectronApplication, Locator, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  FA_ELECTRON_MAIN_JS_PATH,
  FA_FRONTEND_RENDER_TIMER
} from 'app/helpers/playwrightHelpers/faPlaywrightElectronLaunchConstants'
import {
  FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12,
  getFaPlaywrightDefaultActionMonitorOpenPressString
} from 'app/helpers/playwrightHelpers/faPlaywrightKeyboardChords'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers/playwrightDismissStartupTipsNotify'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import actionMonitorMessages from 'app/i18n/en-US/dialogs/L_DialogActionMonitor'
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
 * Buffer before assertions so the window and menus are ready.
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
  dialogActionMonitorPayloadEmpty: 'dialogActionMonitor-cell-payload-empty',
  dialogActionMonitorTable: 'dialogActionMonitor-table',
  dialogKeybindSettingsSave: 'dialogKeybindSettings-save',
  dialogKeybindSettingsTitle: 'dialogKeybindSettings-title',
  dialogKeybindSettingsUserKeybindButton: 'dialogKeybindSettings-userKeybind-button',
  dialogProgramSettingsClose: 'dialogProgramSettings-button-close',
  dialogProgramSettingsTitle: 'dialogProgramSettings-title',
  keybindCaptureCard: 'dialogKeybindSettings-capture-card',
  keybindCaptureField: 'dialogKeybindSettings-capture-qfield',
  keybindCaptureSet: 'dialogKeybindSettings-capture-set',
  monitorActionCell: 'dialogActionMonitor-cell-action',
  monitorClose: 'dialogComponent-button-close'
} as const

/**
 * Default global shortcuts (primary modifier expanded by the app on Windows and Linux).
 */
const defaultChord = {
  openKeybindSettings: 'ControlOrMeta+Alt+Shift+k',
  openProgramSettings: 'ControlOrMeta+Alt+Shift+l'
} as const

/**
 * Table shows newest actions first; this is the expected top-to-bottom id order after the scripted flow.
 */
const expectedActionIdsNewestFirst = [
  'openActionMonitorDialog',
  'saveKeybindSettings',
  'openKeybindSettingsDialog',
  'openProgramSettingsDialog',
  'showStartupTipsNotification'
] as const

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

async function triggerGlobalShortcut (page: Page, playwrightShortcut: string): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(playwrightShortcut)
}

async function pressDefaultOpenActionMonitorChord (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultActionMonitorOpenPressString())
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

async function tryReadClipboardText (page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return null
    }
  })
}

test.describe.serial('Action monitor end-to-end', () => {
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
    await dismissStartupTipsNotifyIfPresent(appWindow)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(electronApp, suiteTestInfo, afterAllTestInfo)
  })

  /**
   * Startup registers showStartupTipsNotification; program and keybind dialogs plus save register three more;
   * opening the Action monitor registers openActionMonitorDialog. The table lists five rows newest-first,
   * and row click may copy saveKeybindSettings JSON when clipboard read is available in the renderer.
   * Requires a current dist/electron/UnPackaged bundle (yarn quasar:build:electron:summarized) when renderer
   * action-manager code affecting history order or the action monitor table columns changed since the last build.
   */
  test('Action history lists five scripted events newest-first and optional save-row clipboard JSON', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Action monitor E2E expects MainLayout home; splash must have finished.'
    ).toBeVisible({
      timeout: 20_000
    })

    await test.step('Open program settings then close without saving', async () => {
      await triggerGlobalShortcut(appWindow, defaultChord.openProgramSettings)
      const programTitle = appWindow.locator(`[data-test-locator="${selectorList.dialogProgramSettingsTitle}"]`)
      await expect(programTitle).toBeVisible()
      await expect(programTitle).toHaveText(programSettingsMessages.title)
      await closeProgramSettingsDialog(appWindow)
    })

    await test.step('Open keybind settings, set Toggle developer tools to Ctrl+Shift+F12, save', async () => {
      await triggerGlobalShortcut(appWindow, defaultChord.openKeybindSettings)
      const keybindTitle = appWindow.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsTitle}"]`)
      await expect(keybindTitle).toBeVisible()
      await expect(keybindTitle).toHaveText(keybindDialogMessages.title)

      await fillKeybindSettingsFilter(appWindow, 'developer tools')
      const devRow = await rowForCommandLabel(appWindow, keybindDialogMessages.commands.toggleDeveloperTools)
      await expect(devRow).toHaveCount(1)
      await devRow.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsUserKeybindButton}"]`).click()

      const captureCard = appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureCard}"]`)
      await expect(captureCard).toBeVisible()
      const captureField = appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureField}"]`)
      await captureField.focus()
      await captureField.press(FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12)
      const setButton = appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureSet}"]`)
      await expect(setButton).toBeEnabled()
      await setButton.click()
      await expect(captureCard).toBeHidden()

      await saveKeybindSettingsDialog(appWindow)
    })

    await test.step('Open Action monitor via default global shortcut', async () => {
      await pressDefaultOpenActionMonitorChord(appWindow)
      const card = appWindow.locator('.dialogActionMonitor')
      await expect(card).toBeVisible({
        timeout: 15_000
      })
      await expect(appWindow.locator('#dialogActionMonitor-title')).toHaveText(actionMonitorMessages.title)
    })

    await test.step('Table shows five rows in newest-first chronological order', async () => {
      const table = appWindow.locator(`[data-test-locator="${selectorList.dialogActionMonitorTable}"]`)
      await expect(table).toBeVisible()
      const headerLabels = [
        actionMonitorMessages.columns.action,
        actionMonitorMessages.columns.startTime,
        actionMonitorMessages.columns.finishTime,
        actionMonitorMessages.columns.payload,
        actionMonitorMessages.columns.type,
        actionMonitorMessages.columns.status
      ]
      const thead = table.locator('thead')
      for (const label of headerLabels) {
        await expect(thead).toContainText(label)
      }
      await expect(table.locator('thead th')).toHaveCount(6)

      const bodyRows = table.locator('tbody tr')
      await expect(bodyRows).toHaveCount(5)

      for (let index = 0; index < expectedActionIdsNewestFirst.length; index += 1) {
        const expectedId = expectedActionIdsNewestFirst[index]
        const actionCell = bodyRows.nth(index).locator(`[data-test-locator="${selectorList.monitorActionCell}"] span`).first()
        await expect(actionCell).toHaveText(expectedId)
      }

      const saveKeybindRow = bodyRows.filter({ hasText: 'saveKeybindSettings' })
      await expect(saveKeybindRow).toHaveCount(1)
      await expect(saveKeybindRow.locator(`[data-test-locator="${selectorList.dialogActionMonitorPayloadEmpty}"]`)).toHaveCount(0)
      await expect(saveKeybindRow.locator('[data-test-locator="dialogActionMonitor-cell-payload"] .text-positive')).toBeVisible()

      const openMonitorRow = bodyRows.filter({ hasText: 'openActionMonitorDialog' })
      await expect(openMonitorRow.locator(`[data-test-locator="${selectorList.dialogActionMonitorPayloadEmpty}"]`)).toBeVisible()
    })

    await test.step('Optional: row click copies saveKeybindSettings JSON when clipboard read succeeds', async () => {
      const saveRow = appWindow.locator(`[data-test-locator="${selectorList.dialogActionMonitorTable}"] tbody tr`).filter({
        hasText: 'saveKeybindSettings'
      })
      await expect(saveRow).toHaveCount(1)
      await saveRow.click()
      await appWindow.waitForTimeout(400)

      const raw = await tryReadClipboardText(appWindow)
      if (raw === null || raw === '') {
        return
      }

      const parsed = JSON.parse(raw) as {
        id?: string
        payload?: { overrides?: { toggleDeveloperTools?: { code: string, mods: string[] } } }
      }
      expect(parsed.id).toBe('saveKeybindSettings')
      expect(parsed.payload?.overrides?.toggleDeveloperTools).toEqual({
        code: 'F12',
        mods: [
          'ctrl',
          'shift'
        ]
      })
    })

    await test.step('Close Action monitor', async () => {
      const root = appWindow.locator('.dialogActionMonitor')
      await root.locator(`[data-test-locator="${selectorList.monitorClose}"]`).click()
      await expect(root).toBeHidden({
        timeout: 15_000
      })
    })
  })
})
