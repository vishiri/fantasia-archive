import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import {
  FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_NEXT_DOCUMENT_TAB,
  FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_PREVIOUS_DOCUMENT_TAB,
  FA_PLAYWRIGHT_PRESS_DEFAULT_MOVE_DOCUMENT_TAB_LEFT,
  FA_PLAYWRIGHT_PRESS_DEFAULT_MOVE_DOCUMENT_TAB_RIGHT,
  FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT,
  getFaPlaywrightDefaultEditDocumentPressString,
  getFaPlaywrightDefaultOpenAppSettingsPressString,
  getFaPlaywrightDefaultSaveDocumentKeepEditModePressString
} from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectHierarchyTreeWorkspaceWorld } from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'
const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectAppControlBar',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const selectorList = {
  dialogDiscardOpenedDocumentTab: 'dialogDiscardOpenedDocumentTab',
  dialogDiscardOpenedDocumentTabCancel: 'dialogDiscardOpenedDocumentTab-cancel',
  dialogDiscardOpenedDocumentTabDiscard: 'dialogDiscardOpenedDocumentTab-discard',
  projectAppControlBar: 'projectAppControlBar',
  projectAppControlBarAdvancedSearchGuideButton: 'projectAppControlBar-advancedSearchGuideButton',
  projectAppControlBarKeyboardShortcutsButton: 'projectAppControlBar-keyboardShortcutsButton',
  projectAppControlBarTipsTricksTriviaButton: 'projectAppControlBar-tipsTricksTriviaButton',
  projectAppControlBarToggleHierarchyTreeButton: 'projectAppControlBar-toggleHierarchyTreeButton',
  projectAppControlBarDeleteActionSeparator: 'projectAppControlBar-deleteActionSeparator',
  projectAppControlBarDeleteDocumentButton: 'projectAppControlBar-deleteDocumentButton',
  projectAppControlBarEditDocumentButton: 'projectAppControlBar-editDocumentButton',
  projectAppControlBarSaveDocumentButton: 'projectAppControlBar-saveDocumentButton',
  projectAppControlBarSaveDocumentKeepEditModeButton: 'projectAppControlBar-saveDocumentKeepEditModeButton',
  projectAppControlBarTab: 'projectAppControlBar-tab-doc-hero',
  projectAppControlBarTabClose: 'projectAppControlBar-tabClose-doc-hero',
  projectAppControlBarTabCloseVillain: 'projectAppControlBar-tabClose-doc-villain',
  projectAppControlBarTabContextMenu: 'projectAppControlBar-tabContextMenu',
  projectAppControlBarTabContextMenuBrowseOpenedTabs: 'projectAppControlBar-tabContextMenu-browseOpenedTabs',
  projectAppControlBarTabContextMenuBrowseSubmenu: 'projectAppControlBar-tabContextMenu-browseSubmenu',
  projectAppControlBarTabContextMenuCloseAllTabsWithoutChanges: 'projectAppControlBar-tabContextMenu-closeAllTabsWithoutChanges',
  projectAppControlBarTabContextMenuCloseAllTabsWithoutChangesExceptThisOne: 'projectAppControlBar-tabContextMenu-closeAllTabsWithoutChangesExceptThisOne',
  projectAppControlBarTabContextMenuCloseThisTab: 'projectAppControlBar-tabContextMenu-closeThisTab',
  projectAppControlBarTabContextMenuCopyName: 'projectAppControlBar-tabContextMenu-copyName',
  projectAppControlBarTabContextMenuCopyTextColor: 'projectAppControlBar-tabContextMenu-copyTextColor',
  projectAppControlBarTabContextMenuCopyBackgroundColor: 'projectAppControlBar-tabContextMenu-copyBackgroundColor',
  projectAppControlBarTabContextMenuCopyDocument: 'projectAppControlBar-tabContextMenu-copyDocument',
  projectAppControlBarTabContextMenuAddNewDocumentUnderThis: 'projectAppControlBar-tabContextMenu-addNewDocumentUnderThis',
  projectAppControlBarTabContextMenuDeleteThisDocument: 'projectAppControlBar-tabContextMenu-deleteThisDocument',
  projectAppControlBarCopyCurrentDocumentButton: 'projectAppControlBar-copyCurrentDocumentButton',
  projectAppControlBarAddNewDocumentUnderThisButton: 'projectAppControlBar-addNewDocumentUnderThisButton',
  projectAppControlBarTabContextMenuForceCloseAllTabs: 'projectAppControlBar-tabContextMenu-forceCloseAllTabs',
  projectAppControlBarTabContextMenuForceCloseAllTabsExceptThisOne: 'projectAppControlBar-tabContextMenu-forceCloseAllTabsExceptThisOne',
  projectAppControlBarTabContextMenuMoveTabLeft: 'projectAppControlBar-tabContextMenu-moveTabLeft',
  projectAppControlBarTabContextMenuMoveTabRight: 'projectAppControlBar-tabContextMenu-moveTabRight',
  projectAppControlBarTabVillain: 'projectAppControlBar-tab-doc-villain',
  projectAppControlBarTabPlace: 'projectAppControlBar-tab-doc-place',
  projectAppControlBarTabWorldIndicatorHero: 'projectAppControlBar-tabWorldIndicator-doc-hero',
  projectAppControlBarQuickAddButton: 'projectAppControlBar-quickAddButton',
  projectAppControlBarQuickSearchButton: 'projectAppControlBar-quickSearchButton',
  projectAppControlBarToggleAppNoteboardButton: 'projectAppControlBar-toggleAppNoteboardButton',
  projectAppControlBarToggleAppNoteboardContentDot: 'projectAppControlBar-toggleAppNoteboardButton-contentDot',
  projectAppControlBarToggleProjectNoteboardButton: 'projectAppControlBar-toggleProjectNoteboardButton',
  projectAppControlBarToggleProjectNoteboardContentDot: 'projectAppControlBar-toggleProjectNoteboardButton-contentDot',
  dialogDiscardOpenedDocumentTabTitle: 'dialogDiscardOpenedDocumentTab-title',
  dialogDeleteOpenedDocument: 'dialogDeleteOpenedDocument',
  dialogDeleteOpenedDocumentCancel: 'dialogDeleteOpenedDocument-cancel',
  dialogDeleteOpenedDocumentDelete: 'dialogDeleteOpenedDocument-delete',
  dialogDeleteOpenedDocumentTitle: 'dialogDeleteOpenedDocument-title',
  dialogDeleteOpenedDocumentWarning: 'dialogDeleteOpenedDocument-warning',
  dialogMarkdownDocumentClose: 'dialogMarkdownDocument-button-close',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  dialogAppSettingsSave: 'dialogAppSettings-button-save',
  dialogAppSettingsClose: 'dialogAppSettings-button-close',
  dialogAppSettingsSettingHideTabCloseButton: 'dialogAppSettings-setting-hideTabCloseButton',
  dialogAppSettingsSettingShowTabBarScrollButtons: 'dialogAppSettings-setting-showTabBarScrollButtons',
  dialogAppSettingsTabVisualAccessibility: 'dialogAppSettings-tab-visualAccessibility',
  dialogMarkdownDocumentContent: 'dialogMarkdownDocument-markdown-content',
  windowAppNoteboardClose: 'windowAppNoteboard-button-close',
  windowAppNoteboardFrame: 'windowAppNoteboard-frame',
  windowProjectNoteboardClose: 'windowProjectNoteboard-button-close',
  windowProjectNoteboardFrame: 'windowProjectNoteboard-frame',
  documentWorkspacePageNameInput: 'documentWorkspacePage-nameInput',
  documentWorkspacePagePreviewTitle: 'documentWorkspacePage-previewTitle'
} as const

