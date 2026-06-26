import type { Page } from 'playwright'
import { expect } from '@playwright/test'

import { FA_PROJECT_SIDEBAR_MIN_WIDTH_PX } from 'app/types/I_faProjectSidebarDomain'

/** data-test-locator on the workspace route QSplitter root. */
export const FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_SPLITTER_LOCATOR = 'mainLayout-sidebarSplitter'

/**
 * Wait longer than renderer debounced sidebar_width persist (150ms) before bridge or layout assertions.
 */
export const FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_PERSIST_DEBOUNCE_SETTLE_MS = 350

/** Layout vs stored integer width slack under Electron window capture. */
export const FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_WIDTH_TOLERANCE_PX = 12

/**
 * Returns the rendered width of the splitter before panel in pixels.
 */
export async function readFaPlaywrightE2eWorkspaceSidebarPanelWidthPx (page: Page): Promise<number> {
  const panel = page.locator(
    `[data-test-locator="${FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_SPLITTER_LOCATOR}"] .q-splitter__before`
  )
  await expect(panel).toBeVisible()
  const box = await panel.boundingBox()
  if (box === null) {
    throw new Error('Workspace sidebar panel bounding box missing')
  }
  return box.width
}

/**
 * Reads persisted workspace sidebar width for the active project through the preload bridge.
 */
export async function readFaPlaywrightE2eProjectSidebarWidthFromBridge (page: Page): Promise<number> {
  const widthPx = await page.evaluate(async () => {
    const api = window.faContentBridgeAPIs?.projectManagement
    if (typeof api?.getProjectSidebar !== 'function') {
      return null
    }
    const root = await api.getProjectSidebar()
    return root.widthPx
  })
  if (widthPx === null) {
    throw new Error('getProjectSidebar bridge unavailable')
  }
  return widthPx
}

/**
 * Drags the native QSplitter separator horizontally by deltaPx (positive widens the left panel).
 */
export async function dragFaPlaywrightE2eWorkspaceSidebarSeparator (
  page: Page,
  deltaPx: number
): Promise<void> {
  const separator = page.locator(
    `[data-test-locator="${FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_SPLITTER_LOCATOR}"] .q-splitter__separator`
  )
  await expect(separator).toBeVisible()
  const box = await separator.boundingBox()
  if (box === null) {
    throw new Error('Workspace splitter separator bounding box missing')
  }
  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2
  const targetX = startX + deltaPx
  const stepCount = Math.max(10, Math.ceil(Math.abs(deltaPx) / 8))
  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.mouse.move(targetX, startY, { steps: stepCount })
  await page.mouse.up()
}

/**
 * Throws when actual panel width is not within tolerancePx of expectedPx.
 */
export function assertFaPlaywrightE2eWorkspaceSidebarWidthNear (
  actualPx: number,
  expectedPx: number,
  label: string,
  tolerancePx: number = FA_PLAYWRIGHT_E2E_WORKSPACE_SIDEBAR_WIDTH_TOLERANCE_PX
): void {
  const delta = Math.abs(actualPx - expectedPx)
  if (delta > tolerancePx) {
    throw new Error(`${label}: expected ~${expectedPx}px (±${tolerancePx}), got ${actualPx}px`)
  }
}

/**
 * Asserts the panel is at least the configured minimum before a drag widens it.
 */
export async function expectFaPlaywrightE2eWorkspaceSidebarAtDefaultWidth (page: Page): Promise<void> {
  const widthPx = await readFaPlaywrightE2eWorkspaceSidebarPanelWidthPx(page)
  assertFaPlaywrightE2eWorkspaceSidebarWidthNear(
    widthPx,
    FA_PROJECT_SIDEBAR_MIN_WIDTH_PX,
    'workspace sidebar default width'
  )
}
