import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'

const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectAppControlBar',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const selectorList = {
  dialogDiscardOpenedDocumentTab: 'dialogDiscardOpenedDocumentTab',
  projectAppControlBar: 'projectAppControlBar',
  projectAppControlBarKeyboardShortcutsButton: 'projectAppControlBar-keyboardShortcutsButton',
  projectAppControlBarToggleHierarchyTreeButton: 'projectAppControlBar-toggleHierarchyTreeButton',
  projectAppControlBarDeleteActionSeparator: 'projectAppControlBar-deleteActionSeparator',
  projectAppControlBarDeleteDocumentButton: 'projectAppControlBar-deleteDocumentButton',
  projectAppControlBarEditDocumentButton: 'projectAppControlBar-editDocumentButton',
  projectAppControlBarSaveDocumentButton: 'projectAppControlBar-saveDocumentButton',
  projectAppControlBarSaveDocumentKeepEditModeButton: 'projectAppControlBar-saveDocumentKeepEditModeButton',
  projectAppControlBarTab: 'projectAppControlBar-tab-doc-hero',
  projectAppControlBarTabClose: 'projectAppControlBar-tabClose-doc-hero',
  projectAppControlBarTabContextMenu: 'projectAppControlBar-tabContextMenu',
  projectAppControlBarTabContextMenuBrowseOpenedTabs: 'projectAppControlBar-tabContextMenu-browseOpenedTabs',
  projectAppControlBarTabContextMenuBrowseSubmenu: 'projectAppControlBar-tabContextMenu-browseSubmenu',
  projectAppControlBarTabContextMenuCloseAllTabsWithoutChanges: 'projectAppControlBar-tabContextMenu-closeAllTabsWithoutChanges',
  projectAppControlBarTabContextMenuCloseAllTabsWithoutChangesExceptThisOne: 'projectAppControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne',
  projectAppControlBarTabContextMenuCloseThisTab: 'projectAppControlBar-tabContextMenu-closeThisTab',
  projectAppControlBarTabContextMenuCopyName: 'projectAppControlBar-tabContextMenu-copyName',
  projectAppControlBarTabContextMenuCopyTextColor: 'projectAppControlBar-tabContextMenu-copyTextColor',
  projectAppControlBarTabContextMenuCopyBackgroundColor: 'projectAppControlBar-tabContextMenu-copyBackgroundColor',
  projectAppControlBarTabContextMenuDeleteThisDocument: 'projectAppControlBar-tabContextMenu-deleteThisDocument',
  projectAppControlBarTabContextMenuForceCloseAllTabs: 'projectAppControlBar-tabContextMenu-forceCloseAllTabs',
  projectAppControlBarTabContextMenuForceCloseAllTabsExceptThisOne: 'projectAppControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne',
  projectAppControlBarTabContextMenuMoveTabLeft: 'projectAppControlBar-tabContextMenu-moveTabLeft',
  projectAppControlBarTabVillain: 'projectAppControlBar-tab-doc-villain',
  projectAppControlBarTabPlace: 'projectAppControlBar-tab-doc-place'
} as const

const sampleOpenedDocumentTabs = [
  {
    documentId: 'doc-hero',
    persistenceState: 'persisted',
    tabLabel: 'Character',
    templateIcon: 'mdi-account',
    displayNameDraft: 'Hero',
    savedDisplayName: 'Hero',
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
    hasUnsavedChanges: false,
    editState: false
  },
  {
    documentId: 'doc-villain',
    persistenceState: 'persisted',
    tabLabel: 'Character',
    templateIcon: 'mdi-skull',
    displayNameDraft: 'Villain draft',
    savedDisplayName: 'Villain',
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
    hasUnsavedChanges: true,
    editState: false
  }
] as const

async function remountAppControlBarAfterStoreSeed (
  page: Page,
  seed: I_faComponentTestingStoreSeed
): Promise<void> {
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })
  await patchFaPlaywrightComponentHarnessStores(page, seed)
  await page.evaluate(async (payload) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $router: {
              replace: (location: { path: string }) => Promise<void>
            }
          }
        }
      }
    }
    const router = root?.__vue_app__?.config.globalProperties.$router
    if (router === undefined) {
      throw new Error('Vue router missing in component harness')
    }
    const routePath = payload.openedDocuments?.activeDocumentId !== undefined &&
      payload.openedDocuments.activeDocumentId !== null &&
      payload.openedDocuments.tabs.length > 0
      ? `/home/document/${payload.openedDocuments.activeDocumentId}`
      : '/componentTesting/ProjectAppControlBar'
    await router.replace({ path: routePath })
  }, seed)
  await page.waitForTimeout(faFrontendRenderTimer)
}

