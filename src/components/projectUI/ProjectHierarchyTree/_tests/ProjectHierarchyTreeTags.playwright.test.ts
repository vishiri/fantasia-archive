import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { getFaPlaywrightDefaultOpenAppSettingsPressString } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectTag, I_faProjectTagDocumentChild } from 'app/types/I_faProjectTagDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'

const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectHierarchyTree',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER
const appSettingsTabSwitchSettleMs = 400
const postSaveAppSettingsWaitMs = 750

const WORLD_ID = '550e8400-e29b-41d4-a716-446655440001'
const HEROES_PLACEMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae9'
const TEMPLATE_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae8'
const DOCUMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90afa'
const DOCUMENT_ID_B = '7c9e6679-7425-40de-944b-e07fc1f90afb'
const TAG_ID_A = 'a77b1e3c-8ef3-44de-b58f-fdf48741672e'
const TAG_ID_B = 'b638ddb1-eee2-4d78-89db-331723040d9c'
const TAG_WRAPPER_ID = `${WORLD_ID}__tagWrapper`

const sampleActiveProject = {
  filePath: 'C:\\Playwright\\hierarchy-tree-tags.faproject',
  id: 'playwright-hierarchy-tree-tags-id',
  name: 'Playwright Hierarchy Tree Tags Project'
} as const

const sampleWorldsWithTags: I_faProjectHierarchyTreeWorkspaceWorld[] = [
  {
    color: '#4caf50',
    colorPalette: '',
    displayName: 'Eldoria',
    groups: [],
    id: WORLD_ID,
    placements: [
      {
        categoryCount: 0,
        displayName: 'Character',
        documentCount: 2,
        documentTemplateId: TEMPLATE_ID,
        groupId: null,
        groupSortOrder: null,
        hasChildren: true,
        icon: 'mdi-account',
        id: HEROES_PLACEMENT_ID,
        nickname: 'Heroes',
        rootSortOrder: 0,
        titlePluralTranslations: { 'en-US': 'Characters' },
        titleSingularTranslations: { 'en-US': 'Character' },
        worldId: WORLD_ID
      }
    ],
    sortOrder: 0,
    tags: [
      {
        categoryCount: 0,
        documentCount: 2,
        id: TAG_ID_A,
        name: 'Alpha'
      },
      {
        categoryCount: 0,
        documentCount: 1,
        id: TAG_ID_B,
        name: 'Beta'
      }
    ]
  }
]

const sampleExpandedUiState: I_faProjectHierarchyTreeUiState = {
  expandedNodeIds: [WORLD_ID],
  schemaVersion: 1,
  scrollTopPx: 0
}

const sampleExpandedWithTagsUiState: I_faProjectHierarchyTreeUiState = {
  expandedNodeIds: [WORLD_ID, TAG_ID_A, TAG_WRAPPER_ID],
  schemaVersion: 1,
  scrollTopPx: 0
}

function buildSampleDocument (input: {
  displayName: string
  id: string
}): I_faProjectDocument {
  return {
    createdAtMs: 1,
    displayName: input.displayName,
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    id: input.id,
    isCategory: false,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: null,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 0,
    templateId: TEMPLATE_ID,
    treeOrderNumber: Number.MIN_SAFE_INTEGER,
    updatedAtMs: 1,
    worldId: WORLD_ID
  }
}

const sampleDocumentsById: Record<string, I_faProjectDocument> = {
  [DOCUMENT_ID]: buildSampleDocument({
    displayName: 'Hero Leaf',
    id: DOCUMENT_ID
  }),
  [DOCUMENT_ID_B]: buildSampleDocument({
    displayName: 'Hero Twin',
    id: DOCUMENT_ID_B
  })
}

const samplePlacementDocuments: I_faProjectHierarchyTreeDocumentChild[] = [
  {
    displayName: 'Hero Leaf',
    hasChildren: false,
    id: DOCUMENT_ID,
    parentDocumentId: null,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 0,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  },
  {
    displayName: 'Hero Twin',
    hasChildren: false,
    id: DOCUMENT_ID_B,
    parentDocumentId: null,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 1,
    treeOrderNumber: Number.MIN_SAFE_INTEGER
  }
]

