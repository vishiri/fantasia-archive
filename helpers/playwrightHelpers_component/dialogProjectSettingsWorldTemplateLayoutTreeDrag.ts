import type { Page } from 'playwright'

const HE_TREE_NEST_INTO_TARGET_INDENT_PX = 31

/**
 * Drags a world template layout he-tree node using Playwright HTML5 dragTo.
 * nest-into-target drops past one indent on the target inner tree node so he-tree nests under a group.
 */
export async function dragWorldTemplateLayoutTreeNode (
  page: Page,
  sourceLocator: string,
  targetLocator: string,
  mode: 'insert-before-target' | 'nest-into-target' = 'insert-before-target'
): Promise<void> {
  const source = page.locator(sourceLocator).first()
  const target = page.locator(targetLocator).first()
  await source.scrollIntoViewIfNeeded()
  await target.scrollIntoViewIfNeeded()

  const targetBox = await target.boundingBox()
  const targetPosition = mode === 'nest-into-target'
    ? {
        x: HE_TREE_NEST_INTO_TARGET_INDENT_PX + 20,
        y: targetBox === null ? 12 : Math.max(8, Math.floor(targetBox.height / 2))
      }
    : {
        x: 12,
        y: 4
      }

  await source.dragTo(target, {
    force: true,
    steps: mode === 'nest-into-target' ? 30 : 20,
    sourcePosition: {
      x: 16,
      y: 12
    },
    targetPosition
  })
  await page.waitForTimeout(600)
}
