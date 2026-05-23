import fs from 'node:fs'
import type { ElectronApplication, Locator, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { navigateFaPlaywrightE2eToHomeRoute } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  e2eSetNextAppConfigExportPath,
  e2eSetNextAppConfigImportPath,
  getPlaywrightE2eUserDataFilePath,
  removePlaywrightE2eBlankFaconfigFilesIfPresent,
  tryUnlinkE2eAppConfigFixtureFiles
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eAppConfigPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import {
  FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12,
  getFaPlaywrightDefaultActionMonitorOpenPressString,
  getFaPlaywrightMonacoSelectAllPressString
} from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_toolsDe from 'app/i18n/de/components/globals/AppControlMenus/L_tools'
import L_toolsEn from 'app/i18n/en-US/components/globals/AppControlMenus/L_tools'
import keybindDialogMessages from 'app/i18n/en-US/dialogs/L_dialogKeybindSettings'
import keybindDialogMessagesDe from 'app/i18n/de/dialogs/L_dialogKeybindSettings'
import appStylingMessages from 'app/i18n/en-US/floatingWindows/L_appStyling'
import appStylingMessagesDe from 'app/i18n/de/floatingWindows/L_appStyling'
import appNoteboardMessagesEn from 'app/i18n/en-US/floatingWindows/L_appNoteboard'
import appNoteboardMessagesDe from 'app/i18n/de/floatingWindows/L_appNoteboard'
import L_appSettingsDe from 'app/i18n/de/dialogs/L_appSettings'
import L_appSettingsEn from 'app/i18n/en-US/dialogs/L_appSettings'
import actionMonitorMessages from 'app/i18n/en-US/dialogs/L_DialogActionMonitor'

const extraEnvSettings = { TEST_ENV: 'e2e' as const }
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER
const menuAnimationTimer = 600
const keybindSettingsSearchDebounceWaitMs = 400
const monacoMountSettleMs = 2500
const appStylingWindowReadyMs = 30_000

const selectorList = {
  actionMonitorTable: 'dialogActionMonitor-table',
  checkExportKeybinds: 'dialogImportExportAppConfig-check-export-keybinds',
  checkExportNoteboard: 'dialogImportExportAppConfig-check-export-noteboard',
  checkExportSettings: 'dialogImportExportAppConfig-check-export-settings',
  checkExportStyling: 'dialogImportExportAppConfig-check-export-styling',
  checkImportKeybinds: 'dialogImportExportAppConfig-check-import-keybinds',
  checkImportNoteboard: 'dialogImportExportAppConfig-check-import-noteboard',
  checkImportSettings: 'dialogImportExportAppConfig-check-import-settings',
  checkImportStyling: 'dialogImportExportAppConfig-check-import-styling',
  dialogKeybindSettingsSave: 'dialogKeybindSettings-save',
  dialogKeybindSettingsTitle: 'dialogKeybindSettings-title',
  dialogKeybindSettingsUserKeybindButton: 'dialogKeybindSettings-userKeybind-button',
  dialogAppSettingsSave: 'dialogAppSettings-button-save',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  editorHost: 'windowAppStyling-editorHost',
  importExportButtonCreate: 'dialogImportExportAppConfig-button-createExport',
  importExportButtonExport: 'dialogImportExportAppConfig-button-export',
  importExportButtonImport: 'dialogImportExportAppConfig-button-import',
  importExportButtonImportSelected: 'dialogImportExportAppConfig-button-importSelected',
  importExportExportHint: 'dialogImportExportAppConfig-export-hint',
  keybindCaptureCard: 'dialogKeybindSettings-capture-card',
  keybindCaptureField: 'dialogKeybindSettings-capture-qfield',
  keybindCaptureSet: 'dialogKeybindSettings-capture-set',
  languageMenuPanel: '.globalLanguageSelector__menu',
  languageOptionDe: 'globalLanguageSelector-option-de',
  languageSelectorRoot: 'globalLanguageSelector-root',
  languageSelectorTrigger: 'globalLanguageSelector-trigger',
  monitorActionCell: 'dialogActionMonitor-cell-action',
  windowAppNoteboardFrame: 'windowAppNoteboard-frame',
  appStylingFrame: 'windowAppStyling-frame',
  appStylingSave: 'windowAppStyling-button-save',
  appStylingTitle: 'windowAppStyling-title',
  quasarToggle: '.q-toggle'
} as const

const defaultChord = {
  openKeybindSettings: 'ControlOrMeta+Alt+Shift+k',
  openAppSettings: 'ControlOrMeta+Alt+Shift+l'
} as const

const bodyBgBlackRgb = 'rgb(0, 0, 0)'

const openTopBarMenuSection = async (page: Page, sectionTitle: string) => {
  const t = page.getByText(sectionTitle, { exact: true })
  await expect(t).toBeVisible({ timeout: 20_000 })
  await t.click()
  await page.waitForTimeout(menuAnimationTimer)
}

const openImportExportAppConfigDialogFromMenu = async (page: Page, menuTitle: string, itemLabel: string) => {
  await openTopBarMenuSection(page, menuTitle)
  await page.getByText(itemLabel, { exact: true }).click()
  await page.waitForTimeout(menuAnimationTimer)
  const card = page.locator('.dialogComponent__wrapper.importExportAppConfig')
  await expect(card).toBeVisible({ timeout: 15_000 })
}

const goToExportPanel = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonExport}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.importExportExportHint}"]`)).toBeVisible({
    timeout: 20_000
  })
}

