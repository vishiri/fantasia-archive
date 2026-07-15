/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds,
  collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh,
  collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh,
  ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh,
  findProjectHierarchyTreeDocumentParentBucket,
  removeProjectHierarchyTreeDocumentNodesByDocumentIds
} from '../projectHierarchyTreeDocumentParentBucket'

function buildPlacementNode (input: {
  children: I_faProjectHierarchyTreeHeTreeNode[]
  childrenLoaded: boolean
  documentTemplateId?: string
}): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: input.children,
    childrenLoaded: input.childrenLoaded,
    documentId: null,
    documentTemplateId: input.documentTemplateId ?? 'tpl-1',
    groupId: null,
    hasChildren: true,
    icon: 'mdi-home',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

function buildDocumentNode (input: {
  documentId: string
  id: string
  label?: string
}): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: input.documentId,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-home',
    id: input.id,
    label: input.label ?? input.id,
    nodeKind: 'document',
    placementId: 'placement-1',
    worldColor: '#ff0000',
    worldId: 'world-1'
  }
}

test('Test that findProjectHierarchyTreeDocumentParentBucket resolves placement parent', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'doc-a',
        label: 'Doc A'
      })
    ],
    childrenLoaded: true
  })
  const treeData = [placement]
  const bucket = findProjectHierarchyTreeDocumentParentBucket(treeData, 'doc-a')
  expect(bucket?.parentNode?.id).toBe('placement-1')
})

test('Test that findProjectHierarchyTreeDocumentParentBucket matches persisted document id when node id differs', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'tree-node-a',
        label: 'Doc A'
      })
    ],
    childrenLoaded: true
  })
  const treeData = [placement]
  const bucket = findProjectHierarchyTreeDocumentParentBucket(treeData, 'doc-a')
  expect(bucket?.parentNode?.id).toBe('placement-1')
})

test('Test that collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh dedupes parent buckets', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-a',
        id: 'doc-a'
      }),
      buildDocumentNode({
        documentId: 'doc-b',
        id: 'doc-b'
      })
    ],
    childrenLoaded: true
  })
  const parentNodeIds = collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh(
    [placement],
    ['doc-a', 'doc-b']
  )
  expect(parentNodeIds).toEqual(['placement-1'])
})

test('Test that collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh includes loaded saved document nodes', () => {
  const childDocument = buildDocumentNode({
    documentId: 'doc-child',
    id: 'doc-child'
  })
  const parentDocument = {
    ...buildDocumentNode({
      documentId: 'doc-parent',
      id: 'doc-parent'
    }),
    children: [childDocument],
    childrenLoaded: true,
    hasChildren: true
  }
  const placement = buildPlacementNode({
    children: [parentDocument],
    childrenLoaded: true
  })
  const parentNodeIds = collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh(
    [placement],
    ['doc-parent']
  )
  expect(parentNodeIds).toEqual(['placement-1', 'doc-parent'])
})

test('Test that collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh skips unloaded saved document nodes', () => {
  const parentDocument = {
    ...buildDocumentNode({
      documentId: 'doc-parent',
      id: 'doc-parent'
    }),
    children: [],
    childrenLoaded: false,
    hasChildren: true
  }
  const placement = buildPlacementNode({
    children: [parentDocument],
    childrenLoaded: true
  })
  const parentNodeIds = collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh(
    [placement],
    ['doc-parent']
  )
  expect(parentNodeIds).toEqual(['placement-1'])
})

test('Test that collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh skips unloaded parents', () => {
  const placement = buildPlacementNode({
    children: [],
    childrenLoaded: false
  })
  const parentNodeIds = collectProjectHierarchyTreeDocumentParentNodeIdsForRefresh(
    [placement],
    ['missing-doc']
  )
  expect(parentNodeIds).toEqual([])
})

test('Test that collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds resolves placement container for top-level delete', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-parent',
        id: 'doc-parent'
      })
    ],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds(
    [placement],
    'doc-parent'
  )
  expect(nodeIds).toEqual(['placement-1'])
})

