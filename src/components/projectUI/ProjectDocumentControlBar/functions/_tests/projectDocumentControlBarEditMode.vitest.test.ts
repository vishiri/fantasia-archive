import { expect, test } from 'vitest'

import {
  resolveProjectDocumentControlBarSaveButtonColor,
  resolveShowProjectDocumentControlBarDeleteButton,
  resolveShowProjectDocumentControlBarEditButton,
  resolveShowProjectDocumentControlBarSaveButtons
} from '../projectDocumentControlBarEditMode'

/**
 * projectDocumentControlBarEditMode visibility and save button colors
 */
test('Test that resolveShowProjectDocumentControlBarEditButton shows only in preview on document routes', () => {
  expect(resolveShowProjectDocumentControlBarEditButton({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: true
  })).toBe(true)
  expect(resolveShowProjectDocumentControlBarEditButton({
    activeDocumentTab: { editState: true },
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
  expect(resolveShowProjectDocumentControlBarEditButton({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: false
  })).toBe(false)
  expect(resolveShowProjectDocumentControlBarEditButton({
    activeDocumentTab: null,
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
})

test('Test that resolveShowProjectDocumentControlBarSaveButtons shows only in edit mode on document routes', () => {
  expect(resolveShowProjectDocumentControlBarSaveButtons({
    activeDocumentTab: { editState: true },
    isOnDocumentWorkspaceRoute: true
  })).toBe(true)
  expect(resolveShowProjectDocumentControlBarSaveButtons({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
  expect(resolveShowProjectDocumentControlBarSaveButtons({
    activeDocumentTab: null,
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
})

test('Test that resolveShowProjectDocumentControlBarDeleteButton shows in view and edit mode on document routes', () => {
  expect(resolveShowProjectDocumentControlBarDeleteButton({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: true
  })).toBe(true)
  expect(resolveShowProjectDocumentControlBarDeleteButton({
    activeDocumentTab: { editState: true },
    isOnDocumentWorkspaceRoute: true
  })).toBe(true)
  expect(resolveShowProjectDocumentControlBarDeleteButton({
    activeDocumentTab: null,
    isOnDocumentWorkspaceRoute: true
  })).toBe(false)
  expect(resolveShowProjectDocumentControlBarDeleteButton({
    activeDocumentTab: { editState: false },
    isOnDocumentWorkspaceRoute: false
  })).toBe(false)
})

test('Test that resolveProjectDocumentControlBarSaveButtonColor uses primary-bright when clean and teal when dirty', () => {
  expect(resolveProjectDocumentControlBarSaveButtonColor({
    hasUnsavedChanges: false
  })).toBe('primary-bright')
  expect(resolveProjectDocumentControlBarSaveButtonColor({
    hasUnsavedChanges: true
  })).toBe('teal-14')
})
