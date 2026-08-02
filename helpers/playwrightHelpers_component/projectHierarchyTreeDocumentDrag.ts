import type { Page } from 'playwright'

type T_hierarchyTreeDocumentDragMode = 'insert-before-target' | 'nest-into-target'

type T_hierarchyTreeDocumentDragOptions = {
  holdDelayMs?: number
  mode?: T_hierarchyTreeDocumentDragMode
  nestDragOpenDwellMs?: number
}

/** Matches ProjectHierarchyTree PROJECT_HIERARCHY_TREE_DRAG_OPEN_DELAY_MS + buffer. */
const DEFAULT_NEST_DRAG_OPEN_DWELL_MS = 500

function resolveHierarchyTreeDocumentRowBox (
  page: Page,
  nodeId: string,
  fallbackBox: { x: number, y: number, width: number, height: number }
): Promise<{ x: number, y: number, width: number, height: number }> {
  const row = page.locator(`[data-test-hierarchy-node-id="${nodeId}"]`)
    .locator('xpath=ancestor::div[contains(@class,"projectHierarchyTree__nodeRow")][1]')
  return row.boundingBox().then((box) => box ?? fallbackBox)
}

function resolveHierarchyTreeDocumentDragEndPoint (
  targetBox: { x: number, y: number, width: number, height: number },
  mode: T_hierarchyTreeDocumentDragMode
): { endX: number, endY: number } {
  if (mode === 'nest-into-target') {
    return {
      endX: targetBox.x + Math.floor(targetBox.width * 0.55),
      endY: targetBox.y + Math.max(12, Math.floor(targetBox.height * 0.78))
    }
  }
  return {
    endX: targetBox.x + 12,
    endY: targetBox.y + 4
  }
}

/**
 * Hold-arms a hierarchy document row (200ms gate) then pointer-drags to another node.
 * insert-before-target drops near the top of the target row (sibling reorder).
 * nest-into-target drops mid-row so he-tree nests under the target document.
 */
export async function dragHierarchyTreeDocumentNodeWithHold (
  page: Page,
  sourceNodeId: string,
  targetNodeId: string,
  options: T_hierarchyTreeDocumentDragOptions = {}
): Promise<void> {
  const holdDelayMs = options.holdDelayMs ?? 250
  const nestDragOpenDwellMs = options.nestDragOpenDwellMs ?? DEFAULT_NEST_DRAG_OPEN_DWELL_MS
  const mode = options.mode ?? 'insert-before-target'
  const source = page.locator(`[data-test-hierarchy-node-id="${sourceNodeId}"]`).first()
  const target = page.locator(`[data-test-hierarchy-node-id="${targetNodeId}"]`).first()
  await source.scrollIntoViewIfNeeded()
  await target.scrollIntoViewIfNeeded()

  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (sourceBox === null || targetBox === null) {
    throw new Error('Hierarchy tree drag source or target bounding box missing')
  }

  if (mode === 'nest-into-target') {
    const sourceRowBox = await resolveHierarchyTreeDocumentRowBox(page, sourceNodeId, sourceBox)
    const nestTargetBox = await resolveHierarchyTreeDocumentRowBox(page, targetNodeId, targetBox)
    const startX = sourceRowBox.x + 16
    const startY = sourceRowBox.y + Math.min(12, Math.max(4, Math.floor(sourceRowBox.height / 2)))
    const hoverX = nestTargetBox.x + Math.floor(nestTargetBox.width * 0.5)
    const hoverY = nestTargetBox.y + Math.floor(nestTargetBox.height * 0.5)
    const { endX, endY } = resolveHierarchyTreeDocumentDragEndPoint(nestTargetBox, mode)

    await page.mouse.move(startX, startY)
    await page.mouse.down()
    await page.waitForTimeout(holdDelayMs)
    await page.mouse.move(hoverX, hoverY, {
      steps: 28
    })
    await page.waitForTimeout(nestDragOpenDwellMs)
    await page.mouse.move(endX, endY, {
      steps: 20
    })
    await page.mouse.up()
    await page.waitForTimeout(1200)
    return
  }

  const startX = sourceBox.x + 16
  const startY = sourceBox.y + Math.min(12, Math.max(4, Math.floor(sourceBox.height / 2)))
  const { endX, endY } = resolveHierarchyTreeDocumentDragEndPoint(targetBox, mode)

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.waitForTimeout(holdDelayMs)
  await page.mouse.move(endX, endY, {
    steps: 24
  })
  await page.mouse.up()
  await page.waitForTimeout(900)
}

/**
 * Hold-arms a document row, moves toward a target mid-drag, presses Escape, then releases.
 * Used to assert cancel leaves tree order unchanged.
 */
export async function cancelHierarchyTreeDocumentDragWithEscape (
  page: Page,
  sourceNodeId: string,
  targetNodeId: string,
  holdDelayMs = 250
): Promise<void> {
  const source = page.locator(`[data-test-hierarchy-node-id="${sourceNodeId}"]`).first()
  const target = page.locator(`[data-test-hierarchy-node-id="${targetNodeId}"]`).first()
  await source.scrollIntoViewIfNeeded()
  await target.scrollIntoViewIfNeeded()

  const sourceBox = await source.boundingBox()
  const targetBox = await target.boundingBox()
  if (sourceBox === null || targetBox === null) {
    throw new Error('Hierarchy tree drag source or target bounding box missing')
  }

  const startX = sourceBox.x + 16
  const startY = sourceBox.y + Math.min(12, Math.max(4, Math.floor(sourceBox.height / 2)))
  const midX = sourceBox.x + (targetBox.x - sourceBox.x) * 0.5 + 12
  const midY = sourceBox.y + (targetBox.y - sourceBox.y) * 0.5 + 4

  await page.mouse.move(startX, startY)
  await page.mouse.down()
  await page.waitForTimeout(holdDelayMs)
  await page.mouse.move(midX, midY, {
    steps: 16
  })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await page.mouse.up()
  await page.waitForTimeout(400)
}