const sampleTemplate: I_faProjectDocumentTemplate = {
  createdAtMs: 1,
  displayName: 'Character',
  icon: 'mdi-account',
  id: TEMPLATE_ID,
  sortOrder: 0,
  titlePluralTranslations: { 'en-US': 'Characters' },
  titleSingularTranslations: { 'en-US': 'Character' },
  updatedAtMs: 1,
  worldAppendix: '',
  worldAppendixTranslations: {}
}

const sampleWorld: I_faProjectWorld = {
  color: '#4caf50',
  colorPalette: '',
  createdAtMs: 1,
  displayName: 'Eldoria',
  displayNameTranslations: { 'en-US': 'Eldoria' },
  id: WORLD_ID,
  sortOrder: 0,
  updatedAtMs: 1
}

const sampleTagsByWorldId: Record<string, I_faProjectTag[]> = {
  [WORLD_ID]: [
    {
      createdAtMs: 1,
      id: TAG_ID_A,
      name: 'Alpha',
      updatedAtMs: 1,
      worldId: WORLD_ID
    },
    {
      createdAtMs: 1,
      id: TAG_ID_B,
      name: 'Beta',
      updatedAtMs: 1,
      worldId: WORLD_ID
    }
  ]
}

const sampleDocumentsUnderTag: Record<string, I_faProjectTagDocumentChild[]> = {
  [TAG_ID_A]: [
    {
      displayName: 'Hero Leaf',
      documentBackgroundColor: '',
      documentId: DOCUMENT_ID,
      documentTextColor: '',
      extraClasses: '',
      isCategory: false,
      isDead: false,
      isFinished: false,
      isMinor: false,
      sortOrder: 0,
      templateId: TEMPLATE_ID,
      treeOrderNumber: Number.MIN_SAFE_INTEGER
    },
    {
      displayName: 'Hero Twin',
      documentBackgroundColor: '',
      documentId: DOCUMENT_ID_B,
      documentTextColor: '',
      extraClasses: '',
      isCategory: false,
      isDead: false,
      isFinished: false,
      isMinor: false,
      sortOrder: 1,
      templateId: TEMPLATE_ID,
      treeOrderNumber: Number.MIN_SAFE_INTEGER
    }
  ]
}

const taggedHierarchySeed: I_faComponentTestingStoreSeed = {
  activeProject: sampleActiveProject,
  compactTags: false,
  hierarchyTree: {
    uiState: sampleExpandedUiState,
    worlds: sampleWorldsWithTags
  },
  noTags: false,
  openedDocuments: {
    activeDocumentId: null,
    tabs: []
  },
  projectContentOverrides: {
    documentsById: sampleDocumentsById,
    documentsUnderTagByTagId: sampleDocumentsUnderTag,
    placementDocumentChildrenByKey: {
      [`${HEROES_PLACEMENT_ID}::__root__`]: samplePlacementDocuments
    },
    tagsByWorldId: sampleTagsByWorldId,
    tagsWithCountsByWorldId: {
      [WORLD_ID]: [
        {
          categoryCount: 0,
          documentCount: 2,
          id: TAG_ID_A,
          name: 'Alpha'
        },
        {
          categoryCount: 0,
          documentCount: 1,
          id: TAG_ID_B,
          name: 'Beta'
        }
      ]
    },
    templatesById: {
      [TEMPLATE_ID]: sampleTemplate
    },
    workspaceHierarchyLayoutWorlds: sampleWorldsWithTags,
    worldsById: {
      [WORLD_ID]: sampleWorld
    }
  },
  tagsAtTop: false
}

