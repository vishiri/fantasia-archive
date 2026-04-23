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
import programStylingMessages from 'app/i18n/en-US/floatingWindows/L_programStyling'

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
 * Floating window can appear after menu navigation; match component-test resilience (assert frame root, not title visibility alone).
 */
const programStylingWindowReadyMs = 30_000

/**
 * Sample user CSS for body zoom in the Program Styling dialog (live preview + save checks).
 */
const programStylingZoomSnippet08 = 'body {zoom:0.8;};'

const programStylingZoomSnippet09 = 'body {zoom:0.9;};'

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  programStylingFrame: 'windowProgramStyling-frame',
  programStylingSave: 'windowProgramStyling-button-save',
  programStylingTitle: 'windowProgramStyling-title',
  editorHost: 'windowProgramStyling-editorHost'
} as const

/**
 * Chromium reports an unset body zoom as '1' once author 'zoom' is removed from user CSS.
 */
const bodyZoomNoneExpected = '1'

/**
 * Expected computed body zoom after typing unsaved CSS (live preview) and after save.
 */
const bodyZoomLivePreviewExpected = '0.8'

const bodyZoomAfterSaveExpected = '0.9'

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
  const frame = page.locator(`[data-test-locator="${selectorList.programStylingFrame}"]`)
  await expect(frame).toHaveCount(1, { timeout: programStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.programStylingTitle}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(programStylingMessages.title)
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
  const frame = page.locator(`[data-test-locator="${selectorList.programStylingFrame}"]`)
  await frame.locator(`[data-test-locator="${selectorList.programStylingSave}"]`).click()
  await expect(frame).toHaveCount(0, { timeout: 15_000 })
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
   * Live preview applies body zoom before save; saving a different zoom persists it; clearing CSS resets zoom.
   */
  test('Program styling live preview and save apply body zoom; clearing removes it', async () => {
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

    await test.step('Type zoom 0.8 — applied to body before save (live preview)', async () => {
      await replaceMonacoText(appWindow, programStylingZoomSnippet08)
      await expect.poll(async () => await readBodyZoom(appWindow), {
        timeout: 15_000
      }).toBe(bodyZoomLivePreviewExpected)
    })

    await test.step('Change to zoom 0.9 and save', async () => {
      await replaceMonacoText(appWindow, programStylingZoomSnippet09)
      await saveProgramStylingWindow(appWindow)
    })

    await test.step('Body has zoom 0.9 from saved user CSS', async () => {
      await expect.poll(async () => await readBodyZoom(appWindow), {
        timeout: 15_000
      }).toBe(bodyZoomAfterSaveExpected)
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
