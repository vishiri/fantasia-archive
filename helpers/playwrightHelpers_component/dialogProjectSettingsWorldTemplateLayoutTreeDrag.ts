import type { Page } from 'playwright'

const HE_TREE_DEFAULT_INDENT_PX = 20

/**
 * Drags a world template layout he-tree node using Playwright HTML5 dragTo.
 * nest-into-target offsets horizontally past one indent so he-tree nests under a group.
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

  const targetPosition = mode === 'nest-into-target'
    ? {
        x: HE_TREE_DEFAULT_INDENT_PX + 12,
        y: 12
      }
    : {
        x: 12,
        y: 4
      }

  await source.dragTo(target, {
    force: true,
    steps: 20,
    sourcePosition: {
      x: 16,
      y: 12
    },
    targetPosition
  })
  await page.waitForTimeout(600)
}