const selectorList = {
  dialogAppSettingsSave: 'dialogAppSettings-button-save',
  dialogAppSettingsSettingCompactTags: 'dialogAppSettings-setting-compactTags',
  dialogAppSettingsSettingNoTags: 'dialogAppSettings-setting-noTags',
  dialogAppSettingsSettingTagsAtTop: 'dialogAppSettings-setting-tagsAtTop',
  dialogAppSettingsTabHierarchicalTree: 'dialogAppSettings-tab-hierarchicalTree',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  nodeContextMenuCollapseAll: 'projectHierarchyTree-nodeContextMenu-collapseAll',
  nodeContextMenuExpandAll: 'projectHierarchyTree-nodeContextMenu-expandAll',
  nodeContextMenuRenameTag: 'projectHierarchyTree-nodeContextMenu-renameTag',
  nodeDocument: 'projectHierarchyTree-node-document',
  nodeLabelSuffix: '-label',
  nodeTag: 'projectHierarchyTree-node-tag',
  nodeTagWrapper: 'projectHierarchyTree-node-tagWrapper',
  nodeTemplatePlacement: 'projectHierarchyTree-node-templatePlacement',
  nodeWorld: 'projectHierarchyTree-node-world',
  renameTagDialog: 'projectHierarchyTree-renameTagDialog',
  renameTagDialogMergeWarning: 'projectHierarchyTree-renameTagDialog-mergeWarning',
  renameTagDialogName: 'projectHierarchyTree-renameTagDialog-name',
  root: 'projectHierarchyTree',
  tree: 'projectHierarchyTree'
} as const

const workspaceTreeRemountOptions = {
  routePath: '/home'
} as const

async function replaceRouterPath (page: Page, path: string): Promise<void> {
  await page.evaluate(async (nextPath) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $router?: {
              replace: (location: string) => Promise<unknown>
            }
          }
        }
      }
    }
    const router = root?.__vue_app__?.config.globalProperties.$router
    if (router === undefined) {
      throw new Error('Vue router unavailable in component harness')
    }
    await router.replace(nextPath)
  }, path)
}

async function remountTaggedHierarchyTree (
  page: Page,
  seed: I_faComponentTestingStoreSeed
): Promise<void> {
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })

  await replaceRouterPath(page, '/componentTesting/ProjectHierarchyTreeSearch')
  await page.waitForTimeout(faFrontendRenderTimer)

  await patchFaPlaywrightComponentHarnessStores(page, {
    activeProject: seed.activeProject,
    openedDocuments: {
      activeDocumentId: null,
      tabs: []
    },
    projectContentOverrides: seed.projectContentOverrides ?? null
  })

  await replaceRouterPath(page, workspaceTreeRemountOptions.routePath)
  await expect.poll(async () => {
    return await page.evaluate(() => window.location.hash)
  }, {
    timeout: 15_000
  }).toMatch(/^#\/home(?:\/document\/[^#]*)?$/)
  await page.waitForTimeout(faFrontendRenderTimer)

  await patchFaPlaywrightComponentHarnessStores(page, {
    ...seed,
    activeProject: undefined,
    compactTags: seed.compactTags ?? false,
    noTags: seed.noTags ?? false,
    tagsAtTop: seed.tagsAtTop ?? false
  })
  await page.waitForTimeout(faFrontendRenderTimer)

  await page.evaluate(async () => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                refreshLayout?: () => Promise<void>
              }>
            }
          }
        }
      }
    }
    const hierarchyStore = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get('S_FaProjectHierarchyTree')
    if (typeof hierarchyStore?.refreshLayout === 'function') {
      await hierarchyStore.refreshLayout()
    }
  })
  await page.waitForTimeout(faFrontendRenderTimer)

  await expect(
    page.locator(`[data-test-locator="${selectorList.root}"]`)
  ).toBeVisible({ timeout: 15_000 })
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

