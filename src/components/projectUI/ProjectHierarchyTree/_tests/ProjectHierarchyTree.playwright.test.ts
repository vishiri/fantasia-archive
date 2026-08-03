import type { ElectronApplication, Page } from 'playwright'
import { expect, test } from '@playwright/test'
import type { TestInfo } from '@playwright/test'
import { launchFaPlaywrightComponentHarnessWindow } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessLifecycle'
import { patchFaPlaywrightComponentHarnessStores } from 'app/helpers/playwrightHelpers_component/faPlaywrightComponentHarnessPiniaSeed'
import { dragHierarchyTreeDocumentNodeWithHold, cancelHierarchyTreeDocumentDragWithEscape } from 'app/helpers/playwrightHelpers_component/projectHierarchyTreeDocumentDrag'
import { getFaPlaywrightDefaultOpenAppSettingsPressString } from 'app/helpers/playwrightHelpers_universal/faPlaywrightKeyboardChords'
import { FA_FRONTEND_RENDER_TIMER } from 'app/helpers/playwrightHelpers_universal/faPlaywrightElectronLaunchConstants'
import { tearDownFaPlaywrightElectronSerialSuite } from 'app/helpers/playwrightHelpers_universal/faPlaywrightSerialSuiteLifecycleTeardown'
import type { I_faComponentTestingStoreSeed } from 'app/types/I_faComponentTestingStoreSeed'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectDocumentTemplate } from 'app/types/I_faProjectDocumentTemplateDomain'
import type {
  I_faProjectHierarchyTreeDocumentChild,
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeWorkspaceWorld
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faProjectWorld } from 'app/types/I_faProjectWorldDomain'

const extraEnvSettings = {
  COMPONENT_NAME: 'ProjectHierarchyTree',
  COMPONENT_PROPS: JSON.stringify({}),
  TEST_ENV: 'components' as const
}

const faFrontendRenderTimer: number = FA_FRONTEND_RENDER_TIMER

const WORLD_ID = '550e8400-e29b-41d4-a716-446655440001'
const WORLD_ID_B = '550e8400-e29b-41d4-a716-446655440002'
const HEROES_PLACEMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae9'
const TEMPLATE_ID = '7c9e6679-7425-40de-944b-e07fc1f90ae8'
const PARENT_DOCUMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90afb'
const DOCUMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90afa'
const BACKGROUND_DOCUMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90afc'
const ZETA_DOCUMENT_ID = '7c9e6679-7425-40de-944b-e07fc1f90afd'

const sampleActiveProject = {
  filePath: 'C:\\Playwright\\hierarchy-tree.faproject',
  id: 'playwright-hierarchy-tree-id',
  name: 'Playwright Hierarchy Tree Project'
} as const

