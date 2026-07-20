import { expect, test } from 'vitest'

import {
  resolveProjectAppControlBarSaveButtonColor,
  resolveShowProjectAppControlBarDeleteButton,
  resolveShowProjectAppControlBarEditButton,
  resolveShowProjectAppControlBarSaveButtons
} from '../projectAppControlBarEditMode'

/**
 * projectAppControlBarEditMode visibility and save button colors
 */
test('Test that resolveShowProjectAppControlBarEditButton shows only in preview on document routes', () => {
  expect(resolveShowProjectAppControlBarEditButton({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: true
  })).toBe(true)
  expect(resolveShowProjectAppControlBarEditButton({
    activeDocumentTab: { editState: true },
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
  expect(resolveShowProjectAppControlBarEditButton({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: false
  })).toBe(false)
  expect(resolveShowProjectAppControlBarEditButton({
    activeDocumentTab: null,
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
})

test('Test that resolveShowProjectAppControlBarSaveButtons shows only in edit mode on document routes', () => {
  expect(resolveShowProjectAppControlBarSaveButtons({
    activeDocumentTab: { editState: true },
    isOnDocumentWorkspaceRoute: true
  })).toBe(true)
  expect(resolveShowProjectAppControlBarSaveButtons({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
  expect(resolveShowProjectAppControlBarSaveButtons({
    activeDocumentTab: null,
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
})

test('Test that resolveShowProjectAppControlBarDeleteButton hides for temporary tabs and shows for persisted tabs on document routes', () => {
  expect(resolveShowProjectAppControlBarDeleteButton({
    activeDocumentTab: { persistenceState: 'persisted' },
    isOnDocumentWorkspaceRoute: true
  })).toBe(true)
  expect(resolveShowProjectAppControlBarDeleteButton({
    activeDocumentTab: { persistenceState: 'temporary' },
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
  expect(resolveShowProjectAppControlBarDeleteButton({
    activeDocumentTab: null,
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
  expect(resolveShowProjectAppControlBarDeleteButton({
    activeDocumentTab: { persistenceState: 'persisted' },
    isOnDocumentWorkspaceRoute: false
  })).toBe(false)
})

test('Test that resolveProjectAppControlBarSaveButtonColor uses primary-bright when clean and teal when dirty', () => {
  expect(resolveProjectAppControlBarSaveButtonColor({
    hasUnsavedChanges: false
  })).toBe('primary-bright')
  expect(resolveProjectAppControlBarSaveButtonColor({
    hasUnsavedChanges: true
  })).toBe('teal-14')
})
