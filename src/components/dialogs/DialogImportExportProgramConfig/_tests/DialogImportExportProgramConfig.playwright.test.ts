import { _electron as electron } from 'playwright'
import type { ElectronApplication, Page } from 'playwright'
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
import importExportMessages from 'app/i18n/en-US/dialogs/L_importExportProgramConfig'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogImportExportProgramConfig',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath: string = FA_ELECTRON_MAIN_JS_PATH

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  buttonExport: 'dialogImportExportProgramConfig-button-export',
  buttonImport: 'dialogImportExportProgramConfig-button-import'
} as const

const importExportDirectInput: T_dialogName = 'ImportExportProgramConfig'

test.describe.serial('Import / export program configuration dialog (smoke)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: importExportDirectInput
    })
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
   * directInput opens the dialog on the root step: title, notice copy, and Import / Export actions match en-US strings.
   */
  test('Import export dialog opens with title, notice text, and Import and Export buttons', async () => {
    const card = appWindow.locator('.dialogComponent__wrapper.importExportProgramConfig')
    await expect(card).toBeVisible()

    const title = appWindow.locator('#dialogImportExportProgramConfig-title')
    await expect(title).toHaveCount(1)
    await expect(title).toHaveText(importExportMessages.title)

    await expect(
      card.getByRole('heading', { name: importExportMessages.notice.heading })
    ).toBeVisible()

    const list = card.locator('ul')
    await expect(list.locator('li').nth(0)).toHaveText(importExportMessages.notice.list.exportFirst)
    await expect(list.locator('li').nth(1)).toHaveText(importExportMessages.notice.list.importOverwrites)
    await expect(list.locator('li').nth(2)).toHaveText(importExportMessages.notice.list.selectiveImport)

    const importBtn = appWindow.locator(`[data-test-locator="${selectorList.buttonImport}"]`)
    const exportBtn = appWindow.locator(`[data-test-locator="${selectorList.buttonExport}"]`)
    await expect(importBtn).toHaveCount(1)
    await expect(exportBtn).toHaveCount(1)
    await expect(importBtn).toHaveText(importExportMessages.importButton)
    await expect(exportBtn).toHaveText(importExportMessages.exportButton)
  })

  /**
   * Non-persistent QDialog dismisses on Escape so the card is hidden.
   */
  test('Import export dialog closes on Escape', async () => {
    const card = appWindow.locator('.dialogComponent__wrapper.importExportProgramConfig')
    await expect(card).toBeVisible()

    await appWindow.keyboard.press('Escape')

    await expect(card).toBeHidden({
      timeout: 15_000
    })
  })
})
