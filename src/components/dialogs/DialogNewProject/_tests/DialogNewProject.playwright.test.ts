import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import L_newProject from 'app/i18n/en-US/dialogs/L_newProject'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  COMPONENT_NAME: 'DialogNewProject',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components'
}

const faFrontendRenderTimer = FA_FRONTEND_RENDER_TIMER

const selectorList = {
  createButton: 'dialogNewProject-button-create',
  nameInput: 'dialogNewProject-input-name'
}

const newProjectDirectInput: T_dialogName = 'NewProject'

test.describe.serial('New project dialog', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: newProjectDirectInput })
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
   * Open **DialogNewProject** via component harness **directInput** and assert **en-US** copy on shell controls.
   */
  test('Renders DialogNewProject with localized title, name field label, and create action', async () => {
    const dialogShell = appWindow.locator('.q-dialog.dialogComponent.NewProject')
    await expect(dialogShell).toHaveCount(1)
    await expect(dialogShell).toHaveAttribute('aria-label', L_newProject.ariaLabel)

    await expect(appWindow.locator('#dialogNewProject-title')).toHaveText(L_newProject.title)

    await expect(appWindow.getByRole('textbox', { name: L_newProject.nameLabel })).toBeVisible()

    await expect(appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toHaveCount(1)

    await expect(
      appWindow.getByRole('button', {
        exact: true,
        name: L_newProject.createButton
      })
    ).toHaveCount(1)
    await expect(appWindow.locator(`[data-test-locator="${selectorList.createButton}"]`)).toBeVisible()
  })
})