const setQCheckboxTo = async (el: Locator, wantOn: boolean) => {
  for (let i = 0; i < 5; i += 1) {
    const isOn = (await el.getAttribute('aria-checked')) === 'true'
    if (isOn === wantOn) {
      return
    }
    await el.click()
  }
}

const setExportOnly = async (page: Page, keep: 'settings' | 'keybinds' | 'styling' | 'noteboard') => {
  const s = page.locator(`[data-test-locator="${selectorList.checkExportSettings}"]`).first()
  const k = page.locator(`[data-test-locator="${selectorList.checkExportKeybinds}"]`).first()
  const t = page.locator(`[data-test-locator="${selectorList.checkExportStyling}"]`).first()
  const n = page.locator(`[data-test-locator="${selectorList.checkExportNoteboard}"]`).first()
  const wantS = keep === 'settings'
  const wantK = keep === 'keybinds'
  const wantT = keep === 'styling'
  const wantN = keep === 'noteboard'
  await setQCheckboxTo(s, wantS)
  await setQCheckboxTo(k, wantK)
  await setQCheckboxTo(t, wantT)
  await setQCheckboxTo(n, wantN)
  const on = async (l: Locator) => (await l.getAttribute('aria-checked')) === 'true'
  expect(await on(s)).toBe(wantS)
  expect(await on(k)).toBe(wantK)
  expect(await on(t)).toBe(wantT)
  expect(await on(n)).toBe(wantN)
}

const clickCreateExport = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonCreate}"]`).click()
  const card = page.locator('.dialogComponent__wrapper.importExportAppConfig')
  await expect(card).toBeHidden({ timeout: 30_000 })
}

const startPrepareImport = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonImport}"]`).click()
  await expect(
    page.locator(`[data-test-locator="${selectorList.importExportButtonImportSelected}"]`)
  ).toBeVisible({ timeout: 20_000 })
}

const expectImportCheckboxesForPart = async (
  page: Page,
  part: 'settings' | 'keybinds' | 'styling' | 'noteboard'
) => {
  const s = page.locator(`[data-test-locator="${selectorList.checkImportSettings}"]`).first()
  const k = page.locator(`[data-test-locator="${selectorList.checkImportKeybinds}"]`).first()
  const t = page.locator(`[data-test-locator="${selectorList.checkImportStyling}"]`).first()
  const n = page.locator(`[data-test-locator="${selectorList.checkImportNoteboard}"]`).first()
  if (part === 'settings') {
    await expect(s).toBeEnabled()
    await expect(k).toBeDisabled()
    await expect(t).toBeDisabled()
    await expect(n).toBeDisabled()
    await expect(s).toHaveAttribute('aria-checked', 'true')
    await expect(k).toHaveAttribute('aria-checked', 'false')
    await expect(t).toHaveAttribute('aria-checked', 'false')
    await expect(n).toHaveAttribute('aria-checked', 'false')
  } else if (part === 'keybinds') {
    await expect(s).toBeDisabled()
    await expect(k).toBeEnabled()
    await expect(t).toBeDisabled()
    await expect(n).toBeDisabled()
    await expect(s).toHaveAttribute('aria-checked', 'false')
    await expect(k).toHaveAttribute('aria-checked', 'true')
    await expect(t).toHaveAttribute('aria-checked', 'false')
    await expect(n).toHaveAttribute('aria-checked', 'false')
  } else if (part === 'styling') {
    await expect(s).toBeDisabled()
    await expect(k).toBeDisabled()
    await expect(t).toBeEnabled()
    await expect(n).toBeDisabled()
    await expect(s).toHaveAttribute('aria-checked', 'false')
    await expect(k).toHaveAttribute('aria-checked', 'false')
    await expect(t).toHaveAttribute('aria-checked', 'true')
    await expect(n).toHaveAttribute('aria-checked', 'false')
  } else {
    await expect(s).toBeDisabled()
    await expect(k).toBeDisabled()
    await expect(t).toBeDisabled()
    await expect(n).toBeEnabled()
    await expect(s).toHaveAttribute('aria-checked', 'false')
    await expect(k).toHaveAttribute('aria-checked', 'false')
    await expect(t).toHaveAttribute('aria-checked', 'false')
    await expect(n).toHaveAttribute('aria-checked', 'true')
  }
}

