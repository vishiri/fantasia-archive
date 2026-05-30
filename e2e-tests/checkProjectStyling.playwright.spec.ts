import fs from 'node:fs'

import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { e2eExpectFaActiveProjectStoreName } from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  navigateFaPlaywrightE2eToHomeRoute,
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  e2eSetNextProjectCreatePath,
  e2eSetNextProjectOpenPath,
  getE2eFaprojectFixtureAbsolutePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { getFaPlaywrightMonacoSelectAllPressString } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_newProject from 'app/i18n/en-US/dialogs/L_newProject'
import projectStylingMessages from 'app/i18n/en-US/floatingWindows/L_projectStyling'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

import { FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS } from 'app/src/scripts/floatingWindows/functions/faQuasarDialogStandardTransition'

/**
 * Extra env settings to trigger isolated E2E profile.
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e'
}

const MENU_ANIMATION_MS = 600
/**
 * Mirrors production debounced project-styling KV writes (380 ms) plus IPC slack.
 */
const projectStylingDebouncedKvSlackMs = 900

const SPLASH_SHELL_TIMEOUT_MS = 20_000
const PROJECT_STYLING_READY_MS = 30_000
const MONACO_MOUNT_SETTLE_MS = 2500

const e2ePostTypingSettleMs = 1_000

/**
 * Baseline `.faproject` basename under isolated Playwright userData: the first serial group creates this file and runs live preview, SQLite persistence, and clearing Custom Project CSS.
 */
const PROJECT_STYLING_E2E_BASELINE_FAPROJECT = 'e2e-project-styling-baseline.faproject'

/**
 * Companion `.faproject` basename: the second serial group creates this file after reopening the baseline project, saves Custom Project CSS only here, then switches back to prove the baseline SQLite row stayed empty.
 */
const PROJECT_STYLING_E2E_COMPANION_FAPROJECT = 'e2e-project-styling-companion.faproject'

const PROJECT_STYLING_E2E_BASELINE_DISPLAY_NAME = 'E2E Custom Project CSS baseline'
const PROJECT_STYLING_E2E_COMPANION_DISPLAY_NAME = 'E2E Custom Project CSS companion'

/**
 * Same zoom snippets as Custom app CSS E2E; project rules apply via '#faProjectUserCss' injection order (after app chrome).
 */
const projectStylingZoomSnippet08 = 'body {zoom:0.8;};'

const projectStylingZoomSnippet09 = 'body {zoom:0.9;};'

/**
 * Chromium reports an unset body zoom as '1' once author 'zoom' is removed from injected project CSS.
 */
const bodyZoomNoneExpected = '1'

const bodyZoomLivePreviewExpected = '0.8'

const bodyZoomAfterSaveExpected = '0.9'

const selectorList = {
  dialogCreateBtn: 'dialogNewProject-button-create',
  dialogNameInput: 'dialogNewProject-input-name',
  projectStylingEditorHost: 'windowProjectStyling-editorHost',
  projectStylingFrame: 'windowProjectStyling-frame',
  projectStylingSave: 'windowProjectStyling-button-save',
  projectStylingTitle: 'windowProjectStyling-title',
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
  await expect(trigger).toBeVisible({
    timeout: SPLASH_SHELL_TIMEOUT_MS
  })
  await trigger.click()
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function openProjectCustomCssFromMenu (page: Page): Promise<void> {
  await openProjectMenu(page)
  const row = page.getByRole('menuitem', {
    exact: false,
    name: projectMenu.items.openProjectCustomCss
  })
  await expect(row).toBeVisible()
  await row.click()
  await dismissOpenMenus(page)
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

async function waitForMonacoEditorMount (page: Page): Promise<void> {
  const host = page.locator(`[data-test-locator="${selectorList.projectStylingEditorHost}"]`)
  await expect(host).toHaveCount(1)
  await expect(async () => {
    const handle = await host.elementHandle()
    if (handle === null) {
      throw new Error('project styling editor host detached before Monaco mount')
    }
    const childCount = await handle.evaluate((node: Element) => node.childElementCount)
    expect(childCount).toBeGreaterThan(0)
  }).toPass({ timeout: 15_000 })
}

async function waitForProjectStylingWindow (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.projectStylingFrame}"]`)
  await expect(frame).toHaveCount(1, {
    timeout: PROJECT_STYLING_READY_MS
  })
  const title = frame.locator(`[data-test-locator="${selectorList.projectStylingTitle}"]`)
  await expect(title).toHaveCount(1)
  await expect(title).toHaveText(projectStylingMessages.title)
  await page.waitForTimeout(MONACO_MOUNT_SETTLE_MS)
  await waitForMonacoEditorMount(page)
}

async function replaceMonacoText (page: Page, nextText: string): Promise<void> {
  const editor = page.locator('.windowProjectStyling .monaco-editor')
  await editor.click()
  await page.keyboard.press(getFaPlaywrightMonacoSelectAllPressString())
  if (nextText.length > 0) {
    await page.keyboard.type(nextText)
  } else {
    await page.keyboard.press('Backspace')
  }
}

async function saveProjectStylingWindow (page: Page): Promise<void> {
  const frame = page.locator(`[data-test-locator="${selectorList.projectStylingFrame}"]`)
  await frame.locator(`[data-test-locator="${selectorList.projectStylingSave}"]`).click()
  await expect(frame).toHaveCount(0, { timeout: 15_000 })
}

async function readBodyZoom (page: Page): Promise<string> {
  return await page.evaluate(() => {
    const raw = window.getComputedStyle(document.body).zoom
    return raw === '' ? bodyZoomNoneExpected : raw
  })
}

async function readActiveProjectCssFromBridge (page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.getProjectStyling !== 'function') {
      return null
    }
    const r = await api.getProjectStyling()
    return r.css
  })
}