const controlBarSeedDefaults = {
  disableAppControlBar: false,
  disableAppControlBarContentButtons: false,
  disableAppControlBarFunctionButtons: false,
  disableAppControlBarGuides: false,
  hideTabCloseButton: false,
  showTabBarScrollButtons: false
} as const

async function readOpenedTabDocumentIds (page: Page): Promise<string[]> {
  return page.locator('[data-test-locator^="projectAppControlBar-tab-"]').evaluateAll((nodes) => {
    return nodes.map((node) => {
      const locator = node.getAttribute('data-test-locator') ?? ''
      return locator.replace('projectAppControlBar-tab-', '')
    })
  })
}

async function readClipboardTextBestEffort (page: Page): Promise<string | null> {
  return page.evaluate(async () => {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return null
    }
  })
}

function buildOverflowTabs (count: number) {
  return Array.from({ length: count }, (_, index) => {
    const id = `doc-overflow-${index}`
    return {
      ...samplePlaceTab,
      documentId: id,
      displayNameDraft: `Overflow ${index}`,
      savedDisplayName: `Overflow ${index}`
    }
  })
}

async function readRouterPath (page: Page): Promise<string> {
  return page.evaluate(() => {
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
}

async function replaceRouterPath (page: Page, path: string): Promise<void> {
  await page.evaluate(async (nextPath) => {
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
    await router.replace({ path: nextPath })
  }, path)
  await page.waitForTimeout(faFrontendRenderTimer)
}

const sampleActiveProject = {
  filePath: 'C:\\Playwright\\control-bar.faproject',
  id: 'control-bar-project',
  name: 'Control Bar Project'
} as const

const CONTROL_BAR_WORLD_ID = '550e8400-e29b-41d4-a716-446655440101'
const CONTROL_BAR_WORLD_ID_B = '550e8400-e29b-41d4-a716-446655440102'
const CONTROL_BAR_TEMPLATE_ID = '7c9e6679-7425-40de-944b-e07fc1f90b01'

const sampleControlBarDocument: I_faProjectDocument = {
  createdAtMs: 1,
  displayName: 'Hero',
  documentBackgroundColor: null,
  documentTextColor: null,
  extraClasses: '',
  id: 'doc-hero',
  isCategory: false,
  isDead: false,
  isFinished: false,
  isMinor: false,
  parentDocumentId: null,
  placementId: null,
  sortOrder: 0,
  templateId: CONTROL_BAR_TEMPLATE_ID,
  treeOrderNumber: Number.MIN_SAFE_INTEGER,
  updatedAtMs: 1,
  worldId: CONTROL_BAR_WORLD_ID
}

const sampleControlBarTemplate: I_faProjectDocumentTemplate = {
  createdAtMs: 1,
  displayName: 'Character',
  icon: 'mdi-account',
  id: CONTROL_BAR_TEMPLATE_ID,
  sortOrder: 0,
  titlePluralTranslations: { 'en-US': 'Characters' },
  titleSingularTranslations: { 'en-US': 'Character' },
  updatedAtMs: 1,
  worldAppendix: '',
  worldAppendixTranslations: {}
}

const sampleControlBarWorld: I_faProjectWorld = {
  color: '#4caf50',
  colorPalette: '',
  createdAtMs: 1,
  displayName: 'Eldoria',
  displayNameTranslations: { 'en-US': 'Eldoria' },
  id: CONTROL_BAR_WORLD_ID,
  sortOrder: 0,
  updatedAtMs: 1
}

const singleWorldHierarchyWorlds: I_faProjectHierarchyTreeWorkspaceWorld[] = [{
  color: '#4caf50',
  colorPalette: '',
  displayName: 'Eldoria',
  groups: [],
  id: CONTROL_BAR_WORLD_ID,
  placements: [],
  sortOrder: 0
}]

const multiWorldHierarchyWorlds: I_faProjectHierarchyTreeWorkspaceWorld[] = [
  ...singleWorldHierarchyWorlds,
  {
    color: '#2196f3',
    colorPalette: '',
    displayName: 'Nordheim',
    groups: [],
    id: CONTROL_BAR_WORLD_ID_B,
    placements: [],
    sortOrder: 1
  }
]

const controlBarDocumentContentOverrides = {
  documentsById: {
    [sampleControlBarDocument.id]: sampleControlBarDocument
  },
  templatesById: {
    [CONTROL_BAR_TEMPLATE_ID]: sampleControlBarTemplate
  },
  worldsById: {
    [CONTROL_BAR_WORLD_ID]: sampleControlBarWorld
  }
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

const samplePlaceTab = {
  documentId: 'doc-place',
  persistenceState: 'persisted' as const,
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
} as const

const controlBarDocumentStructureSeed: I_faComponentTestingStoreSeed = {
  ...controlBarSeedDefaults,
  openedDocuments: {
    activeDocumentId: 'doc-hero',
    tabs: [sampleOpenedDocumentTabs[0]!]
  },
  projectContentOverrides: {
    documentsById: controlBarDocumentContentOverrides.documentsById,
    templatesById: controlBarDocumentContentOverrides.templatesById,
    worldsById: controlBarDocumentContentOverrides.worldsById
  }
}

async function remountAppControlBarAfterStoreSeed (
  page: Page,
  seed: I_faComponentTestingStoreSeed
): Promise<void> {
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })

  const routePath = seed.openedDocuments?.activeDocumentId !== undefined &&
    seed.openedDocuments.activeDocumentId !== null &&
    seed.openedDocuments.tabs.length > 0
    ? `/home/document/${seed.openedDocuments.activeDocumentId}`
    : '/componentTesting/ProjectAppControlBar'

  await page.evaluate(async (nextPath) => {
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
    await router.replace({ path: nextPath })
  }, routePath)
  // Let MainLayout hydrate finish before seeding; hydrate can wipe an earlier seed.
  await page.waitForTimeout(faFrontendRenderTimer)
  await patchFaPlaywrightComponentHarnessStores(page, seed)
  // DocumentWorkspacePage redirects to /home when the route id is not in opened tabs yet
  // (navigate-before-seed). Re-enter the document route after tabs exist.
  if (routePath.startsWith('/home/document/')) {
    await page.evaluate(async (nextPath) => {
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
      await router.replace({ path: nextPath })
    }, routePath)
    await page.waitForTimeout(faFrontendRenderTimer)
    // Re-patch: MainLayout refreshSettings / hydrate can overwrite the first seed.
    await patchFaPlaywrightComponentHarnessStores(page, seed)
  }
  await page.waitForTimeout(faFrontendRenderTimer)
}

const appSettingsTabSwitchSettleMs = 550
const postSaveAppSettingsWaitMs = 500

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

async function openAppSettingsFromControlBarHarness (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultOpenAppSettingsPressString())
  await expect(
    page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  ).toBeVisible({ timeout: 15_000 })
}

