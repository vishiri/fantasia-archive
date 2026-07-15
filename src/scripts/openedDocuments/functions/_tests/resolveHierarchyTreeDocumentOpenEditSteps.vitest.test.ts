import { describe, expect, test } from 'vitest'

import { resolveHierarchyTreeDocumentOpenEditSteps } from '../resolveHierarchyTreeDocumentOpenEditSteps'

describe('resolveHierarchyTreeDocumentOpenEditSteps', () => {
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
})
