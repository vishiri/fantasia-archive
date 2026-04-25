import fs from 'node:fs'
import { _electron as electron } from 'playwright'
import type { ElectronApplication, Locator, Page } from 'playwright'
import { test, expect } from '@playwright/test'
import type { TestInfo } from '@playwright/test'

import { FA_ELECTRON_MAIN_JS_PATH, FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers/faPlaywrightElectronLaunchConstants'
import {
  FA_PLAYWRIGHT_PRESS_CONTROL_SHIFT_F12,
  getFaPlaywrightDefaultActionMonitorOpenPressString,
  getFaPlaywrightMonacoSelectAllPressString
} from 'app/helpers/playwrightHelpers/faPlaywrightKeyboardChords'
import {
  e2eSetNextProgramConfigExportPath,
  e2eSetNextProgramConfigImportPath,
  getPlaywrightE2eUserDataFilePath,
  removePlaywrightE2eBlankFaconfigFilesIfPresent,
  tryUnlinkE2eProgramConfigFixtureFiles
} from 'app/helpers/playwrightHelpers/playwrightE2eProgramConfigPaths'
import {
  closeFaElectronAppWithRecordedVideoAttachments,
  getFaPlaywrightElectronRecordVideoPartial,
  installFaPlaywrightCursorMarkerIfVideoEnabled
} from 'app/helpers/playwrightHelpers/playwrightElectronRecordVideo'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers/playwrightDismissStartupTipsNotify'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import L_toolsDe from 'app/i18n/de/components/globals/AppControlMenus/L_tools'
import L_toolsEn from 'app/i18n/en-US/components/globals/AppControlMenus/L_tools'
import importExportMessages from 'app/i18n/en-US/dialogs/L_importExportProgramConfig'
import keybindDialogMessages from 'app/i18n/en-US/dialogs/L_dialogKeybindSettings'
import keybindDialogMessagesDe from 'app/i18n/de/dialogs/L_dialogKeybindSettings'
import programStylingMessages from 'app/i18n/en-US/floatingWindows/L_programStyling'
import programStylingMessagesDe from 'app/i18n/de/floatingWindows/L_programStyling'
import actionMonitorMessages from 'app/i18n/en-US/dialogs/L_DialogActionMonitor'

const extraEnvSettings = { TEST_ENV: 'e2e' as const }
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER
const menuAnimationTimer = 600
const keybindSettingsSearchDebounceWaitMs = 400
const monacoMountSettleMs = 2500
const programStylingWindowReadyMs = 30_000

const selectorList = {
  actionMonitorTable: 'dialogActionMonitor-table',
  checkExportKeybinds: 'dialogImportExportProgramConfig-check-export-keybinds',
  checkExportSettings: 'dialogImportExportProgramConfig-check-export-settings',
  checkExportStyling: 'dialogImportExportProgramConfig-check-export-styling',
  checkImportKeybinds: 'dialogImportExportProgramConfig-check-import-keybinds',
  checkImportSettings: 'dialogImportExportProgramConfig-check-import-settings',
  checkImportStyling: 'dialogImportExportProgramConfig-check-import-styling',
  dialogKeybindSettingsSave: 'dialogKeybindSettings-save',
  dialogKeybindSettingsTitle: 'dialogKeybindSettings-title',
  dialogKeybindSettingsUserKeybindButton: 'dialogKeybindSettings-userKeybind-button',
  dialogProgramSettingsSave: 'dialogProgramSettings-button-save',
  dialogProgramSettingsTitle: 'dialogProgramSettings-title',
  editorHost: 'windowProgramStyling-editorHost',
  importExportButtonCreate: 'dialogImportExportProgramConfig-button-createExport',
  importExportButtonExport: 'dialogImportExportProgramConfig-button-export',
  importExportButtonImport: 'dialogImportExportProgramConfig-button-import',
  importExportButtonImportSelected: 'dialogImportExportProgramConfig-button-importSelected',
  keybindCaptureCard: 'dialogKeybindSettings-capture-card',
  keybindCaptureField: 'dialogKeybindSettings-capture-qfield',
  keybindCaptureSet: 'dialogKeybindSettings-capture-set',
  languageMenuPanel: '.globalLanguageSelector__menu',
  languageOptionDe: 'globalLanguageSelector-option-de',
  languageSelectorRoot: 'globalLanguageSelector-root',
  languageSelectorTrigger: 'globalLanguageSelector-trigger',
  monitorActionCell: 'dialogActionMonitor-cell-action',
  programStylingFrame: 'windowProgramStyling-frame',
  programStylingSave: 'windowProgramStyling-button-save',
  programStylingTitle: 'windowProgramStyling-title',
  quasarToggle: '.q-toggle'
} as const

const defaultChord = {
  openKeybindSettings: 'ControlOrMeta+Alt+Shift+k',
  openProgramSettings: 'ControlOrMeta+Alt+Shift+l'
} as const

const bodyBgBlackRgb = 'rgb(0, 0, 0)'

const openToolsMenu = async (page: Page, toolsTitle: string) => {
  const t = page.getByText(toolsTitle, { exact: true })
  await expect(t).toBeVisible({ timeout: 20_000 })
  await t.click()
  await page.waitForTimeout(menuAnimationTimer)
}

const openImportExportFromTools = async (page: Page, toolsTitle: string, itemLabel: string) => {
  await openToolsMenu(page, toolsTitle)
  await page.getByText(itemLabel, { exact: true }).click()
  await page.waitForTimeout(menuAnimationTimer)
  const card = page.locator('.dialogComponent__wrapper.importExportProgramConfig')
  await expect(card).toBeVisible({ timeout: 15_000 })
}

const goToExportPanel = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonExport}"]`).click()
  await expect(page.getByText(importExportMessages.exportHint, { exact: true })).toBeVisible()
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

