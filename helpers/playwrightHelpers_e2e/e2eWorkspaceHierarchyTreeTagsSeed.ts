import type { Page } from 'playwright'
import { expect } from '@playwright/test'

import { e2eSeedHierarchyPlacementWithDocuments as e2eSeedHierarchyPlacementRaw } from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeSeed'
import {
  e2eHierarchyTreeSelectorList,
  e2eRefreshHierarchyTreeLayout
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeHelpers'

type T_e2eDocumentsWithTagsSeedInput = {
  documents: Array<{ displayName: string }>
  tagsByDocumentDisplayName: Record<string, Array<{ name: string }>>
  templateDisplayName?: string
}

type T_e2eDocumentsWithTagsSeedResult = {
  documents: Array<{ displayName: string, id: string }>
  placementId: string
  tagIdsByName: Record<string, string>
  templateId: string
  worldId: string
}

/**
 * Seeds placement documents then assigns tags via setDocumentTags (isNew by name).
 * Does not refresh hierarchy layout — callers that need UI sync should wrap or call refresh.
 */
export async function e2eSeedDocumentsWithTags (
  page: Page,
  input: T_e2eDocumentsWithTagsSeedInput
): Promise<T_e2eDocumentsWithTagsSeedResult> {
  const seeded = await e2eSeedHierarchyPlacementRaw(page, {
    documents: input.documents,
    templateDisplayName: input.templateDisplayName ?? 'E2E Tags Template'
  })

  await page.evaluate(async (args) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    for (const document of args.documents) {
      const tagSpecs = args.tagsByDocumentDisplayName[document.displayName] ?? []
      if (tagSpecs.length === 0) {
        continue
      }
      await content.setDocumentTags({
        documentId: document.id,
        tags: tagSpecs.map((tagSpec) => {
          return {
            id: crypto.randomUUID(),
            isNew: true,
            name: tagSpec.name
          }
        })
      })
    }
  }, {
    documents: seeded.documents,
    tagsByDocumentDisplayName: input.tagsByDocumentDisplayName
  })

  const tagIdsByName = await page.evaluate(async (worldId) => {
    const content = window.faContentBridgeAPIs?.projectContent
    if (content === undefined) {
      throw new Error('Project content bridge unavailable')
    }
    const listed = await content.listTagsForWorld({ worldId })
    const map: Record<string, string> = {}
    for (const tag of listed.items) {
      map[tag.name] = tag.id
    }
    return map
  }, seeded.worldId)

  return {
    documents: seeded.documents,
    placementId: seeded.placementId,
    tagIdsByName,
    templateId: seeded.templateId,
    worldId: seeded.worldId
  }
}

/**
 * Seeds documents with tags and refreshes hierarchy layout for visible tree rows.
 */
export async function e2eSeedDocumentsWithTagsAndRefresh (
  page: Page,
  input: T_e2eDocumentsWithTagsSeedInput
): Promise<T_e2eDocumentsWithTagsSeedResult> {
  const seeded = await e2eSeedDocumentsWithTags(page, input)
  await e2eRefreshHierarchyTreeLayout(page)
  return seeded
}

/**
 * Expands the world row, optional Tags wrapper, then a named tag (or first tag).
 */
export async function e2eExpandWorldAndTagNode (
  page: Page,
  tagName?: string
): Promise<void> {
  await expect(
    page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.hierarchyTreeHost}"]`)
  ).toBeVisible({ timeout: 15_000 })

  const treeRoot = page.locator(`[data-test-locator="${e2eHierarchyTreeSelectorList.hierarchyTree}"]`)
  await expect(treeRoot).toBeVisible({ timeout: 15_000 })

  const tagLabelLocator = tagName === undefined
    ? page.locator('[data-test-locator="projectHierarchyTree-node-tag-label"]')
    : page.locator('[data-test-locator="projectHierarchyTree-node-tag-label"]').filter({
      hasText: new RegExp(`^${tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    })
  const tagWrapperLabel = page.locator(
    '[data-test-locator="projectHierarchyTree-node-tagWrapper-label"]'
  )
  const worldLabel = page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeWorld}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
  )

  await expect.poll(async () => {
    if (await tagLabelLocator.count() > 0 && await tagLabelLocator.first().isVisible()) {
      const tagTreeItem = tagLabelLocator.first().locator('xpath=ancestor::*[@role="treeitem"][1]')
      const expanded = await tagTreeItem.count() > 0
        ? await tagTreeItem.getAttribute('aria-expanded')
        : null
      if (expanded === null || expanded === 'true') {
        return 'ready'
      }
      const openIcon = tagTreeItem.locator(
        '[data-test-locator="projectHierarchyTree-openIconWrapper"]'
      )
      if (await openIcon.count() > 0) {
        await openIcon.dispatchEvent('pointerdown')
        await openIcon.click({ force: true })
      } else {
        return 'ready'
      }
      await page.waitForTimeout(300)
      return 'expanding-tag'
    }

    if (await tagWrapperLabel.count() > 0 && await tagWrapperLabel.first().isVisible()) {
      const wrapperTreeItem = tagWrapperLabel.first()
        .locator('xpath=ancestor::*[@role="treeitem"][1]')
      if (await wrapperTreeItem.getAttribute('aria-expanded') !== 'true') {
        const openIcon = wrapperTreeItem.locator(
          '[data-test-locator="projectHierarchyTree-openIconWrapper"]'
        )
        if (await openIcon.count() > 0) {
          await openIcon.dispatchEvent('pointerdown')
          await openIcon.click({ force: true })
        } else {
          await tagWrapperLabel.first().click({ force: true })
        }
        await page.waitForTimeout(300)
        return 'expanding-wrapper'
      }
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

    if (await worldLabel.count() > 0) {
      await worldLabel.first().click({ force: true })
      await page.waitForTimeout(300)
    }
    return 'expanding'
  }, { timeout: 30_000 }).toBe('ready')
}
