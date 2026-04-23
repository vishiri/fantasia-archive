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
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers/playwrightDismissStartupTipsNotify'
import { resetFaPlaywrightIsolatedUserData } from 'app/helpers/playwrightHelpers/playwrightUserDataReset'
import toolsMenuMessages from 'app/i18n/en-US/components/globals/AppControlMenus/L_tools'

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
 * Menu animation timer for tests to wait for the menu animation to finish
 */
const menuAnimationTimer = 600

/**
 * Monaco editor is cold-loaded when the dialog opens.
 */
const monacoMountSettleMs = 2500

/**
 * Sample user CSS applied in the Program Styling dialog (requested E2E payload).
 */
const programStylingZoomSnippet = 'body {zoom:0.9;};'

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  programStylingSave: 'windowProgramStyling-button-save',
  programStylingTitle: 'windowProgramStyling-title',
  editorHost: 'windowProgramStyling-editorHost'
} as const

/**
 * Chromium reports an unset body zoom as '1' once author 'zoom' is removed from user CSS.
 */
const bodyZoomNoneExpected = '1'

/**
 * After applying 'body { zoom: 0.9 }' via injected user stylesheet, computed body zoom in Electron.
 */
const bodyZoomAppliedExpected = '0.9'

async function waitForMonacoEditorMount (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.editorHost}"]`)
  await expect(host).toHaveCount(1)
  await expect(async () => {
    const handle = await host.elementHandle()
    if (handle === null) {
      throw new Error('editor host detached before Monaco mount')
    }
    const childCount = await handle.evaluate((node: Element) => node.childElementCount)
    expect(childCount).toBeGreaterThan(0)
  }).toPass({ timeout: 15_000 })
}

async function openProgramStylingFromToolsMenu (page: Page): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  const toolsTrigger = page.getByText(toolsMenuMessages.title, { exact: true })
  await expect(toolsTrigger).toBeVisible({ timeout: 20_000 })
  await toolsTrigger.click()
  await page.waitForTimeout(menuAnimationTimer)
  const programCssItem = page.getByText(toolsMenuMessages.items.programStyling, { exact: true })
  await expect(programCssItem).toBeVisible()
  await programCssItem.click()
  await page.waitForTimeout(menuAnimationTimer)
}

async function waitForProgramStylingWindow (page: Page): Promise<void> {
  const title = page.locator(`[data-test-locator="${selectorList.programStylingTitle}"]`)
  await expect(title).toBeVisible({ timeout: 15_000 })
  await page.waitForTimeout(monacoMountSettleMs)
  await waitForMonacoEditorMount(page)
}

async function replaceMonacoText (page: Page, nextText: string): Promise<void> {
  const editor = page.locator('.windowProgramStyling .monaco-editor')
  await editor.click()
  await page.keyboard.press('Control+A')
  if (nextText.length > 0) {
    await page.keyboard.type(nextText)
  } else {
    await page.keyboard.press('Backspace')
  }
}

async function saveProgramStylingWindow (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.programStylingSave}"]`).click()
  const title = page.locator(`[data-test-locator="${selectorList.programStylingTitle}"]`)
  await expect(title).toBeHidden({
    timeout: 15_000
  })
}

async function readBodyZoom (page: Page): Promise<string> {
  return await page.evaluate(() => {
    const raw = window.getComputedStyle(document.body).zoom
    return raw === '' ? bodyZoomNoneExpected : raw
  })
}

test.describe.serial('Custom program CSS end-to-end', () => {
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
   * Saves user CSS with a body zoom rule, asserts it affects the app shell, clears CSS, and asserts zoom returns to default.
   */
  test('Program styling save applies body zoom and clearing removes it', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Program styling menu lives on MainLayout; this suite must start on the home route.'
    ).toBeVisible({
      timeout: 20_000
    })

    await test.step('Open Custom program CSS from Tools menu', async () => {
      await openProgramStylingFromToolsMenu(appWindow)
      await waitForProgramStylingWindow(appWindow)
    })

    await test.step('Type zoom CSS and save', async () => {
      await replaceMonacoText(appWindow, programStylingZoomSnippet)
      await saveProgramStylingWindow(appWindow)
    })

    await test.step('Body has zoom from user CSS', async () => {
      await expect.poll(async () => await readBodyZoom(appWindow), {
        timeout: 15_000
      }).toBe(bodyZoomAppliedExpected)
    })

    await test.step('Reopen dialog, clear editor, save empty CSS', async () => {
      await openProgramStylingFromToolsMenu(appWindow)
      await waitForProgramStylingWindow(appWindow)
      await replaceMonacoText(appWindow, '')
      await saveProgramStylingWindow(appWindow)
    })

    await test.step('Body no longer has non-default zoom', async () => {
      await expect.poll(async () => await readBodyZoom(appWindow), {
        timeout: 15_000
      }).toBe(bodyZoomNoneExpected)
    })
  })
})
