import { expect, test } from 'vitest'

import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  projectHierarchyTreeNodeShowsDocumentButtonGroup,
  resolveProjectHierarchyTreeDocumentButtonVisibility
} from '../projectHierarchyTreeDocumentButtonVisibility'

const hideTreeIconDefaults = {
  hideTreeIconAddUnder: false,
  hideTreeIconEdit: false,
  hideTreeIconView: false
} as const

const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: 'doc-1',
  groupId: null,
  hasChildren: false,
  icon: '',
  id: 'doc-1',
  label: 'Doc',
  nodeKind: 'document',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

/**
 * resolveProjectHierarchyTreeDocumentButtonVisibility
 * Defaults show all document-row buttons when settings are not loaded yet.
 */
test('Test that resolveProjectHierarchyTreeDocumentButtonVisibility defaults to showing all buttons', () => {
  expect(resolveProjectHierarchyTreeDocumentButtonVisibility(null, null, hideTreeIconDefaults)).toEqual({
    showsAddUnder: true,
    showsEdit: true,
    showsOpen: true
  })
})

/**
 * resolveProjectHierarchyTreeDocumentButtonVisibility
 * App settings preview overrides persisted settings for live tree chrome.
 */
test('Test that resolveProjectHierarchyTreeDocumentButtonVisibility prefers preview over settings', () => {
  const settings = {
    hideTreeIconAddUnder: false,
    hideTreeIconEdit: false,
    hideTreeIconView: false
  } satisfies Pick<I_faUserSettings, 'hideTreeIconAddUnder' | 'hideTreeIconEdit' | 'hideTreeIconView'>

  expect(resolveProjectHierarchyTreeDocumentButtonVisibility(
    settings as I_faUserSettings,
    {
      hideTreeIconView: true
    },
    hideTreeIconDefaults
  )).toEqual({
    showsAddUnder: true,
    showsEdit: true,
    showsOpen: false
  })
})

/**
 * projectHierarchyTreeNodeShowsDocumentButtonGroup
 * Document rows show the group only when at least one button remains visible.
 */
test('Test that projectHierarchyTreeNodeShowsDocumentButtonGroup limits rows to documents with visible buttons', () => {
  const allVisible = {
    showsAddUnder: true,
    showsEdit: true,
    showsOpen: true
  }
  const allHidden = {
    showsAddUnder: false,
    showsEdit: false,
    showsOpen: false
  }

  expect(projectHierarchyTreeNodeShowsDocumentButtonGroup(documentNode, allVisible)).toBe(true)
  expect(projectHierarchyTreeNodeShowsDocumentButtonGroup(documentNode, allHidden)).toBe(false)
  expect(projectHierarchyTreeNodeShowsDocumentButtonGroup({
    ...documentNode,
    documentId: null
  }, allVisible)).toBe(false)
  expect(projectHierarchyTreeNodeShowsDocumentButtonGroup({
    ...documentNode,
    nodeKind: 'group'
  }, allVisible)).toBe(false)
})