const clickImportSelected = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonImportSelected}"]`).click()
  const card = page.locator('.dialogComponent__wrapper.importExportAppConfig')
  await expect(card).toBeHidden({ timeout: 30_000 })
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

/**
 * Keybind table filter: placeholder string is locale-specific, so the field is located structurally
 * (single filter 'q-input' in the keybind card above the table).
 */
async function fillKeybindSettingsFilter (page: Page, query: string): Promise<void> {
  const searchInput = page
    .locator('.dialogKeybindSettings__card')
    .locator('.q-input')
    .first()
    .locator('input')
  await searchInput.focus()
  await searchInput.fill(query)
  await page.waitForTimeout(keybindSettingsSearchDebounceWaitMs)
}

async function rowForCommandLabel (page: Page, commandLabel: string): Promise<Locator> {
  return page.locator('.dialogKeybindSettings__table').locator('tbody tr').filter({
    hasText: commandLabel
  })
}

async function saveKeybindSettingsDialog (page: Page): Promise<void> {
  const title = page.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsTitle}"]`)
  await page.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsSave}"]`).click()
  await expect(title).toBeHidden({ timeout: 15_000 })
}

async function openAppStylingFromTools (page: Page, tools: typeof L_toolsEn) {
  await dismissStartupTipsNotifyIfPresent(page)
  await openTopBarMenuSection(page, tools.title)
  await page.getByText(tools.items.appStyling, { exact: true }).click()
  await page.waitForTimeout(menuAnimationTimer)
}

async function waitForMonacoEditorMount (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.editorHost}"]`)
  await expect(host).toHaveCount(1)
  await expect(async () => {
    const h = await host.elementHandle()
    if (h === null) {
      throw new Error('editor host missing')
    }
    const childCount = await h.evaluate((node: Element) => node.childElementCount)
    expect(childCount).toBeGreaterThan(0)
  }).toPass({ timeout: 15_000 })
}

async function waitForAppStylingWindow (page: Page, expectedTitle: string = appStylingMessages.title): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.appStylingFrame}"]`)
  await expect(frame).toHaveCount(1, { timeout: appStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.appStylingTitle}"]`)
  await expect(title).toHaveText(expectedTitle)
  await page.waitForTimeout(monacoMountSettleMs)
  await waitForMonacoEditorMount(page)
}

async function replaceMonacoText (page: Page, nextText: string): Promise<void> {
  const editor = page.locator('.windowAppStyling .monaco-editor')
  await editor.click()
  await page.keyboard.press(getFaPlaywrightMonacoSelectAllPressString())
  if (nextText.length > 0) {
    await page.keyboard.type(nextText)
  } else {
    await page.keyboard.press('Backspace')
  }
}

async function saveAppStylingWindow (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.appStylingFrame}"]`)
  await frame.locator(`[data-test-locator="${selectorList.appStylingSave}"]`).click()
  await expect(frame).toHaveCount(0, { timeout: 15_000 })
}

async function openAppNoteboardFromTools (page: Page, tools: typeof L_toolsEn): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  await openTopBarMenuSection(page, tools.title)
  await page.getByText(tools.items.appNoteBoard, { exact: true }).click()
  await page.waitForTimeout(menuAnimationTimer)
}

async function waitForAppNoteboardWindow (
  page: Page,
  expectedTitle: string = appNoteboardMessagesEn.title
): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.windowAppNoteboardFrame}"]`)
  await expect(frame).toHaveCount(1, { timeout: appStylingWindowReadyMs })
  const title = frame.locator('[data-test-locator="windowAppNoteboard-title"]')
  await expect(title).toHaveText(expectedTitle)
}