const sampleWorlds: I_faProjectHierarchyTreeWorkspaceWorld[] = [
  {
    color: '#4caf50',
    colorPalette: '',
    displayName: 'Eldoria',
    groups: [],
    id: WORLD_ID,
    placements: [
      {
        categoryCount: 1,
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
    sortOrder: 0
  }
]

const sampleExpandedUiState: I_faProjectHierarchyTreeUiState = {
  expandedNodeIds: [WORLD_ID, HEROES_PLACEMENT_ID, PARENT_DOCUMENT_ID],
  schemaVersion: 1,
  scrollTopPx: 0
}

function buildSampleDocument (input: {
  displayName: string
  id: string
  isCategory?: boolean
  parentDocumentId?: string | null
}): I_faProjectDocument {
  return {
    createdAtMs: 1,
    displayName: input.displayName,
    documentBackgroundColor: null,
    documentTextColor: null,
    extraClasses: '',
    id: input.id,
    isCategory: input.isCategory === true,
    isDead: false,
    isFinished: false,
    isMinor: false,
    parentDocumentId: input.parentDocumentId ?? null,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 0,
    templateId: TEMPLATE_ID,
    treeOrderNumber: Number.MIN_SAFE_INTEGER,
    updatedAtMs: 1,
    worldId: WORLD_ID
  }
}

const sampleDocumentsById: Record<string, I_faProjectDocument> = {
  [BACKGROUND_DOCUMENT_ID]: buildSampleDocument({
    displayName: 'Background Leaf',
    id: BACKGROUND_DOCUMENT_ID
  }),
  [DOCUMENT_ID]: buildSampleDocument({
    displayName: 'Hero Leaf',
    id: DOCUMENT_ID,
    parentDocumentId: PARENT_DOCUMENT_ID
  }),
  [PARENT_DOCUMENT_ID]: buildSampleDocument({
    displayName: 'Hero Parent',
    id: PARENT_DOCUMENT_ID,
    isCategory: true
  }),
  [ZETA_DOCUMENT_ID]: buildSampleDocument({
    displayName: 'Zeta Nested',
    id: ZETA_DOCUMENT_ID,
    parentDocumentId: PARENT_DOCUMENT_ID
  })
}

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

const samplePlacementDocuments: I_faProjectHierarchyTreeDocumentChild[] = [
  {
    displayName: 'Hero Parent',
    hasChildren: true,
    id: PARENT_DOCUMENT_ID,
    isCategory: true,
    parentDocumentId: null,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 0,
    treeOrderNumber: 10
  },
  {
    displayName: 'Background Leaf',
    hasChildren: false,
    id: BACKGROUND_DOCUMENT_ID,
    parentDocumentId: null,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 1,
    treeOrderNumber: 1
  }
]

const sampleParentChildDocuments: I_faProjectHierarchyTreeDocumentChild[] = [
  {
    displayName: 'Hero Leaf',
    hasChildren: false,
    id: DOCUMENT_ID,
    parentDocumentId: PARENT_DOCUMENT_ID,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 0
  }
]

const nestedSortParentChildDocuments: I_faProjectHierarchyTreeDocumentChild[] = [
  {
    displayName: 'Zeta Nested',
    hasChildren: false,
    id: ZETA_DOCUMENT_ID,
    parentDocumentId: PARENT_DOCUMENT_ID,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 0
  },
  {
    displayName: 'Hero Leaf',
    hasChildren: false,
    id: DOCUMENT_ID,
    parentDocumentId: PARENT_DOCUMENT_ID,
    placementId: HEROES_PLACEMENT_ID,
    sortOrder: 1
  }
]

const sampleTreeData: I_faProjectHierarchyTreeHeTreeNode[] = [
  {
    children: [
      {
        children: [
          {
            children: [
              {
                children: [],
                childrenLoaded: true,
                documentId: DOCUMENT_ID,
                groupId: null,
                hasChildren: false,
                icon: 'mdi-account',
                id: DOCUMENT_ID,
                isCategory: false,
                label: 'Hero Leaf',
                nodeKind: 'document',
                placementId: HEROES_PLACEMENT_ID,
                worldColor: '#4caf50',
                worldId: WORLD_ID
              }
            ],
            childrenLoaded: true,
            documentId: PARENT_DOCUMENT_ID,
            groupId: null,
            hasChildren: true,
            icon: 'mdi-folder-open',
            id: PARENT_DOCUMENT_ID,
            isCategory: true,
            label: 'Hero Parent',
            nodeKind: 'document',
            placementId: HEROES_PLACEMENT_ID,
            worldColor: '#4caf50',
            worldId: WORLD_ID
          },
          {
            children: [],
            childrenLoaded: true,
            documentId: BACKGROUND_DOCUMENT_ID,
            groupId: null,
            hasChildren: false,
            icon: 'mdi-account',
            id: BACKGROUND_DOCUMENT_ID,
            label: 'Background Leaf',
            nodeKind: 'document',
            placementId: HEROES_PLACEMENT_ID,
            worldColor: '#4caf50',
            worldId: WORLD_ID
          },
          {
            children: [],
            childrenLoaded: true,
            documentId: null,
            documentTemplateId: TEMPLATE_ID,
            groupId: null,
            hasChildren: false,
            icon: 'mdi-plus',
            id: `${HEROES_PLACEMENT_ID}__add-new`,
            label: 'Add new character',
            nodeKind: 'addNewDocument',
            placementId: HEROES_PLACEMENT_ID,
            titlePluralTranslations: { 'en-US': 'Characters' },
            titleSingularTranslations: { 'en-US': 'Character' },
            worldColor: '#4caf50',
            worldId: WORLD_ID
          }
        ],
        childrenLoaded: true,
        categoryCount: 1,
        documentCount: 2,
        documentId: null,
        documentTemplateId: TEMPLATE_ID,
        groupId: null,
        hasChildren: true,
        icon: 'mdi-account',
        id: HEROES_PLACEMENT_ID,
        label: 'Heroes',
        nodeKind: 'templatePlacement',
        placementId: HEROES_PLACEMENT_ID,
        titlePluralTranslations: { 'en-US': 'Characters' },
        titleSingularTranslations: { 'en-US': 'Character' },
        worldColor: '#4caf50',
        worldId: WORLD_ID
      }
    ],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: WORLD_ID,
    label: 'Eldoria',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#4caf50',
    worldId: WORLD_ID
  }
]

function buildMarkedSampleTreeData (): I_faProjectHierarchyTreeHeTreeNode[] {
  const treeData = structuredClone(sampleTreeData) as I_faProjectHierarchyTreeHeTreeNode[]
  const placementChildren = treeData[0]?.children?.[0]?.children
  const heroParent = placementChildren?.[0]
  const heroLeaf = heroParent?.children?.[0]
  const backgroundLeaf = placementChildren?.[1]
  if (heroLeaf !== undefined) {
    heroLeaf.isFinished = true
  }
  if (backgroundLeaf !== undefined) {
    backgroundLeaf.isDead = true
    backgroundLeaf.treeOrderNumber = 7
    backgroundLeaf.documentTextColor = '#ff0000'
    backgroundLeaf.documentBackgroundColor = '#00ff00'
  }
  return treeData
}

function buildNestedSortSampleTreeData (): I_faProjectHierarchyTreeHeTreeNode[] {
  const treeData = structuredClone(sampleTreeData) as I_faProjectHierarchyTreeHeTreeNode[]
  const heroParent = treeData[0]?.children?.[0]?.children?.[0]
  if (heroParent === undefined) {
    return treeData
  }
  heroParent.children = [
    {
      children: [],
      childrenLoaded: true,
      documentId: ZETA_DOCUMENT_ID,
      groupId: null,
      hasChildren: false,
      icon: 'mdi-account',
      id: ZETA_DOCUMENT_ID,
      isCategory: false,
      label: 'Zeta Nested',
      nodeKind: 'document',
      placementId: HEROES_PLACEMENT_ID,
      worldColor: '#4caf50',
      worldId: WORLD_ID
    },
    {
      children: [],
      childrenLoaded: true,
      documentId: DOCUMENT_ID,
      groupId: null,
      hasChildren: false,
      icon: 'mdi-account',
      id: DOCUMENT_ID,
      isCategory: false,
      label: 'Hero Leaf',
      nodeKind: 'document',
      placementId: HEROES_PLACEMENT_ID,
      worldColor: '#4caf50',
      worldId: WORLD_ID
    }
  ]
  return treeData
}

function buildLazyExpandSampleTreeData (): I_faProjectHierarchyTreeHeTreeNode[] {
  const treeData = structuredClone(sampleTreeData) as I_faProjectHierarchyTreeHeTreeNode[]
  const heroParent = treeData[0]?.children?.[0]?.children?.[0]
  if (heroParent === undefined) {
    return treeData
  }
  heroParent.childrenLoaded = false
  heroParent.children = [{
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: heroParent.icon,
    id: `${PARENT_DOCUMENT_ID}__lazy`,
    label: '',
    nodeKind: 'document',
    placementId: HEROES_PLACEMENT_ID,
    worldColor: '#4caf50',
    worldId: WORLD_ID
  }]
  return treeData
}

const sampleWorldB: I_faProjectWorld = {
  color: '#2196f3',
  colorPalette: '',
  createdAtMs: 1,
  displayName: 'Nordheim',
  displayNameTranslations: { 'en-US': 'Nordheim' },
  id: WORLD_ID_B,
  sortOrder: 1,
  updatedAtMs: 1
}

const multiWorldWorlds: I_faProjectHierarchyTreeWorkspaceWorld[] = [
  ...sampleWorlds,
  {
    color: '#2196f3',
    colorPalette: '',
    displayName: 'Nordheim',
    groups: [],
    id: WORLD_ID_B,
    placements: [],
    sortOrder: 1
  }
]

const multiWorldTreeData: I_faProjectHierarchyTreeHeTreeNode[] = [
  ...structuredClone(sampleTreeData) as I_faProjectHierarchyTreeHeTreeNode[],
  {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: WORLD_ID_B,
    label: 'Nordheim',
    nodeKind: 'world',
    placementId: null,
    worldColor: '#2196f3',
    worldId: WORLD_ID_B
  }
]

const selectorList = {
  addUnderButton: 'projectHierarchyTree-documentButton-addUnder',
  contextAddNew: 'projectHierarchyTree-nodeContextMenu-addNew',
  contextAddUnder: 'projectHierarchyTree-nodeContextMenu-addNewDocumentUnderThis',
  contextCollapseAll: 'projectHierarchyTree-nodeContextMenu-collapseAll',
  contextCopyBackgroundColor: 'projectHierarchyTree-nodeContextMenu-copyBackgroundColor',
  contextCopyDocument: 'projectHierarchyTree-nodeContextMenu-copyDocument',
  contextCopyName: 'projectHierarchyTree-nodeContextMenu-copyName',
  contextCopyTextColor: 'projectHierarchyTree-nodeContextMenu-copyTextColor',
  contextDeleteDocument: 'projectHierarchyTree-nodeContextMenu-deleteDocument',
  contextEditDocument: 'projectHierarchyTree-nodeContextMenu-editDocument',
  contextExpandAll: 'projectHierarchyTree-nodeContextMenu-expandAll',
  contextOpenDocument: 'projectHierarchyTree-nodeContextMenu-openDocument',
  contextSortBy: 'projectHierarchyTree-nodeContextMenu-sortBy',
  contextSortByNamesDirectAsc: 'projectHierarchyTree-nodeContextMenu-sortBy-namesDirectAsc',
  contextSortBySubmenu: 'projectHierarchyTree-nodeContextMenu-sortBySubmenu',
  deadMarker: 'projectHierarchyTree-node-document-deadMarker',
  deleteDialog: 'dialogDeleteOpenedDocument',
  deleteDialogCancel: 'dialogDeleteOpenedDocument-cancel',
  deleteDialogConfirm: 'dialogDeleteOpenedDocument-delete',
  editButton: 'projectHierarchyTree-documentButton-edit',
  finishedMarker: 'projectHierarchyTree-node-document-finishedMarker',
  nodeDocument: 'projectHierarchyTree-node-document',
  nodeLabelSuffix: '-label',
  nodeTemplatePlacement: 'projectHierarchyTree-node-templatePlacement',
  nodeWorld: 'projectHierarchyTree-node-world',
  openButton: 'projectHierarchyTree-documentButton-open',
  openIcon: 'projectHierarchyTree-openIcon',
  orderNumberBadge: 'projectHierarchyTree-orderNumberBadge',
  placementCount: 'projectHierarchyTree-placementCount',
  placementCountCategory: 'projectHierarchyTree-placementCount-category',
  placementCountDocument: 'projectHierarchyTree-placementCount-document',
  previewTitle: 'documentWorkspacePage-previewTitle',
  projectName: 'projectHierarchyTree-projectName',
  nameInput: 'documentWorkspacePage-nameInput',
  root: 'projectHierarchyTree-root',
  tree: 'projectHierarchyTree',
  dialogAppSettingsTitle: 'dialogAppSettings-title',
  dialogAppSettingsSave: 'dialogAppSettings-button-save',
  dialogAppSettingsTabHierarchicalTree: 'dialogAppSettings-tab-hierarchicalTree',
  dialogAppSettingsSettingHideTreeLines: 'dialogAppSettings-setting-hideTreeLines',
  dialogAppSettingsSettingHideTreeOrderNumbers: 'dialogAppSettings-setting-hideTreeOrderNumbers'
} as const

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

async function openAppSettingsFromHierarchyTreeHarness (page: Page): Promise<void> {
  await prepareRendererForGlobalShortcuts(page)
  await page.keyboard.press(getFaPlaywrightDefaultOpenAppSettingsPressString())
  await expect(
    page.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
  ).toBeVisible({ timeout: 15_000 })
}

async function openAppSettingsHierarchicalTreeTab (page: Page): Promise<void> {
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

const defaultHierarchySeed: I_faComponentTestingStoreSeed = {
  activeProject: sampleActiveProject,
  hierarchyTree: {
    treeData: sampleTreeData,
    uiState: sampleExpandedUiState,
    worlds: sampleWorlds
  },
  openedDocuments: {
    activeDocumentId: null,
    tabs: []
  },
  projectContentOverrides: {
    documentsById: sampleDocumentsById,
    placementDocumentChildrenByKey: {
      [`${HEROES_PLACEMENT_ID}::${PARENT_DOCUMENT_ID}`]: sampleParentChildDocuments,
      [`${HEROES_PLACEMENT_ID}::__root__`]: samplePlacementDocuments
    },
    templatesById: {
      [TEMPLATE_ID]: sampleTemplate
    },
    worldsById: {
      [WORLD_ID]: sampleWorld
    }
  }
}

const markedHierarchySeed: I_faComponentTestingStoreSeed = {
  ...defaultHierarchySeed,
  hierarchyTree: {
    treeData: buildMarkedSampleTreeData(),
    uiState: sampleExpandedUiState,
    worlds: sampleWorlds
  }
}

const multiWorldHierarchySeed: I_faComponentTestingStoreSeed = {
  ...defaultHierarchySeed,
  hierarchyTree: {
    treeData: multiWorldTreeData,
    uiState: sampleExpandedUiState,
    worlds: multiWorldWorlds
  },
  projectContentOverrides: {
    documentsById: sampleDocumentsById,
    placementDocumentChildrenByKey: {
      [`${HEROES_PLACEMENT_ID}::${PARENT_DOCUMENT_ID}`]: sampleParentChildDocuments,
      [`${HEROES_PLACEMENT_ID}::__root__`]: samplePlacementDocuments
    },
    templatesById: {
      [TEMPLATE_ID]: sampleTemplate
    },
    worldsById: {
      [WORLD_ID]: sampleWorld,
      [WORLD_ID_B]: sampleWorldB
    }
  }
}

async function stubHierarchyTreeBridge (page: Page): Promise<void> {
  // contextBridge freezes projectContent methods; Pinia hierarchy seed + projectContentOverrides
  // cover tree display and open/temp document reads. Best-effort assign when writable.
  await page.evaluate((payload) => {
    const content = window.faContentBridgeAPIs?.projectContent
    const management = window.faContentBridgeAPIs?.projectManagement
    if (content === undefined || management === undefined) {
      return
    }
    try {
      ;(content as { listWorkspaceHierarchyLayout?: unknown }).listWorkspaceHierarchyLayout =
        async () => {
          return {
            worlds: payload.worlds
          }
        }
      ;(content as { listPlacementDocumentChildren?: unknown }).listPlacementDocumentChildren =
        async (input: { parentDocumentId?: string | null }) => {
          const parentKey = input?.parentDocumentId ?? '__root__'
          const items = payload.placementDocumentsByParentId[parentKey] ?? []
          return {
            items
          }
        }
      ;(management as { getHierarchyTreeUiState?: unknown }).getHierarchyTreeUiState = async () => {
        return payload.uiState
      }
      ;(management as { setHierarchyTreeUiState?: unknown }).setHierarchyTreeUiState = async () => {
        return true
      }
      ;(management as { getOpenedDocumentsSnapshot?: unknown }).getOpenedDocumentsSnapshot = async () => {
        return {
          activeDocumentId: null,
          schemaVersion: 1,
          tabs: []
        }
      }
      ;(management as { saveOpenedDocumentsSnapshot?: unknown }).saveOpenedDocumentsSnapshot =
        async () => {
          return true
        }
    } catch {
      // Frozen bridge: ignore.
    }
  }, {
    placementDocumentsByParentId: {
      [PARENT_DOCUMENT_ID]: sampleParentChildDocuments,
      __root__: samplePlacementDocuments
    } as Record<string, I_faProjectHierarchyTreeDocumentChild[]>,
    uiState: sampleExpandedUiState,
    worlds: sampleWorlds
  })
}

async function replaceRouterPath (page: Page, path: string): Promise<void> {
  await page.evaluate(async (routePath) => {
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
    await router.replace({ path: routePath })
  }, path)
}

async function ensureHierarchyTreeHarnessBox (page: Page): Promise<void> {
  await page.locator(`[data-test-locator="${selectorList.root}"]`).waitFor({
    state: 'attached',
    timeout: 30_000
  })
  await page.addStyleTag({
    content: `
      [data-test-locator="${selectorList.root}"] {
        height: 360px !important;
        width: 375px !important;
      }
    `
  })
}

async function expandTreeUntilDocumentVisible (
  page: Page,
  documentLabelText: string
): Promise<void> {
  const worldLabel = page.locator(
    `[data-test-locator="${selectorList.nodeWorld}${selectorList.nodeLabelSuffix}"]`
  ).filter({ hasText: 'Eldoria' })
  await expect(worldLabel).toHaveText('Eldoria', { timeout: 15_000 })

  const documentLabel = page.locator(
    `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
  ).filter({ hasText: documentLabelText })
  const treeRoot = page.locator(`[data-test-locator="${selectorList.tree}"]`)

  await expect.poll(async () => {
    if (await documentLabel.count() > 0) {
      return true
    }

    const collapsedTreeItems = treeRoot.locator('[role="treeitem"][aria-expanded="false"]')
    const collapsedCount = await collapsedTreeItems.count()
    if (collapsedCount > 0) {
      const openIconWrapper = collapsedTreeItems.first()
        .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
      if (await openIconWrapper.count() > 0) {
        await openIconWrapper.dispatchEvent('pointerdown')
        await openIconWrapper.click({ force: true })
      } else {
        await collapsedTreeItems.first().click({ force: true })
      }
      await page.waitForTimeout(300)
      return false
    }

    const placementLabel = page.locator(
      `[data-test-locator="${selectorList.nodeTemplatePlacement}${selectorList.nodeLabelSuffix}"]`
    )
    if (await placementLabel.count() > 0) {
      await placementLabel.first().click({ force: true })
      await page.waitForTimeout(300)
    } else {
      await worldLabel.click({ force: true })
      await page.waitForTimeout(300)
    }
    return false
  }, {
    timeout: 30_000
  }).toBe(true)

  await expect(documentLabel.first()).toBeVisible({ timeout: 15_000 })
}

async function remountHierarchyTreeAfterStoreSeed (
  page: Page,
  seed: I_faComponentTestingStoreSeed,
  options?: {
    expandUntilDocumentLabel?: string
    expectTreeRootVisible?: boolean
    routePath?: string
  }
): Promise<void> {
  await page.waitForFunction(() => {
    return typeof window.__faComponentTestingPatchStores === 'function'
  }, { timeout: 30_000 })

  await stubHierarchyTreeBridge(page)

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

  const routePath = options?.routePath ?? '/componentTesting/ProjectHierarchyTree'
  const expectTreeRootVisible = options?.expectTreeRootVisible !== false
  await replaceRouterPath(page, routePath)
  if (expectTreeRootVisible) {
    await ensureHierarchyTreeHarnessBox(page)
  }
  await page.waitForTimeout(faFrontendRenderTimer)

  // Wait out MainLayout opened-documents hydrate so it cannot wipe the seed below.
  if (routePath === '/home' || routePath.startsWith('/home/')) {
    await expect.poll(async () => {
      return await page.evaluate(() => {
        return window.location.hash
      })
    }, {
      timeout: 15_000
    }).toMatch(/^#\/home(?:\/document\/[^#]*)?$/)
    await page.waitForTimeout(faFrontendRenderTimer)
  }

  await patchFaPlaywrightComponentHarnessStores(page, {
    ...seed,
    activeProject: undefined,
    disableCategoryCount: seed.disableCategoryCount ?? false,
    disableDocumentCounts: seed.disableDocumentCounts ?? false,
    doubleDashDocCount: seed.doubleDashDocCount ?? false,
    forceSublevelCollapseInTree: seed.forceSublevelCollapseInTree ?? false,
    hideDeadCrossThrough: seed.hideDeadCrossThrough ?? false,
    hideHierarchyTree: seed.hideHierarchyTree ?? false,
    hideTreeIconAddUnder: seed.hideTreeIconAddUnder ?? false,
    hideTreeIconEdit: seed.hideTreeIconEdit ?? false,
    hideTreeIconView: seed.hideTreeIconView ?? false,
    hideTreeLines: seed.hideTreeLines ?? false,
    hideTreeOrderNumbers: seed.hideTreeOrderNumbers ?? false,
    invertCategoryPosition: seed.invertCategoryPosition ?? false,
    noProjectName: seed.noProjectName ?? false
  })
  await page.waitForTimeout(faFrontendRenderTimer)

  // Hydrate can finish after the first seed patch and rebuild a layout skeleton.
  // Re-apply hierarchy + content overrides after a beat so document rows and open/temp reads stick.
  if (seed.hierarchyTree !== undefined || seed.projectContentOverrides !== undefined) {
    await stubHierarchyTreeBridge(page)
    await patchFaPlaywrightComponentHarnessStores(page, {
      hierarchyTree: seed.hierarchyTree,
      openedDocuments: seed.openedDocuments ?? {
        activeDocumentId: null,
        tabs: []
      },
      projectContentOverrides: seed.projectContentOverrides
    })
    await page.waitForTimeout(faFrontendRenderTimer)
  }

  if (routePath === '/home') {
    await replaceRouterPath(page, '/home')
    await page.waitForTimeout(faFrontendRenderTimer)
    await patchFaPlaywrightComponentHarnessStores(page, {
      disableCategoryCount: seed.disableCategoryCount ?? false,
      disableDocumentCounts: seed.disableDocumentCounts ?? false,
      doubleDashDocCount: seed.doubleDashDocCount ?? false,
      forceSublevelCollapseInTree: seed.forceSublevelCollapseInTree ?? false,
      hideDeadCrossThrough: seed.hideDeadCrossThrough ?? false,
      hideHierarchyTree: seed.hideHierarchyTree ?? false,
      hideTreeLines: seed.hideTreeLines ?? false,
      hideTreeOrderNumbers: seed.hideTreeOrderNumbers ?? false,
      hierarchyTree: seed.hierarchyTree,
      invertCategoryPosition: seed.invertCategoryPosition ?? false,
      noProjectName: seed.noProjectName ?? false,
      openedDocuments: {
        activeDocumentId: null,
        tabs: []
      },
      projectContentOverrides: seed.projectContentOverrides
    })
    await page.waitForTimeout(faFrontendRenderTimer)
  }

  if (!expectTreeRootVisible) {
    return
  }

  await page.locator(`[data-test-locator="${selectorList.root}"]`).waitFor({
    state: 'visible',
    timeout: 30_000
  })
  const expandUntilDocumentLabel = options?.expandUntilDocumentLabel ?? 'Hero Leaf'
  await expandTreeUntilDocumentVisible(page, expandUntilDocumentLabel)
}

async function readOpenedDocumentsSession (page: Page): Promise<{
  activeDocumentId: string | null
  tabs: Array<{
    documentId: string
    editState: boolean
    persistenceState: string
    tabLabel: string
  }>
}> {
  return await page.evaluate(() => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                activeDocumentId?: string | null
                tabs?: Array<{
                  documentId: string
                  editState: boolean
                  persistenceState: string
                  tabLabel: string
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
          documentId: tab.documentId,
          editState: tab.editState,
          persistenceState: tab.persistenceState,
          tabLabel: tab.tabLabel
        }
      })
    }
  })
}

async function openHierarchyNodeContextMenu (page: Page, nodeId: string): Promise<void> {
  await page.locator(
    `[data-test-hierarchy-node-id="${nodeId}"]:not([role="menu"])`
  ).click({
    button: 'right',
    force: true
  })
}

async function clickHierarchySortByMode (
  page: Page,
  modeId: string
): Promise<void> {
  const sortByRow = page.locator(`[data-test-locator="${selectorList.contextSortBy}"]`)
  await expect(sortByRow).toBeVisible()
  await sortByRow.hover()
  const sortBySubmenu = page.locator(`[data-test-locator="${selectorList.contextSortBySubmenu}"]`)
  await expect(sortBySubmenu).toBeVisible({ timeout: 15_000 })
  const modeItem = page.locator(
    `[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-${modeId}"]`
  )
  await modeItem.hover()
  await modeItem.click()
  await expect(sortBySubmenu).toHaveCount(0, { timeout: 15_000 })
}

async function readLastHierarchySortAction (page: Page): Promise<{
  errorMessage: string | null
  payloadPreview: string | null
  status: string | null
}> {
  return await page.evaluate(() => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                actionHistory?: Array<{
                  errorMessage?: string
                  id?: string
                  payloadPreview?: string
                  status?: string
                }>
              }>
            }
          }
        }
      }
    }
    const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get(
      'S_FaActionManager'
    )
    const sortRows = (store?.actionHistory ?? []).filter((row) => {
      return row.id === 'sortHierarchyTreeDocuments'
    })
    const last = sortRows.at(-1)
    return {
      errorMessage: last?.errorMessage ?? null,
      payloadPreview: last?.payloadPreview ?? null,
      status: last?.status ?? null
    }
  })
}

