import { expect, test } from 'vitest'

import {
  isProjectHierarchyTreeDocumentRowClickWithinHoldDelay,
  resolveProjectHierarchyTreeNodeRowElement,
  shouldBlockDocumentRowDragStartBeforeHoldArmed
} from '../projectHierarchyTreeDocumentRowDragHold'

test('Test that shouldBlockDocumentRowDragStartBeforeHoldArmed blocks before armed', () => {
  const shouldBlock = shouldBlockDocumentRowDragStartBeforeHoldArmed({
    armed: false,
    isPointerDownForHold: true
  })
  expect(shouldBlock).toBe(true)
})

test('Test that shouldBlockDocumentRowDragStartBeforeHoldArmed allows armed hold', () => {
  const shouldBlock = shouldBlockDocumentRowDragStartBeforeHoldArmed({
    armed: true,
    isPointerDownForHold: true
  })
  expect(shouldBlock).toBe(false)
})

test('Test that shouldBlockDocumentRowDragStartBeforeHoldArmed ignores idle pointer', () => {
  const shouldBlock = shouldBlockDocumentRowDragStartBeforeHoldArmed({
    armed: false,
    isPointerDownForHold: false
  })
  expect(shouldBlock).toBe(false)
})

test('Test that resolveProjectHierarchyTreeNodeRowElement finds row wrapper', () => {
  const row = document.createElement('div')
  row.className = 'projectHierarchyTree__nodeRow'
  const label = document.createElement('span')
  row.appendChild(label)
  document.body.appendChild(row)
  const resolved = resolveProjectHierarchyTreeNodeRowElement(label)
  expect(resolved).toBe(row)
  row.remove()
})

test('Test that isProjectHierarchyTreeDocumentRowClickWithinHoldDelay accepts short press', () => {
  const withinHoldDelay = isProjectHierarchyTreeDocumentRowClickWithinHoldDelay({
    holdDelayMs: 200,
    holdDurationMs: 120
  })
  expect(withinHoldDelay).toBe(true)
})
