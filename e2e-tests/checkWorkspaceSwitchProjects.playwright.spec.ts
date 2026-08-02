import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import {
  e2eReadOpenedTabDocumentIds,
  e2eHydrateOpenedDocumentsAndRoute
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeHelpers'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  expectFaPlaywrightE2eHashRoute,
  expectFaPlaywrightE2eWorkspaceShell
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppShellAssertions'
import {
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import { interpolateFaProjectSessionNotify } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eProjectSessionNotify'
import {
  e2eSetNextProjectCreatePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'

/**
 * Extra env settings to trigger E2E via Playwright (isolated userData).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

/**
 * Object of string data selectors for the e2e
 */
const selectorList = {
  createBtn: 'dialogNewProject-button-create',
  nameInput: 'dialogNewProject-input-name',
  projectAppControlBar: 'projectAppControlBar',
  splashNew: 'splashPage-btn-new',
  submenuItemSubMenu: 'AppControlSingleMenu-menuItem-subMenu',
  submenuItemSubMenuItemText: 'AppControlSingleMenu-menuItem-subMenu-item-text'
} as const

const SWITCH_PROJECT_A_FAPROJECT = 'e2e-switch-projects-a.faproject'
const SWITCH_PROJECT_B_FAPROJECT = 'e2e-switch-projects-b.faproject'
const SWITCH_PROJECT_A_NAME = 'E2E switch project A'
const SWITCH_PROJECT_B_NAME = 'E2E switch project B'
const SWITCH_PROJECT_A_TAB_LABEL = 'E2E Switch Tab A'
const SWITCH_PROJECT_B_TAB_LABEL = 'E2E Switch Tab B'
const MENU_ANIMATION_MS = 600
const OPENED_DOCUMENTS_PERSIST_SETTLE_MS = 750

let e2eSwitchProjectADocumentId = ''
let e2eSwitchProjectBDocumentId = ''

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

async function createE2eProjectOnWorkspaceRoute (
  page: Page,
  electronApplication: ElectronApplication,
  fixtureBaseName: string,
  projectName: string
): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eSetNextProjectCreatePath(electronApplication, fixtureBaseName)
  await page.locator(`[data-test-locator="${selectorList.splashNew}"]`).click()
  await expect(page.locator(`[data-test-locator="${selectorList.nameInput}"]`)).toBeVisible()
  await page.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(projectName)
  await page.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(page, projectName)
  await expectFaPlaywrightE2eHashRoute(page, '/home')
  await expectFaPlaywrightE2eWorkspaceShell(page)
}

async function seedOpenedDocumentTab (
  page: Page,
  tabLabel: string
): Promise<string> {
  return page.evaluate(async (label) => {
    const content = window.faContentBridgeAPIs?.projectContent
    const management = window.faContentBridgeAPIs?.projectManagement
    if (content === undefined || management === undefined) {
      throw new Error('Project content or management bridge unavailable')
    }
    const worlds = await content.listWorlds()
    const world = worlds.items[0]
    if (world === undefined) {
      throw new Error('No default world in E2E project')
    }
    const document = await content.createDocument({
      displayName: label,
      worldId: world.id
    })
    const saved = await management.saveOpenedDocumentsSnapshot({
      activeDocumentId: document.id,
      schemaVersion: 2,
      tabs: [{
        displayNameDraft: label,
        documentId: document.id,
        persistenceState: 'persisted',
        hasUnsavedChanges: false,
        editState: false,
        savedDisplayName: label,
        documentTextColorDraft: '',
        savedDocumentTextColor: '',
        documentBackgroundColorDraft: '',
        savedDocumentBackgroundColor: '',
        isCategoryDraft: false,
        savedIsCategory: false,
        isFinishedDraft: false,
        isMinorDraft: false,
        isDeadDraft: false,
        savedIsFinished: false,
        savedIsMinor: false,
        savedIsDead: false,
        parentDocumentIdDraft: '',
        savedParentDocumentId: '',
        treeOrderNumberDraft: '',
        savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
        extraClassesDraft: '',
        savedExtraClasses: '',
        tabLabel: label,
        templateIcon: 'mdi-file-document'
      }]
    })
    if (!saved) {
      throw new Error('saveOpenedDocumentsSnapshot returned false')
    }
    return document.id
  }, tabLabel)
}

test.describe.serial('Opened documents E2E — switch projects rehydrates tab strip', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 180_000
  })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture(SWITCH_PROJECT_A_FAPROJECT)
        tryUnlinkE2eFaprojectFixture(SWITCH_PROJECT_B_FAPROJECT)
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

  test('Opening project B clears project A tabs and hydrates project B opened_documents', async () => {
    await createE2eProjectOnWorkspaceRoute(
      appWindow,
      electronApp,
      SWITCH_PROJECT_A_FAPROJECT,
      SWITCH_PROJECT_A_NAME
    )
    e2eSwitchProjectADocumentId = await seedOpenedDocumentTab(appWindow, SWITCH_PROJECT_A_TAB_LABEL)
    expect(e2eSwitchProjectADocumentId.length).toBeGreaterThan(0)
    await e2eHydrateOpenedDocumentsAndRoute(appWindow, e2eSwitchProjectADocumentId)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eSwitchProjectADocumentId}"]`)
    ).toBeVisible({ timeout: 15_000 })

    await e2eSetNextProjectCreatePath(electronApp, SWITCH_PROJECT_B_FAPROJECT)
    await openProjectMenu(appWindow)
    await appWindow.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
    await appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`).fill(SWITCH_PROJECT_B_NAME)
    await appWindow.locator(`[data-test-locator="${selectorList.createBtn}"]`).click()
    await e2eExpectFaActiveProjectStoreName(appWindow, SWITCH_PROJECT_B_NAME)
    await expect(appWindow.getByText(interpolateFaProjectSessionNotify(
      L_faProjectSession.notifyProjectCreated,
      SWITCH_PROJECT_B_NAME
    ))).toBeVisible()

    e2eSwitchProjectBDocumentId = await seedOpenedDocumentTab(appWindow, SWITCH_PROJECT_B_TAB_LABEL)
    expect(e2eSwitchProjectBDocumentId.length).toBeGreaterThan(0)
    await e2eHydrateOpenedDocumentsAndRoute(appWindow, e2eSwitchProjectBDocumentId)

    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eSwitchProjectBDocumentId}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eSwitchProjectADocumentId}"]`)
    ).toHaveCount(0)
    await expect.poll(async () => {
      return e2eReadOpenedTabDocumentIds(appWindow)
    }).toEqual([e2eSwitchProjectBDocumentId])

    await openProjectMenu(appWindow)
    await openLoadRecentSubmenu(appWindow)
    await appWindow.getByRole('menuitem', { name: SWITCH_PROJECT_A_NAME }).click()
    await dismissOpenMenus(appWindow)
    await e2eExpectFaActiveProjectStoreName(appWindow, SWITCH_PROJECT_A_NAME)
    await e2eHydrateOpenedDocumentsAndRoute(appWindow, e2eSwitchProjectADocumentId)
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eSwitchProjectADocumentId}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="projectAppControlBar-tab-${e2eSwitchProjectBDocumentId}"]`)
    ).toHaveCount(0)
    await expect.poll(async () => {
      return e2eReadOpenedTabDocumentIds(appWindow)
    }).toEqual([e2eSwitchProjectADocumentId])
    await appWindow.waitForTimeout(OPENED_DOCUMENTS_PERSIST_SETTLE_MS)
  })
})
