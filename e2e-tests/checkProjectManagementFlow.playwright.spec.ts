import fs from 'node:fs'

import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreEmpty,
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  e2eSetNextProjectCreatePath,
  e2eSetNextProjectOpenPath,
  getE2eFaprojectFixtureAbsolutePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_newProject from 'app/i18n/en-US/dialogs/L_newProject'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

/**
 * Extra env settings to trigger E2E via Playwright (isolated userData, dialog path overrides).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  closeBtn: 'dialogNewProject-button-close',
  createBtn: 'dialogNewProject-button-create',
  globalLanguageSelectorOptionDe: 'globalLanguageSelector-option-de',
  globalLanguageSelectorOptionEnUs: 'globalLanguageSelector-option-en-US',
  globalLanguageSelectorSpellcheckRefresh: 'globalLanguageSelector-spellcheckRefresh',
  globalLanguageSelectorTrigger: 'globalLanguageSelector-trigger',
  nameInput: 'dialogNewProject-input-name',
  submenuItemSubMenu: 'AppControlSingleMenu-menuItem-subMenu',
  submenuItemSubMenuItem: 'AppControlSingleMenu-menuItem-subMenu-item',
  submenuItemSubMenuItemText: 'AppControlSingleMenu-menuItem-subMenu-item-text',
  splashLoad: 'splashPage-btn-load',
  splashNew: 'splashPage-btn-new'
} as const

/** Quasar menu open / nested submenu animation slack (see AppControlSingleMenu Playwright specs). */
const MENU_ANIMATION_MS = 600

/** Display name for the `.faproject` created via Project → Create new project in this suite (MRU and load flows). */
const E2E_PROJECT_DISPLAY_MENU_NEW = 'E2E project from Project menu Create new project'

/** Display name for the `.faproject` created via splash welcome Create new project in this suite. */
const E2E_PROJECT_DISPLAY_SPLASH_NEW = 'E2E project from splash Create new project'

/** Eleven successive creates to exercise MRU cap 10 (entries 02–11 remain; 01 evicted). */
const E2E_RECENT_CAP_TOTAL = 11

function recentCapFixtureBaseName (index1Based: number): string {
  return `e2e-recent-cap-${String(index1Based).padStart(2, '0')}.faproject`
}

function recentCapDisplayName (index1Based: number): string {
  return `E2E MRU cap exercise project ${String(index1Based).padStart(2, '0')}`
}

function unlinkAllE2eRecentCapFixtures (): void {
  for (let i = 1; i <= E2E_RECENT_CAP_TOTAL; i++) {
    tryUnlinkE2eFaprojectFixture(recentCapFixtureBaseName(i))
  }
}

/**
 * Newest-first labels after 11 capped prepends: 11 … 02 (01 dropped).
 */
function expectedRecentCapLabelsAfterElevenCreates (): string[] {
  const out: string[] = []
  for (let n = E2E_RECENT_CAP_TOTAL; n >= 2; n--) {
    out.push(recentCapDisplayName(n))
  }
  return out
}

/**
 * After removing missing-file 11 from MRU: 10 … 02 (nine rows).
 */
function expectedRecentCapLabelsAfterMissingFilePruned (): string[] {
  const out: string[] = []
  for (let n = E2E_RECENT_CAP_TOTAL - 1; n >= 2; n--) {
    out.push(recentCapDisplayName(n))
  }
  return out
}

async function dismissOpenMenus (page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
}

