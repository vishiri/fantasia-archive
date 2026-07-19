import { expect, test } from 'vitest'

import {
  PROJECT_HIERARCHY_TREE_WORLD_COLOR_PRIMARY_BRIGHT_FALLBACK,
  resolveProjectHierarchyTreeWorldDisplayColor
} from '../resolveProjectHierarchyTreeWorldDisplayColor'

test('Test that resolveProjectHierarchyTreeWorldDisplayColor keeps trimmed world hex', () => {
  expect(resolveProjectHierarchyTreeWorldDisplayColor('  #aabbcc  ')).toBe('#aabbcc')
})

test('Test that resolveProjectHierarchyTreeWorldDisplayColor falls back to primary-bright for blank color', () => {
  expect(resolveProjectHierarchyTreeWorldDisplayColor('')).toBe(
    PROJECT_HIERARCHY_TREE_WORLD_COLOR_PRIMARY_BRIGHT_FALLBACK
  )
  expect(resolveProjectHierarchyTreeWorldDisplayColor('   ')).toBe(
    PROJECT_HIERARCHY_TREE_WORLD_COLOR_PRIMARY_BRIGHT_FALLBACK
  )
})
