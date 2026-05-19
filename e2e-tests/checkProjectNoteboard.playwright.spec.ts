import fs from 'node:fs'

import type { ElectronApplication, Locator, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { e2eExpectFaActiveProjectStoreName } from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  e2eSetNextProjectCreatePath,
  e2eSetNextProjectOpenPath,
  getE2eFaprojectFixtureAbsolutePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_PROJECT_NOTEBOARD } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_newProject from 'app/i18n/en-US/dialogs/L_newProject'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'
import noteboardMessages from 'app/i18n/en-US/floatingWindows/L_projectNoteboard'

import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/faQuasarDialogStandardTransition'

/**
 * Extra env settings to trigger isolated E2E profile.
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

const MENU_ANIMATION_MS = 600
const FLOATING_FRAME_PERSIST_SETTLE_MS = 500
/**
 * Matches production debounced main-process writes for note text plus IPC slack (same as checkAppNoteboard.playwright.spec.ts).
 */
const noteboardTextPersistSettleMs = 900
/**
 * After any Playwright fill or project-noteboard synthetic input, wait before the next UI action so debounced persist and window chrome settle (avoids racing toggle/close).
 */
const e2ePostTypingSettleMs = 1_000
const PROJECT_NOTEBOARD_READY_MS = 30_000
const SPLASH_SHELL_TIMEOUT_MS = 20_000

/**
 * Baseline `.faproject` basename: first serial group captures parked window geometry and note text here.
 */
const PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT = 'e2e-project-noteboard-baseline.faproject'

/**
 * Companion `.faproject` basename: second serial group types different notes here to prove per-project SQLite isolation when switching back to the baseline file.
 */
const PROJECT_NOTEBOARD_E2E_COMPANION_FAPROJECT = 'e2e-project-noteboard-companion.faproject'

const PROJECT_NOTEBOARD_E2E_BASELINE_DISPLAY_NAME = 'E2E Project noteboard baseline'
const PROJECT_NOTEBOARD_E2E_COMPANION_DISPLAY_NAME = 'E2E Project noteboard companion'

const PROJECT_NOTEBOARD_E2E_BASELINE_NOTE_SAMPLE =
  'E2E baseline project noteboard — paragraph one.\n' +
  'E2E baseline project noteboard — paragraph two.\n' +
  'E2E baseline project noteboard — paragraph three.'

const PROJECT_NOTEBOARD_E2E_COMPANION_NOTE_SAMPLE =
  'E2E companion project noteboard — line one (different project).\n' +
  'E2E companion project noteboard — line two (different project).'

/**
 * Mirrors default floating-window layout clamps (margins plus minimum square chrome).
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

const targetFrameMinSizePx = 400

interface I_geomBoxRounded {
  h: number
  w: number
  x: number
  y: number
}

interface I_expectedFloatingViewportLayout {
  expH: number
  expW: number
  expX: number
  expY: number
  ih: number
  iw: number
}

/**
 * Bounding box after shrinking the noteboard to its minimum size and parking it at the top-left margin; the second serial group reloads the baseline `.faproject` and expects this geometry again after editing the companion project in between.
 */
let savedBaselineParkedNoteboardGeom!: I_geomBoxRounded

const selectorList = {
  dialogCreateBtn: 'dialogNewProject-button-create',
  dialogNameInput: 'dialogNewProject-input-name',
  nbCloseButton: 'windowProjectNoteboard-button-close',
  nbDrag: 'windowProjectNoteboard-dragHandle',
  nbEditor: 'windowProjectNoteboard-editor',
  nbFrame: 'windowProjectNoteboard-frame',
  nbTitle: 'windowProjectNoteboard-title',
  resizeHandleSe: '.faFloatingWindowFrameResizeHandles__se',
  splashLoad: 'splashPage-btn-load',
  splashNew: 'splashPage-btn-new'
} as const

async function dismissOpenMenus (page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
}

async function openProjectMenu (page: Page): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  await dismissOpenMenus(page)
  const trigger = page.getByRole('button', {
    exact: true,
    name: projectMenu.title
  })
  await expect(trigger).toBeVisible({ timeout: SPLASH_SHELL_TIMEOUT_MS })
  await trigger.click()
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function waitForProjectNoteboardFrame (page: Page): Promise<Locator> {
  const frame = page.locator(`[data-test-locator="${selectorList.nbFrame}"]`)
  await expect(frame).toHaveCount(1, {
    timeout: PROJECT_NOTEBOARD_READY_MS
  })
  const title = frame.locator(`[data-test-locator="${selectorList.nbTitle}"]`)
  await expect(title).toHaveText(noteboardMessages.title)
  await page.waitForTimeout(FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + 100)
  const editor = frame.locator(`[data-test-locator="${selectorList.nbEditor}"]`)
  await expect(editor).toBeVisible()
  return frame
}

