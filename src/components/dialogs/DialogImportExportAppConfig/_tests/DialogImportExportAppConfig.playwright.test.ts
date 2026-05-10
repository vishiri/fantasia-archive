import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import importExportMessages from 'app/i18n/en-US/dialogs/L_importExportAppConfig'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogImportExportAppConfig',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Buffer before assertions so the component-testing shell finishes rendering.
 * - Tune this constant only when this spec needs a different wait.
 */
const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  buttonExport: 'dialogImportExportAppConfig-button-export',
  buttonImport: 'dialogImportExportAppConfig-button-import'
} as const

const importExportDirectInput: T_dialogName = 'ImportExportAppConfig'

test.describe.serial('Import / export app configuration dialog (smoke)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: importExportDirectInput
    })
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
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
   * directInput opens the dialog on the root step: title, notice copy, and Import / Export actions match en-US strings.
   */
  test('Import export dialog opens with title, notice text, and Import and Export buttons', async () => {
    const card = appWindow.locator('.dialogComponent__wrapper.importExportAppConfig')
    await expect(card).toBeVisible()

    const title = appWindow.locator('#dialogImportExportAppConfig-title')
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
    const card = appWindow.locator('.dialogComponent__wrapper.importExportAppConfig')
    await expect(card).toBeVisible()

    await appWindow.keyboard.press('Escape')

    await expect(card).toBeHidden({
      timeout: 15_000
    })
  })
})
