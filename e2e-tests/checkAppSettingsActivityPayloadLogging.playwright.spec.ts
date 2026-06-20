import type { ElectronApplication, Locator, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { navigateFaPlaywrightE2eToHomeRoute } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { getFaPlaywrightDefaultActionMonitorOpenPressString } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import { FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH } from 'app/src/scripts/actionManager/functions/faActionPayloadPreviewLimits'
import actionMonitorMessages from 'app/i18n/en-US/dialogs/L_DialogActionMonitor'
import appSettingsMessages from 'app/i18n/en-US/dialogs/L_appSettings'

/**
 * Extra env settings to trigger E2E via Playwright (isolated userData).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  dialogActionMonitorTable: 'dialogActionMonitor-table',
  dialogAppSettingsSave: 'dialogAppSettings-button-save',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  logFullActivityPayloadSearchSetting: 'dialogAppSettings-search-setting-logFullActivityPayload',
  monitorClose: 'dialogComponent-button-close',
  quasarToggle: '.q-toggle',
  showDocumentIDSearchSetting: 'dialogAppSettings-search-setting-showDocumentID'
} as const

/**
 * Playwright ControlOrMeta matches the app primary modifier (Command on macOS, Control on Windows and Linux).
 */
const defaultChord = {
  openAppSettings: 'ControlOrMeta+Alt+Shift+l'
} as const

const logFullActivityPayloadTitle =
  appSettingsMessages.appOptions.logFullActivityPayload.title

const showDocumentIDTitle =
  appSettingsMessages.appOptions.showDocumentID.title

const developerSettingsDocumentBodySubtitle =
  appSettingsMessages.appOptionsCategories.developerSettings.documentBody.subtitle

/**
 * q-input debounce is 300ms; allow slack for Electron paint after the model updates.
 */
const appSettingsSearchDebounceWaitMs = 400

type T_actionMonitorClipboardRow = {
  id?: string
  payload?: {
    settings?: {
      logFullActivityPayload?: boolean
      showDocumentID?: boolean
    }
  }
  payloadPreview?: string
}

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

async function fillAppSettingsSearch (page: Page, query: string): Promise<void> {
  const searchInput = page.locator('.dialogAppSettings__settingsSearchWrapper input').first()
  await searchInput.click()
  await searchInput.fill(query)
  await page.waitForTimeout(appSettingsSearchDebounceWaitMs)
}

async function openAppSettingsDialog (page: Page): Promise<void> {
  await triggerGlobalShortcut(page, defaultChord.openAppSettings)
  const title = page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  await expect(title).toBeVisible({ timeout: 15_000 })
  await expect(title).toHaveText(appSettingsMessages.title)
}

async function saveAppSettingsDialog (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
  const title = page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

async function setQuasarToggleInRow (toggle: Locator, wantOn: boolean): Promise<void> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const isOn = (await toggle.getAttribute('aria-checked')) === 'true'
    if (isOn === wantOn) {
      return
    }
    await toggle.click()
  }
  throw new Error(`Quasar toggle did not reach aria-checked=${String(wantOn)}`)
}

async function setAppSettingsToggleBySearch (
  page: Page,
  settingTitle: string,
  settingRowLocator: string,
  wantOn: boolean
): Promise<void> {
  await fillAppSettingsSearch(page, settingTitle)
  const settingRow = page.locator(`[data-test-locator="${settingRowLocator}"]`)
  await expect(settingRow).toBeVisible()
  await expect(
    settingRow.locator('[data-test-locator="dialogAppSettings-search-settingLabel"]')
  ).toHaveText(settingTitle)
  const toggle = settingRow.locator(selectorList.quasarToggle).first()
  await setQuasarToggleInRow(toggle, wantOn)
}

async function pressDefaultOpenActionMonitorChord (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultActionMonitorOpenPressString())
}

async function openActionMonitorDialog (page: Page): Promise<void> {
  await pressDefaultOpenActionMonitorChord(page)
  const card = page.locator('.dialogActionMonitor')
  await expect(card).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('#dialogActionMonitor-title')).toHaveText(actionMonitorMessages.title)
}

async function closeActionMonitorDialog (page: Page): Promise<void> {
  const root = page.locator('.dialogActionMonitor')
  await root.locator(`[data-test-locator="${selectorList.monitorClose}"]`).click()
  await expect(root).toBeHidden({
    timeout: 15_000
  })
}

async function tryReadClipboardText (page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    return await navigator.clipboard.readText().then(
      (text) => text,
      (): null => null
    )
  })
}