test.describe.serial('Project app control bar visibility', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.beforeAll(async ({}, testInfo) => {
    suiteTestInfo = testInfo
    const launched = await launchFaPlaywrightComponentHarnessWindow({
      buildLaunchEnv (): Record<string, string> {
        return {
          COMPONENT_NAME: extraEnvSettings.COMPONENT_NAME,
          COMPONENT_PROPS: extraEnvSettings.COMPONENT_PROPS,
          TEST_ENV: extraEnvSettings.TEST_ENV
        }
      },
      renderDelayMs: faFrontendRenderTimer,
      testInfo
    })
    electronApp = launched.electronApp
    appWindow = launched.appWindow
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false
    })
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if the app control bar renders when the setting is off', async () => {
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toBeVisible()
  })

  test('Check if the app control bar hides when disable app control bar is on', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: true
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toHaveCount(0)
  })

  test('Check if opened document tabs stay visible when disable app control bar is on', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: true,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
  })

  test('Check if seeded opened document tabs render in the control bar', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabClose}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.getByText('Hero', { exact: true })
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarEditDocumentButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteDocumentButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteActionSeparator}"]`)
    ).toHaveCount(1)
  })

  test('Check if save buttons appear when the active document tab is in edit mode', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0],
          editState: true
        }]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarEditDocumentButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentKeepEditModeButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteDocumentButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteActionSeparator}"]`)
    ).toHaveCount(1)
  })

  test('Check if middle-clicking a tab without unsaved changes closes it', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'middle' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
    await expect.poll(async () => {
      return appWindow.evaluate(() => {
        const root = document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $router: {
                  currentRoute: {
                    value: {
                      path: string
                    }
                  }
                }
              }
            }
          }
        }
        return root?.__vue_app__?.config.globalProperties.$router.currentRoute.value.path ?? ''
      })
    }).toBe('/home/document/doc-villain')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveClass(/q-tab--active/)
  })

  test('Check if middle-clicking a tab with unsaved changes opens the discard dialog', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-villain',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
      .click({ button: 'middle' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTab}"]`)
    ).toBeVisible()
  })

  test('Check if right-clicking a tab opens the tab context menu with browse submenu and close action', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenu}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuBrowseOpenedTabs}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCopyName}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuMoveTabLeft}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCloseThisTab}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCloseAllTabsWithoutChangesExceptThisOne}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCloseAllTabsWithoutChanges}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuForceCloseAllTabsExceptThisOne}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuForceCloseAllTabs}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuDeleteThisDocument}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuForceCloseAllTabsExceptThisOne}"]`)
    ).toHaveClass(/text-secondary/)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuForceCloseAllTabs}"]`)
    ).toHaveClass(/text-secondary/)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuDeleteThisDocument}"]`)
    ).toHaveClass(/text-secondary/)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuBrowseOpenedTabs}"]`)
      .hover()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuBrowseSubmenu}"]`)
    ).toBeVisible()
    await expect(
      appWindow.getByText('Villain draft', { exact: true })
    ).toHaveCount(1)
    await expect(
      appWindow.locator('[data-test-locator="projectAppControlBar-tabContextMenu-browseTab"][data-test-browse-tab-document-id="doc-villain"] .projectAppControlBarTabContextMenu__browseTabUnsavedIcon')
    ).toHaveCount(1)
    await expect(
      appWindow.locator('[data-test-locator="projectAppControlBar-tabContextMenu-browseTab"][data-test-browse-tab-document-id="doc-hero"] .projectAppControlBarTabContextMenu__browseTabUnsavedIcon')
    ).toHaveCount(0)
  })

  test('Check if close this tab from the context menu closes a clean tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCloseThisTab}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
  })

  test('Check if left guide and tree buttons render on the fixed strip', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      disableAppControlBarGuides: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarKeyboardShortcutsButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`)
    ).toHaveCount(1)
  })

  test('Check if close all tabs without changes except this one keeps dirty tabs and the right-clicked tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [
          ...sampleOpenedDocumentTabs,
          {
            documentId: 'doc-place',
            persistenceState: 'persisted',
            tabLabel: 'Place',
            templateIcon: 'mdi-map-marker',
            displayNameDraft: 'Place',
            savedDisplayName: 'Place',
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
            hasUnsavedChanges: false,
            editState: false
          }
        ]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCloseAllTabsWithoutChangesExceptThisOne}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabPlace}"]`)
    ).toHaveCount(0)
  })
})
