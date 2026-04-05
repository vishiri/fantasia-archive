import { _electron as electron } from 'playwright'
import { test, expect } from '@playwright/test'
import { extraEnvVariablesAPI } from 'app/src-electron/contentBridgeAPIs/extraEnvVariablesAPI'
import type { T_dialogName } from 'app/types/T_dialogList'

/**
 * Extra env settings to trigger component testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'components',
  COMPONENT_NAME: 'DialogProgramSettings',
  COMPONENT_PROPS: JSON.stringify({})
}

/**
 * Electron main filepath
 */
const electronMainFilePath:string = extraEnvVariablesAPI.ELECTRON_MAIN_FILEPATH

/**
 * Extra render timer buffer for tests to start after loading the app
 * - Change here in order manually adjust this component's wait times
 */
const faFrontendRenderTimer = extraEnvVariablesAPI.FA_FRONTEND_RENDER_TIMER

/**
 * Object of string data selectors for the component
 */
const selectorList = {
  closeButton: 'dialogProgramSettings-button-close',
  title: 'dialogProgramSettings-title'
}

/**
 * Feed "ProgramSettings" input and check if key dialog chrome opens.
 */
test('Open test "ProgramSettings" dialog with title and actions', async () => {
  const testString: T_dialogName = 'ProgramSettings'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const closeButton = appWindow.locator(`[data-test="${selectorList.closeButton}"]`)
  const title = appWindow.locator(`#${selectorList.title}`)

  await expect(closeButton).toHaveCount(1)
  await expect(title).toHaveCount(1)

  await electronApp.close()
})

/**
 * Feed "ProgramSettings" input and check if dialog closes after Close click.
 */
test('Open test "ProgramSettings" dialog and close it', async () => {
  const testString: T_dialogName = 'ProgramSettings'
  extraEnvSettings.COMPONENT_PROPS = JSON.stringify({ directInput: testString })

  const electronApp = await electron.launch({
    env: extraEnvSettings,
    args: [electronMainFilePath]
  })

  const appWindow = await electronApp.firstWindow()
  await appWindow.waitForTimeout(faFrontendRenderTimer)

  const closeButton = appWindow.locator(`[data-test="${selectorList.closeButton}"]`)
  const title = appWindow.locator(`#${selectorList.title}`)

  await expect(title).toHaveCount(1)
  await expect(closeButton).toHaveCount(1)
  await closeButton.click()

  await appWindow.waitForTimeout(1500)

  expect(await title.isHidden()).toBe(true)

  await electronApp.close()
})