test('Test that collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds resolves promotion and parent containers for nested delete', () => {
  const placement = buildPlacementNode({
    children: [
      {
        ...buildDocumentNode({
          documentId: 'doc-grandparent',
          id: 'doc-grandparent'
        }),
        children: [
          buildDocumentNode({
            documentId: 'doc-parent',
            id: 'doc-parent'
          })
        ],
        childrenLoaded: true,
        hasChildren: true
      }
    ],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds(
    [placement],
    'doc-parent'
  )
  expect(nodeIds).toEqual(['doc-grandparent', 'placement-1'])
})

test('Test that collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds skips deleted document row when it has loaded children', () => {
  const placement = buildPlacementNode({
    children: [
      {
        ...buildDocumentNode({
          documentId: 'doc-grandparent',
          id: 'doc-grandparent'
        }),
        children: [
          {
            ...buildDocumentNode({
              documentId: 'doc-parent',
              id: 'doc-parent'
            }),
            children: [
              buildDocumentNode({
                documentId: 'doc-child',
                id: 'doc-child'
              })
            ],
            childrenLoaded: true,
            hasChildren: true
          }
        ],
        childrenLoaded: true,
        hasChildren: true
      }
    ],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds(
    [placement],
    'doc-parent'
  )
  expect(nodeIds).toEqual(['doc-grandparent', 'placement-1'])
})

test('Test that removeProjectHierarchyTreeDocumentNodesByDocumentIds removes nested document rows', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-parent',
        id: 'doc-parent'
      }),
      buildDocumentNode({
        documentId: 'doc-sibling',
        id: 'doc-sibling'
      })
    ],
    childrenLoaded: true
  })
  const treeData = [placement]
  const removed = removeProjectHierarchyTreeDocumentNodesByDocumentIds(treeData, ['doc-parent'])
  expect(removed).toBe(true)
  expect(placement.children.map((child) => child.documentId)).toEqual(['doc-sibling'])
})

