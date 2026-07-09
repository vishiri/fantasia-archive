import { expect, test } from 'vitest'

import {
  resolveActiveOpenedDocumentTab,
  resolveCanEditActiveDocumentViaKeybind,
  resolveCanSaveActiveDocumentViaKeybind,
  resolveIsOnDocumentWorkspaceRoute
} from '../functions/openedDocumentWorkspaceKeybindGuards'

const previewTab = {
  documentId: 'doc-1',
  tabLabel: 'Doc',
  templateIcon: 'mdi-feather',
  displayNameDraft: 'Draft',
  savedDisplayName: 'Saved',
  hasUnsavedChanges: false,
  editState: false
}

const editTab = {
  ...previewTab,
  editState: true
}

function resolveRouteDocumentId (routePath: string): string | null {
  return routePath.startsWith('/home/document/') ? 'doc-1' : null
}

function resolveShowEditButton (input: {
  activeDocumentTab: { editState: boolean } | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }
  return !input.activeDocumentTab.editState
}

function resolveShowSaveButtons (input: {
  activeDocumentTab: { editState: boolean } | null
  isOnDocumentWorkspaceRoute: boolean
}): boolean {
  if (!input.isOnDocumentWorkspaceRoute || input.activeDocumentTab === null) {
    return false
  }
  return input.activeDocumentTab.editState
}

test('Test that resolveActiveOpenedDocumentTab returns null when active document id is missing', () => {
  expect(resolveActiveOpenedDocumentTab([previewTab], null)).toBeNull()
})

test('Test that resolveIsOnDocumentWorkspaceRoute reports workspace routes only', () => {
  expect(resolveIsOnDocumentWorkspaceRoute('/home/document/doc-1', resolveRouteDocumentId)).toBe(true)
  expect(resolveIsOnDocumentWorkspaceRoute('/home', resolveRouteDocumentId)).toBe(false)
})

test('Test that resolveCanEditActiveDocumentViaKeybind delegates to edit visibility rules', () => {
  expect(resolveCanEditActiveDocumentViaKeybind({
    activeDocumentId: 'doc-1',
    resolveFaDocumentWorkspaceRouteDocumentId: resolveRouteDocumentId,
    resolveShowProjectDocumentControlBarEditButton: resolveShowEditButton,
    routePath: '/home/document/doc-1',
    tabs: [previewTab]
  })).toBe(true)

  expect(resolveCanEditActiveDocumentViaKeybind({
    activeDocumentId: 'doc-1',
    resolveFaDocumentWorkspaceRouteDocumentId: resolveRouteDocumentId,
    resolveShowProjectDocumentControlBarEditButton: resolveShowEditButton,
    routePath: '/home/document/doc-1',
    tabs: [editTab]
  })).toBe(false)

  expect(resolveCanEditActiveDocumentViaKeybind({
    activeDocumentId: 'doc-1',
    resolveFaDocumentWorkspaceRouteDocumentId: resolveRouteDocumentId,
    resolveShowProjectDocumentControlBarEditButton: resolveShowEditButton,
    routePath: '/home',
    tabs: [previewTab]
  })).toBe(false)
})

test('Test that resolveCanSaveActiveDocumentViaKeybind delegates to save visibility rules', () => {
  expect(resolveCanSaveActiveDocumentViaKeybind({
    activeDocumentId: 'doc-1',
    resolveFaDocumentWorkspaceRouteDocumentId: resolveRouteDocumentId,
    resolveShowProjectDocumentControlBarSaveButtons: resolveShowSaveButtons,
    routePath: '/home/document/doc-1',
    tabs: [editTab]
  })).toBe(true)

  expect(resolveCanSaveActiveDocumentViaKeybind({
    activeDocumentId: 'doc-1',
    resolveFaDocumentWorkspaceRouteDocumentId: resolveRouteDocumentId,
    resolveShowProjectDocumentControlBarSaveButtons: resolveShowSaveButtons,
    routePath: '/home/document/doc-1',
    tabs: [previewTab]
  })).toBe(false)
})