function interpolateFaProjectSessionNotify (template: string, projectName: string): string {
  return template.split('{projectName}').join(projectName)
}

function assertE2eFaprojectFixtureHasContentOnDisk (baseName: string): void {
  const absolutePath = getE2eFaprojectFixtureAbsolutePath(baseName)
  expect(fs.existsSync(absolutePath)).toBe(true)
  const stat = fs.statSync(absolutePath)
  expect(stat.isFile()).toBe(true)
  expect(stat.size).toBeGreaterThan(0)
}

async function readActiveProjectNoteboardTextFromBridge (page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.getProjectNoteboard !== 'function') {
      return null
    }
    const r = await api.getProjectNoteboard()
    return r.text
  })
}

async function expectActiveProjectNoteboardTextInDatabaseEventually (
  page: Page,
  expected: string,
  timeoutMs = 20_000
): Promise<void> {
  await expect.poll(async () => {
    return await readActiveProjectNoteboardTextFromBridge(page)
  }, { timeout: timeoutMs }).toBe(expected)
}

/**
 * Same rhythm as checkAppNoteboard: focus editor, set body, wait noteboardTextPersistSettleMs for debounced IPC (380 ms) plus slack.
 * Project noteboard uses a native textarea — prefer fill() so Playwright emits real input events the Vue v-model/Pinia path accepts; synthetic Event-only updates can leave store text empty so SQLite never receives edits.
 */
async function fillProjectNoteboardEditorPersist (editor: Locator, text: string, page: Page): Promise<void> {
  await editor.click()
  await editor.fill(text)
  await expect(editor).toHaveValue(text, { timeout: 10_000 })
  await page.waitForTimeout(noteboardTextPersistSettleMs)
  await expectActiveProjectNoteboardTextInDatabaseEventually(page, text)
  await page.waitForTimeout(e2ePostTypingSettleMs)
}

function assertCloseToPx (actual: number, expected: number, label: string, tolerancePx: number): void {
  expect(
    Math.abs(actual - expected),
    `${label}: expected approximately ${expected}, received ${actual}`
  ).toBeLessThanOrEqual(tolerancePx)
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
  dragLocatorValue: typeof selectorList.nbDrag,
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
    return await readRoundedBoundingBoxForLocator(frame)
  }, { timeout: 10_000 }).toMatchObject({
    h: targetFrameMinSizePx,
    w: targetFrameMinSizePx
  })

  const parked = await readRoundedBoundingBoxForLocator(frame)

  if (corner === 'bottomRight') {
    assertCloseToPx(
      parked.x + parked.w,
      viewportMetrics.iw - defaultFloatingLayout.marginRightPx,
      'project noteboard right edge after bottom-right parking',
      6
    )
    assertCloseToPx(
      parked.y + parked.h,
      viewportMetrics.ih - defaultFloatingLayout.marginBottomPx,
      'project noteboard bottom edge after bottom-right parking',
      6
    )
  } else {
    assertCloseToPx(parked.x, defaultFloatingLayout.marginLeftPx, 'project noteboard left edge after top-left parking', 5)
    assertCloseToPx(parked.y, defaultFloatingLayout.marginTopPx, 'project noteboard top edge after top-left parking', 5)
  }

  return parked
}

/**
 * Creates the companion `.faproject` from Project → Create new project so the path override matches `PROJECT_NOTEBOARD_E2E_COMPANION_FAPROJECT`.
 */
async function createCompanionProjectForNoteboardIsolation (
  electron: ElectronApplication,
  appWin: Page
): Promise<void> {
  await e2eSetNextProjectCreatePath(electron, PROJECT_NOTEBOARD_E2E_COMPANION_FAPROJECT)
  await openProjectMenu(appWin)
  await appWin.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
  await expect(appWin.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
  await appWin.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`).fill(
    PROJECT_NOTEBOARD_E2E_COMPANION_DISPLAY_NAME
  )
  await appWin.waitForTimeout(e2ePostTypingSettleMs)
  await appWin.locator(`[data-test-locator="${selectorList.dialogCreateBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(appWin, PROJECT_NOTEBOARD_E2E_COMPANION_DISPLAY_NAME)
  await expect(appWin.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    PROJECT_NOTEBOARD_E2E_COMPANION_DISPLAY_NAME
  ))).toBeVisible()
  await dismissOpenMenus(appWin)
}