const setExportOnly = async (page: Page, keep: 'settings' | 'keybinds' | 'styling') => {
  const s = page.locator(`[data-test-locator="${selectorList.checkExportSettings}"]`).first()
  const k = page.locator(`[data-test-locator="${selectorList.checkExportKeybinds}"]`).first()
  const t = page.locator(`[data-test-locator="${selectorList.checkExportStyling}"]`).first()
  const wantS = keep === 'settings'
  const wantK = keep === 'keybinds'
  const wantT = keep === 'styling'
  await setQCheckboxTo(s, wantS)
  await setQCheckboxTo(k, wantK)
  await setQCheckboxTo(t, wantT)
  const on = async (l: Locator) => (await l.getAttribute('aria-checked')) === 'true'
  expect(await on(s)).toBe(wantS)
  expect(await on(k)).toBe(wantK)
  expect(await on(t)).toBe(wantT)
}

const clickCreateExport = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonCreate}"]`).click()
  const card = page.locator('.dialogComponent__wrapper.importExportProgramConfig')
  await expect(card).toBeHidden({ timeout: 30_000 })
}

const startPrepareImport = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonImport}"]`).click()
  await expect(
    page.locator(`[data-test-locator="${selectorList.importExportButtonImportSelected}"]`)
  ).toBeVisible({ timeout: 20_000 })
}

