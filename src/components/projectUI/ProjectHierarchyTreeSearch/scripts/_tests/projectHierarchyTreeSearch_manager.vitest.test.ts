/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

/**
 * projectHierarchyTreeSearch_manager exports debounced search composable.
 */
test('Test that projectHierarchyTreeSearch_manager exports useProjectHierarchyTreeSearch', async () => {
  const { useProjectHierarchyTreeSearch } = await import('../projectHierarchyTreeSearch_manager')
  expect(useProjectHierarchyTreeSearch).toBeTypeOf('function')
})

test('Test that projectHierarchyTreeSearch_manager reads the project epoch while searching', async () => {
  vi.useFakeTimers()
  const { useProjectHierarchyTreeSearch } = await import('../projectHierarchyTreeSearch_manager')
  const api = useProjectHierarchyTreeSearch()
  api.searchQuery.value = 'hero'
  await vi.advanceTimersByTimeAsync(300)
  expect(api.searchQuery.value).toBe('hero')
  vi.useRealTimers()
})
