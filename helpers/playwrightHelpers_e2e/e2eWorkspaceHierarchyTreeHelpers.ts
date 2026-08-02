import type { Page } from 'playwright'
import { expect } from '@playwright/test'

import { e2eSeedHierarchyPlacementWithDocuments as e2eSeedHierarchyPlacementRaw } from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeSeed'
import type { I_faProjectDocument } from 'app/types/I_faProjectDocumentDomain'
import type { I_faProjectHierarchyTreeDocumentChild } from 'app/types/I_faProjectHierarchyTreeDomain'

/**
 * Object of hierarchy tree data-test-locator keys shared by workspace E2E specs.
 */
export const e2eHierarchyTreeSelectorList = {
  addUnderButton: 'projectHierarchyTree-documentButton-addUnder',
  contextDeleteDocument: 'projectHierarchyTree-nodeContextMenu-deleteDocument',
  contextSortBy: 'projectHierarchyTree-nodeContextMenu-sortBy',
  contextSortBySubmenu: 'projectHierarchyTree-nodeContextMenu-sortBySubmenu',
  deleteDialog: 'dialogDeleteOpenedDocument',
  deleteDialogCancel: 'dialogDeleteOpenedDocument-cancel',
  deleteDialogConfirm: 'dialogDeleteOpenedDocument-delete',
  editButton: 'projectHierarchyTree-documentButton-edit',
  hierarchyTree: 'projectHierarchyTree',
  hierarchyTreeHost: 'projectHierarchyTree-host',
  nodeDocument: 'projectHierarchyTree-node-document',
  nodeDocumentLabelSuffix: '-label',
  nodeTemplatePlacement: 'projectHierarchyTree-node-templatePlacement',
  nodeWorld: 'projectHierarchyTree-node-world',
  openButton: 'projectHierarchyTree-documentButton-open',
  searchInput: 'projectHierarchyTreeSearch-input'
} as const

async function e2eInvokeHierarchyRefreshLayout (page: Page): Promise<void> {
  await page.evaluate(async () => {
    const root = globalThis.document.querySelector('#q-app') as HTMLElement & {
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
}

export async function e2eRefreshHierarchyTreeLayout (page: Page): Promise<void> {
  await e2eInvokeHierarchyRefreshLayout(page)
}

export async function e2eSeedHierarchyPlacementWithDocuments (
  page: Page,
  input: Parameters<typeof e2eSeedHierarchyPlacementRaw>[1]
): Promise<Awaited<ReturnType<typeof e2eSeedHierarchyPlacementRaw>>> {
  const seeded = await e2eSeedHierarchyPlacementRaw(page, input)
  await e2eInvokeHierarchyRefreshLayout(page)
  return seeded
}

export async function e2eExpandWorldAndPlacementNodes (page: Page): Promise<void> {
  await expect(
    page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.hierarchyTreeHost}"]`)
  ).toBeVisible({ timeout: 15_000 })

  const treeRoot = page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.hierarchyTree}"]`)
  await expect(treeRoot).toBeVisible({ timeout: 15_000 })

  const documentLabels = page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
  )
  const addNewRow = page.locator('[data-test-locator="projectHierarchyTree-node-addNewDocument-label"]')
  const placementLabel = page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeTemplatePlacement}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
  )
  const worldLabel = page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeWorld}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
  )

  await expect.poll(async () => {
    if (await documentLabels.count() > 0 && await documentLabels.first().isVisible()) {
      return 'ready'
    }
    if (await addNewRow.count() > 0 && await addNewRow.first().isVisible()) {
      return 'ready'
    }

    const collapsedTreeItems = treeRoot.locator('[role="treeitem"][aria-expanded="false"]')
    if (await collapsedTreeItems.count() > 0) {
      const openIconWrapper = collapsedTreeItems.first()
        .locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
      if (await openIconWrapper.count() > 0) {
        await openIconWrapper.dispatchEvent('pointerdown')
        await openIconWrapper.click({ force: true })
      } else {
        await collapsedTreeItems.first().click({ force: true })
      }
      await page.waitForTimeout(300)
      return 'expanding'
    }

    if (await placementLabel.count() > 0) {
      await placementLabel.first().click({ force: true })
      await page.waitForTimeout(300)
      return 'expanding'
    }

    if (await worldLabel.count() > 0) {
      await worldLabel.first().click({ force: true })
      await page.waitForTimeout(300)
    }
    return 'expanding'
  }, { timeout: 30_000 }).toBe('ready')
}

