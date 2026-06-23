import fs from 'node:fs'

import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import {
  assertProjectSettingsManifest,
  E2E_PROJECT_SETTINGS_PHASE1_MANIFEST,
  E2E_PROJECT_SETTINGS_PHASE2_MANIFEST,
  E2E_PROJECT_SETTINGS_SELECTOR_LIST,
  mutateProjectSettingsPhase2,
  seedProjectSettingsPhase1
} from 'app/helpers/playwrightHelpers_e2e/e2eDialogProjectSettingsManifest.playwright'
import { assertSaveEnabledWithoutErrorsIcon } from 'app/helpers/playwrightHelpers_component/dialogProjectSettingsPlaywrightHelpers'
import {
  e2eExpectFaActiveProjectStoreEmpty,
  e2eExpectFaActiveProjectStoreName
} from 'app/helpers/playwrightHelpers_e2e/e2eExpectFaActiveProjectStore'
import { launchFaPlaywrightE2eAppWindow } from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eAppLifecycle'
import {
  navigateFaPlaywrightE2eToHomeRoute,
  navigateFaPlaywrightE2eToSplashRoute
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eNavigateHome'
import {
  clickFaPlaywrightE2eSplashResumePrimarySegment,
  expectFaPlaywrightE2eSplashResumeDropdownLabelsOrdered,
  openFaPlaywrightE2eSplashResumeDropdown
} from 'app/helpers/playwrightHelpers_e2e/faPlaywrightE2eSplashResume'
import {
  e2eSetNextProjectCreatePath,
  getE2eFaprojectFixtureAbsolutePath,
  tryUnlinkE2eFaprojectFixture
} from 'app/helpers/playwrightHelpers_e2e/playwrightE2eProjectPaths'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { getFaPlaywrightDefaultActionMonitorOpenPressString } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { dismissStartupTipsNotifyIfPresent } from 'app/helpers/playwrightHelpers_universal/playwrightDismissStartupTipsNotify'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import projectMenu from 'app/i18n/en-US/components/globals/AppControlMenus/L_project'
import L_newProject from 'app/i18n/en-US/dialogs/L_newProject'
import L_projectSettings from 'app/i18n/en-US/dialogs/L_projectSettings'
import L_faProjectSettings from 'app/i18n/en-US/globalFunctionality/L_faProjectSettings'
import L_faProjectSession from 'app/i18n/en-US/globalFunctionality/L_faProjectSession'
import actionMonitorMessages from 'app/i18n/en-US/dialogs/L_DialogActionMonitor'

/**
 * Extra env settings to trigger E2E via Playwright (isolated userData, dialog path overrides).
 */
const extraEnvSettings = {
  TEST_ENV: 'e2e' as const
}

const MENU_ANIMATION_MS = 600

const PROJECT_SETTINGS_E2E_FAPROJECT = 'e2e-project-settings.faproject'
const PROJECT_SETTINGS_E2E_CREATE_NAME = 'E2E PS Alpha'

const selectorList = {
  ...E2E_PROJECT_SETTINGS_SELECTOR_LIST,
  dialogActionMonitorTable: 'dialogActionMonitor-table',
  dialogCreateBtn: 'dialogNewProject-button-create',
  dialogNameInput: 'dialogNewProject-input-name',
  monitorActionCell: 'dialogActionMonitor-cell-action',
  submenuItemSubMenu: 'AppControlSingleMenu-menuItem-subMenu',
  submenuItemSubMenuItem: 'AppControlSingleMenu-menuItem-subMenu-item',
  submenuItemSubMenuItemText: 'AppControlSingleMenu-menuItem-subMenu-item-text'
} as const

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

async function dismissOpenMenus (page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(150)
}

async function prepareRendererForGlobalShortcuts (page: Page): Promise<void> {
  await page.bringToFront()
  await page.evaluate(() => {
    const root = document.querySelector('#q-app')
    if (root instanceof HTMLElement) {
      root.tabIndex = -1
      root.focus()
    }
  })
}

async function pressDefaultOpenActionMonitorChord (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultActionMonitorOpenPressString())
}

async function collectActionMonitorActionIds (page: Page): Promise<string[]> {
  const table = page.locator(`[data-test-locator="${selectorList.dialogActionMonitorTable}"]`)
  const rows = table.locator('tbody tr')
  const count = await rows.count()
  const ids: string[] = []
  for (let index = 0; index < count; index += 1) {
    const text = await rows.nth(index)
      .locator(`[data-test-locator="${selectorList.monitorActionCell}"] span`)
      .first()
      .innerText()
    ids.push(text.trim())
  }
  return ids
}