test('Test that collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds reloads direct parent before promotion ancestor for nested child delete', () => {
  const placement = buildPlacementNode({
    children: [
      {
        ...buildDocumentNode({
          documentId: 'doc-parent',
          id: 'doc-parent'
        }),
        children: [
          buildDocumentNode({
            documentId: 'doc-child',
            id: 'doc-child'
          })
        ],
        childrenLoaded: true,
        hasChildren: true
      }
    ],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds(
    [placement],
    'doc-child'
  )
  expect(nodeIds).toEqual(['doc-parent', 'placement-1'])
})

test('Test that collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds returns empty when document is missing', () => {
  const placement = buildPlacementNode({
    children: [],
    childrenLoaded: true
  })
  expect(collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds([placement], 'missing-doc')).toEqual([])
})

test('Test that collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds skips unloaded placement containers', () => {
  const placement = buildPlacementNode({
    children: [
      buildDocumentNode({
        documentId: 'doc-parent',
        id: 'doc-parent'
      })
    ],
    childrenLoaded: false
  })
  expect(collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds([placement], 'doc-parent')).toEqual([])
})

test('Test that collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh resolves loaded placement', () => {
  const placement = buildPlacementNode({
    children: [],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
    [placement],
    {
      parentDocumentId: null,
      templateId: 'tpl-1',
      worldId: 'world-1'
    }
  )
  expect(nodeIds).toEqual(['placement-1'])
})

test('Test that collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh resolves loaded parent document', () => {
  const parentDocument = {
    ...buildDocumentNode({
      documentId: 'doc-parent',
      id: 'doc-parent'
    }),
    children: [],
    childrenLoaded: true,
    hasChildren: true
  }
  const placement = buildPlacementNode({
    children: [parentDocument],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
    [placement],
    {
      parentDocumentId: 'doc-parent',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }
  )
  expect(nodeIds).toEqual(['doc-parent'])
})

test('Test that collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh resolves unloaded placement', () => {
  const placement = buildPlacementNode({
    children: [],
    childrenLoaded: false
  })
  const nodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
    [placement],
    {
      parentDocumentId: null,
      templateId: 'tpl-1',
      worldId: 'world-1'
    }
  )
  expect(nodeIds).toEqual(['placement-1'])
})

test('Test that collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh skips missing parent document', () => {
  const placement = buildPlacementNode({
    children: [],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
    [placement],
    {
      parentDocumentId: 'missing-parent',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }
  )
  expect(nodeIds).toEqual([])
})

test('Test that collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh resolves unloaded parent document', () => {
  const parentDocument = {
    ...buildDocumentNode({
      documentId: 'doc-parent',
      id: 'doc-parent'
    }),
    children: [],
    childrenLoaded: false,
    hasChildren: true
  }
  const placement = buildPlacementNode({
    children: [parentDocument],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
    [placement],
    {
      parentDocumentId: 'doc-parent',
      templateId: 'tpl-1',
      worldId: 'world-1'
    }
  )
  expect(nodeIds).toEqual(['doc-parent'])
})

test('Test that ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh marks leaf parents expandable', () => {
  const parentDocument = {
    ...buildDocumentNode({
      documentId: 'doc-parent',
      id: 'doc-parent'
    }),
    children: [],
    childrenLoaded: false,
    hasChildren: false
  }
  const placement = buildPlacementNode({
    children: [parentDocument],
    childrenLoaded: true
  })
  const marked = ensureProjectHierarchyTreeDocumentNodeHasChildrenForRefresh(
    [placement],
    'doc-parent'
  )
  expect(marked).toBe(true)
  expect(parentDocument.hasChildren).toBe(true)
})

test('Test that collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh finds nested placement rows', () => {
  const nestedPlacement = buildPlacementNode({
    children: [],
    childrenLoaded: true,
    documentTemplateId: 'tpl-nested'
  })
  nestedPlacement.id = 'placement-nested'
  nestedPlacement.placementId = 'placement-nested'
  const treeData = [
    {
      children: [
        {
          children: [nestedPlacement],
          childrenLoaded: true,
          documentId: null,
          documentTemplateId: null,
          groupId: 'group-1',
          hasChildren: true,
          icon: 'mdi-folder',
          id: 'group-1',
          label: 'Group',
          nodeKind: 'group' as const,
          placementId: null,
          worldColor: '#ff0000',
          worldId: 'world-1'
        }
      ],
      childrenLoaded: true,
      documentId: null,
      documentTemplateId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-earth',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world' as const,
      placementId: null,
      worldColor: '#ff0000',
      worldId: 'world-1'
    }
  ]
  const nodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
    treeData,
    {
      parentDocumentId: null,
      templateId: 'tpl-nested',
      worldId: 'world-1'
    }
  )
  expect(nodeIds).toEqual(['placement-nested'])
})

test('Test that collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds skips unloaded promotion target', () => {
  const placement = buildPlacementNode({
    children: [
      {
        ...buildDocumentNode({
          documentId: 'doc-grandparent',
          id: 'doc-grandparent'
        }),
        children: [
          buildDocumentNode({
            documentId: 'doc-parent',
            id: 'doc-parent'
          })
        ],
        childrenLoaded: true,
        hasChildren: true
      }
    ],
    childrenLoaded: false
  })
  const nodeIds = collectProjectHierarchyTreeDocumentDeleteRefreshNodeIds(
    [placement],
    'doc-parent'
  )
  expect(nodeIds).toEqual(['doc-grandparent'])
})

test('Test that collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh returns empty when placement is missing', () => {
  const placement = buildPlacementNode({
    children: [],
    childrenLoaded: true
  })
  const nodeIds = collectProjectHierarchyTreeNewDocumentContainerNodeIdsForRefresh(
    [placement],
    {
      parentDocumentId: null,
      templateId: 'missing-template',
      worldId: 'world-1'
    }
  )
  expect(nodeIds).toEqual([])
})
