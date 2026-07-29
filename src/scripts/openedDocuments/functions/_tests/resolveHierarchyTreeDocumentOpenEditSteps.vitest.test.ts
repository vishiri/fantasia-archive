import { expect, test } from 'vitest'

import { resolveHierarchyTreeDocumentOpenEditSteps } from '../resolveHierarchyTreeDocumentOpenEditSteps'

/**
 * resolveHierarchyTreeDocumentOpenEditSteps
 * Open mode opens and focuses when the tab is not already open.
 */
test('Test that open mode opens and focuses when tab is closed', () => {
  expect(resolveHierarchyTreeDocumentOpenEditSteps({
    mode: 'open',
    tabEditState: null,
    tabIsOpen: false
  })).toEqual({
    shouldEnterEditMode: false,
    shouldFocusTab: true,
    shouldOpenFromTree: true
  })
})

/**
 * resolveHierarchyTreeDocumentOpenEditSteps
 * Open mode only focuses when the tab is already open in preview.
 */
test('Test that open mode only focuses when tab is already open in preview', () => {
  expect(resolveHierarchyTreeDocumentOpenEditSteps({
    mode: 'open',
    tabEditState: false,
    tabIsOpen: true
  })).toEqual({
    shouldEnterEditMode: false,
    shouldFocusTab: true,
    shouldOpenFromTree: false
  })
})

/**
 * resolveHierarchyTreeDocumentOpenEditSteps
 * Open mode only focuses when the tab is already open in edit.
 */
test('Test that open mode only focuses when tab is already open in edit', () => {
  expect(resolveHierarchyTreeDocumentOpenEditSteps({
    mode: 'open',
    tabEditState: true,
    tabIsOpen: true
  })).toEqual({
    shouldEnterEditMode: false,
    shouldFocusTab: true,
    shouldOpenFromTree: false
  })
})

/**
 * resolveHierarchyTreeDocumentOpenEditSteps
 * Edit mode opens, focuses, and enters edit when the tab is closed.
 */
test('Test that edit mode opens, focuses, and enters edit when tab is closed', () => {
  expect(resolveHierarchyTreeDocumentOpenEditSteps({
    mode: 'edit',
    tabEditState: null,
    tabIsOpen: false
  })).toEqual({
    shouldEnterEditMode: true,
    shouldFocusTab: true,
    shouldOpenFromTree: true
  })
})

/**
 * resolveHierarchyTreeDocumentOpenEditSteps
 * Edit mode focuses and enters edit when the tab is open in preview.
 */
test('Test that edit mode focuses and enters edit when tab is open in preview', () => {
  expect(resolveHierarchyTreeDocumentOpenEditSteps({
    mode: 'edit',
    tabEditState: false,
    tabIsOpen: true
  })).toEqual({
    shouldEnterEditMode: true,
    shouldFocusTab: true,
    shouldOpenFromTree: false
  })
})

/**
 * resolveHierarchyTreeDocumentOpenEditSteps
 * Edit mode only focuses when the tab is already in edit.
 */
test('Test that edit mode only focuses when tab is already in edit', () => {
  expect(resolveHierarchyTreeDocumentOpenEditSteps({
    mode: 'edit',
    tabEditState: true,
    tabIsOpen: true
  })).toEqual({
    shouldEnterEditMode: false,
    shouldFocusTab: true,
    shouldOpenFromTree: false
  })
})