async function loadBaselineProjectViaMenu (electronApp: ElectronApplication, appWin: Page): Promise<void> {
  await e2eSetNextProjectOpenPath(electronApp, PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT)
  await openProjectMenu(appWin)
  await appWin.getByRole('menuitem', { name: projectMenu.items.loadProject }).click()
  await dismissOpenMenus(appWin)
  await e2eExpectFaActiveProjectStoreName(appWin, PROJECT_NOTEBOARD_E2E_BASELINE_DISPLAY_NAME)
  await expect(appWin.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectLoaded,
    PROJECT_NOTEBOARD_E2E_BASELINE_DISPLAY_NAME
  ))).toBeVisible()
}

async function toggleProjectNoteboardFromMenu (appWin: Page): Promise<void> {
  await openProjectMenu(appWin)
  const row = appWin.getByRole('menuitem', {
    exact: false,
    name: projectMenu.items.toggleProjectNoteboard
  })
  await expect(row).toBeEnabled()
  await row.click()
  await dismissOpenMenus(appWin)
}

test.describe.serial('Project noteboard E2E — fresh Playwright profile: resize, park geometry, persist notes, toggle window', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({ timeout: 180_000 })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture(PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT)
        tryUnlinkE2eFaprojectFixture(PROJECT_NOTEBOARD_E2E_COMPANION_FAPROJECT)
      },
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: true,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
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
   * With no `.faproject` loaded, Toggle Project Noteboard must stay disabled because project-scoped UI has nothing to attach to.
   */
  test('Project menu disables Toggle Project Noteboard until a project is active', async () => {
    await openProjectMenu(appWindow)
    const row = appWindow.getByRole('menuitem', {
      exact: false,
      name: projectMenu.items.toggleProjectNoteboard
    })
    await expect(row).toBeVisible()
    await expect(row).toBeDisabled()
    await dismissOpenMenus(appWindow)
  })

  /**
   * Shrinks the floating window to minimum size, drags it to the top-left clamp, saves multi-line notes to the baseline SQLite file, then hides and reopens with the global shortcut and asserts geometry and text round-trip before Close.
   */
  test('Baseline project: minimum-size noteboard, parked top-left geometry, persisted textarea, survives toggle hide', async () => {
    await e2eSetNextProjectCreatePath(electronApp, PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT)
    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`)
    ).toBeVisible()
    await appWindow.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`).fill(
      PROJECT_NOTEBOARD_E2E_BASELINE_DISPLAY_NAME
    )
    await appWindow.waitForTimeout(e2ePostTypingSettleMs)
    await appWindow.locator(`[data-test-locator="${selectorList.dialogCreateBtn}"]`).click()
    await expect(appWindow.locator('[data-test-locator="mainLayout-activeProjectName"]')).toBeVisible({
      timeout: 20_000
    })
    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT)

    await toggleProjectNoteboardFromMenu(appWindow)
    let frame = await waitForProjectNoteboardFrame(appWindow)

    await resizeFloatingFrameTowardMinSquare(appWindow, frame)

    const viewportLayout = await readExpectedFloatingOpenLayoutFromViewport(appWindow)
    savedBaselineParkedNoteboardGeom = await dragMinFloaterToCorner(
      appWindow,
      frame,
      selectorList.nbDrag,
      {
        ih: viewportLayout.ih,
        iw: viewportLayout.iw
      },
      'topLeft'
    )

    await appWindow.waitForTimeout(FLOATING_FRAME_PERSIST_SETTLE_MS)

    const editor = frame.locator(`[data-test-locator="${selectorList.nbEditor}"]`)
    await fillProjectNoteboardEditorPersist(editor, PROJECT_NOTEBOARD_E2E_BASELINE_NOTE_SAMPLE, appWindow)

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_PROJECT_NOTEBOARD)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nbFrame}"]`)
    ).toHaveCount(0, {
      timeout: 15_000
    })

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_TOGGLE_PROJECT_NOTEBOARD)
    frame = await waitForProjectNoteboardFrame(appWindow)
    await expect(frame.locator(`[data-test-locator="${selectorList.nbEditor}"]`)).toHaveValue(
      PROJECT_NOTEBOARD_E2E_BASELINE_NOTE_SAMPLE,
      {
        timeout: 15_000
      }
    )

    const afterToggleParked = await readRoundedBoundingBoxForLocator(frame)
    assertCloseToPx(
      afterToggleParked.x,
      savedBaselineParkedNoteboardGeom.x,
      'baseline project noteboard restored left after toggle hide',
      5
    )
    assertCloseToPx(
      afterToggleParked.y,
      savedBaselineParkedNoteboardGeom.y,
      'baseline project noteboard restored top after toggle hide',
      5
    )
    assertCloseToPx(
      afterToggleParked.w,
      savedBaselineParkedNoteboardGeom.w,
      'baseline project noteboard restored width after toggle hide',
      5
    )
    assertCloseToPx(
      afterToggleParked.h,
      savedBaselineParkedNoteboardGeom.h,
      'baseline project noteboard restored height after toggle hide',
      5
    )

    await appWindow.locator(`[data-test-locator="${selectorList.nbCloseButton}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.nbFrame}"]`)).toHaveCount(0, {
      timeout: 15_000
    })

    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT)
  })
})

