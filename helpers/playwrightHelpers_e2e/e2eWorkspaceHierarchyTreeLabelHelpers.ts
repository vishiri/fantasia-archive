import type { Page } from 'playwright'
import { expect } from '@playwright/test'

import {
  e2eExpandWorldAndPlacementNodes,
  e2eHierarchyTreeSelectorList,
  e2eRefreshHierarchyTreeLayout
} from 'app/helpers/playwrightHelpers_e2e/e2eWorkspaceHierarchyTreeHelpers'

export async function e2eClickHierarchyDocumentLabel (
  page: Page,
  displayName: string,
  button: 'left' | 'middle' | 'right' = 'left'
): Promise<void> {
  await e2eEnsureHierarchyDocumentLabelVisible(page, displayName)
  await page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
  ).filter({ hasText: displayName }).click({
    button,
    force: true
  })
}

export async function e2eEnsureHierarchyDocumentLabelVisible (
  page: Page,
  displayName: string
): Promise<void> {
  const label = page.locator(
    `[data-test-locator="${e2eHierarchyTreeSelectorList.nodeDocument}${e2eHierarchyTreeSelectorList.nodeDocumentLabelSuffix}"]`
  ).filter({ hasText: displayName })
  if (await label.count() > 0 && await label.first().isVisible()) {
    return
  }
  await e2eRefreshHierarchyTreeLayout(page)
  await e2eExpandWorldAndPlacementNodes(page)
  await expect(label.first()).toBeVisible({ timeout: 15_000 })
}