async function openAppSettingsHierarchicalTreeTab (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultOpenAppSettingsPressString())
  await expect(
    page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  ).toBeVisible({ timeout: 15_000 })
  const tab = page.locator(
    `[data-test-locator="${selectorList.dialogAppSettingsTabHierarchicalTree}"]`
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

async function saveAppSettingsAndWait (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
  await expect(
    page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  ).toHaveCount(0, { timeout: 15_000 })
  await page.waitForTimeout(postSaveAppSettingsWaitMs)
}

async function expandWorldIfCollapsed (page: Page): Promise<void> {
  const worldLabel = page.locator(
    `[data-test-locator="${selectorList.nodeWorld}${selectorList.nodeLabelSuffix}"]`
  ).filter({ hasText: 'Eldoria' })
  await expect(worldLabel).toBeVisible({ timeout: 15_000 })
  const treeItem = worldLabel.locator('xpath=ancestor::*[@role="treeitem"][1]')
  const expanded = await treeItem.getAttribute('aria-expanded')
  if (expanded === 'false') {
    const openIcon = treeItem.locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
    if (await openIcon.count() > 0) {
      await openIcon.dispatchEvent('pointerdown')
      await openIcon.click({ force: true })
    } else {
      await worldLabel.click({ force: true })
    }
    await page.waitForTimeout(300)
  }
}

function tagLabelLocator (page: Page, name: string) {
  return page.locator(
    `[data-test-locator="${selectorList.nodeTag}${selectorList.nodeLabelSuffix}"]`
  ).filter({ hasText: name })
}

function tagWrapperLabelLocator (page: Page) {
  return page.locator(
    `[data-test-locator="${selectorList.nodeTagWrapper}${selectorList.nodeLabelSuffix}"]`
  )
}

function placementLabelLocator (page: Page) {
  return page.locator(
    `[data-test-locator="${selectorList.nodeTemplatePlacement}${selectorList.nodeLabelSuffix}"]`
  )
}

test.describe.serial('Project hierarchy tree tag settings chrome', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 180_000
  })

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
    await remountTaggedHierarchyTree(appWindow, taggedHierarchySeed)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if seeded flat tags render under the world without a wrapper', async () => {
    await remountTaggedHierarchyTree(appWindow, taggedHierarchySeed)
    await expandWorldIfCollapsed(appWindow)
    await expect(tagLabelLocator(appWindow, 'Alpha')).toBeVisible({ timeout: 15_000 })
    await expect(tagLabelLocator(appWindow, 'Beta')).toBeVisible()
    await expect(tagWrapperLabelLocator(appWindow)).toHaveCount(0)
  })

  test('Check if compactTags seed wraps tags under the Tags node', async () => {
    await remountTaggedHierarchyTree(appWindow, {
      ...taggedHierarchySeed,
      compactTags: true,
      hierarchyTree: {
        uiState: sampleExpandedWithTagsUiState,
        worlds: sampleWorldsWithTags
      }
    })
    await expandWorldIfCollapsed(appWindow)
    await expect(tagWrapperLabelLocator(appWindow)).toBeVisible({ timeout: 15_000 })
    await expect(tagLabelLocator(appWindow, 'Alpha')).toBeVisible()
    await expect(tagLabelLocator(appWindow, 'Beta')).toBeVisible()
  })

  test('Check if noTags seed hides tag and tagWrapper rows', async () => {
    await remountTaggedHierarchyTree(appWindow, {
      ...taggedHierarchySeed,
      noTags: true
    })
    await expandWorldIfCollapsed(appWindow)
    await expect(tagLabelLocator(appWindow, 'Alpha')).toHaveCount(0)
    await expect(tagWrapperLabelLocator(appWindow)).toHaveCount(0)
    await expect(placementLabelLocator(appWindow)).toBeVisible()
  })

  test('Check if tagsAtTop seed places tag rows before the placement', async () => {
    await remountTaggedHierarchyTree(appWindow, {
      ...taggedHierarchySeed,
      tagsAtTop: true
    })
    await expandWorldIfCollapsed(appWindow)
    const alphaBox = await tagLabelLocator(appWindow, 'Alpha').boundingBox()
    const placementBox = await placementLabelLocator(appWindow).boundingBox()
    expect(alphaBox).not.toBeNull()
    expect(placementBox).not.toBeNull()
    expect((alphaBox?.y ?? 0) < (placementBox?.y ?? 0)).toBe(true)
  })

  test('Check if Save compactTags updates the mounted tree to a Tags wrapper', async () => {
    await remountTaggedHierarchyTree(appWindow, taggedHierarchySeed)
    await expandWorldIfCollapsed(appWindow)
    await expect(tagWrapperLabelLocator(appWindow)).toHaveCount(0)

    await openAppSettingsHierarchicalTreeTab(appWindow)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingCompactTags,
      true
    )
    await saveAppSettingsAndWait(appWindow)

    await expect(tagWrapperLabelLocator(appWindow)).toBeVisible({ timeout: 15_000 })
    const wrapperTreeItem = tagWrapperLabelLocator(appWindow).locator(
      'xpath=ancestor::*[@role="treeitem"][1]'
    )
    if ((await wrapperTreeItem.getAttribute('aria-expanded')) === 'false') {
      const openIcon = wrapperTreeItem.locator(
        '[data-test-locator="projectHierarchyTree-openIconWrapper"]'
      )
      if (await openIcon.count() > 0) {
        await openIcon.dispatchEvent('pointerdown')
        await openIcon.click({ force: true })
      } else {
        await tagWrapperLabelLocator(appWindow).click({ force: true })
      }
      await appWindow.waitForTimeout(300)
    }
    await expect(tagLabelLocator(appWindow, 'Alpha')).toBeVisible({ timeout: 15_000 })
  })

  test('Check if Save noTags hides tags and clearing it restores them', async () => {
    await remountTaggedHierarchyTree(appWindow, {
      ...taggedHierarchySeed,
      compactTags: true,
      hierarchyTree: {
        uiState: sampleExpandedWithTagsUiState,
        worlds: sampleWorldsWithTags
      }
    })
    await expandWorldIfCollapsed(appWindow)
    await expect(tagWrapperLabelLocator(appWindow)).toBeVisible()

    await openAppSettingsHierarchicalTreeTab(appWindow)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingNoTags,
      true
    )
    await saveAppSettingsAndWait(appWindow)
    await expect(tagWrapperLabelLocator(appWindow)).toHaveCount(0)
    await expect(tagLabelLocator(appWindow, 'Alpha')).toHaveCount(0)

    await openAppSettingsHierarchicalTreeTab(appWindow)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingNoTags,
      false
    )
    await saveAppSettingsAndWait(appWindow)
    await expect(tagWrapperLabelLocator(appWindow)).toBeVisible({ timeout: 15_000 })
  })

  test('Check if Tags wrapper context menu offers expand all under this node', async () => {
    await remountTaggedHierarchyTree(appWindow, {
      ...taggedHierarchySeed,
      compactTags: true,
      hierarchyTree: {
        uiState: {
          expandedNodeIds: [WORLD_ID],
          schemaVersion: 1,
          scrollTopPx: 0
        },
        worlds: sampleWorldsWithTags
      }
    })
    await expandWorldIfCollapsed(appWindow)
    const wrapperLabel = tagWrapperLabelLocator(appWindow)
    await expect(wrapperLabel).toBeVisible({ timeout: 15_000 })
    await wrapperLabel.click({ button: 'right' })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuExpandAll}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuCollapseAll}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuRenameTag}"]`)
    ).toHaveCount(0)
    await appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuExpandAll}"]`).click()
    await expect(tagLabelLocator(appWindow, 'Alpha')).toBeVisible({ timeout: 15_000 })
  })

  test('Check if expand tag loads under-tag document rows from overrides', async () => {
    await remountTaggedHierarchyTree(appWindow, {
      ...taggedHierarchySeed,
      hierarchyTree: {
        uiState: {
          expandedNodeIds: [WORLD_ID],
          schemaVersion: 1,
          scrollTopPx: 0
        },
        worlds: sampleWorldsWithTags
      }
    })
    await expandWorldIfCollapsed(appWindow)
    const alphaLabel = tagLabelLocator(appWindow, 'Alpha')
    await expect(alphaLabel).toBeVisible({ timeout: 15_000 })
    const treeItem = alphaLabel.locator('xpath=ancestor::*[@role="treeitem"][1]')
    const openIcon = treeItem.locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
    if (await openIcon.count() > 0) {
      await openIcon.dispatchEvent('pointerdown')
      await openIcon.click({ force: true })
    } else {
      await alphaLabel.click({ force: true })
    }
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Hero Leaf' })
    ).toBeVisible({ timeout: 15_000 })
  })

  test('Check if rename tag dialog shows merge warning for an existing name', async () => {
    await remountTaggedHierarchyTree(appWindow, taggedHierarchySeed)
    await expandWorldIfCollapsed(appWindow)
    const alphaLabel = tagLabelLocator(appWindow, 'Alpha')
    await expect(alphaLabel).toBeVisible({ timeout: 15_000 })
    await alphaLabel.click({ button: 'right' })
    await appWindow.locator(`[data-test-locator="${selectorList.nodeContextMenuRenameTag}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.renameTagDialog}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(`[data-test-locator="${selectorList.renameTagDialogName}"]`).fill('Beta')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.renameTagDialogMergeWarning}"]`)
    ).toBeVisible()
  })
})
