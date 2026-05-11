import fs from 'node:fs'
import path from 'node:path'

import type { ElectronApplication, Locator, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import toolsMenuMessages from 'app/i18n/en-US/components/globals/AppControlMenus/L_tools'
import appStylingMessages from 'app/i18n/en-US/floatingWindows/L_appStyling'
import noteboardMessages from 'app/i18n/en-US/floatingWindows/L_appNoteboard'
import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'

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
 * Monaco mounts after the floating frame exists.
 */
const monacoMountSettleMs = 2500

/**
 * Floating window readiness timeout after Tools menu dismissal.
 */
const appStylingWindowReadyMs = 30_000

/**
 * Matches note board Transition timing plus a small slack for layout paint.
 */
const noteboardChromeSettleMs = FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 100

/**
 * Target size after enforcing the clamped resize handle sweep (floating frame CSS minimum matches this number).
 */
const targetFrameMinSizePx = 400

/**
 * Default floating frame layout (mirrors FA_FLOATING_WINDOW_FRAME_DEFAULT_LAYOUT) used for reopen expectations and resets.
 */
const defaultFloatingLayout = {
  heightFrac: 0.85,
  marginBottomPx: 0,
  marginLeftPx: 0,
  marginRightPx: 0,
  marginTopPx: 36,
  minHeightPx: 400,
  minWidthPx: 400,
  widthFrac: 0.9
} as const

/**
 * Persisted rectangles recorded on disk between the two Electron launches in this spec file only.
 */
const geomSnapPath = path.join(process.cwd(), 'test-results', 'checkAppFloatingWindows-geom-snapshot.json')

/**
 * Frame writes debounce around 280 ms in Vue; flushing on close fires after 'windowModel' is false so guarded persist bodies must run earlier while each floater remains open.
 */
const floatingFramePersistSettleMs = 500

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  appStylingClose: 'windowAppStyling-button-close',
  appStylingDrag: 'windowAppStyling-dragHandle',
  appStylingEditorHost: 'windowAppStyling-editorHost',
  appStylingFrame: 'windowAppStyling-frame',
  appStylingTitle: 'windowAppStyling-title',
  nbCloseButton: 'windowAppNoteboard-button-close',
  nbDrag: 'windowAppNoteboard-dragHandle',
  nbEditor: 'windowAppNoteboard-editor',
  nbFrame: 'windowAppNoteboard-frame',
  nbTitle: 'windowAppNoteboard-title',
  resizeHandleSe: '.faFloatingWindowFrameResizeHandles__se'
} as const

interface I_geomBoxRounded {
  h: number
  w: number
  x: number
  y: number
}

interface I_floatingWindowsGeomSnap {
  noteboardPost: I_geomBoxRounded
  noteboardPre: I_geomBoxRounded
  stylingPost: I_geomBoxRounded
  stylingPre: I_geomBoxRounded
}

interface I_expectedFloatingViewportLayout {
  expH: number
  expW: number
  expX: number
  expY: number
  ih: number
  iw: number
}

async function ensureGeomSnapshotCleared (): Promise<void> {
  await fs.promises.mkdir(path.dirname(geomSnapPath), { recursive: true })
  await fs.promises.rm(geomSnapPath, {
    force: true
  })
}

async function readGeomSnapshotFromDisk (): Promise<I_floatingWindowsGeomSnap> {
  const raw = await fs.promises.readFile(geomSnapPath, 'utf8')
  const parsedUnknown: unknown = JSON.parse(raw)
  if (
    typeof parsedUnknown !== 'object' ||
    parsedUnknown === null
  ) {
    throw new Error('Floating window geometry snapshot corrupt: top-level payload is not an object.')
  }
  const p = parsedUnknown as Partial<I_floatingWindowsGeomSnap>
  const stylingPre = p.stylingPre
  const stylingPost = p.stylingPost
  const noteboardPre = p.noteboardPre
  const noteboardPost = p.noteboardPost
  const keys: Array<[string, unknown]> = [
    ['stylingPre', stylingPre],
    ['stylingPost', stylingPost],
    ['noteboardPre', noteboardPre],
    ['noteboardPost', noteboardPost]
  ]
  for (const [name, v] of keys) {
    if (
      typeof v !== 'object' ||
      v === null
    ) {
      throw new Error(`Floating window geometry snapshot missing ${name}.`)
    }
    const rect = v as Partial<I_geomBoxRounded>
    for (const k of ['h', 'w', 'x', 'y']) {
      if (typeof rect[k as keyof I_geomBoxRounded] !== 'number') {
        throw new Error(`Floating window geometry snapshot field ${name}.${k} is not a finite number snapshot.`)
      }
    }
  }
  return {
    noteboardPost: noteboardPost as I_geomBoxRounded,
    noteboardPre: noteboardPre as I_geomBoxRounded,
    stylingPost: stylingPost as I_geomBoxRounded,
    stylingPre: stylingPre as I_geomBoxRounded
  }
}

