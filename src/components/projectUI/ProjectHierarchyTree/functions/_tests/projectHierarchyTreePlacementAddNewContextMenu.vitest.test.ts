import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { resolveProjectHierarchyTreeAddNewRowLabel } from '../projectHierarchyTreeAddNewDocumentLabel'
import { createResolveProjectHierarchyTreePlacementAddNewContextMenuRow } from '../projectHierarchyTreePlacementAddNewContextMenu'

const resolveProjectHierarchyTreePlacementAddNewContextMenuRow =
  createResolveProjectHierarchyTreePlacementAddNewContextMenuRow({
    addNewDocumentIcon: 'mdi-plus',
    resolveAddNewRowLabel: resolveProjectHierarchyTreeAddNewRowLabel
  })

function createPlacement (
  overrides: Partial<I_faProjectHierarchyTreeHeTreeNode> = {}
): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: 'template-1',
    groupId: 'group-1',
    hasChildren: true,
    icon: '',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    titlePluralTranslations: { 'en-US': 'Buildings' },
    titleSingularTranslations: { 'en-US': 'Building' },
    worldColor: '#000',
    worldId: 'world-1',
    ...overrides
  }
}

test('resolveProjectHierarchyTreePlacementAddNewContextMenuRow returns null for non-placement nodes', () => {
  expect(resolveProjectHierarchyTreePlacementAddNewContextMenuRow({
    placement: {
      ...createPlacement(),
      nodeKind: 'group'
    },
    preferredLanguageCode: 'en-US'
  })).toBeNull()
})

test('resolveProjectHierarchyTreePlacementAddNewContextMenuRow uses loaded add-new child label', () => {
  const placement = createPlacement({
    children: [{
      children: [],
      childrenLoaded: true,
      documentId: null,
      documentTemplateId: 'template-1',
      groupId: null,
      hasChildren: false,
      icon: 'mdi-plus',
      id: 'placement-1__add-new',
      label: 'Add new building',
      nodeKind: 'addNewDocument',
      placementId: 'placement-1',
      worldColor: '#000',
      worldId: 'world-1'
    }]
  })
  expect(resolveProjectHierarchyTreePlacementAddNewContextMenuRow({
    placement,
    preferredLanguageCode: 'en-US'
  })).toEqual({
    icon: 'mdi-plus',
    label: 'Add new building'
  })
})

test('resolveProjectHierarchyTreePlacementAddNewContextMenuRow falls back to preferred-language label', () => {
  expect(resolveProjectHierarchyTreePlacementAddNewContextMenuRow({
    placement: createPlacement(),
    preferredLanguageCode: 'en-US'
  })).toEqual({
    icon: 'mdi-plus',
    label: 'Add new building'
  })
})

test('resolveProjectHierarchyTreePlacementAddNewContextMenuRow falls back when placement translation maps are missing', () => {
  expect(resolveProjectHierarchyTreePlacementAddNewContextMenuRow({
    placement: createPlacement({
      titlePluralTranslations: undefined,
      titleSingularTranslations: undefined
    }),
    preferredLanguageCode: 'en-US'
  })).toEqual({
    icon: 'mdi-plus',
    label: 'Add new MISSING TRANSLATION'
  })
})