async function readClipboardTextBestEffort (page: Page): Promise<string | null> {
  return await page.evaluate(async () => {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return null
    }
  })
}

test.describe.serial('Project hierarchy tree seeded layout', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  test.describe.configure({
    timeout: 120_000
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
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed)
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if hierarchy host renders seeded world and placement rows', async () => {
    await expect(appWindow.locator(`[data-test-locator="${selectorList.tree}"]`)).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nodeWorld}${selectorList.nodeLabelSuffix}"]`)
    ).toHaveText('Eldoria')
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeTemplatePlacement}${selectorList.nodeLabelSuffix}"]`
      )
    ).toHaveText('Heroes')
  })

  test('Check if expanded placement shows seeded document leaf and open button', async () => {
    const documentLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Leaf' })
    await expect(documentLabel).toBeVisible({ timeout: 15_000 })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.openButton}"]`).first()
    ).toBeVisible()
  })
})

test.describe.serial('Project hierarchy tree document open edit expand', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  // MainLayout /home: openFromTree must not leave component-testing (hydrate wipes tabs).
  const workspaceTreeRemountOptions = {
    routePath: '/home'
  } as const

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
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if hideTreeIcon settings hide matching document row buttons', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hideTreeIconAddUnder: true,
      hideTreeIconEdit: true,
      hideTreeIconView: true
    }, workspaceTreeRemountOptions)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.openButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.editButton}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.addUnderButton}"]`)
    ).toHaveCount(0)
  })

  test('Check if open icon collapses a non-world node', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const placementTreeItem = appWindow.locator(
      `[data-test-locator="${selectorList.nodeTemplatePlacement}"]`
    ).locator('xpath=ancestor::*[@role="treeitem"][1]')
    await expect(placementTreeItem).toHaveAttribute('aria-expanded', 'true')

    const placementOpenIconWrapper = appWindow.locator(
      `[data-test-locator="${selectorList.nodeTemplatePlacement}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
      .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
    await placementOpenIconWrapper.dispatchEvent('pointerdown')
    await placementOpenIconWrapper.click({ force: true })
    await expect(placementTreeItem).toHaveAttribute('aria-expanded', 'false', { timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Hero Leaf' })
    ).toHaveCount(0)
  })

  test('Check if add-under row button creates a temporary child tab', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const leafRow = appWindow.locator(
      `[data-test-hierarchy-node-id="${DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
    const addUnderButton = leafRow.locator(`[data-test-locator="${selectorList.addUnderButton}"]`)
    await expect(addUnderButton).toBeVisible()
    await addUnderButton.click({ force: true })

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.some((tab) => tab.persistenceState === 'temporary')
    }, {
      timeout: 15_000
    }).toBe(true)

    const session = await readOpenedDocumentsSession(appWindow)
    const temporaryTab = session.tabs.find((tab) => tab.persistenceState === 'temporary')
    expect(temporaryTab).toBeDefined()
    expect(session.activeDocumentId).toBe(temporaryTab?.documentId)
  })

  test('Check if open row button opens the document in preview mode', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const leafRow = appWindow.locator(
      `[data-test-hierarchy-node-id="${DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
    await leafRow.locator(`[data-test-locator="${selectorList.openButton}"]`).click()

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.location.hash
      })
    }).toContain(`/home/document/${DOCUMENT_ID}`)

    const session = await readOpenedDocumentsSession(appWindow)
    expect(session.activeDocumentId).toBe(DOCUMENT_ID)
    expect(session.tabs.find((tab) => tab.documentId === DOCUMENT_ID)?.editState).toBe(false)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.previewTitle}"]`)
    ).toBeVisible({ timeout: 15_000 })
  })

  test('Check if edit row button opens the document in edit mode', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const leafRow = appWindow.locator(
      `[data-test-hierarchy-node-id="${DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
    await leafRow.locator(`[data-test-locator="${selectorList.editButton}"]`).click()

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.location.hash
      })
    }).toContain(`/home/document/${DOCUMENT_ID}`)

    const session = await readOpenedDocumentsSession(appWindow)
    expect(session.tabs.find((tab) => tab.documentId === DOCUMENT_ID)?.editState).toBe(true)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    ).toBeVisible({ timeout: 15_000 })
  })

  test('Check if left-click on a leaf document opens a tab and navigates', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Background Leaf' }).click()

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.location.hash
      })
    }).toContain(`/home/document/${BACKGROUND_DOCUMENT_ID}`)

    const session = await readOpenedDocumentsSession(appWindow)
    expect(session.activeDocumentId).toBe(BACKGROUND_DOCUMENT_ID)
  })

  test('Check if active tree row highlight follows the active opened tab', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const heroNode = appWindow.locator(`[data-test-hierarchy-node-id="${DOCUMENT_ID}"]`)
    const backgroundNode = appWindow.locator(
      `[data-test-hierarchy-node-id="${BACKGROUND_DOCUMENT_ID}"]`
    )

    await expect(heroNode).not.toHaveClass(/projectHierarchyTreeNode--activeTabDocument/)
    await expect(backgroundNode).not.toHaveClass(/projectHierarchyTreeNode--activeTabDocument/)

    await appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Leaf' }).click()
    await expect.poll(async () => {
      return (await readOpenedDocumentsSession(appWindow)).activeDocumentId
    }).toBe(DOCUMENT_ID)
    await expect(heroNode).toHaveClass(/projectHierarchyTreeNode--activeTabDocument/)
    await expect(backgroundNode).not.toHaveClass(/projectHierarchyTreeNode--activeTabDocument/)

    await appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Background Leaf' }).click()
    await expect.poll(async () => {
      return (await readOpenedDocumentsSession(appWindow)).activeDocumentId
    }).toBe(BACKGROUND_DOCUMENT_ID)
    await expect(backgroundNode).toHaveClass(/projectHierarchyTreeNode--activeTabDocument/)
    await expect(heroNode).not.toHaveClass(/projectHierarchyTreeNode--activeTabDocument/)
  })

  test('Check if document DnD sibling reorder updates tree UI order', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const placementSiblingLabels = appWindow.locator(
      `[role="treeitem"][aria-level="3"] [data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    )
    await expect(placementSiblingLabels).toHaveCount(2)
    await expect(placementSiblingLabels.nth(0)).toHaveText('Hero Parent')
    await expect(placementSiblingLabels.nth(1)).toHaveText('Background Leaf')

    await dragHierarchyTreeDocumentNodeWithHold(
      appWindow,
      BACKGROUND_DOCUMENT_ID,
      PARENT_DOCUMENT_ID
    )

    await expect.poll(async () => {
      return [
        await placementSiblingLabels.nth(0).textContent(),
        await placementSiblingLabels.nth(1).textContent()
      ]
    }, {
      timeout: 15_000
    }).toEqual(['Background Leaf', 'Hero Parent'])
  })

  test('Check if document DnD reparent nests under the belongs-under target', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const levelThreeLabels = appWindow.locator(
      `[role="treeitem"][aria-level="3"] [data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    )
    await expect(levelThreeLabels).toHaveCount(2)
    await expect(levelThreeLabels.nth(0)).toHaveText('Hero Parent')
    await expect(levelThreeLabels.nth(1)).toHaveText('Background Leaf')

    await dragHierarchyTreeDocumentNodeWithHold(
      appWindow,
      BACKGROUND_DOCUMENT_ID,
      PARENT_DOCUMENT_ID,
      { mode: 'nest-into-target' }
    )

    await expect.poll(async () => {
      return await appWindow.locator(
        `[data-test-hierarchy-node-id="${BACKGROUND_DOCUMENT_ID}"]`
      ).locator('xpath=ancestor::*[@role="treeitem"][1]').getAttribute('aria-level')
    }, {
      timeout: 15_000
    }).toBe('4')

    await expect(levelThreeLabels).toHaveCount(1)
    await expect(levelThreeLabels.nth(0)).toHaveText('Hero Parent')
    await expect(
      appWindow.locator(
        `[role="treeitem"][aria-level="4"] [data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Background Leaf' })
    ).toBeVisible()
  })

  test('Check if Escape mid-drag cancels and leaves sibling order unchanged', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const placementSiblingLabels = appWindow.locator(
      `[role="treeitem"][aria-level="3"] [data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    )
    await expect(placementSiblingLabels).toHaveCount(2)
    await expect(placementSiblingLabels.nth(0)).toHaveText('Hero Parent')
    await expect(placementSiblingLabels.nth(1)).toHaveText('Background Leaf')

    await cancelHierarchyTreeDocumentDragWithEscape(
      appWindow,
      BACKGROUND_DOCUMENT_ID,
      PARENT_DOCUMENT_ID
    )

    await expect(placementSiblingLabels.nth(0)).toHaveText('Hero Parent')
    await expect(placementSiblingLabels.nth(1)).toHaveText('Background Leaf')
  })

  test('Check if left-click on a document with children expands instead of opening', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hierarchyTree: {
        treeData: sampleTreeData,
        uiState: {
          expandedNodeIds: [WORLD_ID, HEROES_PLACEMENT_ID],
          schemaVersion: 1,
          scrollTopPx: 0
        },
        worlds: sampleWorlds
      }
    }, {
      expandUntilDocumentLabel: 'Hero Parent',
      routePath: '/home'
    })

    const parentLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Parent' })
    await expect(parentLabel).toBeVisible()

    const parentTreeItem = appWindow.locator(
      `[data-test-hierarchy-node-id="${PARENT_DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::*[@role="treeitem"][1]')
    await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'false')

    const hashBefore = await appWindow.evaluate(() => {
      return window.location.hash
    })
    await parentLabel.click()
    await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true', { timeout: 15_000 })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Hero Leaf' })
    ).toBeVisible()

    const hashAfter = await appWindow.evaluate(() => {
      return window.location.hash
    })
    expect(hashAfter).toBe(hashBefore)
    const session = await readOpenedDocumentsSession(appWindow)
    expect(session.tabs.some((tab) => tab.documentId === PARENT_DOCUMENT_ID)).toBe(false)
  })

  test('Check if middle-click opens a document tab and focuses it', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Leaf' }).click()
    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.activeDocumentId
    }).toBe(DOCUMENT_ID)

    await appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Background Leaf' }).click({
      button: 'middle'
    })

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.some((tab) => tab.documentId === BACKGROUND_DOCUMENT_ID)
    }, {
      timeout: 15_000
    }).toBe(true)

    const session = await readOpenedDocumentsSession(appWindow)
    expect(session.activeDocumentId).toBe(BACKGROUND_DOCUMENT_ID)
    expect(session.tabs.some((tab) => tab.documentId === DOCUMENT_ID)).toBe(true)
    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.location.hash
      })
    }).toContain(`/home/document/${BACKGROUND_DOCUMENT_ID}`)
  })
})