/**
 * Creates the companion `.faproject` from the Project menu so the path override matches `PROJECT_STYLING_E2E_COMPANION_FAPROJECT`.
 */
async function createCompanionProjectForPerProjectIsolation (electron: ElectronApplication, appWin: Page): Promise<void> {
  await e2eSetNextProjectCreatePath(electron, PROJECT_STYLING_E2E_COMPANION_FAPROJECT)
  await openProjectMenu(appWin)
  await appWin.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
  await expect(appWin.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
  await appWin.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`).fill(
    PROJECT_STYLING_E2E_COMPANION_DISPLAY_NAME
  )
  await appWin.waitForTimeout(e2ePostTypingSettleMs)
  await appWin.locator(`[data-test-locator="${selectorList.dialogCreateBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(appWin, PROJECT_STYLING_E2E_COMPANION_DISPLAY_NAME)
  await expect(appWin.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    PROJECT_STYLING_E2E_COMPANION_DISPLAY_NAME
  ))).toBeVisible()
  await dismissOpenMenus(appWin)
}

async function loadNamedProjectViaMenu (
  electronApp: ElectronApplication,
  appWin: Page,
  fixtureBaseName: string,
  displayName: string
): Promise<void> {
  await e2eSetNextProjectOpenPath(electronApp, fixtureBaseName)
  await openProjectMenu(appWin)
  await appWin.getByRole('menuitem', { name: projectMenu.items.loadProject }).click()
  await dismissOpenMenus(appWin)
  await e2eExpectFaActiveProjectStoreName(appWin, displayName)
  await expect(appWin.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectLoaded,
    displayName
  ))).toBeVisible()
}

test.describe.serial('Custom Project CSS E2E — fresh Playwright profile: Monaco, SQLite, and clearing the stylesheet', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({ timeout: 180_000 })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture(PROJECT_STYLING_E2E_BASELINE_FAPROJECT)
        tryUnlinkE2eFaprojectFixture(PROJECT_STYLING_E2E_COMPANION_FAPROJECT)
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
   * With no project loaded yet, the Project menu must disable Custom Project CSS because there is no active SQLite file to read or write.
   */
  test('Project menu keeps Custom Project CSS disabled until an active `.faproject` session exists', async () => {
    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await openProjectMenu(appWindow)
    const row = appWindow.getByRole('menuitem', {
      exact: false,
      name: projectMenu.items.openProjectCustomCss
    })
    await expect(row).toBeVisible()
    await expect(row).toBeDisabled()
    await dismissOpenMenus(appWindow)
  })

  /**
   * Walks the baseline `.faproject` through: **Create new project**, open Custom Project CSS, Monaco live preview (body zoom), Save to persist in SQLite, reopen and save an empty editor to clear stored CSS, then assert bridge reads back an empty string.
   */
  test('Create new project: Custom Project CSS live preview, Save persists body zoom to SQLite, then Save with empty editor clears stored CSS', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await e2eSetNextProjectCreatePath(electronApp, PROJECT_STYLING_E2E_BASELINE_FAPROJECT)
    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`)
    ).toBeVisible()
    await appWindow.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`).fill(
      PROJECT_STYLING_E2E_BASELINE_DISPLAY_NAME
    )
    await appWindow.waitForTimeout(e2ePostTypingSettleMs)
    await appWindow.locator(`[data-test-locator="${selectorList.dialogCreateBtn}"]`).click()
    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, PROJECT_STYLING_E2E_BASELINE_DISPLAY_NAME)

    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectCreated,
      PROJECT_STYLING_E2E_BASELINE_DISPLAY_NAME
    ))).toBeVisible()

    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_STYLING_E2E_BASELINE_FAPROJECT)

    await openProjectCustomCssFromMenu(appWindow)
    await waitForProjectStylingWindow(appWindow)

    await replaceMonacoText(appWindow, projectStylingZoomSnippet08)
    await appWindow.waitForTimeout(projectStylingDebouncedKvSlackMs)

    await expect.poll(async () => await readBodyZoom(appWindow), {
      timeout: 15_000
    }).toBe(bodyZoomLivePreviewExpected)

    await replaceMonacoText(appWindow, projectStylingZoomSnippet09)
    await saveProjectStylingWindow(appWindow)
    await appWindow.waitForTimeout(projectStylingDebouncedKvSlackMs)

    await expect.poll(async () => await readBodyZoom(appWindow), {
      timeout: 15_000
    }).toBe(bodyZoomAfterSaveExpected)

    await openProjectCustomCssFromMenu(appWindow)
    await waitForProjectStylingWindow(appWindow)

    await replaceMonacoText(appWindow, '')
    await saveProjectStylingWindow(appWindow)

    await expect.poll(async () => await readBodyZoom(appWindow), {
      timeout: 15_000
    }).toBe(bodyZoomNoneExpected)

    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_STYLING_E2E_BASELINE_FAPROJECT)

    await expect.poll(async () => await readActiveProjectCssFromBridge(appWindow), {
      timeout: 20_000
    }).toBe('')
  })
})