async function writeGeomSnapshot (snap: I_floatingWindowsGeomSnap): Promise<void> {
  await fs.promises.mkdir(path.dirname(geomSnapPath), { recursive: true })
  await fs.promises.writeFile(geomSnapPath, JSON.stringify(snap, undefined, 2), 'utf8')
}

async function readExpectedFloatingOpenLayoutFromViewport (page: Page): Promise<I_expectedFloatingViewportLayout> {
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

function assertCloseToPx (actual: number, expected: number, label: string, tolerancePx: number): void {
  expect(
    Math.abs(actual - expected),
    `${label}: expected approximately ${expected}, received ${actual}`
  ).toBeLessThanOrEqual(tolerancePx)
}

function boxesAreFarApart (first: I_geomBoxRounded, second: I_geomBoxRounded): boolean {
  const dist =
    Math.abs(first.x - second.x) +
    Math.abs(first.y - second.y) +
    Math.abs(first.w - second.w) +
    Math.abs(first.h - second.h)
  return dist > 40
}

async function readRoundedBoundingBoxForLocator (loc: Locator): Promise<I_geomBoxRounded> {
  const raw = await loc.boundingBox()
  expect(raw).not.toBeNull()
  return {
    h: Math.round(raw!.height),
    w: Math.round(raw!.width),
    x: Math.round(raw!.x),
    y: Math.round(raw!.y)
  }
}

async function waitForMonacoEditorMountAtHost (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.appStylingEditorHost}"]`)
  await expect(host).toHaveCount(1)
  await expect(async () => {
    const handle = await host.elementHandle()
    if (handle === null) {
      throw new Error('windowAppStyling editor host detached before Monaco mount')
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

async function waitForWindowAppStylingVisible (page: Page): Promise<Locator> {
  const frame = page.locator(`[data-test-locator="${selectorList.appStylingFrame}"]`)
  await expect(frame).toHaveCount(1, { timeout: appStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.appStylingTitle}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(appStylingMessages.title)
  await page.waitForTimeout(monacoMountSettleMs)
  await waitForMonacoEditorMountAtHost(page)
  return frame
}

async function openNoteboardFromToolsMenu (page: Page): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  const toolsTrigger = page.getByText(toolsMenuMessages.title, { exact: true })
  await expect(toolsTrigger).toBeVisible({ timeout: 20_000 })
  await toolsTrigger.click()
  await page.waitForTimeout(menuAnimationTimer)
  const row = page.getByText(toolsMenuMessages.items.appNoteBoard, { exact: true })
  await expect(row).toBeVisible()
  await row.click()
  await page.waitForTimeout(menuAnimationTimer)
}

async function waitForWindowAppNoteboardVisible (page: Page): Promise<Locator> {
  const frame = page.locator(`[data-test-locator="${selectorList.nbFrame}"]`)
  await expect(frame).toHaveCount(1, { timeout: appStylingWindowReadyMs })
  const title = frame.locator(`[data-test-locator="${selectorList.nbTitle}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(noteboardMessages.title)
  await page.waitForTimeout(noteboardChromeSettleMs)
  const editor = frame.locator(`[data-test-locator="${selectorList.nbEditor}"]`)
  await expect(editor).toBeVisible()
  return frame
}

async function resizeFloatingFrameTowardMinSquare (page: Page, frame: Locator): Promise<void> {
  const boxBefore = await frame.boundingBox()
  expect(boxBefore).not.toBeNull()
  const deltaX = targetFrameMinSizePx - boxBefore!.width
  const deltaY = targetFrameMinSizePx - boxBefore!.height
  const handle = frame.locator(selectorList.resizeHandleSe)
  await expect(handle).toHaveCount(1)
  const hBox = await handle.boundingBox()
  expect(hBox).not.toBeNull()
  const startX = hBox!.x + hBox!.width / 2
  const startY = hBox!.y + hBox!.height / 2
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(startX + deltaX, startY + deltaY)
  await page.mouse.up()
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
    h: targetFrameMinSizePx,
    w: targetFrameMinSizePx
  })
}

type T_cornerParkTarget = 'bottomRight' | 'topLeft'

async function dragMinFloaterToCorner (
  page: Page,
  frame: Locator,
  dragLocatorValue: typeof selectorList.appStylingDrag | typeof selectorList.nbDrag,
  viewportMetrics: Pick<I_expectedFloatingViewportLayout, 'ih' | 'iw'>,
  corner: T_cornerParkTarget
): Promise<I_geomBoxRounded> {
  let box!: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>
  await expect.poll(async () => {
    const b = await frame.boundingBox()
    if (b === null) {
      return false
    }
    box = b
    return true
  }, { timeout: 10_000 }).toBe(true)

  let targetLeft: number
  let targetTop: number

  if (corner === 'bottomRight') {
    targetLeft = viewportMetrics.iw - box.width - defaultFloatingLayout.marginRightPx
    targetTop = viewportMetrics.ih - box.height - defaultFloatingLayout.marginBottomPx
  } else {
    targetLeft = defaultFloatingLayout.marginLeftPx
    targetTop = defaultFloatingLayout.marginTopPx
  }

  const dxTotal = targetLeft - box.x
  const dyTotal = targetTop - box.y

  const drag = frame.locator(`[data-test-locator="${dragLocatorValue}"]`)
  await expect(drag).toHaveCount(1)
  const dBox = await drag.boundingBox()
  expect(dBox).not.toBeNull()

  await page.mouse.move(dBox!.x + dBox!.width / 2, dBox!.y + dBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(dBox!.x + dBox!.width / 2 + dxTotal, dBox!.y + dBox!.height / 2 + dyTotal)
  await page.mouse.up()

  await expect.poll(async () => {
    const next = await readRoundedBoundingBoxForLocator(frame)
    return next
  }, { timeout: 10_000 }).toMatchObject({
    h: targetFrameMinSizePx,
    w: targetFrameMinSizePx
  })

  const parked = await readRoundedBoundingBoxForLocator(frame)

  if (corner === 'bottomRight') {
    assertCloseToPx(
      parked.x + parked.w,
      viewportMetrics.iw - defaultFloatingLayout.marginRightPx,
      'floater right edge aligns with viewport after bottom-right parking',
      6
    )
    assertCloseToPx(
      parked.y + parked.h,
      viewportMetrics.ih - defaultFloatingLayout.marginBottomPx,
      'floater bottom edge aligns with viewport after bottom-right parking',
      6
    )
  } else {
    assertCloseToPx(parked.x, defaultFloatingLayout.marginLeftPx, 'floater left edge after top-left parking', 5)
    assertCloseToPx(parked.y, defaultFloatingLayout.marginTopPx, 'floater top edge after top-left parking', 5)
  }

  return parked
}

async function readRoundedZIndexUnderViewport (loc: Locator): Promise<number> {
  const z = await loc.evaluate((element: HTMLElement) => {
    const raw = window.getComputedStyle(element).zIndex
    if (raw === 'auto') {
      return Number.NaN
    }
    return Number.parseFloat(raw)
  })
  expect(Number.isFinite(z)).toBe(true)
  return z as number
}

async function coarseResetFloatingTowardPreferredLayout (
  page: Page,
  frame: Locator,
  dragTestLocator: typeof selectorList.appStylingDrag | typeof selectorList.nbDrag,
  preferred: Pick<I_expectedFloatingViewportLayout, 'expH' | 'expW' | 'expX' | 'expY'>
): Promise<void> {
  await expect.poll(async () => frame.boundingBox()).not.toBeNull()
  let anchorBox!: NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>
  await expect.poll(async () => {
    const b = await frame.boundingBox()
    anchorBox = b!
    return b !== null
  }, { timeout: 10_000 }).toBeTruthy()

  const deltaWDesired = preferred.expW - anchorBox.width
  const deltaHDesired = preferred.expH - anchorBox.height
  const clampedDw = Math.max(-anchorBox.width + targetFrameMinSizePx + 2, deltaWDesired)
  const clampedDh = Math.max(-anchorBox.height + targetFrameMinSizePx + 2, deltaHDesired)

  const handle = frame.locator(selectorList.resizeHandleSe)
  await expect(handle).toHaveCount(1)
  const hb = await handle.boundingBox()
  expect(hb).not.toBeNull()
  const sx = hb!.x + hb!.width / 2
  const sy = hb!.y + hb!.height / 2
  await page.mouse.move(sx, sy)
  await page.mouse.down()
  await page.mouse.move(sx + clampedDw, sy + clampedDh)
  await page.mouse.up()
  await page.waitForTimeout(200)

  const mid = await readRoundedBoundingBoxForLocator(frame)
  const dxToward = preferred.expX + Math.floor(preferred.expW / 2) - (mid.x + Math.floor(mid.w / 2))
  const dyToward = preferred.expY + Math.floor(preferred.expH / 2) - (mid.y + Math.floor(mid.h / 2))
  const drag = frame.locator(`[data-test-locator="${dragTestLocator}"]`)
  await expect(drag).toHaveCount(1)
  const dBox = await drag.boundingBox()
  expect(dBox).not.toBeNull()

  await page.mouse.move(dBox!.x + dBox!.width / 2, dBox!.y + dBox!.height / 2)
  await page.mouse.down()
  await page.mouse.move(dBox!.x + dBox!.width / 2 + dxToward, dBox!.y + dBox!.height / 2 + dyToward)
  await page.mouse.up()
  await page.waitForTimeout(200)
}

test.describe.serial('Floating windows record geometry (fresh Playwright profile)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 180_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    await ensureGeomSnapshotCleared()
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
   * Captures pre-open default rectangles and post-manipulation rectangles for Custom app CSS and the App note board on a clean profile, then writes them next to the Playwright report path for the follow-up launch.
   * - Custom app CSS ends at the smallest square before it is parked at the bottom-right corner; the note board uses the same minimum square then parks top-left under the header margin band.
   */
  test('Resize and park Custom app CSS bottom-right, then note board top-left, writing a geometry snapshot', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Floating window entries live on MainLayout; start from the splash or home route.'
    ).toBeVisible({
      timeout: 20_000
    })

    const expectedLayout = await readExpectedFloatingOpenLayoutFromViewport(appWindow)
    const viewportMetrics = {
      ih: expectedLayout.ih,
      iw: expectedLayout.iw
    }

    await openAppStylingFromToolsMenu(appWindow)
    const stylingFrame = await waitForWindowAppStylingVisible(appWindow)
    const stylingPreRounded = await readRoundedBoundingBoxForLocator(stylingFrame)
    assertCloseToPx(stylingPreRounded.w, expectedLayout.expW, 'initial Custom app CSS width', 3)
    assertCloseToPx(stylingPreRounded.h, expectedLayout.expH, 'initial Custom app CSS height', 3)
    assertCloseToPx(stylingPreRounded.x, expectedLayout.expX, 'initial Custom app CSS left', 3)
    assertCloseToPx(stylingPreRounded.y, expectedLayout.expY, 'initial Custom app CSS top', 3)

    const stylingPre: I_geomBoxRounded = stylingPreRounded

    await resizeFloatingFrameTowardMinSquare(appWindow, stylingFrame)
    const stylingPost = await dragMinFloaterToCorner(
      appWindow,
      stylingFrame,
      selectorList.appStylingDrag,
      viewportMetrics,
      'bottomRight'
    )

    await appWindow.waitForTimeout(floatingFramePersistSettleMs)

    await stylingFrame.locator(`[data-test-locator="${selectorList.appStylingClose}"]`).click()
    await expect(stylingFrame).toHaveCount(0, { timeout: 15_000 })

    await openNoteboardFromToolsMenu(appWindow)
    const nbFrame = await waitForWindowAppNoteboardVisible(appWindow)
    const nbPreRounded = await readRoundedBoundingBoxForLocator(nbFrame)
    assertCloseToPx(nbPreRounded.w, expectedLayout.expW, 'initial note board width', 3)
    assertCloseToPx(nbPreRounded.h, expectedLayout.expH, 'initial note board height', 3)
    assertCloseToPx(nbPreRounded.x, expectedLayout.expX, 'initial note board left', 3)
    assertCloseToPx(nbPreRounded.y, expectedLayout.expY, 'initial note board top', 3)

    const noteboardPre: I_geomBoxRounded = nbPreRounded

    await resizeFloatingFrameTowardMinSquare(appWindow, nbFrame)
    const noteboardPost = await dragMinFloaterToCorner(
      appWindow,
      nbFrame,
      selectorList.nbDrag,
      viewportMetrics,
      'topLeft'
    )

    await appWindow.waitForTimeout(floatingFramePersistSettleMs)

    await nbFrame.locator(`[data-test-locator="${selectorList.nbCloseButton}"]`).click()
    await expect(nbFrame).toHaveCount(0, { timeout: 15_000 })

    const snapshotPayload: I_floatingWindowsGeomSnap = {
      noteboardPost,
      noteboardPre,
      stylingPost,
      stylingPre
    }
    await writeGeomSnapshot(snapshotPayload)

    await expect.poll(() => fs.existsSync(geomSnapPath)).toBe(true)
  })
})

test.describe.serial('Floating windows restore geometry after app restart (reuse profile, no isolation reset)', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 240_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      resetUserData: false,
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
   * Reads the JSON snapshot from the prior serial group, reopens each floating window, and proves geometry matches the recorded post-resize snapshot instead of the centered default.
   * - With both frames visible the note board stack order must sit above Custom app CSS; coarse reset moves each frame toward the default layout before closing the note board first per maintainer workflow notes.
   */
  test('After restart Custom app CSS and note board reopen to parked geometry, note board stacks above, then rough reset closes', async () => {
    const snap = await readGeomSnapshotFromDisk()

    await expect(
      appWindow.locator('.appHeader'),
      'Floating window entries live on MainLayout; start from the splash or home route.'
    ).toBeVisible({
      timeout: 20_000
    })

    const preferredLayout = await readExpectedFloatingOpenLayoutFromViewport(appWindow)

    await test.step('Reopen Custom app CSS and match post snapshot, not default pre snapshot', async () => {
      await openAppStylingFromToolsMenu(appWindow)
      const stylingFrame = await waitForWindowAppStylingVisible(appWindow)
      const stylingBox = await readRoundedBoundingBoxForLocator(stylingFrame)
      assertCloseToPx(stylingBox.w, snap.stylingPost.w, 'restored Custom app CSS width', 5)
      assertCloseToPx(stylingBox.h, snap.stylingPost.h, 'restored Custom app CSS height', 5)
      assertCloseToPx(stylingBox.x, snap.stylingPost.x, 'restored Custom app CSS left', 5)
      assertCloseToPx(stylingBox.y, snap.stylingPost.y, 'restored Custom app CSS top', 5)
      expect(boxesAreFarApart(stylingBox, snap.stylingPre)).toBe(true)
    })

    await test.step('Reopen note board on top and match post snapshot, not default pre snapshot', async () => {
      await openNoteboardFromToolsMenu(appWindow)
      const nbFrame = await waitForWindowAppNoteboardVisible(appWindow)
      const nbBox = await readRoundedBoundingBoxForLocator(nbFrame)
      assertCloseToPx(nbBox.w, snap.noteboardPost.w, 'restored note board width', 5)
      assertCloseToPx(nbBox.h, snap.noteboardPost.h, 'restored note board height', 5)
      assertCloseToPx(nbBox.x, snap.noteboardPost.x, 'restored note board left', 5)
      assertCloseToPx(nbBox.y, snap.noteboardPost.y, 'restored note board top', 5)
      expect(boxesAreFarApart(nbBox, snap.noteboardPre)).toBe(true)
    })

    const stylingFrameLive = appWindow.locator(`[data-test-locator="${selectorList.appStylingFrame}"]`)
    const nbFrameLive = appWindow.locator(`[data-test-locator="${selectorList.nbFrame}"]`)
    await expect(stylingFrameLive).toHaveCount(1)
    await expect(nbFrameLive).toHaveCount(1)

    const stylingZ = await readRoundedZIndexUnderViewport(stylingFrameLive)
    const nbZ = await readRoundedZIndexUnderViewport(nbFrameLive)
    expect(nbZ, 'App note board z-index must exceed Custom app CSS when both floaters are visible').toBeGreaterThan(stylingZ)

    await test.step('Coarse reset note board first, close it, reset Custom app CSS, close it', async () => {
      await coarseResetFloatingTowardPreferredLayout(
        appWindow,
        nbFrameLive,
        selectorList.nbDrag,
        preferredLayout
      )
      await appWindow.waitForTimeout(floatingFramePersistSettleMs)
      await nbFrameLive.locator(`[data-test-locator="${selectorList.nbCloseButton}"]`).click()
      await expect(nbFrameLive).toHaveCount(0, { timeout: 15_000 })

      await coarseResetFloatingTowardPreferredLayout(
        appWindow,
        stylingFrameLive,
        selectorList.appStylingDrag,
        preferredLayout
      )
      await appWindow.waitForTimeout(floatingFramePersistSettleMs)
      await stylingFrameLive.locator(`[data-test-locator="${selectorList.appStylingClose}"]`).click()
      await expect(stylingFrameLive).toHaveCount(0, { timeout: 15_000 })
    })
  })
})