/**
 * Cold-launches Electron again on the same Playwright `userData` (`resetUserData` false) without deleting the `.faproject` files written in the first serial group.
 */
test.describe.serial('Project noteboard E2E — cold restart: companion project notes do not overwrite baseline SQLite', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({ timeout: 180_000 })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      dismissStartupTips: true,
      renderDelayMs: FA_FRONTEND_RENDER_TIMER,
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
      suiteTestInfo,
      afterClose (): void {
        tryUnlinkE2eFaprojectFixture(PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT)
        tryUnlinkE2eFaprojectFixture(PROJECT_NOTEBOARD_E2E_COMPANION_FAPROJECT)
      }
    })
  })

  /**
   * Opens the baseline `.faproject`, creates the companion project and saves different note text there, loads the baseline file again, and expects the baseline textarea and parked bounding box from the first serial group—not the companion strings.
   */
  test('Cold restart: baseline load, type notes on companion project, reload baseline restores parked frame and baseline notes only', async () => {
    await expect(
      appWindow.locator('.appHeader'),
      'Expect MainLayout chrome on the rewarmed profile.'
    ).toBeVisible({
      timeout: SPLASH_SHELL_TIMEOUT_MS
    })

    await e2eSetNextProjectOpenPath(electronApp, PROJECT_NOTEBOARD_E2E_BASELINE_FAPROJECT)
    await appWindow.locator(`[data-test-locator="${selectorList.splashLoad}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, PROJECT_NOTEBOARD_E2E_BASELINE_DISPLAY_NAME)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      PROJECT_NOTEBOARD_E2E_BASELINE_DISPLAY_NAME
    ))).toBeVisible()

    await createCompanionProjectForNoteboardIsolation(electronApp, appWindow)
    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_NOTEBOARD_E2E_COMPANION_FAPROJECT)

    await toggleProjectNoteboardFromMenu(appWindow)
    const companionFrame = await waitForProjectNoteboardFrame(appWindow)
    const companionEditor = companionFrame.locator(`[data-test-locator="${selectorList.nbEditor}"]`)
    await fillProjectNoteboardEditorPersist(
      companionEditor,
      PROJECT_NOTEBOARD_E2E_COMPANION_NOTE_SAMPLE,
      appWindow
    )

    await loadBaselineProjectViaMenu(electronApp, appWindow)
    await appWindow.waitForTimeout(
      FLOATING_FRAME_PERSIST_SETTLE_MS +
        FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS +
        noteboardTextPersistSettleMs
    )

    const baselineFrame = await waitForProjectNoteboardFrame(appWindow)

    await expectActiveProjectNoteboardTextInDatabaseEventually(appWindow, PROJECT_NOTEBOARD_E2E_BASELINE_NOTE_SAMPLE)
    await expect(baselineFrame.locator(`[data-test-locator="${selectorList.nbEditor}"]`)).toHaveValue(
      PROJECT_NOTEBOARD_E2E_BASELINE_NOTE_SAMPLE,
      {
        timeout: 15_000
      }
    )

    const restored = await readRoundedBoundingBoxForLocator(baselineFrame)
    assertCloseToPx(
      restored.x,
      savedBaselineParkedNoteboardGeom.x,
      'baseline project noteboard left after reload',
      6
    )
    assertCloseToPx(
      restored.y,
      savedBaselineParkedNoteboardGeom.y,
      'baseline project noteboard top after reload',
      6
    )
    assertCloseToPx(
      restored.w,
      savedBaselineParkedNoteboardGeom.w,
      'baseline project noteboard width after reload',
      6
    )
    assertCloseToPx(
      restored.h,
      savedBaselineParkedNoteboardGeom.h,
      'baseline project noteboard height after reload',
      6
    )

    await baselineFrame.locator(`[data-test-locator="${selectorList.nbCloseButton}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.nbFrame}"]`)).toHaveCount(0, {
      timeout: 15_000
    })
  })
})
