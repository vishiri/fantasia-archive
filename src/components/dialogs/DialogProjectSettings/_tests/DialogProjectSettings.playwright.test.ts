import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  COMPONENT_NAME: 'DialogProjectSettings',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components'
}

const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER

const componentFixtureProjectName = 'Component test project name'

const selectorList = {
  closeButton: 'dialogProjectSettings-button-close',
  panelWorldsTitle: 'dialogProjectSettings-panel-worlds-title',
  projectNameInput: 'dialogProjectSettings-input-projectName',
  saveButton: 'dialogProjectSettings-button-save',
  tabGeneralSettings: 'dialogProjectSettings-tab-generalSettings',
  tabWorldsSettings: 'dialogProjectSettings-tab-worldsSettings',
  title: 'dialogProjectSettings-title'
} as const

const projectSettingsDirectInput: T_dialogName = 'ProjectSettings'

test.describe.serial('Project settings dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({
      directInput: projectSettingsDirectInput,
      directSettingsSnapshot: {
        projectName: componentFixtureProjectName,
        schemaVersion: 1
      }
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
   * Opens DialogProjectSettings via component harness directInput and directSettingsSnapshot.
   */
  test('Renders Project Settings title, General settings tab, and prefilled project name', async () => {
    const dialogShell = appWindow.locator('.q-dialog.dialogComponent.ProjectSettings')
    await expect(dialogShell).toHaveCount(1)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveText(L_projectSettings.title)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`)
    ).toHaveText(L_projectSettings.categories.generalSettings.title)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`)
    ).toHaveText(L_projectSettings.categories.worldsSettings.title)

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    await expect(nameInput).toHaveValue(componentFixtureProjectName)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`)
    ).toContainText(L_projectSettings.closeButton)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`)
    ).toContainText(L_projectSettings.saveButton)
  })

  /**
   * Worlds settings tab shows the Project's Worlds panel title when selected.
   */
  test('Worlds settings tab shows Project\'s Worlds panel title when selected', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabWorldsSettings}"]`).click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.panelWorldsTitle}"]`)
    ).toHaveText(L_projectSettings.panels.worlds.title)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    ).toHaveCount(0)
  })

  /**
   * Close without saving dismisses the dialog without requiring a persisted project database.
   */
  test('Close without saving dismisses the dialog', async () => {
    await appWindow.locator(`[data-test-locator="${selectorList.tabGeneralSettings}"]`).click()

    const nameInput = appWindow.locator(`[data-test-locator="${selectorList.projectNameInput}"]`)
    await nameInput.fill('Edited but not saved')

    await appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()

    const dialogShell = appWindow.locator('.q-dialog.dialogComponent.ProjectSettings')
    await expect(dialogShell).toHaveCount(0)
  })
})