test.describe.serial('Project hierarchy tree chrome markers context add-new', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  const workspaceTreeRemountOptions = {
    routePath: '/home'
  } as const

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
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if finished and dead markers render with dead strikethrough', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, markedHierarchySeed, workspaceTreeRemountOptions)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.finishedMarker}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.deadMarker}"]`)
    ).toBeVisible()

    const deadLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Background Leaf' })
    await expect(deadLabel).toHaveClass(/projectHierarchyTreeNode__label--dead/)
  })

  test('Check if hideDeadCrossThrough clears dead label line-through via body class', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...markedHierarchySeed,
      hideDeadCrossThrough: true
    }, workspaceTreeRemountOptions)

    const deadLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Background Leaf' })
    await expect(deadLabel).toHaveClass(/projectHierarchyTreeNode__label--dead/)

    await expect.poll(async () => {
      return await deadLabel.evaluate((element) => {
        return window.getComputedStyle(element).textDecorationLine
      })
    }).toBe('none')

    const hasBodyClass = await appWindow.evaluate(() => {
      return document.body.classList.contains('fa-userSetting--hideDeadCrossThrough')
    })
    expect(hasBodyClass).toBe(true)
  })

  test('Check if order-number badge shows and hideTreeOrderNumbers hides it', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, markedHierarchySeed, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberBadge}"]`)
    ).toHaveText('7')

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...markedHierarchySeed,
      hideTreeOrderNumbers: true
    }, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberBadge}"]`)
    ).toHaveCount(0)
  })

  test('Check if hideTreeLines removes structural tree lines', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)
    await expect.poll(async () => {
      return await appWindow.locator(
        `[data-test-locator="${selectorList.tree}"] .tree-line`
      ).count()
    }).toBeGreaterThan(0)

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hideTreeLines: true
    }, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tree}"] .tree-line`)
    ).toHaveCount(0)
  })

  test('Check if Save hierarchy chrome flags update the mounted tree', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...markedHierarchySeed,
      hideTreeLines: false,
      hideTreeOrderNumbers: false
    }, workspaceTreeRemountOptions)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberBadge}"]`)
    ).toHaveText('7')
    await expect.poll(async () => {
      return await appWindow.locator(
        `[data-test-locator="${selectorList.tree}"] .tree-line`
      ).count()
    }).toBeGreaterThan(0)

    await openAppSettingsFromHierarchyTreeHarness(appWindow)
    await openAppSettingsHierarchicalTreeTab(appWindow)
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingHideTreeOrderNumbers,
      true
    )
    await toggleAppSettingsSwitch(
      appWindow,
      selectorList.dialogAppSettingsSettingHideTreeLines,
      true
    )
    await appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsSave}"]`).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.dialogAppSettingsTitle}"]`)
    ).toHaveCount(0, { timeout: 15_000 })
    await appWindow.waitForTimeout(postSaveAppSettingsWaitMs)

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.orderNumberBadge}"]`)
    ).toHaveCount(0)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.tree}"] .tree-line`)
    ).toHaveCount(0)
  })

  test('Check if noProjectName hides project title on multi-world seed', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, multiWorldHierarchySeed, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectName}"]`)
    ).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectName}"]`)
    ).toHaveText(sampleActiveProject.name)

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...multiWorldHierarchySeed,
      noProjectName: true
    }, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.projectName}"]`)
    ).toHaveCount(0)
  })

  test('Check if hideHierarchyTree hides the tree host on home', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hideHierarchyTree: true
    }, {
      expectTreeRootVisible: false,
      routePath: '/home'
    })

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.root}"]`)
    ).toHaveCount(0)
  })

  test('Check if forceSublevelCollapseInTree clears nested expand when parent closes', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      forceSublevelCollapseInTree: true
    }, workspaceTreeRemountOptions)

    const heroLeafLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Leaf' })
    await expect(heroLeafLabel).toBeVisible()

    const parentTreeItem = appWindow.locator(
      `[data-test-hierarchy-node-id="${PARENT_DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::*[@role="treeitem"][1]')
    await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true')

    const parentOpenIconWrapper = appWindow.locator(
      `[data-test-hierarchy-node-id="${PARENT_DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
      .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
    await parentOpenIconWrapper.dispatchEvent('pointerdown')
    await parentOpenIconWrapper.click({ force: true })

    await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'false', { timeout: 15_000 })
    await expect(heroLeafLabel).toHaveCount(0)
    // Re-expand after force collapse needs lazy IPC reload; frozen contextBridge stubs often fail.
  })

  test('Check if context expand all and collapse all update visible children', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hierarchyTree: {
        treeData: sampleTreeData,
        uiState: {
          expandedNodeIds: [WORLD_ID, HEROES_PLACEMENT_ID],
          schemaVersion: 1,
          scrollTopPx: 0
        },
        worlds: sampleWorlds
      }
    }, {
      expandUntilDocumentLabel: 'Hero Parent',
      routePath: '/home'
    })

    const heroLeafLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Leaf' })
    await expect(heroLeafLabel).toHaveCount(0)

    const placementLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeTemplatePlacement}${selectorList.nodeLabelSuffix}"]`
    )
    await placementLabel.click({
      button: 'right',
      force: true
    })
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextExpandAll}"]`
    ).click()
    await expect(heroLeafLabel).toBeVisible({ timeout: 15_000 })

    await placementLabel.click({
      button: 'right',
      force: true
    })
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextCollapseAll}"]`
    ).click()
    await expect(heroLeafLabel).toHaveCount(0, { timeout: 15_000 })
  })

  test('Check if add-new-document row left-click creates a temporary tab', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await appWindow.locator(
      '[data-test-locator="projectHierarchyTree-node-addNewDocument-label"]'
    ).filter({ hasText: 'Add new character' }).click({ force: true })

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.some((tab) => tab.persistenceState === 'temporary')
    }, {
      timeout: 15_000
    }).toBe(true)

    const session = await readOpenedDocumentsSession(appWindow)
    const temporaryTab = session.tabs.find((tab) => tab.persistenceState === 'temporary')
    expect(temporaryTab).toBeDefined()
    expect(session.activeDocumentId).toBe(temporaryTab?.documentId)
  })

  test('Check if add-new-document row middle-click creates a temporary tab', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Leaf' }).click()
    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.activeDocumentId
    }).toBe(DOCUMENT_ID)

    await appWindow.locator(
      '[data-test-locator="projectHierarchyTree-node-addNewDocument-label"]'
    ).filter({ hasText: 'Add new character' }).click({
      button: 'middle',
      force: true
    })

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.filter((tab) => tab.persistenceState === 'temporary').length
    }, {
      timeout: 15_000
    }).toBeGreaterThan(0)

    const session = await readOpenedDocumentsSession(appWindow)
    expect(session.tabs.some((tab) => tab.documentId === DOCUMENT_ID)).toBe(true)
    expect(session.tabs.some((tab) => tab.persistenceState === 'temporary')).toBe(true)
  })
})