const expectImportCheckboxesForPart = async (page: Page, part: 'settings' | 'keybinds' | 'styling') => {
  const s = page.locator(`[data-test-locator="${selectorList.checkImportSettings}"]`).first()
  const k = page.locator(`[data-test-locator="${selectorList.checkImportKeybinds}"]`).first()
  const t = page.locator(`[data-test-locator="${selectorList.checkImportStyling}"]`).first()
  if (part === 'settings') {
    await expect(s).toBeEnabled()
    await expect(k).toBeDisabled()
    await expect(t).toBeDisabled()
    await expect(s).toHaveAttribute('aria-checked', 'true')
    await expect(k).toHaveAttribute('aria-checked', 'false')
    await expect(t).toHaveAttribute('aria-checked', 'false')
  } else if (part === 'keybinds') {
    await expect(s).toBeDisabled()
    await expect(k).toBeEnabled()
    await expect(t).toBeDisabled()
    await expect(s).toHaveAttribute('aria-checked', 'false')
    await expect(k).toHaveAttribute('aria-checked', 'true')
    await expect(t).toHaveAttribute('aria-checked', 'false')
  } else {
    await expect(s).toBeDisabled()
    await expect(k).toBeDisabled()
    await expect(t).toBeEnabled()
    await expect(s).toHaveAttribute('aria-checked', 'false')
    await expect(k).toHaveAttribute('aria-checked', 'false')
    await expect(t).toHaveAttribute('aria-checked', 'true')
  }
}

const clickImportSelected = async (page: Page) => {
  await page.locator(`[data-test-locator="${selectorList.importExportButtonImportSelected}"]`).click()
  const card = page.locator('.dialogComponent__wrapper.importExportProgramConfig')
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

async function openProgramStylingFromTools (page: Page, tools: typeof L_toolsEn) {
  await dismissStartupTipsNotifyIfPresent(page)
  await openToolsMenu(page, tools.title)
  await page.getByText(tools.items.programStyling, { exact: true }).click()
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

async function waitForProgramStylingWindow (page: Page, expectedTitle: string = programStylingMessages.title): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.programStylingFrame}"]`)
  await expect(frame).toHaveCount(1, { timeout: programStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.programStylingTitle}"]`)
  await expect(title).toHaveText(expectedTitle)
  await page.waitForTimeout(monacoMountSettleMs)
  await waitForMonacoEditorMount(page)
}

async function replaceMonacoText (page: Page, nextText: string): Promise<void> {
  const editor = page.locator('.windowProgramStyling .monaco-editor')
  await editor.click()
  await page.keyboard.press(getFaPlaywrightMonacoSelectAllPressString())
  if (nextText.length > 0) {
    await page.keyboard.type(nextText)
  } else {
    await page.keyboard.press('Backspace')
  }
}

async function saveProgramStylingWindow (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.programStylingFrame}"]`)
  await frame.locator(`[data-test-locator="${selectorList.programStylingSave}"]`).click()
  await expect(frame).toHaveCount(0, { timeout: 15_000 })
}

async function fillProgramSettingsSearch (page: Page, query: string) {
  const searchInput = page.locator('.dialogProgramSettings__settingsSearchWrapper input').first()
  await searchInput.click()
  await searchInput.fill(query)
  await page.waitForTimeout(400)
}

