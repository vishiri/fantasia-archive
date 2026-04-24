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
import helpInfoMenuMessages from 'app/i18n/en-US/components/globals/AppControlMenus/L_helpInfo'
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
 * Monaco editor is cold-loaded when the floating window opens.
 */
const monacoMountSettleMs = 2500

/**
 * Floating window can appear after menu navigation.
 */
const programStylingWindowReadyMs = 30_000

/**
 * Target size after resize drag (matches floating frame minimum width and height).
 */
const targetFrameSizePx = 400

/**
 * Default floating frame layout (mirrors FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT) for expected initial geometry.
 */
const defaultFloatingLayout = {
  widthFrac: 0.9,
  heightFrac: 0.85,
  minWidthPx: 400,
  minHeightPx: 400,
  marginTopPx: 36,
  marginRightPx: 0,
  marginBottomPx: 0,
  marginLeftPx: 0
} as const

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  programStylingFrame: 'windowProgramStyling-frame',
  programStylingTitle: 'windowProgramStyling-title',
  dragHandle: 'windowProgramStyling-dragHandle',
  closeButton: 'windowProgramStyling-button-close',
  editorHost: 'windowProgramStyling-editorHost',
  resizeHandleSe: '.faFloatingWindowFrameResizeHandles__se',
  licenseMarkdownWrapper: 'dialogMarkdownDocument-markdown-wrapper',
  licenseDialogClose: 'dialogMarkdownDocument-button-close'
} as const

interface I_expectedFloatingFrameLayout {
  expH: number
  expW: number
  expX: number
  expY: number
  ih: number
  iw: number
}

async function readExpectedInitialFrameLayout (page: Page): Promise<I_expectedFloatingFrameLayout> {
  return await page.evaluate((layout) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const maxUsableW = vw - layout.marginLeftPx - layout.marginRightPx
    const nextW = Math.max(
      layout.minWidthPx,
      Math.min(maxUsableW, Math.floor(vw * layout.widthFrac))
    )
    const nextH = Math.max(layout.minHeightPx, Math.floor(vh * layout.heightFrac))
    const idealX = Math.floor((vw - nextW) / 2)
    const idealY = Math.floor((vh - nextH) / 2)
    const x = Math.min(
      vw - nextW - layout.marginRightPx,
      Math.max(layout.marginLeftPx, idealX)
    )
    const y = Math.min(
      vh - nextH - layout.marginBottomPx,
      Math.max(layout.marginTopPx, idealY)
    )
    return {
      expH: nextH,
      expW: nextW,
      expX: x,
      expY: y,
      ih: vh,
      iw: vw
    }
  }, defaultFloatingLayout)
}

/**
 * Same ordering as checkAppStyling.playwright.spec: allow Monaco workers after the frame is
 * on-screen, then require a non-empty editor host to avoid Playwright/white-screen flakiness.
 */
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

