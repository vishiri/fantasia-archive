/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

/**
 * projectHierarchyTreeSearch_manager exports debounced search composable.
 */
test('Test that projectHierarchyTreeSearch_manager exports useProjectHierarchyTreeSearch', async () => {
  const { useProjectHierarchyTreeSearch } = await import('../projectHierarchyTreeSearch_manager')
  expect(useProjectHierarchyTreeSearch).toBeTypeOf('function')
})