async function setShowDocumentId (page: Page, on: boolean) {
  await fillProgramSettingsSearch(page, 'Show document IDs')
  const block = page.locator(
    '[data-test-locator="dialogProgramSettings-search-setting-showDocumentID"]'
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

async function saveProgramSettingsDialog (page: Page) {
  const title = page.locator(`[data-test-locator="${selectorList.dialogProgramSettingsTitle}"]`)
  await page.locator(`[data-test-locator="${selectorList.dialogProgramSettingsSave}"]`).click()
  await expect(title).toBeHidden({ timeout: 15_000 })
}

async function readBodyBackgroundColor (page: Page) {
  return await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor)
}

async function readMonacoTextLen (page: Page) {
  return await page.evaluate(() => {
    const lines = document.querySelector(
      '.windowProgramStyling .monaco-editor .view-lines'
    )
    return (lines?.textContent ?? '').trim().length
  })
}

function pressDefaultOpenActionMonitorChord (page: Page) {
  return prepareRendererForGlobalShortcuts(page).then(() => {
    return page.keyboard.press(getFaPlaywrightDefaultActionMonitorOpenPressString())
  })
}

test.describe.serial('Import / export program configuration E2E', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    removePlaywrightE2eBlankFaconfigFilesIfPresent()
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
    await expect(appWindow.locator('.appHeader')).toBeVisible({ timeout: 20_000 })
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await closeFaElectronAppWithRecordedVideoAttachments(
      electronApp,
      suiteTestInfo,
      afterAllTestInfo
    )
  })

  test('exports blank faconfigs, mutates the app, imports selectively, and validates action history', async () => {
    test.setTimeout(300_000)

    const blankSettings = 'blank_settings.faconfig'
    const blankKeybinds = 'blank_keybinds.faconfig'
    const blankCss = 'blank_css.faconfig'

    await test.step('Export only program settings', async () => {
      await openImportExportFromTools(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportProgramConfig
      )
      await goToExportPanel(appWindow)
      await setExportOnly(appWindow, 'settings')
      await e2eSetNextProgramConfigExportPath(electronApp, blankSettings)
      await clickCreateExport(appWindow)
      expect(fs.existsSync(getPlaywrightE2eUserDataFilePath(blankSettings))).toBe(true)
    })

    await test.step('Export only keybinds', async () => {
      await openImportExportFromTools(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportProgramConfig
      )
      await goToExportPanel(appWindow)
      await setExportOnly(appWindow, 'keybinds')
      await e2eSetNextProgramConfigExportPath(electronApp, blankKeybinds)
      await clickCreateExport(appWindow)
      expect(fs.existsSync(getPlaywrightE2eUserDataFilePath(blankKeybinds))).toBe(true)
    })

    await test.step('Export only custom CSS', async () => {
      await openImportExportFromTools(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportProgramConfig
      )
      await goToExportPanel(appWindow)
      await setExportOnly(appWindow, 'styling')
      await e2eSetNextProgramConfigExportPath(electronApp, blankCss)
      await clickCreateExport(appWindow)
      expect(fs.existsSync(getPlaywrightE2eUserDataFilePath(blankCss))).toBe(true)
    })

    await test.step('Switch interface to German, devtools keybind, custom CSS, and Show document IDs', async () => {
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

      await openProgramStylingFromTools(appWindow, L_toolsDe)
      await waitForProgramStylingWindow(appWindow, programStylingMessagesDe.title)
      await replaceMonacoText(appWindow, 'body {background-color: #000000 !important;}')
      await saveProgramStylingWindow(appWindow)

      await triggerGlobalShortcut(appWindow, defaultChord.openProgramSettings)
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.dialogProgramSettingsTitle}"]`)
      ).toBeVisible()
      await setShowDocumentId(appWindow, true)
      await saveProgramSettingsDialog(appWindow)
    })

    await test.step('Assert German UI, show document id on, devtools keybind, and body background', async () => {
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.languageSelectorRoot}"]`)
      ).toHaveAttribute('data-test-i18n-locale', 'de')

      await triggerGlobalShortcut(appWindow, defaultChord.openProgramSettings)
      await setShowDocumentId(appWindow, true)
      const block = appWindow.locator(
        '[data-test-locator="dialogProgramSettings-search-setting-showDocumentID"]'
      )
      const tgl = block.locator(selectorList.quasarToggle)
      await expect(tgl).toHaveAttribute('aria-checked', 'true')
      await appWindow.locator(`[data-test-locator="${selectorList.dialogProgramSettingsSave}"]`).click()
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.dialogProgramSettingsTitle}"]`)
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

    await test.step('Import program-settings blank and expect English + show document IDs off', async () => {
      await e2eSetNextProgramConfigImportPath(electronApp, blankSettings)
      await openImportExportFromTools(
        appWindow,
        L_toolsDe.title,
        L_toolsDe.items.importExportProgramConfig
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
      await triggerGlobalShortcut(appWindow, defaultChord.openProgramSettings)
      await fillProgramSettingsSearch(appWindow, 'Show document IDs')
      const tgl = appWindow
        .locator('[data-test-locator="dialogProgramSettings-search-setting-showDocumentID"]')
        .locator(selectorList.quasarToggle)
      await expect(tgl).toHaveAttribute('aria-checked', 'false')
      await appWindow.locator(`[data-test-locator="${selectorList.dialogProgramSettingsSave}"]`).click()
      await expect(
        appWindow.locator(`[data-test-locator="${selectorList.dialogProgramSettingsTitle}"]`)
      ).toBeHidden({ timeout: 15_000 })
    })

    await test.step('Import keybinds blank: Ctrl+Shift+F12 no longer toggles devtools; keybind dialog shows default chord', async () => {
      await e2eSetNextProgramConfigImportPath(electronApp, blankKeybinds)
      await openImportExportFromTools(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportProgramConfig
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
      await e2eSetNextProgramConfigImportPath(electronApp, blankCss)
      await openImportExportFromTools(
        appWindow,
        L_toolsEn.title,
        L_toolsEn.items.importExportProgramConfig
      )
      await startPrepareImport(appWindow)
      await expectImportCheckboxesForPart(appWindow, 'styling')
      await clickImportSelected(appWindow)

      const bg = await readBodyBackgroundColor(appWindow)
      expect(bg).not.toBe(bodyBgBlackRgb)

      await openProgramStylingFromTools(appWindow, L_toolsEn)
      await waitForProgramStylingWindow(appWindow)
      const len = await readMonacoTextLen(appWindow)
      expect(len).toBe(0)
      await saveProgramStylingWindow(appWindow)
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
        'importProgramConfigApply'
      ]) {
        expect(allIds).toContain(must)
      }
      expect(allIds.filter((x) => x === 'exportProgramConfigPackage').length).toBeGreaterThanOrEqual(3)
      expect(allIds.filter((x) => x === 'exportProgramConfigSaveResult').length).toBeGreaterThanOrEqual(3)

      const importRows = appWindow
        .locator(`[data-test-locator="${selectorList.actionMonitorTable}"] tbody tr`)
        .filter({ hasText: 'importProgramConfigApply' })
      await expect(importRows).toHaveCount(3)

      const readApplyPayload = async (index: number) => {
        const row = importRows.nth(index)
        await row.click()
        await appWindow.waitForTimeout(300)
        const raw = await appWindow.evaluate(async () => {
          try {
            return await navigator.clipboard.readText()
          } catch {
            return null
          }
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
      for (const row of [a0, a1, a2]) {
        expect(row?.id).toBe('importProgramConfigApply')
      }
      const payloads = [a0, a1, a2].map((r) => r?.payload as {
        applyProgramSettings: boolean
        applyKeybinds: boolean
        applyProgramStyling: boolean
      } | undefined)
      const hasApplyCombo = (ps: { applyProgramSettings: boolean, applyKeybinds: boolean, applyProgramStyling: boolean }) =>
        payloads.some(
          (p) =>
            p !== undefined &&
            p.applyProgramSettings === ps.applyProgramSettings &&
            p.applyKeybinds === ps.applyKeybinds &&
            p.applyProgramStyling === ps.applyProgramStyling
        )
      expect(
        hasApplyCombo({
          applyKeybinds: false,
          applyProgramSettings: true,
          applyProgramStyling: false
        })
      ).toBe(true)
      expect(
        hasApplyCombo({
          applyKeybinds: true,
          applyProgramSettings: false,
          applyProgramStyling: false
        })
      ).toBe(true)
      expect(
        hasApplyCombo({
          applyKeybinds: false,
          applyProgramSettings: false,
          applyProgramStyling: true
        })
      ).toBe(true)

      const root = appWindow.locator('.dialogActionMonitor')
      await root.locator('[data-test-locator="dialogComponent-button-close"]').click()
      await expect(root).toBeHidden({ timeout: 15_000 })
    })

    await test.step('best-effort cleanup of fixture .faconfig files', () => {
      try {
        tryUnlinkE2eProgramConfigFixtureFiles()
      } catch {
        // not a test failure
      }
    })
  })
})