async function openLicenseFromHelpMenu (page: Page): Promise<void> {
  const helpTrigger = page.getByText(helpInfoMenuMessages.title, { exact: true })
  await expect(helpTrigger).toBeVisible({ timeout: 20_000 })
  await helpTrigger.click()
  await page.waitForTimeout(menuAnimationTimer)
  const licenseItem = page.getByText(helpInfoMenuMessages.items.license, { exact: true })
  await expect(licenseItem).toBeVisible()
  await licenseItem.click()
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

function assertCloseToPx (actual: number, expected: number, label: string, tolerancePx: number): void {
  expect(
    Math.abs(actual - expected),
    `${label}: expected ~${expected}, got ${actual}`
  ).toBeLessThanOrEqual(tolerancePx)
}

test.describe.serial('Floating windows end-to-end (checkFloatingWindows)', () => {
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
   * checkFloatingWindows
   * Opens Custom program CSS, asserts initial layout, resizes to 400 by 400, drags to the top-right, opens and closes
   * License (markdown dialog) from Help while the floating window stays open, then closes without saving.
   */
  test('Custom program CSS floating window sizes, resizes, moves to top-right, and closes without saving', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Floating window menu lives on MainLayout; this suite must start on the home route.'
    ).toBeVisible({
      timeout: 20_000
    })

    const expectedLayout = await readExpectedInitialFrameLayout(appWindow)

    await test.step('Open Custom program CSS from Tools menu', async () => {
      await openProgramStylingFromToolsMenu(appWindow)
      await waitForProgramStylingWindow(appWindow)
    })

    const frame = appWindow.locator(`[data-test-locator="${selectorList.programStylingFrame}"]`)

    await test.step('Assert initial size and position match centered default layout', async () => {
      const box = await frame.boundingBox()
      expect(box).not.toBeNull()
      assertCloseToPx(Math.round(box!.width), expectedLayout.expW, 'initial width', 3)
      assertCloseToPx(Math.round(box!.height), expectedLayout.expH, 'initial height', 3)
      assertCloseToPx(Math.round(box!.x), expectedLayout.expX, 'initial left', 3)
      assertCloseToPx(Math.round(box!.y), expectedLayout.expY, 'initial top', 3)
    })

    await test.step('Resize via south-east handle to 400px by 400px', async () => {
      const boxBefore = await frame.boundingBox()
      expect(boxBefore).not.toBeNull()
      const deltaX = targetFrameSizePx - boxBefore!.width
      const deltaY = targetFrameSizePx - boxBefore!.height
      const handle = frame.locator(selectorList.resizeHandleSe)
      await expect(handle).toHaveCount(1)
      const hBox = await handle.boundingBox()
      expect(hBox).not.toBeNull()
      const startX = hBox!.x + hBox!.width / 2
      const startY = hBox!.y + hBox!.height / 2
      await appWindow.mouse.move(startX, startY)
      await appWindow.mouse.down()
      await appWindow.mouse.move(startX + deltaX, startY + deltaY)
      await appWindow.mouse.up()
      await expect.poll(async () => {
        const b = await frame.boundingBox()
        if (b === null) {
          return null
        }
        return {
          h: Math.round(b.height),
          w: Math.round(b.width)
        }
      }, { timeout: 15_000 }).toEqual({
        h: targetFrameSizePx,
        w: targetFrameSizePx
      })
    })

    await test.step('Drag title row to top-right corner of the viewport', async () => {
      const box = await frame.boundingBox()
      expect(box).not.toBeNull()
      const drag = frame.locator(`[data-test-locator="${selectorList.dragHandle}"]`)
      await expect(drag).toHaveCount(1)
      const dBox = await drag.boundingBox()
      expect(dBox).not.toBeNull()
      const targetX = expectedLayout.iw - box!.width - defaultFloatingLayout.marginRightPx
      const targetY = defaultFloatingLayout.marginTopPx
      const dx = targetX - box!.x
      const dy = targetY - box!.y
      const startX = dBox!.x + dBox!.width / 2
      const startY = dBox!.y + dBox!.height / 2
      await appWindow.mouse.move(startX, startY)
      await appWindow.mouse.down()
      await appWindow.mouse.move(startX + dx, startY + dy)
      await appWindow.mouse.up()
      await expect.poll(async () => {
        const b = await frame.boundingBox()
        if (b === null) {
          return null
        }
        return {
          h: Math.round(b.height),
          w: Math.round(b.width),
          x: Math.round(b.x),
          y: Math.round(b.y)
        }
      }, { timeout: 10_000 }).toMatchObject({
        h: targetFrameSizePx,
        w: targetFrameSizePx
      })
      const after = await frame.boundingBox()
      expect(after).not.toBeNull()
      expect(
        Math.abs(after!.x + after!.width - expectedLayout.iw),
        'frame flush with right edge of viewport'
      ).toBeLessThanOrEqual(5)
      assertCloseToPx(Math.round(after!.y), defaultFloatingLayout.marginTopPx, 'frame top at margin', 5)
    })

    await test.step('Open License from Help while the floating window is open, then close License; frame stays unchanged', async () => {
      const boxBefore = await frame.boundingBox()
      expect(boxBefore).not.toBeNull()
      const expectedFrameBox = {
        h: Math.round(boxBefore!.height),
        w: Math.round(boxBefore!.width),
        x: Math.round(boxBefore!.x),
        y: Math.round(boxBefore!.y)
      }
      expect(frame).toHaveCount(1)

      await openLicenseFromHelpMenu(appWindow)

      const licenseWrapper = appWindow.locator(`[data-test-locator="${selectorList.licenseMarkdownWrapper}"]`)
      await expect(licenseWrapper).toHaveCount(1, { timeout: 20_000 })
      await expect(frame).toHaveCount(1)
      const boxWithLicenseOpen = await frame.boundingBox()
      expect(boxWithLicenseOpen).not.toBeNull()
      assertCloseToPx(
        Math.round(boxWithLicenseOpen!.width),
        expectedFrameBox.w,
        'floating width while License dialog is open',
        3
      )
      assertCloseToPx(
        Math.round(boxWithLicenseOpen!.height),
        expectedFrameBox.h,
        'floating height while License dialog is open',
        3
      )
      assertCloseToPx(
        Math.round(boxWithLicenseOpen!.x),
        expectedFrameBox.x,
        'floating x while License dialog is open',
        3
      )
      assertCloseToPx(
        Math.round(boxWithLicenseOpen!.y),
        expectedFrameBox.y,
        'floating y while License dialog is open',
        3
      )

      await appWindow.locator(`[data-test-locator="${selectorList.licenseDialogClose}"]`).click()
      await expect(licenseWrapper).toHaveCount(0, { timeout: 15_000 })

      await expect(frame).toHaveCount(1)
      const boxAfter = await frame.boundingBox()
      expect(boxAfter).not.toBeNull()
      assertCloseToPx(
        Math.round(boxAfter!.width),
        expectedFrameBox.w,
        'frame width after License close',
        3
      )
      assertCloseToPx(
        Math.round(boxAfter!.height),
        expectedFrameBox.h,
        'frame height after License close',
        3
      )
      assertCloseToPx(
        Math.round(boxAfter!.x),
        expectedFrameBox.x,
        'frame x after License close',
        3
      )
      assertCloseToPx(
        Math.round(boxAfter!.y),
        expectedFrameBox.y,
        'frame y after License close',
        3
      )
      const title = frame.locator(`[data-test-locator="${selectorList.programStylingTitle}"]`)
      await expect(title).toHaveText(programStylingMessages.title)
    })

    await test.step('Close without saving', async () => {
      await frame.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()
      await expect(frame).toHaveCount(0, { timeout: 15_000 })
    })
  })
})