async function copyNewestActionMonitorRowClipboard (
  page: Page,
  actionId: string
): Promise<T_actionMonitorClipboardRow | null> {
  const table = page.locator(`[data-test-locator="${selectorList.dialogActionMonitorTable}"]`)
  const row = table.locator('tbody tr').filter({ hasText: actionId }).first()
  await expect(row).toBeVisible({ timeout: 15_000 })
  await row.click()
  await page.waitForTimeout(400)
  const raw = await tryReadClipboardText(page)
  if (raw === null || raw === '') {
    return null
  }
  return JSON.parse(raw) as T_actionMonitorClipboardRow
}

let electronApp: ElectronApplication
let appWindow: Page
let suiteTestInfo: TestInfo

test.describe.serial('App settings activity payload logging E2E', () => {
  test.describe.configure({ timeout: 180_000 })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: true,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
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
   * With Log full activity payload off, saveAppSettings rows store a truncated payloadPreview.
   * With the toggle on, later saveAppSettings rows store the full JSON payload for clipboard copy.
   */
  test('saveAppSettings activity payload is truncated by default and full when logging is enabled', async () => {
    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await dismissStartupTipsNotifyIfPresent(appWindow)

    await test.step('Save app settings with full payload logging disabled', async () => {
      await openAppSettingsDialog(appWindow)
      await setAppSettingsToggleBySearch(
        appWindow,
        logFullActivityPayloadTitle,
        selectorList.logFullActivityPayloadSearchSetting,
        false
      )
      await setAppSettingsToggleBySearch(
        appWindow,
        showDocumentIDTitle,
        selectorList.showDocumentIDSearchSetting,
        true
      )
      await saveAppSettingsDialog(appWindow)
    })

    await test.step('Action monitor copies a truncated saveAppSettings payloadPreview', async () => {
      await openActionMonitorDialog(appWindow)
      const copied = await copyNewestActionMonitorRowClipboard(appWindow, 'saveAppSettings')
      expect(copied, 'clipboard read should return saveAppSettings row JSON').not.toBeNull()
      expect(copied?.id).toBe('saveAppSettings')
      expect(copied?.payloadPreview).toBeDefined()
      expect(copied?.payloadPreview?.endsWith('...')).toBe(true)
      expect(copied?.payloadPreview?.length).toBe(FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH + 3)
      expect(copied?.payload).toBeUndefined()
      await closeActionMonitorDialog(appWindow)
    })

    await test.step('Enable Log full activity payload and save again', async () => {
      await openAppSettingsDialog(appWindow)
      await setAppSettingsToggleBySearch(
        appWindow,
        logFullActivityPayloadTitle,
        selectorList.logFullActivityPayloadSearchSetting,
        true
      )
      await saveAppSettingsDialog(appWindow)

      await openAppSettingsDialog(appWindow)
      await setAppSettingsToggleBySearch(
        appWindow,
        showDocumentIDTitle,
        selectorList.showDocumentIDSearchSetting,
        false
      )
      await saveAppSettingsDialog(appWindow)
    })

    await test.step('Action monitor copies the full saveAppSettings payload', async () => {
      await openActionMonitorDialog(appWindow)
      const copied = await copyNewestActionMonitorRowClipboard(appWindow, 'saveAppSettings')
      expect(copied, 'clipboard read should return saveAppSettings row JSON').not.toBeNull()
      expect(copied?.id).toBe('saveAppSettings')
      expect(copied?.payloadPreview).toBeDefined()
      expect(copied?.payloadPreview?.endsWith('...')).toBe(false)
      expect((copied?.payloadPreview?.length ?? 0)).toBeGreaterThan(FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH)
      expect(copied?.payload?.settings?.logFullActivityPayload).toBe(true)
      expect(copied?.payload?.settings?.showDocumentID).toBe(false)
      expect(JSON.parse(copied?.payloadPreview ?? '')).toEqual(copied?.payload)
      await closeActionMonitorDialog(appWindow)
    })
  })

  /**
   * Developer settings search exposes the renamed Developer Settings subgroup label.
   */
  test('Developer settings subgroup shows Developer Settings subtitle in search results', async () => {
    await openAppSettingsDialog(appWindow)
    await fillAppSettingsSearch(appWindow, logFullActivityPayloadTitle)
    const subcategory = appWindow.locator(
      '[data-test-locator="dialogAppSettings-search-subcategory-developerSettings-documentBody"]'
    )
    await expect(subcategory).toBeVisible()
    await expect(
      subcategory.locator('[data-test-locator="dialogAppSettings-search-subcategoryTitle"]')
    ).toHaveText(developerSettingsDocumentBodySubtitle)
    await appWindow.locator('[data-test-locator="dialogAppSettings-button-close"]').click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
    ).toBeHidden({ timeout: 15_000 })
  })
})