async function openProjectMenu (page: Page): Promise<void> {
  await dismissStartupTipsNotifyIfPresent(page)
  await dismissOpenMenus(page)
  const trigger = page.getByRole('button', {
    exact: true,
    name: projectMenu.title
  })
  await expect(trigger).toBeVisible({ timeout: 20_000 })
  await trigger.click()
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function openProjectSettingsFromMenu (page: Page): Promise<void> {
  await openProjectMenu(page)
  const row = page.getByRole('menuitem', {
    exact: false,
    name: projectMenu.items.projectSettings
  })
  await expect(row).toBeVisible({ timeout: 15_000 })
  await expect(row).toBeEnabled()
  await row.click()
  await dismissOpenMenus(page)
}

async function openLoadRecentSubmenu (page: Page): Promise<void> {
  await page.getByRole('menuitem', { name: projectMenu.items.loadRecentProject }).hover({ force: true })
  await page.waitForTimeout(MENU_ANIMATION_MS)
}

async function expectLoadRecentSubmenuFirstLabel (page: Page, label: string): Promise<void> {
  const panel = page.locator(`[data-test-locator="${selectorList.submenuItemSubMenu}"]`).last()
  const first = panel.locator(`[data-test-locator="${selectorList.submenuItemSubMenuItem}"]`).first()
  await expect(
    first.locator(`[data-test-locator="${selectorList.submenuItemSubMenuItemText}"] span`)
  ).toHaveText(label)
}

async function createProjectViaMenu (
  appWin: Page,
  electron: ElectronApplication,
  projectName: string,
  fixtureBaseName: string
): Promise<void> {
  await e2eSetNextProjectCreatePath(electron, fixtureBaseName)
  await openProjectMenu(appWin)
  await appWin.getByRole('menuitem', { name: projectMenu.items.newProject }).click()
  await expect(appWin.locator('#dialogNewProject-title')).toContainText(L_newProject.title)
  await appWin.locator(`[data-test-locator="${selectorList.dialogNameInput}"]`).fill(projectName)
  await appWin.locator(`[data-test-locator="${selectorList.dialogCreateBtn}"]`).click()
  await e2eExpectFaActiveProjectStoreName(appWin, projectName)
  await expect(appWin.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectCreated,
    projectName
  ))).toBeVisible()
}

async function relaunchE2eAppWindowKeepingUserData (
  suiteTestInfoBinding: TestInfo,
  currentTestInfo: TestInfo,
  dismissStartupTips: boolean
): Promise<void> {
  await tearDownFaPlaywrightElectronSerialSuite({
    afterAllTestInfo: currentTestInfo,
    electronApp,
    suiteTestInfo: suiteTestInfoBinding
  })
  const launched = await launchFaPlaywrightE2eAppWindow({
    buildLaunchEnv (): Record<string, string> {
      return {
        TEST_ENV: extraEnvSettings.TEST_ENV
      }
    },
    dismissStartupTips,
    renderDelayMs: FA_FRONTEND_RENDER_TIMER,
    resetUserData: false,
    testInfo: suiteTestInfoBinding
  })
  electronApp = launched.electronApp
  appWindow = launched.appWindow
}

async function resumeProjectFromSplash (page: Page, projectName: string): Promise<void> {
  await navigateFaPlaywrightE2eToSplashRoute(page)
  await e2eExpectFaActiveProjectStoreEmpty(page)
  await clickFaPlaywrightE2eSplashResumePrimarySegment(page)
  await e2eExpectFaActiveProjectStoreName(page, projectName)
  await expect(page.getByText(interpolateFaProjectSessionNotify(
    L_faProjectSession.notifyProjectLoaded,
    projectName
  ))).toBeVisible()
  await navigateFaPlaywrightE2eToHomeRoute(page)
}

async function assertActionMonitorSaveCount (page: Page, expectedSaveCount: number): Promise<void> {
  await expect(async () => {
    await pressDefaultOpenActionMonitorChord(page)
    await expect(page.locator('#dialogActionMonitor-title')).toHaveText(actionMonitorMessages.title)
  }).toPass({ timeout: 30_000 })
  const actionIds = await collectActionMonitorActionIds(page)
  const saveCount = actionIds.filter((id) => id === 'saveProjectSettings').length
  expect(saveCount).toBe(expectedSaveCount)
  await dismissOpenMenus(page)
}

async function assertShellPersistence (
  page: Page,
  projectName: string
): Promise<void> {
  await openProjectMenu(page)
  await openLoadRecentSubmenu(page)
  await expectLoadRecentSubmenuFirstLabel(page, projectName)
  await dismissOpenMenus(page)

  await navigateFaPlaywrightE2eToSplashRoute(page)
  await openFaPlaywrightE2eSplashResumeDropdown(page)
  await expectFaPlaywrightE2eSplashResumeDropdownLabelsOrdered(page, [projectName])
  await dismissOpenMenus(page)
  await navigateFaPlaywrightE2eToHomeRoute(page)
}

