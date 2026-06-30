import { expect, test } from 'vitest'

import {
  parseFaProjectHierarchyTreeListPlacementChildrenInput,
  parseFaProjectHierarchyTreeMoveDocumentInput,
  parseFaProjectHierarchyTreeSearchInput,
  parseFaProjectHierarchyTreeSearchQueryPayload
} from '../faProjectHierarchyTreeContentSchema'

const SAMPLE_UUID = '550e8400-e29b-41d4-a716-446655440000'

/**
 * parseFaProjectHierarchyTreeListPlacementChildrenInput
 * Accepts placementId with optional parentDocumentId.
 */
test('Test that parseFaProjectHierarchyTreeListPlacementChildrenInput parses parent id', () => {
  const parsed = parseFaProjectHierarchyTreeListPlacementChildrenInput({
    placementId: SAMPLE_UUID,
    parentDocumentId: null
  })
  expect(parsed.placementId).toBe(SAMPLE_UUID)
  expect(parsed.parentDocumentId).toBeNull()
})

/**
 * parseFaProjectHierarchyTreeListPlacementChildrenInput
 * Omits parentDocumentId when IPC payload only includes placementId.
 */
test('Test that parseFaProjectHierarchyTreeListPlacementChildrenInput omits parent id key', () => {
  const parsed = parseFaProjectHierarchyTreeListPlacementChildrenInput({
    placementId: SAMPLE_UUID
  })
  expect(parsed.placementId).toBe(SAMPLE_UUID)
  expect(parsed).not.toHaveProperty('parentDocumentId')
})

/**
 * parseFaProjectHierarchyTreeMoveDocumentInput
 * Validates move payload shape for hierarchy reorder IPC.
 */
test('Test that parseFaProjectHierarchyTreeMoveDocumentInput parses reorder payload', () => {
  const parsed = parseFaProjectHierarchyTreeMoveDocumentInput({
    documentId: SAMPLE_UUID,
    targetParentDocumentId: null,
    targetSortOrder: 2
  })
  expect(parsed.targetSortOrder).toBe(2)
})

/**
 * parseFaProjectHierarchyTreeMoveDocumentInput
 * Accepts non-null targetParentDocumentId for nested document moves.
 */
test('Test that parseFaProjectHierarchyTreeMoveDocumentInput parses parent document id', () => {
  const parentId = '660e8400-e29b-41d4-a716-446655440001'
  const parsed = parseFaProjectHierarchyTreeMoveDocumentInput({
    documentId: SAMPLE_UUID,
    targetParentDocumentId: parentId,
    targetSortOrder: 0
  })
  expect(parsed.targetParentDocumentId).toBe(parentId)
})

/**
 * parseFaProjectHierarchyTreeListPlacementChildrenInput
 * Accepts explicit parentDocumentId string for nested lazy loads.
 */
test('Test that parseFaProjectHierarchyTreeListPlacementChildrenInput parses parent document id', () => {
  const parentId = '660e8400-e29b-41d4-a716-446655440001'
  const parsed = parseFaProjectHierarchyTreeListPlacementChildrenInput({
    parentDocumentId: parentId,
    placementId: SAMPLE_UUID
  })
  expect(parsed.parentDocumentId).toBe(parentId)
})

/**
 * parseFaProjectHierarchyTreeSearchQueryPayload
 * Extracts query string from IPC payload object.
 */
test('Test that parseFaProjectHierarchyTreeSearchQueryPayload reads query field', () => {
  expect(parseFaProjectHierarchyTreeSearchQueryPayload({ query: 'hero' })).toBe('hero')
})

/**
 * parseFaProjectHierarchyTreeSearchInput
 * Validates full search IPC payload object.
 */
test('Test that parseFaProjectHierarchyTreeSearchInput parses query object', () => {
  expect(parseFaProjectHierarchyTreeSearchInput({ query: 'villain' }).query).toBe('villain')
})