function appNoteboardEditorTextbox (page: Page, editorAria: string): Locator {
  const frame = page.locator(`[data-test-locator="${selectorList.windowAppNoteboardFrame}"]`)
  return frame.getByRole('textbox', { name: editorAria })
}

async function readNoteboardEditorText (
  page: Page,
  editorAria: string = appNoteboardMessagesEn.editorAria
): Promise<string> {
  const el = appNoteboardEditorTextbox(page, editorAria)
  await expect(el).toBeVisible({ timeout: 15_000 })
  return await el.inputValue()
}

async function closeAppNoteboardWindow (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.windowAppNoteboardFrame}"]`)
  await frame.locator('[data-test-locator="windowAppNoteboard-button-close"]').click()
  await expect(frame).toHaveCount(0, { timeout: 15_000 })
}

async function fillAppSettingsSearch (page: Page, query: string) {
  const searchInput = page.locator('.dialogAppSettings__settingsSearchWrapper input').first()
  await searchInput.click()
  await searchInput.fill(query)
  await page.waitForTimeout(400)
}

async function resolveShowDocumentIdSearchQuery (page: Page): Promise<string> {
  const root = page.locator(`[data-test-locator="${selectorList.languageSelectorRoot}"]`)
  const locale = await root.getAttribute('data-test-i18n-locale')
  if (locale === 'de') {
    return L_appSettingsDe.appOptions.showDocumentID.title
  }
  return L_appSettingsEn.appOptions.showDocumentID.title
}

async function setShowDocumentId (page: Page, on: boolean) {
  await fillAppSettingsSearch(page, await resolveShowDocumentIdSearchQuery(page))
  const block = page.locator(
    '[data-test-locator="dialogAppSettings-search-setting-showDocumentID"]'
  )
  const tgl = block.locator(selectorList.quasarToggle)
  for (let i = 0; i < 5; i += 1) {
    const c = (await tgl.getAttribute('aria-checked')) === 'true'
    if (c === on) {
      return
    }
    await tgl.click()
  }
}

async function saveAppSettingsDialog (page: Page) {
  const title = page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  await page.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
  await expect(title).toBeHidden({ timeout: 15_000 })
}

async function readBodyBackgroundColor (page: Page) {
  return await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
}

async function readMonacoTextLen (page: Page) {
  return await page.evaluate(() => {
    const lines = document.querySelector(
      '.windowAppStyling .monaco-editor .view-lines'
    )
    return (lines?.textContent ?? '').trim().length
  })
}

function pressDefaultOpenActionMonitorChord (page: Page) {
  return prepareRendererForGlobalShortcuts(page).then(() => {
    return page.keyboard.press(getFaPlaywrightDefaultActionMonitorOpenPressString())
  })
}

