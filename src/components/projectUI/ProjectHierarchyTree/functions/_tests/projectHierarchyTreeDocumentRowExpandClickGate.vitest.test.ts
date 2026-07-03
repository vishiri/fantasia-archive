import { expect, test } from 'vitest'

import {
  isProjectHierarchyTreeDocumentRowClickWithinDragTolerance,
  shouldProjectHierarchyTreeDocumentRowClickToggleExpand
} from '../projectHierarchyTreeDocumentRowExpandClickGate'

test('Test that document row click within tolerance is accepted', () => {
  const withinTolerance = isProjectHierarchyTreeDocumentRowClickWithinDragTolerance({
    clickClientX: 12,
    clickClientY: 14,
    pointerDownSample: {
      clientX: 10,
      clientY: 10
    },
    tolerancePx: 8
  })
  expect(withinTolerance).toBe(true)
})

test('Test that document row click outside tolerance is rejected', () => {
  const withinTolerance = isProjectHierarchyTreeDocumentRowClickWithinDragTolerance({
    clickClientX: 20,
    clickClientY: 10,
    pointerDownSample: {
      clientX: 0,
      clientY: 0
    },
    tolerancePx: 8
  })
  expect(withinTolerance).toBe(false)
})

test('Test that document row click tolerance rejects null pointer sample', () => {
  const withinTolerance = isProjectHierarchyTreeDocumentRowClickWithinDragTolerance({
    clickClientX: 10,
    clickClientY: 10,
    pointerDownSample: null,
    tolerancePx: 8
  })
  expect(withinTolerance).toBe(false)
})

test('Test that document row click toggle is blocked while drag is active', () => {
  const shouldToggle = shouldProjectHierarchyTreeDocumentRowClickToggleExpand({
    clickClientX: 10,
    clickClientY: 10,
    dragStartedForGesture: false,
    holdDelayMs: 200,
    holdDurationMs: 50,
    isTreeDragActive: true,
    pointerDownSample: {
      clientX: 10,
      clientY: 10
    },
    tolerancePx: 8
  })
  expect(shouldToggle).toBe(false)
})

test('Test that document row click toggle is blocked after drag started for gesture', () => {
  const shouldToggle = shouldProjectHierarchyTreeDocumentRowClickToggleExpand({
    clickClientX: 10,
    clickClientY: 10,
    dragStartedForGesture: true,
    holdDelayMs: 200,
    holdDurationMs: 50,
    isTreeDragActive: false,
    pointerDownSample: {
      clientX: 10,
      clientY: 10
    },
    tolerancePx: 8
  })
  expect(shouldToggle).toBe(false)
})

test('Test that document row click toggle is blocked after drag hold delay', () => {
  const shouldToggle = shouldProjectHierarchyTreeDocumentRowClickToggleExpand({
    clickClientX: 10,
    clickClientY: 10,
    dragStartedForGesture: false,
    holdDelayMs: 200,
    holdDurationMs: 250,
    isTreeDragActive: false,
    pointerDownSample: {
      clientX: 10,
      clientY: 10
    },
    tolerancePx: 8
  })
  expect(shouldToggle).toBe(false)
})