/**
 * Reuses the same Playwright `userData` as the first serial group (`resetUserData` false) so we exercise a warm app while switching `.faproject` files.
 */
test.describe.serial('Custom Project CSS E2E — warm app session: per-project SQLite styling does not leak across projects', () => {
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
        tryUnlinkE2eFaprojectFixture(PROJECT_STYLING_E2E_BASELINE_FAPROJECT)
        tryUnlinkE2eFaprojectFixture(PROJECT_STYLING_E2E_COMPANION_FAPROJECT)
      }
    })
  })

  /**
   * Loads the baseline project (still no saved Custom CSS after the first serial group), creates a companion project, saves a different body zoom only on the companion, then switches projects and checks computed body zoom plus `getProjectStyling().css` for each.
   */
  test('Saving Custom Project CSS on one .faproject leaves another .faproject default zoom and empty stored CSS', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)

    await e2eSetNextProjectOpenPath(electronApp, PROJECT_STYLING_E2E_BASELINE_FAPROJECT)
    await appWindow.locator(`[data-test-locator="${selectorList.splashLoad}"]`).click()

    await e2eExpectFaActiveProjectStoreName(appWindow, PROJECT_STYLING_E2E_BASELINE_DISPLAY_NAME)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      PROJECT_STYLING_E2E_BASELINE_DISPLAY_NAME
    ))).toBeVisible()

    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await createCompanionProjectForPerProjectIsolation(electronApp, appWindow)
    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_STYLING_E2E_COMPANION_FAPROJECT)

    await openProjectCustomCssFromMenu(appWindow)
    await waitForProjectStylingWindow(appWindow)

    await replaceMonacoText(appWindow, projectStylingZoomSnippet08)
    await expect.poll(async () => await readBodyZoom(appWindow), {
      timeout: 15_000
    }).toBe(bodyZoomLivePreviewExpected)

    await replaceMonacoText(appWindow, projectStylingZoomSnippet09)
    await saveProjectStylingWindow(appWindow)
    await appWindow.waitForTimeout(projectStylingDebouncedKvSlackMs)

    await expect.poll(async () => await readBodyZoom(appWindow), {
      timeout: 15_000
    }).toBe(bodyZoomAfterSaveExpected)

    await loadNamedProjectViaMenu(
      electronApp,
      appWindow,
      PROJECT_STYLING_E2E_BASELINE_FAPROJECT,
      PROJECT_STYLING_E2E_BASELINE_DISPLAY_NAME
    )

    await appWindow.waitForTimeout(
      MENU_ANIMATION_MS + FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + projectStylingDebouncedKvSlackMs
    )

    await expect.poll(async () => await readBodyZoom(appWindow), {
      timeout: 20_000
    }).toBe(bodyZoomNoneExpected)

    await expect.poll(async () => await readActiveProjectCssFromBridge(appWindow), {
      timeout: 20_000
    }).toBe('')

    await loadNamedProjectViaMenu(
      electronApp,
      appWindow,
      PROJECT_STYLING_E2E_COMPANION_FAPROJECT,
      PROJECT_STYLING_E2E_COMPANION_DISPLAY_NAME
    )

    await appWindow.waitForTimeout(
      MENU_ANIMATION_MS + FA_QUASAR_DIALOG_STANDARD_TRANSITION_MS + projectStylingDebouncedKvSlackMs
    )

    await expect.poll(async () => await readBodyZoom(appWindow), {
      timeout: 20_000
    }).toBe(bodyZoomAfterSaveExpected)

    await expect.poll(async () => await readActiveProjectCssFromBridge(appWindow), {
      timeout: 20_000
    }).toBe(projectStylingZoomSnippet09)
  })
})