test.describe.serial('Import / export app configuration E2E', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      beforeIsolationReset (): void {
        removePlaywrightE2eBlankFaconfigFilesIfPresent()
      },
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
    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('exports blank faconfigs, mutates the app, imports selectively, and validates action history', async () => {
    test.setTimeout(300_000)

    const blankSettings = 'blank_settings.faconfig'
    const blankKeybinds = 'blank_keybinds.faconfig'
    const blankCss = 'blank_css.faconfig'
    const blankNoteboard = 'blank_noteboard.faconfig'

    await test.step('Export only app settings', async () => {
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportAppConfig
      )
      await goToExportPanel(appWindow)
      await setExportOnly(appWindow, 'settings')
      await e2eSetNextAppConfigExportPath(electronApp, blankSettings)
      await clickCreateExport(appWindow)
      expect(fs.existsSync(getPlaywrightE2eUserDataFilePath(blankSettings))).toBe(true)
    })

    await test.step('Export only keybinds', async () => {
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportAppConfig
      )
      await goToExportPanel(appWindow)
      await setExportOnly(appWindow, 'keybinds')
      await e2eSetNextAppConfigExportPath(electronApp, blankKeybinds)
      await clickCreateExport(appWindow)
      expect(fs.existsSync(getPlaywrightE2eUserDataFilePath(blankKeybinds))).toBe(true)
    })

    await test.step('Export only custom CSS', async () => {
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportAppConfig
      )
      await goToExportPanel(appWindow)
      await setExportOnly(appWindow, 'styling')
      await e2eSetNextAppConfigExportPath(electronApp, blankCss)
      await clickCreateExport(appWindow)
      expect(fs.existsSync(getPlaywrightE2eUserDataFilePath(blankCss))).toBe(true)
    })

    await test.step('Export only app noteboard', async () => {
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportAppConfig
      )
      await goToExportPanel(appWindow)
      await setExportOnly(appWindow, 'noteboard')
      await e2eSetNextAppConfigExportPath(electronApp, blankNoteboard)
      await clickCreateExport(appWindow)
      expect(fs.existsSync(getPlaywrightE2eUserDataFilePath(blankNoteboard))).toBe(true)
    })

    await test.step('Switch interface to German, devtools keybind, custom CSS, app noteboard, and Show document IDs', async () => {
      const root = appWindow.locator(`[data-test-locator="${selectorList.languageSelectorRoot}"]`)
      await appWindow.locator(`[data-test-locator="${selectorList.languageSelectorTrigger}"]`).click()
      await expect(appWindow.locator(selectorList.languageMenuPanel)).toBeVisible()
      await appWindow.locator(`[data-test-locator="${selectorList.languageOptionDe}"]`).click()
      await expect(root).toHaveAttribute('data-test-i18n-locale', 'de', { timeout: 15_000 })
      await expect(
        appWindow.getByText(L_toolsDe.title, { exact: true })
      ).toBeVisible()

      await triggerGlobalShortcut(appWindow, defaultChord.openKeybindSettings)
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.dialogKeybindSettingsTitle}"]`)
      ).toBeVisible()
      await fillKeybindSettingsFilter(appWindow, 'Entwickler')
      const devRow = await rowForCommandLabel(
        appWindow,
        keybindDialogMessagesDe.commands.toggleDeveloperTools
      )
      await devRow
        .locator(`[data-test-locator="${selectorList.dialogKeybindSettingsUserKeybindButton}"]`)
        .click()
      const captureCard = appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureCard}"]`)
      await expect(captureCard).toBeVisible()
      const captureField = appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureField}"]`)
      await captureField.focus()
      await captureField.press(FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12)
      await appWindow.locator(`[data-test-locator="${selectorList.keybindCaptureSet}"]`).click()
      await expect(captureCard).toBeHidden()
      await saveKeybindSettingsDialog(appWindow)

      await openAppStylingFromTools(appWindow, L_toolsDe)
      await waitForAppStylingWindow(appWindow, appStylingMessagesDe.title)
      await replaceMonacoText(appWindow, 'body {background-color: #000000 !important;}')
      await saveAppStylingWindow(appWindow)

      await openAppNoteboardFromTools(appWindow, L_toolsDe)
      await waitForAppNoteboardWindow(appWindow, appNoteboardMessagesDe.title)
      const nbEditor = appNoteboardEditorTextbox(
        appWindow,
        appNoteboardMessagesDe.editorAria
      )
      await expect(nbEditor).toBeVisible({ timeout: 30_000 })
      await nbEditor.fill('e2e-noteboard-marker')
      await closeAppNoteboardWindow(appWindow)

      await triggerGlobalShortcut(appWindow, defaultChord.openAppSettings)
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
      ).toBeVisible()
      await setShowDocumentId(appWindow, true)
      await saveAppSettingsDialog(appWindow)
    })

    await test.step('Assert German UI, show document id on, devtools keybind, and body background', async () => {
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.languageSelectorRoot}"]`)
      ).toHaveAttribute('data-test-i18n-locale', 'de')

      await triggerGlobalShortcut(appWindow, defaultChord.openAppSettings)
      await setShowDocumentId(appWindow, true)
      const block = appWindow.locator(
        '[data-test-locator="dialogAppSettings-search-setting-showDocumentID"]'
      )
      const tgl = block.locator(selectorList.quasarToggle)
      await expect(tgl).toHaveAttribute('aria-checked', 'true')
      await appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
      ).toBeHidden({ timeout: 15_000 })

      await expect.poll(async () => {
        return await appWindow.evaluate(async () => {
          return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
        })
      }, { timeout: 15_000 }).toBe(false)
      await prepareRendererForGlobalShortcuts(appWindow)
      await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12)
      await expect.poll(async () => {
        return await appWindow.evaluate(async () => {
          return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
        })
      }, { timeout: 15_000 }).toBe(true)
      await prepareRendererForGlobalShortcuts(appWindow)
      await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12)
      await expect.poll(async () => {
        return await appWindow.evaluate(async () => {
          return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
        })
      }, { timeout: 15_000 }).toBe(false)

      const bg = await readBodyBackgroundColor(appWindow)
      expect(bg).toBe(bodyBgBlackRgb)
    })

    await test.step('Import app-settings blank and expect English + show document IDs off', async () => {
      await e2eSetNextAppConfigImportPath(electronApp, blankSettings)
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsDe.title,
        L_toolsDe.items.importExportAppConfig
      )
      await startPrepareImport(appWindow)
      await expectImportCheckboxesForPart(appWindow, 'settings')
      await clickImportSelected(appWindow)
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.languageSelectorRoot}"]`)
      ).toHaveAttribute('data-test-i18n-locale', 'en-US', { timeout: 20_000 })
      await expect(
        appWindow.getByText(L_toolsEn.title, { exact: true })
      ).toBeVisible()
      await triggerGlobalShortcut(appWindow, defaultChord.openAppSettings)
      await fillAppSettingsSearch(appWindow, L_appSettingsEn.appOptions.showDocumentID.title)
      const tgl = appWindow
        .locator('[data-test-locator="dialogAppSettings-search-setting-showDocumentID"]')
        .locator(selectorList.quasarToggle)
      await expect(tgl).toHaveAttribute('aria-checked', 'false')
      await appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
      ).toBeHidden({ timeout: 15_000 })
    })

    await test.step('Import keybinds blank: Default keybind for developer tools no longer toggles devtools; keybind dialog shows default chord', async () => {
      await e2eSetNextAppConfigImportPath(electronApp, blankKeybinds)
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportAppConfig
      )
      await startPrepareImport(appWindow)
      await expectImportCheckboxesForPart(appWindow, 'keybinds')
      await clickImportSelected(appWindow)

      await expect.poll(async () => {
        return await appWindow.evaluate(async () => {
          return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
        })
      }, { timeout: 15_000 }).toBe(false)
      await prepareRendererForGlobalShortcuts(appWindow)
      await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12)
      await appWindow.waitForTimeout(500)
      await expect.poll(async () => {
        return await appWindow.evaluate(async () => {
          return await window.faContentBridgeAPIs.faDevToolsControl.checkDevToolsStatus()
        })
      }, { timeout: 5000 }).toBe(false)

      await triggerGlobalShortcut(appWindow, defaultChord.openKeybindSettings)
      await fillKeybindSettingsFilter(appWindow, 'developer tools')
      const devRow = await rowForCommandLabel(
        appWindow,
        keybindDialogMessages.commands.toggleDeveloperTools
      )
      const keyBtn = devRow.locator(
        `[data-test-locator="${selectorList.dialogKeybindSettingsUserKeybindButton}"]`
      )
      const label = (await keyBtn.textContent()) ?? ''
      expect(label).not.toMatch(/Ctrl\+Shift\+F12|Ctrl \+ Shift \+ F12/i)
      await saveKeybindSettingsDialog(appWindow)
    })

    await test.step('Import custom CSS blank: body not black, Monaco empty after reopen', async () => {
      await e2eSetNextAppConfigImportPath(electronApp, blankCss)
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportAppConfig
      )
      await startPrepareImport(appWindow)
      await expectImportCheckboxesForPart(appWindow, 'styling')
      await clickImportSelected(appWindow)

      const bg = await readBodyBackgroundColor(appWindow)
      expect(bg).not.toBe(bodyBgBlackRgb)

      await openAppStylingFromTools(appWindow, L_toolsEn)
      await waitForAppStylingWindow(appWindow)
      const len = await readMonacoTextLen(appWindow)
      expect(len).toBe(0)
      await saveAppStylingWindow(appWindow)
    })

    await test.step('Import app noteboard blank: textarea empty after reopen', async () => {
      await e2eSetNextAppConfigImportPath(electronApp, blankNoteboard)
      await openImportExportAppConfigDialogFromMenu(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportAppConfig
      )
      await startPrepareImport(appWindow)
      await expectImportCheckboxesForPart(appWindow, 'noteboard')
      await clickImportSelected(appWindow)

      await openAppNoteboardFromTools(appWindow, L_toolsEn)
      await waitForAppNoteboardWindow(appWindow)
      const text = await readNoteboardEditorText(appWindow)
      expect(text.trim()).toBe('')
      await closeAppNoteboardWindow(appWindow)
    })

    await test.step('Action monitor lists expected rows; import apply rows copy JSON payloads', async () => {
      await pressDefaultOpenActionMonitorChord(appWindow)
      const card = appWindow.locator('.dialogActionMonitor')
      await expect(card).toBeVisible({ timeout: 15_000 })
      await expect(appWindow.locator('#dialogActionMonitor-title')).toHaveText(actionMonitorMessages.title)
      const table = appWindow.locator(`[data-test-locator="${selectorList.actionMonitorTable}"]`)
      const rows = table.locator('tbody tr')
      await expect(rows.first()).toBeVisible()
      const idCells = table.locator(`[data-test-locator="${selectorList.monitorActionCell}"] span`).first()
      await expect(idCells).toBeVisible()

      const allIds: string[] = []
      const n = await rows.count()
      for (let i = 0; i < n; i += 1) {
        const txt = await rows.nth(i).locator(`[data-test-locator="${selectorList.monitorActionCell}"] span`).first().innerText()
        allIds.push(txt.trim())
      }
      for (const must of [
        'showStartupTipsNotification',
        'languageSwitch',
        'importAppConfigApply'
      ]) {
        expect(allIds).toContain(must)
      }
      expect(allIds.filter((x) => x === 'exportAppConfigPackage').length).toBeGreaterThanOrEqual(4)
      expect(allIds.filter((x) => x === 'exportAppConfigSaveResult').length).toBeGreaterThanOrEqual(4)

      const importRows = appWindow
        .locator(`[data-test-locator="${selectorList.actionMonitorTable}"] tbody tr`)
        .filter({ hasText: 'importAppConfigApply' })
      await expect(importRows).toHaveCount(4)

      const readApplyPayload = async (index: number) => {
        const row = importRows.nth(index)
        await row.click()
        await appWindow.waitForTimeout(300)
        const raw = await appWindow.evaluate(async () => {
          return await navigator.clipboard.readText().then(
            (t) => t,
            (): null => null
          )
        })
        if (raw === null || raw === '') {
          return null
        }
        return JSON.parse(raw) as {
          id?: string
          payload?: Record<string, unknown>
        }
      }
      const a0 = await readApplyPayload(0)
      const a1 = await readApplyPayload(1)
      const a2 = await readApplyPayload(2)
      const a3 = await readApplyPayload(3)
      for (const row of [a0, a1, a2, a3]) {
        expect(row?.id).toBe('importAppConfigApply')
      }
      const payloads = [a0, a1, a2, a3].map((r) => r?.payload as {
        applyKeybinds: boolean
        applyAppNoteboard: boolean
        applyAppSettings: boolean
        applyAppStyling: boolean
      } | undefined)
      const hasApplyCombo = (ps: {
        applyKeybinds: boolean
        applyAppNoteboard: boolean
        applyAppSettings: boolean
        applyAppStyling: boolean
      }) =>
        payloads.some(
          (p) =>
            p !== undefined &&
            p.applyAppSettings === ps.applyAppSettings &&
            p.applyKeybinds === ps.applyKeybinds &&
            p.applyAppStyling === ps.applyAppStyling &&
            p.applyAppNoteboard === ps.applyAppNoteboard
        )
      expect(
        hasApplyCombo({
          applyKeybinds: false,
          applyAppNoteboard: false,
          applyAppSettings: true,
          applyAppStyling: false
        })
      ).toBe(true)
      expect(
        hasApplyCombo({
          applyKeybinds: true,
          applyAppNoteboard: false,
          applyAppSettings: false,
          applyAppStyling: false
        })
      ).toBe(true)
      expect(
        hasApplyCombo({
          applyKeybinds: false,
          applyAppNoteboard: false,
          applyAppSettings: false,
          applyAppStyling: true
        })
      ).toBe(true)
      expect(
        hasApplyCombo({
          applyKeybinds: false,
          applyAppNoteboard: true,
          applyAppSettings: false,
          applyAppStyling: false
        })
      ).toBe(true)

      const root = appWindow.locator('.dialogActionMonitor')
      await root.locator('[data-test-locator="dialogComponent-button-close"]').click()
      await expect(root).toBeHidden({ timeout: 15_000 })
    })

    await test.step('best-effort cleanup of fixture .faconfig files', () => {
      tryUnlinkE2eAppConfigFixtureFiles()
    })
  })
})