async function openProjectMenu (page: Page): Promise<void> {
  await dismissOpenMenus(page)
  await page.getByRole('button', {
    exact: true,
    name: projectMenu.title
  }).click()
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function openLoadRecentSubmenu (page: Page): Promise<void> {
  await page.getByRole('menuitem', { name: projectMenu.items.loadRecentProject }).hover({ force: true })
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function expectLoadRecentSubmenuLabels (
  page: Page,
  firstLabel: string,
  secondLabel: string
): Promise<void> {
  await expectLoadRecentSubmenuLabelsOrdered(page, [firstLabel, secondLabel])
}

async function expectLoadRecentSubmenuLabelsOrdered (
  page: Page,
  expectedLabelsNewestFirst: readonly string[]
): Promise<void> {
  const panel = page.locator(`[data-test-locator="${selectorList.submenuItemSubMenu}"]`).last()
  const items = panel.locator(`[data-test-locator="${selectorList.submenuItemSubMenuItem}"]`)
  await expect(items).toHaveCount(expectedLabelsNewestFirst.length)
  for (let i = 0; i < expectedLabelsNewestFirst.length; i++) {
    await expect(
      items.nth(i).locator(`[data-test-locator="${selectorList.submenuItemSubMenuItemText}"] span`)
    ).toHaveText(expectedLabelsNewestFirst[i]!)
  }
}

async function createProjectViaMenu (
  appWin: Page,
  electron: ElectronApplication,
  projectName: string,
  fixtureBaseName: string
): Promise<void> {
  await e2eSetNextProjectCreatePath(electron, fixtureBaseName)
  await appWin.getByRole('button', {
    exact: true,
    name: projectMenu.title
  }).click()
  await appWin.waitForTimeout(MENU_ANIMATION_MS)
  await appWin.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
  await expect(appWin.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
  await appWin.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(projectName)
  await appWin.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(appWin, projectName)
  await expect(appWin.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    projectName
  ))).toBeVisible()
}

function interpolateFaProjectSessionNotify (
  template: string,
  projectName: string
): string {
  return template.split('{projectName}').join(projectName)
}

/**
 * SQLite **.faproject** files must exist on disk and be non-empty after a successful creation flow (schema + migrations).
 */
function assertE2eCreatedFaprojectFileExistsWithContent (baseName: string): void {
  const absolutePath = getE2eFaprojectFixtureAbsolutePath(baseName)
  expect(fs.existsSync(absolutePath)).toBe(true)
  const stat = fs.statSync(absolutePath)
  expect(stat.isFile()).toBe(true)
  expect(stat.size).toBeGreaterThan(0)
}

test.describe.serial('Project management flow', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture('e2e-splash-project.faproject')
        tryUnlinkE2eFaprojectFixture('e2e-menu-project.faproject')
        unlinkAllE2eRecentCapFixtures()
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
      async afterClose (): Promise<void> {
        tryUnlinkE2eFaprojectFixture('e2e-splash-project.faproject')
        tryUnlinkE2eFaprojectFixture('e2e-menu-project.faproject')
        unlinkAllE2eRecentCapFixtures()
      },
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * **DialogNewProject** must clear stale typing when reopened after dismissal without creation.
   */
  test('DialogNewProject resets the name field after close without creating', async () => {
    const nameField = appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)

    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(nameField).toBeVisible()
    await expect(nameField).toHaveValue('')
    await nameField.fill('E2E discarded project name typing')
    await appWindow.locator(`[data-test-locator="${selectorList.closeBtn}"]`).click()
    await expect(appWindow.locator('#dialogNewProject-title')).toBeHidden()

    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(nameField).toBeVisible()
    await expect(nameField).toHaveValue('')
    await appWindow.locator(`[data-test-locator="${selectorList.closeBtn}"]`).click()
    await expect(appWindow.locator('#dialogNewProject-title')).toBeHidden()
  })

  /**
   * Creates a new `.faproject` from the splash welcome **Create new project** control and verifies session plus creation toast.
   */
  test('creates a .faproject from the splash Create new project control', async () => {
    await e2eSetNextProjectCreatePath(electronApp, 'e2e-splash-project.faproject')
    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(E2E_PROJECT_DISPLAY_SPLASH_NEW)
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_SPLASH_NEW)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectCreated,
      E2E_PROJECT_DISPLAY_SPLASH_NEW
    ))).toBeVisible()
    assertE2eCreatedFaprojectFileExistsWithContent('e2e-splash-project.faproject')
  })

  /**
   * Opens **Project → Create new project**, creates a second fixture, and verifies the active project switches to the menu-created display name.
   */
  test('opens Create new project from the Project menu and creates a file', async () => {
    await e2eSetNextProjectCreatePath(electronApp, 'e2e-menu-project.faproject')
    const projectTitle = projectMenu.title
    await appWindow.getByRole('button', {
      exact: true,
      name: projectTitle
    }).click()
    await appWindow.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
    await expect(appWindow.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(E2E_PROJECT_DISPLAY_MENU_NEW)
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_MENU_NEW)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectCreated,
      E2E_PROJECT_DISPLAY_MENU_NEW
    ))).toBeVisible()
    assertE2eCreatedFaprojectFileExistsWithContent('e2e-menu-project.faproject')
  })

  /**
   * Stages the splash-created fixture path, uses the splash **Load existing project** button, and expects that project's display name plus loaded toast.
   */
  test('loads an existing .faproject from the splash Load existing project control', async () => {
    await e2eSetNextProjectOpenPath(electronApp, 'e2e-splash-project.faproject')
    await appWindow.locator(`[data-test-locator="${selectorList.splashLoad}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_SPLASH_NEW)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      E2E_PROJECT_DISPLAY_SPLASH_NEW
    ))).toBeVisible()
  })

  /**
   * Stages the menu-created fixture path, opens **Project → Load existing project**, and expects that project's display name plus loaded toast.
   */
  test('loads an existing .faproject from the Project menu', async () => {
    await e2eSetNextProjectOpenPath(electronApp, 'e2e-menu-project.faproject')
    const projectTitle = projectMenu.title
    await appWindow.getByRole('button', {
      exact: true,
      name: projectTitle
    }).click()
    await appWindow.getByRole('menuitem', { name: projectMenu.items.loadProject }).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_MENU_NEW)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      E2E_PROJECT_DISPLAY_MENU_NEW
    ))).toBeVisible()
  })

  /**
   * Loading the file that is already the active session should surface one clear error toast, not reload the project.
   */
  test('Load existing project rejects opening the currently active file again', async () => {
    await e2eSetNextProjectOpenPath(electronApp, 'e2e-menu-project.faproject')
    const projectTitle = projectMenu.title
    await appWindow.getByRole('button', {
      exact: true,
      name: projectTitle
    }).click()
    await appWindow.getByRole('menuitem', { name: projectMenu.items.loadProject }).click()

    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_MENU_NEW)
    await expect(appWindow.getByText(L_faProjectSession.openRejectedAlreadyActive)).toBeVisible()
  })

  /**
   * **Load recent project**: MRU order matches the session, opens reorder the list, the active file cannot be opened again from the list,
   * spellcheck refresh after a language round-trip clears the main-process session, and the top MRU entry loads again cleanly.
   */
  test('Load recent project submenu orders MRU, switches active session, warns on duplicate open, clears after reload, and reopens', async () => {
    await openProjectMenu(appWindow)
    const loadRecentRow = appWindow.getByRole('menuitem', { name: projectMenu.items.loadRecentProject })
    await expect(loadRecentRow).toBeEnabled()
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabels(
      appWindow,
      E2E_PROJECT_DISPLAY_MENU_NEW,
      E2E_PROJECT_DISPLAY_SPLASH_NEW
    )

    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_DISPLAY_SPLASH_NEW }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_SPLASH_NEW)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      E2E_PROJECT_DISPLAY_SPLASH_NEW
    ))).toBeVisible()

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabels(
      appWindow,
      E2E_PROJECT_DISPLAY_SPLASH_NEW,
      E2E_PROJECT_DISPLAY_MENU_NEW
    )

    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_DISPLAY_MENU_NEW }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_MENU_NEW)

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabels(
      appWindow,
      E2E_PROJECT_DISPLAY_MENU_NEW,
      E2E_PROJECT_DISPLAY_SPLASH_NEW
    )
    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_DISPLAY_MENU_NEW }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_MENU_NEW)
    await expect(
      appWindow.getByText(L_faProjectSession.openRejectedAlreadyActive).first()
    ).toBeVisible()

    await appWindow.locator(`[data-test-locator="${selectorList.globalLanguageSelectorTrigger}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.globalLanguageSelectorOptionDe}"]`).click()
    await expect(appWindow.locator('[data-test-locator="globalLanguageSelector-root"]')).toHaveAttribute(
      'data-test-active-language-code',
      'de',
      { timeout: 15_000 }
    )

    await appWindow.locator(`[data-test-locator="${selectorList.globalLanguageSelectorTrigger}"]`).click()
    await appWindow.locator(`[data-test-locator="${selectorList.globalLanguageSelectorOptionEnUs}"]`).click()
    await expect(appWindow.locator('[data-test-locator="globalLanguageSelector-root"]')).toHaveAttribute(
      'data-test-active-language-code',
      'en-US',
      { timeout: 15_000 }
    )

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.globalLanguageSelectorSpellcheckRefresh}"]`)
    ).toBeVisible({ timeout: 10_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.globalLanguageSelectorSpellcheckRefresh}"]`).click()
    await appWindow.waitForTimeout(FA_FRONTEND_RENDER_TIMER)

    await e2eExpectFaActiveProjectStoreEmpty(appWindow)
    await expect(appWindow.locator('[data-test-locator="mainLayout-activeProjectName"]')).toHaveCount(0)

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabels(
      appWindow,
      E2E_PROJECT_DISPLAY_MENU_NEW,
      E2E_PROJECT_DISPLAY_SPLASH_NEW
    )
    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_DISPLAY_MENU_NEW }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_DISPLAY_MENU_NEW)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      E2E_PROJECT_DISPLAY_MENU_NEW
    ))).toBeVisible()
  })

  /**
   * Eleven **Create new project** flows hit the MRU cap (10): submenu lists E2E MRU cap exercise project 11 … 02 only.
   * While 11 is active its SQLite file stays open, so we switch to project 10, delete 11's file on disk, then open 11 from MRU.
   * That surfaces 'Project file does not exist', prunes the stale MRU row, and leaves nine entries (10 … 02).
   */
  test('Recent project MRU caps at 10 and drops stale paths after a missing file open', async () => {
    for (let i = 1; i <= E2E_RECENT_CAP_TOTAL; i++) {
      await createProjectViaMenu(
        appWindow,
        electronApp,
        recentCapDisplayName(i),
        recentCapFixtureBaseName(i)
      )
      assertE2eCreatedFaprojectFileExistsWithContent(recentCapFixtureBaseName(i))
      await dismissOpenMenus(appWindow)
    }

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabelsOrdered(
      appWindow,
      expectedRecentCapLabelsAfterElevenCreates()
    )
    await appWindow.getByRole('menuitem', {
      name: recentCapDisplayName(E2E_RECENT_CAP_TOTAL - 1)
    }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(
      appWindow,
      recentCapDisplayName(E2E_RECENT_CAP_TOTAL - 1)
    )

    tryUnlinkE2eFaprojectFixture(recentCapFixtureBaseName(E2E_RECENT_CAP_TOTAL))
    expect(fs.existsSync(getE2eFaprojectFixtureAbsolutePath(
      recentCapFixtureBaseName(E2E_RECENT_CAP_TOTAL)
    ))).toBe(false)

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await appWindow.getByRole('menuitem', {
      name: recentCapDisplayName(E2E_RECENT_CAP_TOTAL)
    }).click()
    await dismissOpenMenus(appWindow)

    await expect(
      appWindow.getByText('Project file does not exist').first()
    ).toBeVisible()
    await e2eExpectFaActiveProjectStoreName(
      appWindow,
      recentCapDisplayName(E2E_RECENT_CAP_TOTAL - 1)
    )

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabelsOrdered(
      appWindow,
      expectedRecentCapLabelsAfterMissingFilePruned()
    )
    await dismissOpenMenus(appWindow)
  })
})
