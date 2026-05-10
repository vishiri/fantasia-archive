import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { getFaPlaywrightMonacoSelectAllPressString } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import toolsMenuMessages from 'app/i18n/en-US/components/globals/AppControlMenus/L_tools'
import appStylingMessages from 'app/i18n/en-US/floatingWindows/L_appStyling'

/**
 * Extra env settings to trigger E2E testing via Playwright
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

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
const appStylingWindowReadyMs = 30_000

/**
 * Sample user CSS for body zoom in the Custom app CSS window (live preview + save checks).
 */
const appStylingZoomSnippet08 = 'body {zoom:0.8;};'

const appStylingZoomSnippet09 = 'body {zoom:0.9;};'

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  appStylingFrame: 'windowAppStyling-frame',
  appStylingSave: 'windowAppStyling-button-save',
  appStylingTitle: 'windowAppStyling-title',
  editorHost: 'windowAppStyling-editorHost'
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

async function openAppStylingFromToolsMenu (page: Page): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  const toolsTrigger = page.getByText(toolsMenuMessages.title, { exact: true })
  await expect(toolsTrigger).toBeVisible({ timeout: 20_000 })
  await toolsTrigger.click()
  await page.waitForTimeout(menuAnimationTimer)
  const appStylingMenuItem = page.getByText(toolsMenuMessages.items.appStyling, { exact: true })
  await expect(appStylingMenuItem).toBeVisible()
  await appStylingMenuItem.click()
  await page.waitForTimeout(menuAnimationTimer)
}

async function waitForAppStylingWindow (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.appStylingFrame}"]`)
  await expect(frame).toHaveCount(1, { timeout: appStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.appStylingTitle}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(appStylingMessages.title)
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

async function readBodyZoom (page: Page): Promise<string> {
  return await page.evaluate(() => {
    const raw = window.getComputedStyle(document.body).zoom
    return raw === '' ? bodyZoomNoneExpected : raw
  })
}

test.describe.serial('Custom app CSS end-to-end', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
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
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * Live preview applies body zoom before save; saving a different zoom persists it; clearing CSS resets zoom.
   */
  test('App styling live preview and save apply body zoom; clearing removes it', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'App styling menu lives on MainLayout; this suite must start on the home route.'
    ).toBeVisible({
      timeout: 20_000
    })

    await test.step('Open Custom app CSS from Tools menu', async () => {
      await openAppStylingFromToolsMenu(appWindow)
      await waitForAppStylingWindow(appWindow)
    })

    await test.step('Type zoom 0.8 — applied to body before save (live preview)', async () => {
      await replaceMonacoText(appWindow, appStylingZoomSnippet08)
      await expect.poll(async () => await readBodyZoom(appWindow), {
        timeout: 15_000
      }).toBe(bodyZoomLivePreviewExpected)
    })

    await test.step('Change to zoom 0.9 and save', async () => {
      await replaceMonacoText(appWindow, appStylingZoomSnippet09)
      await saveAppStylingWindow(appWindow)
    })

    await test.step('Body has zoom 0.9 from saved user CSS', async () => {
      await expect.poll(async () => await readBodyZoom(appWindow), {
        timeout: 15_000
      }).toBe(bodyZoomAfterSaveExpected)
    })

    await test.step('Reopen dialog, clear editor, save empty CSS', async () => {
      await openAppStylingFromToolsMenu(appWindow)
      await waitForAppStylingWindow(appWindow)
      await replaceMonacoText(appWindow, '')
      await saveAppStylingWindow(appWindow)
    })

    await test.step('Body no longer has non-default zoom', async () => {
      await expect.poll(async () => await readBodyZoom(appWindow), {
        timeout: 15_000
      }).toBe(bodyZoomNoneExpected)
    })
  })
})