export async function e2eExpandHierarchyDocumentNode (page: Page, documentId: string): Promise<void> {
  const row = page.locator(`[data-test-hierarchy-node-id="${documentId}"]`)
    .locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
  await expect(row).toHaveCount(1, { timeout: 15_000 })

  const treeItem = row.locator('xpath=ancestor::*[@role="treeitem"][1]')
  if (await treeItem.count() > 0 && await treeItem.getAttribute('aria-expanded') === 'true') {
    return
  }

  const openIcon = row.locator('[data-test-locator="projectHierarchyTree-openIconWrapper"]')
  if (await openIcon.count() > 0) {
    await openIcon.dispatchEvent('pointerdown')
    await openIcon.click({ force: true })
  } else {
    await row.locator(
      `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
    ).click({ force: true })
  }

  await expect.poll(async () => {
    if (await treeItem.count() === 0) {
      return true
    }
    return (await treeItem.getAttribute('aria-expanded')) === 'true'
  }, { timeout: 15_000 }).toBe(true)
}

export async function e2eOpenHierarchyNodeContextMenu (page: Page, nodeId: string): Promise<void> {
  await page.locator(
    `[data-test-hierarchy-node-id="${nodeId}"]:not([role="menu"])`
  ).click({
    button: 'right',
    force: true
  })
}

export async function e2eClickHierarchySortByMode (page: Page, modeId: string): Promise<void> {
  const sortByRow = page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.contextSortBy}"]`)
  await sortByRow.hover()
  const sortBySubmenu = page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.contextSortBySubmenu}"]`)
  await sortBySubmenu.waitFor({
    state: 'visible',
    timeout: 15_000
  })
  const modeItem = page.locator(
    `[data-test-locator="projectHierarchyTree-nodeContextMenu-sortBy-${modeId}"]`
  )
  await modeItem.hover()
  await modeItem.click()
}

export async function e2eReadOpenedTabDocumentIds (page: Page): Promise<string[]> {
  return page.locator('[data-test-locator^="projectAppControlBar-tab-"]').evaluateAll((nodes) => {
    return nodes.map((node) => {
      const locator = node.getAttribute('data-test-locator') ?? ''
      return locator.replace('projectAppControlBar-tab-', '')
    })
  })
}

export async function e2eReadPlacementRootSiblingDisplayNames (
  page: Page,
  placementId: string
): Promise<string[]> {
  return page.evaluate(async (nextPlacementId) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    const children = await content.listPlacementDocumentChildren({
      parentDocumentId: null,
      placementId: nextPlacementId
    })
    return children.items.map((row) => row.displayName)
  }, placementId)
}

export async function e2eGetDocumentById (
  page: Page,
  documentId: string
): Promise<I_faProjectDocument> {
  return page.evaluate(async (id) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    return await content.getDocumentById(id)
  }, documentId)
}

export async function e2eDeleteDocumentViaBridge (page: Page, documentId: string): Promise<void> {
  await page.evaluate(async (id) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    await content.deleteDocument(id)
  }, documentId)
}

export async function e2eReadPlacementChildrenForParent (
  page: Page,
  placementId: string,
  parentDocumentId: string
): Promise<I_faProjectHierarchyTreeDocumentChild[]> {
  return page.evaluate(async (input) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    const children = await content.listPlacementDocumentChildren({
      parentDocumentId: input.parentDocumentId,
      placementId: input.placementId
    })
    return children.items
  }, {
    parentDocumentId,
    placementId
  })
}

export async function e2eHydrateOpenedDocumentsAndRoute (
  page: Page,
  documentId: string
): Promise<void> {
  await page.evaluate(async (nextDocumentId) => {
    const root = document.querySelector('#q-app') as HTMLElement & {
      __vue_app__?: {
        config: {
          globalProperties: {
            $pinia?: {
              _s?: Map<string, {
                hydrateFromProjectDatabase?: () => Promise<void>
              }>
            }
            $router: {
              replace: (location: { path: string }) => Promise<void>
            }
          }
        }
      }
    }
    const globalProperties = root?.__vue_app__?.config.globalProperties
    const router = globalProperties?.$router
    const openedDocumentsStore = globalProperties?.$pinia?._s?.get('S_FaOpenedDocuments')
    if (router === undefined) {
      throw new Error('Vue router missing in E2E app')
    }
    if (typeof openedDocumentsStore?.hydrateFromProjectDatabase !== 'function') {
      throw new Error('S_FaOpenedDocuments.hydrateFromProjectDatabase missing in E2E app')
    }
    await openedDocumentsStore.hydrateFromProjectDatabase()
    await router.replace({ path: `/home/document/${nextDocumentId}` })
  }, documentId)
}