async function openAppSettingsVisualAccessibilityTab (page: Page): Promise<void> {
  const tab = page.locator(
    `[data-test-locator="${selectorList.dialogAppSettingsTabVisualAccessibility}"]`
  )
  await expect(tab).toHaveCount(1)
  await tab.click()
  await page.waitForTimeout(appSettingsTabSwitchSettleMs)
}

async function toggleAppSettingsSwitch (
  page: Page,
  settingLocator: string,
  wantChecked: boolean
): Promise<void> {
  const settingRoot = page.locator(`[data-test-locator="${settingLocator}"]`)
  await expect(settingRoot).toHaveCount(1)
  const toggle = settingRoot.getByRole('switch')
  await expect(toggle).toBeVisible()
  const ariaChecked = await toggle.getAttribute('aria-checked')
  const isChecked = ariaChecked === 'true'
  if (isChecked !== wantChecked) {
    await toggle.click()
  }
  await expect(toggle).toHaveAttribute('aria-checked', wantChecked ? 'true' : 'false')
}

async function readOpenedDocumentsSession (page: Page): Promise<{
  activeDocumentId: string | null
  tabs: Array<{
    documentId: string
    displayNameDraft: string
    editState: boolean
    hasUnsavedChanges: boolean
    parentDocumentIdDraft: string
    persistenceState: string
  }>
}> {
  return page.evaluate(() => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                activeDocumentId?: string | null
                tabs?: Array<{
                  documentId: string
                  displayNameDraft: string
                  editState: boolean
                  hasUnsavedChanges: boolean
                  parentDocumentIdDraft: string
                  persistenceState: string
                }>
              }>
            }
          }
        }
      }
    }
    const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')
    if (store === undefined) {
      throw new Error('S_FaOpenedDocuments missing in component harness')
    }
    return {
      activeDocumentId: store.activeDocumentId ?? null,
      tabs: [...(store.tabs ?? [])].map((tab) => {
        return {
          displayNameDraft: tab.displayNameDraft,
          documentId: tab.documentId,
          editState: tab.editState,
          hasUnsavedChanges: tab.hasUnsavedChanges,
          parentDocumentIdDraft: tab.parentDocumentIdDraft,
          persistenceState: tab.persistenceState
        }
      })
    }
  })
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
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`).getByText('Hero', { exact: true })
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
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuBrowseSubmenu}"]`).getByText('Villain draft', { exact: true })
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
          samplePlaceTab
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

  test('Check if hideTabCloseButton hides the tab X while the tab still renders', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      hideTabCloseButton: true,
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
    ).toHaveCount(0)
  })

  test('Check if Edit enters edit mode on the document workspace page', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePagePreviewTitle}"]`)
    ).toBeVisible()

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarEditDocumentButton}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePageNameInput}"]`)
    ).toBeVisible({ timeout: 10_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePagePreviewTitle}"]`)
    ).toHaveCount(0)
  })

  test('Check if force close all tabs clears the tab strip', async () => {
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
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuForceCloseAllTabs}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(0, { timeout: 10_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(0)
  })

  test('Check if app and project noteboard content dots follow seeded noteboard text', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      activeProject: sampleActiveProject,
      appNoteboardText: '',
      disableAppControlBar: false,
      projectNoteboardText: ''
    })

    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarToggleAppNoteboardContentDot}"]`
      )
    ).toHaveCount(0)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarToggleProjectNoteboardContentDot}"]`
      )
    ).toHaveCount(0)

    await remountAppControlBarAfterStoreSeed(appWindow, {
      activeProject: sampleActiveProject,
      appNoteboardText: 'filled app notes',
      disableAppControlBar: false,
      projectNoteboardText: 'filled project notes'
    })

    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarToggleAppNoteboardContentDot}"]`
      )
    ).toHaveCount(1)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarToggleProjectNoteboardContentDot}"]`
      )
    ).toHaveCount(1)
  })

  test('Check if the tab X closes a clean tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      hideTabCloseButton: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabClose}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
  })

  test('Check if the tab X on a dirty tab opens discard; cancel keeps; discard removes', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      hideTabCloseButton: false,
      openedDocuments: {
        activeDocumentId: 'doc-villain',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabCloseVillain}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTab}"]`)
    ).toBeVisible()

    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTabCancel}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabCloseVillain}"]`)
      .click()
    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTabDiscard}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(0, { timeout: 10_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
  })

  test('Check if temporary tabs hide the delete button and context delete row', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      hideTabCloseButton: false,
      openedDocuments: {
        activeDocumentId: 'doc-temp',
        tabs: [{
          ...sampleOpenedDocumentTabs[0],
          documentId: 'doc-temp',
          persistenceState: 'temporary',
          displayNameDraft: 'Temp',
          savedDisplayName: 'Temp'
        }]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteDocumentButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteActionSeparator}"]`)
    ).toHaveCount(0)

    await appWindow
      .locator('[data-test-locator="projectAppControlBar-tab-doc-temp"]')
      .click({ button: 'right' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenu}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuDeleteThisDocument}"]`)
    ).toHaveCount(0)
  })

  test('Check if disableAppControlBarGuides hides guide buttons and keeps tree toggle', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      disableAppControlBarGuides: true,
      hideTabCloseButton: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarKeyboardShortcutsButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarAdvancedSearchGuideButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTipsTricksTriviaButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`)
    ).toHaveCount(1)
  })

  test('Check if close all tabs without changes closes clean tabs including the right-clicked one', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      disableAppControlBarGuides: false,
      hideTabCloseButton: false,
      openedDocuments: {
        activeDocumentId: 'doc-place',
        tabs: [
          ...sampleOpenedDocumentTabs,
          samplePlaceTab
        ]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabPlace}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCloseAllTabsWithoutChanges}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabPlace}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
  })

  test('Check if force close all tabs except this one keeps only the right-clicked tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      disableAppControlBar: false,
      disableAppControlBarGuides: false,
      hideTabCloseButton: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [
          ...sampleOpenedDocumentTabs,
          samplePlaceTab
        ]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuForceCloseAllTabsExceptThisOne}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1, { timeout: 10_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabPlace}"]`)
    ).toHaveCount(0)
  })

  test('Check if hideTabCloseButton still allows middle-click close on a clean tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      hideTabCloseButton: true,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabClose}"]`)
    ).toHaveCount(0)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'middle' })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
  })

  test('Check if context Move tab left and right swap neighbors', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }).toEqual(['doc-hero', 'doc-villain'])

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuMoveTabLeft}"]`)
      .last()
      .click()

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }).toEqual(['doc-villain', 'doc-hero'])

    await appWindow.keyboard.press('Escape')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenu}"]`)
    ).toHaveCount(0)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuMoveTabRight}"]`)
      .last()
      .click()

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }).toEqual(['doc-hero', 'doc-villain'])
  })

  test('Check if Move tab left no-ops on leftmost and Move tab right no-ops on rightmost', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuMoveTabLeft}"]`)
      .last()
      .click()

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }).toEqual(['doc-hero', 'doc-villain'])

    await appWindow.keyboard.press('Escape')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenu}"]`)
    ).toHaveCount(0)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuMoveTabRight}"]`)
      .last()
      .click()

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }).toEqual(['doc-hero', 'doc-villain'])
  })

  test('Check if browse submenu click activates the chosen tab route', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuBrowseOpenedTabs}"]`)
      .hover()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuBrowseSubmenu}"]`)
    ).toBeVisible()
    await appWindow
      .locator('[data-test-locator="projectAppControlBar-tabContextMenu-browseTab"][data-test-browse-tab-document-id="doc-villain"]')
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveClass(/q-tab--active/)
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
  })

  test('Check if context Copy name and colors show success toasts', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0],
          documentTextColorDraft: '#aabbcc',
          documentBackgroundColorDraft: '#112233'
        }, sampleOpenedDocumentTabs[1]]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCopyName}"]`)
      .last()
      .click()
    await expect(
      appWindow.locator('.q-notification').filter({
        hasText: 'Document name copied to the clipboard.'
      })
    ).toBeVisible({ timeout: 15_000 })
    const copiedName = await readClipboardTextBestEffort(appWindow)
    if (copiedName !== null) {
      expect(copiedName).toBe('Hero')
    }

    await appWindow.keyboard.press('Escape')
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCopyTextColor}"]`)
      .last()
      .click()
    await expect(
      appWindow.locator('.q-notification').filter({
        hasText: 'Document text color copied to the clipboard.'
      })
    ).toBeVisible({ timeout: 15_000 })
    const copiedTextColor = await readClipboardTextBestEffort(appWindow)
    if (copiedTextColor !== null) {
      expect(copiedTextColor).toBe('#aabbcc')
    }

    await appWindow.keyboard.press('Escape')
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCopyBackgroundColor}"]`)
      .last()
      .click()
    await expect(
      appWindow.locator('.q-notification').filter({
        hasText: 'Document background color copied to the clipboard.'
      })
    ).toBeVisible({ timeout: 15_000 })
    const copiedBackgroundColor = await readClipboardTextBestEffort(appWindow)
    if (copiedBackgroundColor !== null) {
      expect(copiedBackgroundColor).toBe('#112233')
    }
  })

  test('Check if finished and dead markers render on tabs', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0],
          isFinishedDraft: true,
          isDeadDraft: true
        }, sampleOpenedDocumentTabs[1]]
      }
    })

    const heroTab = appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    await expect(heroTab).toHaveClass(/projectAppControlBarTabs__tab--dead/)
    await expect(heroTab.locator('.projectAppControlBarTabs__finishedMarker')).toHaveText('✓')
    await expect(heroTab.locator('.projectAppControlBarTabs__deadMarker')).toHaveText('†')
    await expect(heroTab.locator('.projectAppControlBarTabs__tabLabelText--dead')).toHaveCount(1)
  })

  test('Check if minor-only tabs use muted chrome without custom text color', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0],
          isMinorDraft: true
        }, sampleOpenedDocumentTabs[1]]
      }
    })

    const heroTab = appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    await expect(heroTab).toHaveClass(/projectAppControlBarTabs__tab--statusMuted/)
    await expect(heroTab).not.toHaveClass(/projectAppControlBarTabs__tab--customAppearance/)
  })

  test('Check if custom text and background colors appear on tab chrome', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0],
          documentTextColorDraft: '#aabbcc',
          documentBackgroundColorDraft: '#112233'
        }, sampleOpenedDocumentTabs[1]]
      }
    })

    const heroTab = appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    await expect(heroTab).toHaveClass(/projectAppControlBarTabs__tab--customAppearance/)
    await expect(heroTab).toHaveClass(/projectAppControlBarTabs__tab--customDocumentBackground/)
    await expect(heroTab).toHaveAttribute('style', /#aabbcc/i)
    await expect(heroTab).toHaveAttribute('style', /#112233/i)
  })

  test('Check if disableAppControlBarFunctionButtons hides tree and noteboard toggles', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      disableAppControlBarFunctionButtons: true,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarToggleAppNoteboardButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarToggleProjectNoteboardButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarQuickSearchButton}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarQuickAddButton}"]`)
    ).toHaveCount(1)
  })

  test('Check if disableAppControlBarContentButtons hides quick search and add', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      disableAppControlBarContentButtons: true,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarQuickSearchButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarQuickAddButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`)
    ).toHaveCount(1)
  })

  test('Check if toggle hierarchy tree button flips the tree-hidden strip chrome', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      hideHierarchyTree: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    const fixedStrip = appWindow.locator('.projectAppControlBar--fixedStrip')
    await expect(fixedStrip).not.toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`)
      .click()

    await expect(fixedStrip).toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarToggleHierarchyTreeButton}"]`)
      .click()

    await expect(fixedStrip).not.toHaveClass(/projectAppControlBar--fixedStrip--treeHidden/)
  })

  test('Check if tips advanced-search and noteboard strip buttons open surfaces', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      activeProject: sampleActiveProject,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTipsTricksTriviaButton}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogMarkdownDocumentContent}"]`)
    ).toHaveClass(/tipsTricksTrivia/, { timeout: 15_000 })
    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogMarkdownDocumentClose}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogMarkdownDocumentContent}"]`)
    ).toHaveCount(0)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarAdvancedSearchGuideButton}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogMarkdownDocumentContent}"]`)
    ).toHaveClass(/advancedSearchGuide/, { timeout: 15_000 })
    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogMarkdownDocumentClose}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogMarkdownDocumentContent}"]`)
    ).toHaveCount(0)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarToggleAppNoteboardButton}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.windowAppNoteboardFrame}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow
      .locator(`[data-test-locator="${selectorList.windowAppNoteboardClose}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.windowAppNoteboardFrame}"]`)
    ).toHaveCount(0)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarToggleProjectNoteboardButton}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.windowProjectNoteboardFrame}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow
      .locator(`[data-test-locator="${selectorList.windowProjectNoteboardClose}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.windowProjectNoteboardFrame}"]`)
    ).toHaveCount(0)
  })

  test('Check if discard dialog shows title Cancel and Discard actions', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
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
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTabTitle}"]`)
    ).toContainText('Discard changes')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTabCancel}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTabDiscard}"]`)
    ).toBeVisible()

    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTabCancel}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDiscardOpenedDocumentTab}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
  })

  test('Check if delete strip button opens delete dialog with warning and Cancel closes it', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteDocumentButton}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocument}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentTitle}"]`)
    ).toContainText('Delete')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentTitle}"]`)
    ).toContainText('Hero')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentWarning}"]`)
    ).toContainText('FOREVER')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentCancel}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentDelete}"]`)
    ).toBeVisible()

    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentCancel}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocument}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
  })

  test('Check if delete dialog confirm removes the tab and shows a success toast', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [
          sampleOpenedDocumentTabs[0]!,
          sampleOpenedDocumentTabs[1]!
        ]
      },
      projectContentOverrides: {
        documentsById: {
          'doc-hero': sampleControlBarDocument,
          'doc-villain': {
            ...sampleControlBarDocument,
            displayName: 'Villain',
            id: 'doc-villain'
          }
        },
        templatesById: {
          [CONTROL_BAR_TEMPLATE_ID]: sampleControlBarTemplate
        },
        worldsById: {
          [CONTROL_BAR_WORLD_ID]: sampleControlBarWorld
        }
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteDocumentButton}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocument}"]`)
    ).toBeVisible({ timeout: 15_000 })

    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentDelete}"]`)
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocument}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator('.q-notification').filter({
        hasText: 'Document successfully deleted.'
      })
    ).toBeVisible({ timeout: 15_000 })
  })

  test('Check if context Delete this document opens the same delete dialog', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenuDeleteThisDocument}"]`)
      .last()
      .click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocument}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentTitle}"]`)
    ).toContainText('Hero')

    await appWindow
      .locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocumentCancel}"]`)
      .click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogDeleteOpenedDocument}"]`)
    ).toHaveCount(0)
  })

  test('Check if showTabBarScrollButtons enables scroll chrome and overflow arrows', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      showTabBarScrollButtons: true,
      openedDocuments: {
        activeDocumentId: 'doc-overflow-0',
        tabs: buildOverflowTabs(12)
      }
    })

    const tabsRoot = appWindow.locator('.projectAppControlBarTabs--header')
    await expect(tabsRoot).toHaveClass(/projectAppControlBarTabs--showScrollButtons/)
    await expect(
      appWindow.locator('.projectAppControlBarTabs--header .q-tabs__arrow')
    ).not.toHaveCount(0)
  })

  test('Check if mouse wheel scrolls tabs horizontally when scroll buttons are off', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      showTabBarScrollButtons: false,
      openedDocuments: {
        activeDocumentId: 'doc-overflow-0',
        tabs: buildOverflowTabs(12)
      }
    })

    const tabsRoot = appWindow.locator('.projectAppControlBarTabs--header')
    await expect(tabsRoot).not.toHaveClass(/projectAppControlBarTabs--showScrollButtons/)

    const scrollBefore = await appWindow.evaluate(() => {
      const content = document.querySelector('.projectAppControlBarTabs--header .q-tabs__content')
      if (!(content instanceof HTMLElement)) {
        return null
      }
      return {
        left: content.scrollLeft,
        overflow: content.scrollWidth > content.clientWidth
      }
    })
    expect(scrollBefore).not.toBeNull()
    expect(scrollBefore?.overflow).toBe(true)

    await tabsRoot.dispatchEvent('wheel', {
      deltaX: 0,
      deltaY: 480
    })

    await expect.poll(async () => {
      return appWindow.evaluate(() => {
        const content = document.querySelector('.projectAppControlBarTabs--header .q-tabs__content')
        if (!(content instanceof HTMLElement)) {
          return -1
        }
        return content.scrollLeft
      })
    }).toBeGreaterThan(scrollBefore?.left ?? 0)
  })

  test('Check if overview to document route mounts DocumentWorkspacePage and dashboard keeps tabs', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)

    await replaceRouterPath(appWindow, '/home')
    await expect.poll(async () => {
      return readRouterPath(appWindow)
    }).toBe('/home')
    await expect(
      appWindow.locator('[data-test-locator="projectOverview"]')
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage"]')
    ).toHaveCount(0)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click()
    await expect.poll(async () => {
      return readRouterPath(appWindow)
    }).toBe('/home/document/doc-hero')
    await expect(
      appWindow.locator('[data-test-locator="documentWorkspacePage"]')
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)

    await replaceRouterPath(appWindow, '/home')
    await expect.poll(async () => {
      return readRouterPath(appWindow)
    }).toBe('/home')
    await expect(
      appWindow.locator('[data-test-locator="projectOverview"]')
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toHaveCount(1)
  })

  test('Check if copy current document strip button opens a temporary copy tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, controlBarDocumentStructureSeed)

    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarCopyCurrentDocumentButton}"]`
      )
    ).toBeVisible({ timeout: 15_000 })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarCopyCurrentDocumentButton}"]`)
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.filter((tab) => tab.persistenceState === 'temporary').length
    }, {
      timeout: 15_000
    }).toBe(1)

    const session = await readOpenedDocumentsSession(appWindow)
    const temporaryTab = session.tabs.find((tab) => tab.persistenceState === 'temporary')
    expect(temporaryTab).toBeDefined()
    expect(session.activeDocumentId).toBe(temporaryTab?.documentId)
    expect(temporaryTab?.displayNameDraft.toLowerCase()).toContain('hero')
    expect(session.tabs.some((tab) => tab.documentId === 'doc-hero')).toBe(true)
  })

  test('Check if add-under strip button opens a nested temporary tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, controlBarDocumentStructureSeed)

    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarAddNewDocumentUnderThisButton}"]`
      )
    ).toBeVisible({ timeout: 15_000 })

    await appWindow
      .locator(
        `[data-test-locator="${selectorList.projectAppControlBarAddNewDocumentUnderThisButton}"]`
      )
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.filter((tab) => tab.persistenceState === 'temporary').length
    }, {
      timeout: 15_000
    }).toBe(1)

    const session = await readOpenedDocumentsSession(appWindow)
    const temporaryTab = session.tabs.find((tab) => tab.persistenceState === 'temporary')
    expect(temporaryTab).toBeDefined()
    expect(session.activeDocumentId).toBe(temporaryTab?.documentId)
    expect(temporaryTab?.parentDocumentIdDraft).toBe('doc-hero')
  })

  test('Check if tab context Copy document and Add under create temporary tabs', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, controlBarDocumentStructureSeed)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenu}"]`).last()
    ).toBeVisible({ timeout: 15_000 })
    await appWindow
      .locator(
        `[data-test-locator="${selectorList.projectAppControlBarTabContextMenuCopyDocument}"]`
      )
      .last()
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.filter((tab) => tab.persistenceState === 'temporary').length
    }, {
      timeout: 15_000
    }).toBe(1)

    await remountAppControlBarAfterStoreSeed(appWindow, controlBarDocumentStructureSeed)
    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
      .click({ button: 'right' })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabContextMenu}"]`).last()
    ).toBeVisible({ timeout: 15_000 })
    await appWindow
      .locator(
        `[data-test-locator="${selectorList.projectAppControlBarTabContextMenuAddNewDocumentUnderThis}"]`
      )
      .last()
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.some((tab) => {
        return tab.persistenceState === 'temporary' && tab.parentDocumentIdDraft === 'doc-hero'
      })
    }, {
      timeout: 15_000
    }).toBe(true)
  })

  test('Check if Save exits edit mode and clears unsaved chrome', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarDocumentStructureSeed,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0]!,
          displayNameDraft: 'Hero Renamed',
          editState: true,
          hasUnsavedChanges: true
        }]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentButton}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveClass(/projectAppControlBarTabs__tab--withUnsavedAlert/)

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentButton}"]`)
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const tab = session.tabs.find((entry) => entry.documentId === 'doc-hero')
      return {
        displayNameDraft: tab?.displayNameDraft,
        editState: tab?.editState,
        hasUnsavedChanges: tab?.hasUnsavedChanges
      }
    }, {
      timeout: 15_000
    }).toEqual({
      displayNameDraft: 'Hero Renamed',
      editState: false,
      hasUnsavedChanges: false
    })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarEditDocumentButton}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).not.toHaveClass(/projectAppControlBarTabs__tab--withUnsavedAlert/)
  })

  test('Check if Save keep-edit clears unsaved chrome while staying in edit', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarDocumentStructureSeed,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0]!,
          displayNameDraft: 'Hero Keep Edit',
          editState: true,
          hasUnsavedChanges: true
        }]
      }
    })

    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarSaveDocumentKeepEditModeButton}"]`
      )
    ).toBeVisible({ timeout: 15_000 })

    await appWindow
      .locator(
        `[data-test-locator="${selectorList.projectAppControlBarSaveDocumentKeepEditModeButton}"]`
      )
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const tab = session.tabs.find((entry) => entry.documentId === 'doc-hero')
      return {
        displayNameDraft: tab?.displayNameDraft,
        editState: tab?.editState,
        hasUnsavedChanges: tab?.hasUnsavedChanges
      }
    }, {
      timeout: 15_000
    }).toEqual({
      displayNameDraft: 'Hero Keep Edit',
      editState: true,
      hasUnsavedChanges: false
    })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarSaveDocumentKeepEditModeButton}"]`
      )
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePageNameInput}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).not.toHaveClass(/projectAppControlBarTabs__tab--withUnsavedAlert/)
  })

  test('Check if temporary tab hides delete and Save promotes to persisted', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-temp',
        tabs: [{
          ...sampleOpenedDocumentTabs[0]!,
          documentId: 'doc-temp',
          displayNameDraft: 'Temp Hero',
          editState: true,
          hasUnsavedChanges: false,
          persistenceState: 'temporary',
          savedDisplayName: 'Temp Hero',
          templateId: CONTROL_BAR_TEMPLATE_ID,
          worldId: CONTROL_BAR_WORLD_ID
        }]
      },
      projectContentOverrides: {
        documentsById: {},
        templatesById: controlBarDocumentContentOverrides.templatesById,
        worldsById: controlBarDocumentContentOverrides.worldsById
      }
    })

    await expect(
      appWindow.locator('[data-test-locator="projectAppControlBar-tab-doc-temp"]')
    ).toBeVisible({ timeout: 15_000 })

    await appWindow.evaluate(() => {
      const root = document.querySelector('#q-app') as HTMLElement & {
        __vue_app__?: {
          config: {
            globalProperties: {
              $pinia?: {
                _s?: Map<string, {
                  enterDocumentEditMode?: (documentId: string) => void
                  setDocumentEditState?: (documentId: string, editState: boolean) => void
                }>
              }
            }
          }
        }
      }
      const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaOpenedDocuments')
      store?.enterDocumentEditMode?.('doc-temp')
      store?.setDocumentEditState?.('doc-temp', true)
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteDocumentButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentButton}"]`)
    ).toBeVisible({ timeout: 15_000 })

    await appWindow
      .locator(`[data-test-locator="${selectorList.projectAppControlBarSaveDocumentButton}"]`)
      .click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const tab = session.tabs.find((entry) => entry.documentId === 'doc-temp')
      return {
        editState: tab?.editState,
        hasUnsavedChanges: tab?.hasUnsavedChanges,
        persistenceState: tab?.persistenceState
      }
    }, {
      timeout: 15_000
    }).toEqual({
      editState: false,
      hasUnsavedChanges: false,
      persistenceState: 'persisted'
    })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarDeleteDocumentButton}"]`)
    ).toBeVisible()
  })

  test('Check if world indicators stay hidden for a single-world project', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      hierarchyTree: {
        worlds: singleWorldHierarchyWorlds
      },
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0]!,
          worldId: CONTROL_BAR_WORLD_ID
        }]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarTabWorldIndicatorHero}"]`
      )
    ).toHaveCount(0)
  })

  test('Check if world indicators show when multiple worlds are seeded', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      hierarchyTree: {
        worlds: multiWorldHierarchyWorlds
      },
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [{
          ...sampleOpenedDocumentTabs[0]!,
          worldId: CONTROL_BAR_WORLD_ID
        }]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.projectAppControlBarTabWorldIndicatorHero}"]`
      )
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveClass(/projectAppControlBarTabs__tab--withWorldIndicator/)
  })

  test('Check if focus next and previous document tab keybinds cycle the active tab', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [
          sampleOpenedDocumentTabs[0]!,
          sampleOpenedDocumentTabs[1]!,
          samplePlaceTab
        ]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_NEXT_DOCUMENT_TAB)
    await expect.poll(async () => {
      return (await readOpenedDocumentsSession(appWindow)).activeDocumentId
    }, {
      timeout: 15_000
    }).toBe('doc-villain')

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_NEXT_DOCUMENT_TAB)
    await expect.poll(async () => {
      return (await readOpenedDocumentsSession(appWindow)).activeDocumentId
    }).toBe('doc-place')

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_FOCUS_PREVIOUS_DOCUMENT_TAB)
    await expect.poll(async () => {
      return (await readOpenedDocumentsSession(appWindow)).activeDocumentId
    }).toBe('doc-villain')
  })

  test('Check if move document tab left and right keybinds reorder the strip', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-villain',
        tabs: [
          sampleOpenedDocumentTabs[0]!,
          sampleOpenedDocumentTabs[1]!,
          samplePlaceTab
        ]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_MOVE_DOCUMENT_TAB_LEFT)
    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, {
      timeout: 15_000
    }).toEqual(['doc-villain', 'doc-hero', 'doc-place'])

    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_MOVE_DOCUMENT_TAB_RIGHT)
    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }).toEqual(['doc-hero', 'doc-villain', 'doc-place'])
  })

  test('Check if drag-reorder swaps two tabs to a new LTR order', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [
          sampleOpenedDocumentTabs[0]!,
          sampleOpenedDocumentTabs[1]!
        ]
      }
    })

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, {
      timeout: 15_000
    }).toEqual(['doc-hero', 'doc-villain'])

    const heroTab = appWindow.locator(
      `[data-test-locator="${selectorList.projectAppControlBarTab}"]`
    )
    const villainTab = appWindow.locator(
      `[data-test-locator="${selectorList.projectAppControlBarTabVillain}"]`
    )
    await expect(heroTab).toBeVisible()
    await expect(villainTab).toBeVisible()

    const heroBox = await heroTab.boundingBox()
    const villainBox = await villainTab.boundingBox()
    expect(heroBox).not.toBeNull()
    expect(villainBox).not.toBeNull()

    await appWindow.mouse.move(
      heroBox!.x + heroBox!.width / 2,
      heroBox!.y + heroBox!.height / 2
    )
    await appWindow.mouse.down()
    await appWindow.mouse.move(
      villainBox!.x + villainBox!.width / 2,
      villainBox!.y + villainBox!.height / 2,
      { steps: 24 }
    )
    await appWindow.mouse.up()
    await appWindow.waitForTimeout(400)

    await expect.poll(async () => {
      return readOpenedTabDocumentIds(appWindow)
    }, {
      timeout: 15_000
    }).toEqual(['doc-villain', 'doc-hero'])
  })

  test('Check if edit and save document keybinds enter edit, keep-edit save, and exit-edit save', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, controlBarDocumentStructureSeed)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePagePreviewTitle}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBar}"]`).click()

    await appWindow.keyboard.press(getFaPlaywrightDefaultEditDocumentPressString())
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePageNameInput}"]`)
    ).toBeVisible({ timeout: 15_000 })

    const nameInput = appWindow.locator(
      `[data-test-locator="${selectorList.documentWorkspacePageNameInput}"]`
    )
    await nameInput.fill('Hero Keybind Keep')
    await appWindow.keyboard.press(getFaPlaywrightDefaultSaveDocumentKeepEditModePressString())
    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const tab = session.tabs.find((entry) => entry.documentId === 'doc-hero')
      return {
        displayNameDraft: tab?.displayNameDraft,
        editState: tab?.editState,
        hasUnsavedChanges: tab?.hasUnsavedChanges
      }
    }, {
      timeout: 15_000
    }).toEqual({
      displayNameDraft: 'Hero Keybind Keep',
      editState: true,
      hasUnsavedChanges: false
    })
    await expect(nameInput).toBeVisible()

    await nameInput.fill('Hero Keybind Exit')
    await appWindow.keyboard.press(FA_PLAYWRIGHT_PRESS_DEFAULT_SAVE_DOCUMENT)
    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      const tab = session.tabs.find((entry) => entry.documentId === 'doc-hero')
      return {
        displayNameDraft: tab?.displayNameDraft,
        editState: tab?.editState,
        hasUnsavedChanges: tab?.hasUnsavedChanges
      }
    }, {
      timeout: 15_000
    }).toEqual({
      displayNameDraft: 'Hero Keybind Exit',
      editState: false,
      hasUnsavedChanges: false
    })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePagePreviewTitle}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.documentWorkspacePageNameInput}"]`)
    ).toHaveCount(0)
  })

  test('Check if Save hideTabCloseButton hides tab X after App Settings closes', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      hideTabCloseButton: false,
      openedDocuments: {
        activeDocumentId: 'doc-hero',
        tabs: [...sampleOpenedDocumentTabs]
      }
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabClose}"]`)
    ).toHaveCount(1)

    await openAppSettingsFromControlBarHarness(appWindow)
    await openAppSettingsVisualAccessibilityTab(appWindow)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingHideTabCloseButton,
      true
    )
    await appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await appWindow.waitForTimeout(postSaveAppSettingsWaitMs)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTab}"]`)
    ).toHaveCount(1)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectAppControlBarTabClose}"]`)
    ).toHaveCount(0)
  })

  test('Check if Save showTabBarScrollButtons shows chevrons after App Settings closes', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      showTabBarScrollButtons: false,
      openedDocuments: {
        activeDocumentId: 'doc-overflow-0',
        tabs: buildOverflowTabs(12)
      }
    })

    const tabsRoot = appWindow.locator('.projectAppControlBarTabs--header')
    await expect(tabsRoot).not.toHaveClass(/projectAppControlBarTabs--showScrollButtons/)

    await openAppSettingsFromControlBarHarness(appWindow)
    await openAppSettingsVisualAccessibilityTab(appWindow)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingShowTabBarScrollButtons,
      true
    )
    await appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await appWindow.waitForTimeout(postSaveAppSettingsWaitMs)

    await expect(tabsRoot).toHaveClass(/projectAppControlBarTabs--showScrollButtons/)
    await expect(
      appWindow.locator('.projectAppControlBarTabs--header .q-tabs__arrow')
    ).not.toHaveCount(0)
  })

  test('Check if unsaved App Settings toggles live-preview tab close and scroll buttons', async () => {
    await remountAppControlBarAfterStoreSeed(appWindow, {
      ...controlBarSeedDefaults,
      hideTabCloseButton: false,
      showTabBarScrollButtons: false,
      openedDocuments: {
        activeDocumentId: 'doc-overflow-0',
        tabs: buildOverflowTabs(12)
      }
    })

    const tabsRoot = appWindow.locator('.projectAppControlBarTabs--header')
    await expect(
      appWindow.locator('[data-test-locator^="projectAppControlBar-tabClose-"]').first()
    ).toBeVisible()
    await expect(tabsRoot).not.toHaveClass(/projectAppControlBarTabs--showScrollButtons/)

    await openAppSettingsFromControlBarHarness(appWindow)
    await openAppSettingsVisualAccessibilityTab(appWindow)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingHideTabCloseButton,
      true
    )
    await expect(
      appWindow.locator('[data-test-locator^="projectAppControlBar-tabClose-"]')
    ).toHaveCount(0)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingShowTabBarScrollButtons,
      true
    )
    await expect(tabsRoot).toHaveClass(/projectAppControlBarTabs--showScrollButtons/)

    await appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsClose}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
    ).toHaveCount(0, { timeout: 15_000 })

    await expect(
      appWindow.locator('[data-test-locator^="projectAppControlBar-tabClose-"]').first()
    ).toBeVisible()
    await expect(tabsRoot).not.toHaveClass(/projectAppControlBarTabs--showScrollButtons/)
  })
})
