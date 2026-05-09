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

const E2E_PROJECT_MENU_REALM = 'E2E Menu Realm'
const E2E_PROJECT_SPLASH_REALM = 'E2E Splash Realm'

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
  await page.getByRole('menuitem', { name: projectMenu.items.loadRecentProject }).click()
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function expectLoadRecentSubmenuLabels (
  page: Page,
  firstLabel: string,
  secondLabel: string
): Promise<void> {
  const panel = page.locator(`[data-test-locator="${selectorList.submenuItemSubMenu}"]`).last()
  const items = panel.locator(`[data-test-locator="${selectorList.submenuItemSubMenuItem}"]`)
  await expect(items).toHaveCount(2)
  await expect(
    items.nth(0).locator(`[data-test-locator="${selectorList.submenuItemSubMenuItemText}"] span`)
  ).toHaveText(firstLabel)
  await expect(
    items.nth(1).locator(`[data-test-locator="${selectorList.submenuItemSubMenuItemText}"] span`)
  ).toHaveText(secondLabel)
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
      },
      electronApp,
      suiteTestInfo
    })
  })

  /**
   * **New project** dialog must clear stale typing when reopened after dismissal without creation.
   */
  test('New project dialog resets the name field after close without creating', async () => {
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
   * Creates a new `.faproject` from the splash welcome **New project** control and verifies session plus creation toast.
   */
  test('creates a .faproject from the splash New project control', async () => {
    await e2eSetNextProjectCreatePath(electronApp, 'e2e-splash-project.faproject')
    await appWindow.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
    await expect(appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill('E2E Splash Realm')
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, 'E2E Splash Realm')
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectCreated,
      'E2E Splash Realm'
    ))).toBeVisible()
    assertE2eCreatedFaprojectFileExistsWithContent('e2e-splash-project.faproject')
  })

  /**
   * Opens **Project → New project**, creates a second fixture, and verifies the active project switches to the menu-created realm.
   */
  test('opens New project from the Project menu and creates a file', async () => {
    await e2eSetNextProjectCreatePath(electronApp, 'e2e-menu-project.faproject')
    const projectTitle = projectMenu.title
    await appWindow.getByRole('button', {
      exact: true,
      name: projectTitle
    }).click()
    await appWindow.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
    await expect(appWindow.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill('E2E Menu Realm')
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, 'E2E Menu Realm')
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectCreated,
      'E2E Menu Realm'
    ))).toBeVisible()
    assertE2eCreatedFaprojectFileExistsWithContent('e2e-menu-project.faproject')
  })

  /**
   * Stages the splash-created fixture path, uses the splash **Load existing project** button, and expects the splash realm plus loaded toast.
   */
  test('loads an existing .faproject from the splash Load existing project control', async () => {
    await e2eSetNextProjectOpenPath(electronApp, 'e2e-splash-project.faproject')
    await appWindow.locator(`[data-test-locator="${selectorList.splashLoad}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, 'E2E Splash Realm')
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      'E2E Splash Realm'
    ))).toBeVisible()
  })

  /**
   * Stages the menu-created fixture path, opens **Project → Load project**, and expects the menu realm plus loaded toast.
   */
  test('loads an existing .faproject from the Project menu', async () => {
    await e2eSetNextProjectOpenPath(electronApp, 'e2e-menu-project.faproject')
    const projectTitle = projectMenu.title
    await appWindow.getByRole('button', {
      exact: true,
      name: projectTitle
    }).click()
    await appWindow.getByRole('menuitem', { name: projectMenu.items.loadProject }).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, 'E2E Menu Realm')
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      'E2E Menu Realm'
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

    await e2eExpectFaActiveProjectStoreName(appWindow, 'E2E Menu Realm')
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
      E2E_PROJECT_MENU_REALM,
      E2E_PROJECT_SPLASH_REALM
    )

    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_SPLASH_REALM }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_SPLASH_REALM)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      E2E_PROJECT_SPLASH_REALM
    ))).toBeVisible()

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabels(
      appWindow,
      E2E_PROJECT_SPLASH_REALM,
      E2E_PROJECT_MENU_REALM
    )

    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_MENU_REALM }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_MENU_REALM)

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await expectLoadRecentSubmenuLabels(
      appWindow,
      E2E_PROJECT_MENU_REALM,
      E2E_PROJECT_SPLASH_REALM
    )
    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_MENU_REALM }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_MENU_REALM)
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
      E2E_PROJECT_MENU_REALM,
      E2E_PROJECT_SPLASH_REALM
    )
    await appWindow.getByRole('menuitem', { name: E2E_PROJECT_MENU_REALM }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_MENU_REALM)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectLoaded,
      E2E_PROJECT_MENU_REALM
    ))).toBeVisible()
  })
})