let electronApp: ElectronApplication
let appWindow: Page
let suiteTestInfo: TestInfo

test.describe.serial('Project settings E2E — full persistence journey', () => {
  test.describe.configure({ timeout: 600_000 })

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightE2eAppWindow({
      afterIsolationResetBeforeLaunch (): void {
        tryUnlinkE2eFaprojectFixture(PROJECT_SETTINGS_E2E_FAPROJECT)
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
      suiteTestInfo,
      afterClose (): void {
        tryUnlinkE2eFaprojectFixture(PROJECT_SETTINGS_E2E_FAPROJECT)
      }
    })
  })

  /**
   * Phase 1: seed all Project Settings inputs, save without closing, same-session smoke.
   */
  test('Phase 1 seed, save without closing, same-session smoke', async () => {
    await navigateFaPlaywrightE2eToSplashRoute(appWindow)
    await createProjectViaMenu(
      appWindow,
      electronApp,
      PROJECT_SETTINGS_E2E_CREATE_NAME,
      PROJECT_SETTINGS_E2E_FAPROJECT
    )
    assertE2eFaprojectFixtureHasContentOnDisk(PROJECT_SETTINGS_E2E_FAPROJECT)

    await navigateFaPlaywrightE2eToHomeRoute(appWindow)
    await openProjectSettingsFromMenu(appWindow)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toContainText(L_projectSettings.title)

    await seedProjectSettingsPhase1(appWindow, E2E_PROJECT_SETTINGS_PHASE1_MANIFEST)

    await appWindow.locator('.dialogProjectSettings__cardActions').scrollIntoViewIfNeeded()
    await assertSaveEnabledWithoutErrorsIcon(appWindow)
    await appWindow.locator(`[data-test-locator="${selectorList.saveWithoutClosingButton}"]`).evaluate((element) => {
      if (element instanceof HTMLElement) {
        element.click()
      }
    })

    await expect(async () => {
      const toast = appWindow.getByText(L_faProjectSettings.saveSuccess)
      if (await toast.isVisible()) {
        return
      }
      await pressDefaultOpenActionMonitorChord(appWindow)
      const actionIds = await collectActionMonitorActionIds(appWindow)
      expect(actionIds).toContain('saveProjectSettings')
      await dismissOpenMenus(appWindow)
    }).toPass({ timeout: 60_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveCount(1, { timeout: 15_000 })

    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_SETTINGS_PHASE1_MANIFEST.projectName)

    await appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
  })

  /**
   * Cold restart: assert Phase 1 manifest + shell, Phase 2 mutations, save with closing.
   */
  test('Restart, verify Phase 1, mutate Phase 2, save with closing', async ({}, testInfo) => {
    await relaunchE2eAppWindowKeepingUserData(suiteTestInfo, testInfo, true)
    await resumeProjectFromSplash(appWindow, E2E_PROJECT_SETTINGS_PHASE1_MANIFEST.projectName)

    await openProjectSettingsFromMenu(appWindow)
    await assertProjectSettingsManifest(appWindow, E2E_PROJECT_SETTINGS_PHASE1_MANIFEST)
    await appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await assertShellPersistence(appWindow, E2E_PROJECT_SETTINGS_PHASE1_MANIFEST.projectName)

    await openProjectSettingsFromMenu(appWindow)
    await mutateProjectSettingsPhase2(appWindow, E2E_PROJECT_SETTINGS_PHASE2_MANIFEST)

    await appWindow.locator(`[data-test-locator="${selectorList.saveButton}"]`).click()
    await expect(
      appWindow.getByText(L_faProjectSettings.saveSuccess)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveCount(0, { timeout: 15_000 })

    await e2eExpectFaActiveProjectStoreName(appWindow, E2E_PROJECT_SETTINGS_PHASE2_MANIFEST.projectName)

    await assertActionMonitorSaveCount(appWindow, 1)
  })

  /**
   * Cold restart: assert Phase 2 manifest + shell (MRU label = final project name).
   */
  test('Restart and verify Phase 2 persistence', async ({}, testInfo) => {
    test.setTimeout(240_000)

    await relaunchE2eAppWindowKeepingUserData(suiteTestInfo, testInfo, true)
    await resumeProjectFromSplash(appWindow, E2E_PROJECT_SETTINGS_PHASE2_MANIFEST.projectName)

    await openProjectSettingsFromMenu(appWindow)
    await assertProjectSettingsManifest(appWindow, E2E_PROJECT_SETTINGS_PHASE2_MANIFEST)
    await appWindow.locator(`[data-test-locator="${selectorList.closeButton}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.title}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await assertShellPersistence(appWindow, E2E_PROJECT_SETTINGS_PHASE2_MANIFEST.projectName)
    await dismissOpenMenus(appWindow)
  })
})
