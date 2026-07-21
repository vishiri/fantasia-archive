import { computed } from 'vue'
import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { createProjectHierarchyTreeNodeDisplayBindings } from '../projectHierarchyTreeNodeDisplayBindingsWiring'

const documentNode: I_faProjectHierarchyTreeHeTreeNode = {
  children: [],
  childrenLoaded: true,
  documentId: 'doc-a',
  groupId: null,
  hasChildren: false,
  icon: 'mdi-account',
  id: 'doc-a',
  label: 'Hero',
  nodeKind: 'document',
  placementId: 'placement-1',
  treeOrderNumber: 7,
  worldColor: '#000',
  worldId: 'world-1'
}

const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
  categoryCount: 2,
  children: [],
  childrenLoaded: true,
  documentCount: 5,
  documentId: null,
  documentTemplateId: 'template-1',
  groupId: 'group-1',
  hasChildren: true,
  icon: 'mdi-account',
  id: 'placement-1',
  label: 'Characters',
  nodeKind: 'templatePlacement',
  placementId: 'placement-1',
  worldColor: '#000',
  worldId: 'world-1'
}

test('Test that createProjectHierarchyTreeNodeDisplayBindings resolves order badge labels', () => {
  const showsOrderNumberBadge = computed(() => true)
  const bindings = createProjectHierarchyTreeNodeDisplayBindings({
    resolvePlacementCountDisplayForCounts: () => ({
      segments: [],
      showDivider: false,
      shows: true
    }),
    showsOrderNumberBadge
  })

  expect(bindings.resolveOrderNumberBadgeLabelForNode(documentNode)).toBe('7')
  expect(bindings.resolveOrderNumberBadgeLabelForNode(placementNode)).toBeNull()
})

test('Test that createProjectHierarchyTreeNodeDisplayBindings resolves placement counts', () => {
  const showsOrderNumberBadge = computed(() => false)
  const bindings = createProjectHierarchyTreeNodeDisplayBindings({
    resolvePlacementCountDisplayForCounts: ({ categoryCount, documentCount }) => ({
      segments: [
        {
          kind: 'category',
          value: categoryCount
        },
        {
          kind: 'document',
          value: documentCount
        }
      ],
      showDivider: true,
      shows: true
    }),
    showsOrderNumberBadge
  })

  expect(bindings.resolvePlacementCountDisplayForNode(documentNode)).toBeNull()
  expect(bindings.resolvePlacementCountDisplayForNode(placementNode)).toEqual({
    categoryCount: 2,
    display: {
      segments: [
        {
          kind: 'category',
          value: 2
        },
        {
          kind: 'document',
          value: 5
        }
      ],
      showDivider: true,
      shows: true
    },
    documentCount: 5
  })
})