test.describe.serial('Project hierarchy tree context menu and placement counts', () => {
  let electronApp: ElectronApplication
  let appWindow: Page
  let suiteTestInfo: TestInfo

  const workspaceTreeRemountOptions = {
    routePath: '/home'
  } as const

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
  })

  test.afterAll(async ({}, afterAllTestInfo) => {
    await tearDownFaPlaywrightElectronSerialSuite({
      afterAllTestInfo,
      electronApp,
      suiteTestInfo
    })
  })

  test('Check if context Open and Edit open the document in matching modes', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await openHierarchyNodeContextMenu(appWindow, DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextOpenDocument}"]`
    ).click()

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.location.hash
      })
    }).toContain(`/home/document/${DOCUMENT_ID}`)
    let session = await readOpenedDocumentsSession(appWindow)
    expect(session.activeDocumentId).toBe(DOCUMENT_ID)
    expect(session.tabs.find((tab) => tab.documentId === DOCUMENT_ID)?.editState).toBe(false)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.previewTitle}"]`)
    ).toBeVisible({ timeout: 15_000 })

    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)
    await openHierarchyNodeContextMenu(appWindow, DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextEditDocument}"]`
    ).click()

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        return window.location.hash
      })
    }).toContain(`/home/document/${DOCUMENT_ID}`)
    session = await readOpenedDocumentsSession(appWindow)
    expect(session.tabs.find((tab) => tab.documentId === DOCUMENT_ID)?.editState).toBe(true)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.nameInput}"]`)
    ).toBeVisible({ timeout: 15_000 })
  })

  test('Check if context Copy document and Add under create temporary tabs', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await openHierarchyNodeContextMenu(appWindow, DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextCopyDocument}"]`
    ).click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.filter((tab) => tab.persistenceState === 'temporary').length
    }, {
      timeout: 15_000
    }).toBeGreaterThan(0)

    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)
    await openHierarchyNodeContextMenu(appWindow, DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextAddUnder}"]`
    ).click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.some((tab) => tab.persistenceState === 'temporary')
    }, {
      timeout: 15_000
    }).toBe(true)
  })

  test('Check if context Delete opens the delete confirmation dialog', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await openHierarchyNodeContextMenu(appWindow, BACKGROUND_DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextDeleteDocument}"]`
    ).click()

    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.deleteDialog}"]`)
    ).toBeVisible({ timeout: 15_000 })
    await appWindow.locator(
      `[data-test-locator="${selectorList.deleteDialogCancel}"]`
    ).click()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.deleteDialog}"]`)
    ).toHaveCount(0)
  })

  test('Check if context Copy name and colors write clipboard or show success toast', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, markedHierarchySeed, workspaceTreeRemountOptions)

    await openHierarchyNodeContextMenu(appWindow, BACKGROUND_DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextCopyName}"]`
    ).click()
    await expect(
      appWindow.locator('.q-notification').filter({
        hasText: 'Document name copied to the clipboard.'
      })
    ).toBeVisible({ timeout: 15_000 })
    const copiedName = await readClipboardTextBestEffort(appWindow)
    if (copiedName !== null) {
      expect(copiedName).toBe('Background Leaf')
    }

    await openHierarchyNodeContextMenu(appWindow, BACKGROUND_DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextCopyTextColor}"]`
    ).click()
    await expect(
      appWindow.locator('.q-notification').filter({
        hasText: 'Document text color copied to the clipboard.'
      })
    ).toBeVisible({ timeout: 15_000 })
    const copiedTextColor = await readClipboardTextBestEffort(appWindow)
    if (copiedTextColor !== null) {
      expect(copiedTextColor).toBe('#ff0000')
    }

    await openHierarchyNodeContextMenu(appWindow, BACKGROUND_DOCUMENT_ID)
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextCopyBackgroundColor}"]`
    ).click()
    await expect(
      appWindow.locator('.q-notification').filter({
        hasText: 'Document background color copied to the clipboard.'
      })
    ).toBeVisible({ timeout: 15_000 })
    const copiedBackgroundColor = await readClipboardTextBestEffort(appWindow)
    if (copiedBackgroundColor !== null) {
      expect(copiedBackgroundColor).toBe('#00ff00')
    }
  })

  test('Check if context Add new on placement creates a temporary tab', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    await openHierarchyNodeContextMenu(appWindow, HEROES_PLACEMENT_ID)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.contextAddNew}"]`)
    ).toBeVisible()
    await appWindow.locator(
      `[data-test-locator="${selectorList.contextAddNew}"]`
    ).click()

    await expect.poll(async () => {
      const session = await readOpenedDocumentsSession(appWindow)
      return session.tabs.some((tab) => tab.persistenceState === 'temporary')
    }, {
      timeout: 15_000
    }).toBe(true)
  })

  test('Check if placement count segments respect disable and invert settings', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const placementCount = appWindow.locator(
      `[data-test-locator="${selectorList.placementCount}"]`
    )
    await expect(placementCount).toBeVisible()
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.placementCountDocument}"]`)
    ).toHaveText('2')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.placementCountCategory}"]`)
    ).toHaveText('1')
    await expect(placementCount).toHaveText('(2 | 1)')

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      doubleDashDocCount: true
    }, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.placementCount}"]`)
    ).toHaveText('(2 || 1)')

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      invertCategoryPosition: true
    }, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.placementCount}"]`)
    ).toHaveText('(1 | 2)')

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      disableDocumentCounts: true
    }, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.placementCount}"]`)
    ).toHaveText('(1)')
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.placementCountDocument}"]`)
    ).toHaveCount(0)

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      disableCategoryCount: true,
      disableDocumentCounts: true
    }, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(`[data-test-locator="${selectorList.placementCount}"]`)
    ).toHaveCount(0)
  })

  test('Check if Sort by submenu lists eight modes and namesDirectAsc reorders siblings', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const placementSiblingLabels = appWindow.locator(
      `[role="treeitem"][aria-level="3"] [data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    )
    await expect(placementSiblingLabels).toHaveCount(2)
    await expect(placementSiblingLabels.nth(0)).toHaveText('Hero Parent')
    await expect(placementSiblingLabels.nth(1)).toHaveText('Background Leaf')

    await openHierarchyNodeContextMenu(appWindow, HEROES_PLACEMENT_ID)
    const sortByRow = appWindow.locator(`[data-test-locator="${selectorList.contextSortBy}"]`)
    await expect(sortByRow).toBeVisible()
    await sortByRow.hover()
    const sortBySubmenu = appWindow.locator(`[data-test-locator="${selectorList.contextSortBySubmenu}"]`)
    await expect(sortBySubmenu).toBeVisible({ timeout: 15_000 })

    const sortModeIds = [
      'namesDirectAsc',
      'namesDirectDesc',
      'customOrderDirectAsc',
      'customOrderDirectDesc',
      'namesRecursiveAsc',
      'namesRecursiveDesc',
      'customOrderRecursiveAsc',
      'customOrderRecursiveDesc'
    ] as const
    for (const modeId of sortModeIds) {
      await expect(
        appWindow.locator(`[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-${modeId}"]`)
      ).toBeVisible()
    }

    const namesDirectAscItem = appWindow.locator(
      `[data-test-locator="${selectorList.contextSortByNamesDirectAsc}"]`
    )
    await namesDirectAscItem.hover()
    await namesDirectAscItem.click()

    await expect(sortBySubmenu).toHaveCount(0, { timeout: 15_000 })

    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        const root = document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $pinia?: {
                  _s?: Map<string, {
                    actionHistory?: Array<{
                      errorMessage?: string
                      id?: string
                      payloadPreview?: string
                      status?: string
                    }>
                  }>
                }
              }
            }
          }
        }
        const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get(
          'S_FaActionManager'
        )
        const sortRows = (store?.actionHistory ?? []).filter((row) => {
          return row.id === 'sortHierarchyTreeDocuments'
        })
        const last = sortRows.at(-1)
        return {
          errorMessage: last?.errorMessage ?? null,
          payloadPreview: last?.payloadPreview ?? null,
          status: last?.status ?? null,
          sortRowCount: sortRows.length
        }
      })
    }, {
      timeout: 15_000
    }).toEqual({
      errorMessage: null,
      payloadPreview: 'direct:name:asc',
      status: 'success',
      sortRowCount: 1
    })

    await expect.poll(async () => {
      return await appWindow.evaluate((placementId) => {
        const root = document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $pinia?: {
                  _s?: Map<string, {
                    treeData?: Array<{
                      children?: Array<{
                        children?: Array<{ label?: string, nodeKind?: string }>
                        id?: string
                      }>
                      id?: string
                    }>
                  }>
                }
              }
            }
          }
        }
        const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get(
          'S_FaProjectHierarchyTree'
        )
        const world = store?.treeData?.[0]
        const placement = world?.children?.find((child) => child.id === placementId)
        return (placement?.children ?? [])
          .filter((child) => child.nodeKind === 'document')
          .map((child) => child.label ?? '')
      }, HEROES_PLACEMENT_ID)
    }, {
      timeout: 15_000
    }).toEqual(['Background Leaf', 'Hero Parent'])

    await expect.poll(async () => {
      return await placementSiblingLabels.allTextContents()
    }, {
      timeout: 15_000
    }).toEqual(['Background Leaf', 'Hero Parent'])
  })

  test('Check if customOrderDirectAsc and namesRecursiveAsc reorder siblings', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)

    const placementSiblingLabels = appWindow.locator(
      `[role="treeitem"][aria-level="3"] [data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    )
    await expect(placementSiblingLabels.nth(0)).toHaveText('Hero Parent')
    await expect(placementSiblingLabels.nth(1)).toHaveText('Background Leaf')

    await openHierarchyNodeContextMenu(appWindow, HEROES_PLACEMENT_ID)
    await clickHierarchySortByMode(appWindow, 'customOrderDirectAsc')

    await expect.poll(async () => {
      return await readLastHierarchySortAction(appWindow)
    }, {
      timeout: 15_000
    }).toEqual({
      errorMessage: null,
      payloadPreview: 'direct:customOrder:asc',
      status: 'success'
    })

    await expect.poll(async () => {
      return await placementSiblingLabels.allTextContents()
    }, {
      timeout: 15_000
    }).toEqual(['Background Leaf', 'Hero Parent'])

    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hierarchyTree: {
        treeData: buildNestedSortSampleTreeData(),
        uiState: sampleExpandedUiState,
        worlds: sampleWorlds
      },
      projectContentOverrides: {
        ...defaultHierarchySeed.projectContentOverrides,
        placementDocumentChildrenByKey: {
          [`${HEROES_PLACEMENT_ID}::${PARENT_DOCUMENT_ID}`]: nestedSortParentChildDocuments,
          [`${HEROES_PLACEMENT_ID}::__root__`]: samplePlacementDocuments
        }
      }
    }, workspaceTreeRemountOptions)

    const nestedSiblingLabels = appWindow.locator(
      `[role="treeitem"][aria-level="4"] [data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    )
    await expect(nestedSiblingLabels).toHaveCount(2)
    await expect(nestedSiblingLabels.nth(0)).toHaveText('Zeta Nested')
    await expect(nestedSiblingLabels.nth(1)).toHaveText('Hero Leaf')

    await openHierarchyNodeContextMenu(appWindow, PARENT_DOCUMENT_ID)
    await clickHierarchySortByMode(appWindow, 'namesRecursiveAsc')

    await expect.poll(async () => {
      return await readLastHierarchySortAction(appWindow)
    }, {
      timeout: 15_000
    }).toEqual({
      errorMessage: null,
      payloadPreview: 'recursive:name:asc',
      status: 'success'
    })

    await expect.poll(async () => {
      return await nestedSiblingLabels.allTextContents()
    }, {
      timeout: 15_000
    }).toEqual(['Hero Leaf', 'Zeta Nested'])
  })

  test('Check if lazy expand loads children for unloaded parent', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hierarchyTree: {
        treeData: buildLazyExpandSampleTreeData(),
        uiState: {
          expandedNodeIds: [WORLD_ID, HEROES_PLACEMENT_ID],
          schemaVersion: 1,
          scrollTopPx: 0
        },
        worlds: sampleWorlds
      }
    }, {
      expandUntilDocumentLabel: 'Hero Parent',
      routePath: '/home'
    })

    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Hero Leaf' })
    ).toHaveCount(0)

    const parentOpenIconWrapper = appWindow.locator(
      `[data-test-hierarchy-node-id="${PARENT_DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
      .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
    await parentOpenIconWrapper.dispatchEvent('pointerdown')
    await parentOpenIconWrapper.click({ force: true })

    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Hero Leaf' })
    ).toBeVisible({ timeout: 15_000 })
  })

  test('Check if scrollTopPx restore applies to hierarchy uiState after remount', async () => {
    const targetScrollTopPx = 48
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hierarchyTree: {
        treeData: sampleTreeData,
        uiState: {
          expandedNodeIds: sampleExpandedUiState.expandedNodeIds,
          schemaVersion: 1,
          scrollTopPx: targetScrollTopPx
        },
        worlds: sampleWorlds
      }
    }, workspaceTreeRemountOptions)

    // Component harness replaceSession seeds store uiState; DOM scrollTop apply runs on
    // hydrate restoreUiStateFromStore (covered by E2E scroll restore).
    await expect.poll(async () => {
      return await appWindow.evaluate(() => {
        const root = document.querySelector('#q-app') as HTMLElement & {
          __vue_app__?: {
            config: {
              globalProperties: {
                $pinia?: {
                  _s?: Map<string, {
                    uiState?: { scrollTopPx?: number }
                  }>
                }
              }
            }
          }
        }
        const store = root?.__vue_app__?.config.globalProperties.$pinia?._s?.get(
          'S_FaProjectHierarchyTree'
        )
        return store?.uiState?.scrollTopPx ?? -1
      })
    }, {
      timeout: 15_000
    }).toBe(targetScrollTopPx)
  })

  test('Check if expandedNodeIds restore re-opens nested document rows', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hierarchyTree: {
        treeData: sampleTreeData,
        uiState: {
          expandedNodeIds: [WORLD_ID, HEROES_PLACEMENT_ID],
          schemaVersion: 1,
          scrollTopPx: 0
        },
        worlds: sampleWorlds
      }
    }, {
      expandUntilDocumentLabel: 'Hero Parent',
      routePath: '/home'
    })
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Hero Leaf' })
    ).toHaveCount(0)

    await remountHierarchyTreeAfterStoreSeed(appWindow, defaultHierarchySeed, workspaceTreeRemountOptions)
    await expect(
      appWindow.locator(
        `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
      ).filter({ hasText: 'Hero Leaf' })
    ).toBeVisible()
  })

  test('Check if search hit reveal expands ancestors and shows the matching document', async () => {
    await remountHierarchyTreeAfterStoreSeed(appWindow, {
      ...defaultHierarchySeed,
      hierarchyTree: {
        treeData: sampleTreeData,
        uiState: {
          expandedNodeIds: [WORLD_ID, HEROES_PLACEMENT_ID],
          schemaVersion: 1,
          scrollTopPx: 0
        },
        worlds: sampleWorlds
      },
      projectContentOverrides: {
        documentsById: sampleDocumentsById,
        placementDocumentChildrenByKey: {
          [`${HEROES_PLACEMENT_ID}::${PARENT_DOCUMENT_ID}`]: sampleParentChildDocuments,
          [`${HEROES_PLACEMENT_ID}::__root__`]: samplePlacementDocuments
        },
        searchHitsByQuery: {
          hero: [{
            ancestorDocumentIds: [PARENT_DOCUMENT_ID],
            displayName: 'Hero Leaf',
            documentId: DOCUMENT_ID,
            placementId: HEROES_PLACEMENT_ID,
            worldId: WORLD_ID
          }]
        },
        templatesById: {
          [TEMPLATE_ID]: sampleTemplate
        },
        worldsById: {
          [WORLD_ID]: sampleWorld
        }
      }
    }, {
      expandUntilDocumentLabel: 'Hero Parent',
      routePath: '/home'
    })

    const leafLabel = appWindow.locator(
      `[data-test-locator="${selectorList.nodeDocument}${selectorList.nodeLabelSuffix}"]`
    ).filter({ hasText: 'Hero Leaf' })
    await expect(leafLabel).toHaveCount(0)

    const parentTreeItem = appWindow.locator(
      `[data-test-hierarchy-node-id="${PARENT_DOCUMENT_ID}"]`
    ).locator('xpath=ancestor::*[@role="treeitem"][1]')
    await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'false')

    const searchInput = appWindow.locator(
      '[data-test-locator="projectHierarchyTreeSearch-input"] input'
    )
    await expect(searchInput).toBeVisible({ timeout: 15_000 })
    await searchInput.fill('hero')

    await expect(leafLabel).toBeVisible({ timeout: 15_000 })
    await expect(parentTreeItem).toHaveAttribute('aria-expanded', 'true')
    await expect(
      appWindow.locator(`[data-test-hierarchy-node-id="${DOCUMENT_ID}"]`)
    ).toBeVisible()
  })
})
