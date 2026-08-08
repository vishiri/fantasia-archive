/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { computed, nextTick, ref, watch } from 'vue'

import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import { collectProjectHierarchyTreeTagAddDocumentPlacementOptions } from '../../functions/projectHierarchyTreeTagMenuPlacements'
import {
  isProjectHierarchyTreeDocumentDropParentValid,
  isProjectHierarchyTreeNodeDroppable,
  resolveProjectHierarchyTreeDragContext
} from '../../functions/projectHierarchyTreeDnD'
import { mapProjectHierarchyTreeToTopologyKey } from '../../functions/projectHierarchyTreeTopologyKey'
import {
  mapProjectHierarchyTreeDocumentsUnderTagToNodes,
  mapProjectHierarchyTreeTagToNode,
  mapProjectHierarchyTreeTagWrapperNode,
  mergeProjectHierarchyTreeWorldChildrenWithTags,
  resolveProjectHierarchyTreeTagBranchNodes,
  resolveProjectHierarchyTreeTagRenameMergeConflict
} from '../../functions/projectHierarchyTreeTagNodes'
import {
  patchProjectHierarchyTreeTagBranchLabelsInPlace
} from '../projectHierarchyTreeTagBranchPatchWiring'
import { createProjectHierarchyTreeLazyPlaceholderApi } from '../../functions/projectHierarchyTreeLazyPlaceholder'
import { persistProjectHierarchyTreeDraggedDocumentUnderTagReorder } from '../projectHierarchyTreeDnDCommitUnderTagWiring'
import { loadProjectHierarchyTreeTagNodeChildrenIfNeeded } from '../projectHierarchyTreeLazyLoadTagChildrenWiring'
import { createProjectHierarchyTreeLazyLoadSessionWiring } from '../projectHierarchyTreeLazyLoadSessionWiring'
import {
  createProjectHierarchyTreeNodeContextMenuUiWiring,
  resolveProjectHierarchyTreeNodeContextMenuPointerAnchorStyle
} from '../projectHierarchyTreeNodeContextMenuUiWiring'
import {
  resolveProjectHierarchyTreeNodeContextMenuLabels,
  resolveProjectHierarchyTreeNodeContextMenuSectionFlags
} from '../projectHierarchyTreeNodeContextMenuWiring'
import { createProjectHierarchyTreeSessionBulkContextMenuWiring } from '../projectHierarchyTreeSessionBulkContextMenuWiring'
import { createProjectHierarchyTreeSessionHandlersWiring } from '../projectHierarchyTreeSessionHandlersWiring'
import {
  bindProjectHierarchyTreeTagSkeletonResolvers,
  createProjectHierarchyTreeSyncWiring,
  mapWorkspaceLayoutToHierarchyTreeSkeleton
} from '../projectHierarchyTreeSyncMapperWiring'
import { createProjectHierarchyTreeTagRenameDialogWiring } from '../projectHierarchyTreeTagRenameDialogWiring'
import { bindProjectHierarchyTreeTagSessionWiring } from '../projectHierarchyTreeTagSessionBindWiring'
import { bindProjectHierarchyTreeTagSettingsResyncWatch } from '../projectHierarchyTreeTagSettingsResyncWiring'

const lazyPlaceholderApi = createProjectHierarchyTreeLazyPlaceholderApi()

function buildTagNode (overrides: Partial<I_faProjectHierarchyTreeHeTreeNode> = {}): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: false,
    categoryCount: 0,
    documentCount: 1,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: 'mdi-tag',
    id: 'tag-1',
    label: 'Heroes',
    nodeKind: 'tag',
    placementId: null,
    tagId: 'tag-1',
    worldColor: '#111',
    worldId: 'world-1',
    ...overrides
  }
}

function buildUnderTagDocument (documentId: string, tagId = 'tag-1'): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-file',
    id: `${tagId}__doc__${documentId}`,
    label: documentId,
    nodeKind: 'document',
    placementId: null,
    tagId,
    worldColor: '#111',
    worldId: 'world-1'
  }
}

const sampleWorldWithTags = {
  color: '#ff0000',
  colorPalette: '',
  displayName: 'World A',
  groups: [],
  id: 'world-1',
  placements: [{
    displayName: 'Character',
    documentTemplateId: 'template-1',
    groupId: null,
    groupSortOrder: null,
    hasChildren: false,
    icon: 'mdi-account',
    id: 'placement-1',
    nickname: '',
    rootSortOrder: 0,
    titlePluralTranslations: {},
    titleSingularTranslations: {},
    worldId: 'world-1'
  }],
  sortOrder: 0,
  tags: [{
    categoryCount: 0,
    documentCount: 2,
    id: 'tag-1',
    name: 'Heroes'
  }, {
    categoryCount: 0,
    documentCount: 0,
    id: 'tag-2',
    name: 'Places'
  }]
}

/**
 * collectProjectHierarchyTreeTagAddDocumentPlacementOptions
 * Uses empty translation maps when placement omits title fields.
 */
test('Test that collectProjectHierarchyTreeTagAddDocumentPlacementOptions handles missing title translations', () => {
  const options = collectProjectHierarchyTreeTagAddDocumentPlacementOptions({
    preferredLanguageCode: 'en-US',
    resolveAddNewRowLabel: ({ titlePluralTranslations, titleSingularTranslations }) => {
      return `${Object.keys(titlePluralTranslations).length}-${Object.keys(titleSingularTranslations).length}`
    },
    treeNodes: [{
      children: [{
        children: [],
        childrenLoaded: true,
        documentId: null,
        documentTemplateId: 'tpl-1',
        groupId: null,
        hasChildren: false,
        icon: 'mdi-account',
        id: 'placement-1',
        label: 'Characters',
        nodeKind: 'templatePlacement',
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-1'
      }],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#000',
      worldId: 'world-1'
    }],
    worldId: 'world-1'
  })
  expect(options).toEqual([{
    icon: 'mdi-account',
    label: '0-0',
    nodeId: 'placement-1',
    templateId: 'tpl-1',
    worldId: 'world-1'
  }])
})

/**
 * collectProjectHierarchyTreeTagAddDocumentPlacementOptions
 * Sorts multiple placement labels and coalesces undefined translation maps.
 */
test('Test that collectProjectHierarchyTreeTagAddDocumentPlacementOptions sorts options and coalesces undefined translations', () => {
  const options = collectProjectHierarchyTreeTagAddDocumentPlacementOptions({
    preferredLanguageCode: 'en-US',
    resolveAddNewRowLabel: ({ titlePluralTranslations }) => {
      return titlePluralTranslations['en-US'] ?? 'Default'
    },
    treeNodes: [{
      children: [{
        children: [],
        childrenLoaded: true,
        documentId: null,
        documentTemplateId: 'tpl-z',
        groupId: null,
        hasChildren: false,
        icon: 'mdi-z',
        id: 'placement-z',
        label: 'Zebra',
        nodeKind: 'templatePlacement',
        placementId: 'placement-z',
        titlePluralTranslations: { 'en-US': 'Zebra' },
        titleSingularTranslations: { 'en-US': 'Zebra' },
        worldColor: '#000',
        worldId: 'world-1'
      }, {
        children: [],
        childrenLoaded: true,
        documentId: null,
        documentTemplateId: 'tpl-a',
        groupId: null,
        hasChildren: false,
        icon: 'mdi-a',
        id: 'placement-a',
        label: 'Alpha',
        nodeKind: 'templatePlacement',
        placementId: 'placement-a',
        titlePluralTranslations: undefined,
        titleSingularTranslations: undefined,
        worldColor: '#000',
        worldId: 'world-1'
      } as I_faProjectHierarchyTreeHeTreeNode],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#000',
      worldId: 'world-1'
    }],
    worldId: 'world-1'
  })
  expect(options.map((row) => row.label)).toEqual(['Default', 'Zebra'])
  expect(options.map((row) => row.nodeId)).toEqual(['placement-a', 'placement-z'])
})

/**
 * collectProjectHierarchyTreeTagAddDocumentPlacementOptions
 * Visits nested group children when collecting placement options.
 */
test('Test that collectProjectHierarchyTreeTagAddDocumentPlacementOptions visits nested groups', () => {
  const options = collectProjectHierarchyTreeTagAddDocumentPlacementOptions({
    preferredLanguageCode: 'en-US',
    resolveAddNewRowLabel: () => 'Character',
    treeNodes: [{
      children: [{
        children: [{
          children: [],
          childrenLoaded: true,
          documentId: null,
          documentTemplateId: 'tpl-2',
          groupId: 'group-1',
          hasChildren: false,
          icon: 'mdi-home',
          id: 'placement-2',
          label: 'Buildings',
          nodeKind: 'templatePlacement',
          placementId: 'placement-2',
          titlePluralTranslations: { 'en-US': 'Buildings' },
          titleSingularTranslations: { 'en-US': 'Building' },
          worldColor: '#000',
          worldId: 'world-1'
        }],
        childrenLoaded: true,
        documentId: null,
        groupId: null,
        hasChildren: true,
        icon: '',
        id: 'group-1',
        label: 'Group',
        nodeKind: 'group',
        placementId: null,
        worldColor: '#000',
        worldId: 'world-1'
      }],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#000',
      worldId: 'world-1'
    }],
    worldId: 'world-1'
  })
  expect(options.map((row) => row.nodeId)).toEqual(['placement-2'])
})

/**
 * collectProjectHierarchyTreeTagAddDocumentPlacementOptions
 * Ignores placements outside the requested world.
 */
test('Test that collectProjectHierarchyTreeTagAddDocumentPlacementOptions filters by world id', () => {
  const options = collectProjectHierarchyTreeTagAddDocumentPlacementOptions({
    preferredLanguageCode: 'en-US',
    resolveAddNewRowLabel: () => 'Row',
    treeNodes: [{
      children: [{
        children: [],
        childrenLoaded: true,
        documentId: null,
        documentTemplateId: 'tpl-1',
        groupId: null,
        hasChildren: false,
        icon: 'mdi-account',
        id: 'placement-1',
        label: 'Characters',
        nodeKind: 'templatePlacement',
        placementId: 'placement-1',
        worldColor: '#000',
        worldId: 'world-2'
      }],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#000',
      worldId: 'world-1'
    }],
    worldId: 'world-1'
  })
  expect(options).toEqual([])
})

/**
 * mapProjectHierarchyTreeDocumentsUnderTagToNodes
 * Tie-breaks equal sortOrder rows by document id.
 */
test('Test that mapProjectHierarchyTreeDocumentsUnderTagToNodes tie-breaks by document id', () => {
  const nodes = mapProjectHierarchyTreeDocumentsUnderTagToNodes({
    items: [
      {
        documentBackgroundColor: '',
        documentId: 'doc-b',
        documentTextColor: '',
        displayName: 'Same',
        extraClasses: '',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        sortOrder: 0,
        templateId: null,
        treeOrderNumber: 0
      },
      {
        documentBackgroundColor: '',
        documentId: 'doc-a',
        documentTextColor: '',
        displayName: 'Same',
        extraClasses: '',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        sortOrder: 0,
        templateId: null,
        treeOrderNumber: 0
      }
    ],
    resolvePlacementDisplayIcon: () => 'mdi-file',
    tagId: 'tag-1',
    worldColor: '#111',
    worldId: 'world-1'
  })
  expect(nodes.map((node) => node.documentId)).toEqual(['doc-a', 'doc-b'])
})

/**
 * patchProjectHierarchyTreeTagBranchLabelsInPlace
 * Drops stale tag rows and non-tag wrapper children when syncing membership.
 */
test('Test that patchProjectHierarchyTreeTagBranchLabelsInPlace drops stale tag rows', () => {
  const syncSpy = vi.fn()
  const wrapperNode = mapProjectHierarchyTreeTagWrapperNode({
    lazyPlaceholderApi,
    tags: [{
      categoryCount: 0,
      documentCount: 1,
      id: 'tag-1',
      name: 'Heroes'
    }],
    tagsLabel: 'Tags',
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  wrapperNode.children.push({
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'not-a-tag',
    label: 'Skip',
    nodeKind: 'group',
    placementId: null,
    worldColor: '#111',
    worldId: 'world-1'
  })
  const worldNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [wrapperNode, buildTagNode({
      id: 'missing-tag',
      label: 'Stale'
    })],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }
  patchProjectHierarchyTreeTagBranchLabelsInPlace({
    lazyPlaceholderApi: {
      resolveLazyChildren: lazyPlaceholderApi.resolveLazyChildren,
      syncProjectHierarchyTreeNodeLazyChildren: syncSpy
    },
    resolveTagsLabel: () => 'Tags',
    tagSettings: {
      compactTags: true,
      noTags: false,
      tagsAtTop: false
    },
    world: {
      color: '#111',
      colorPalette: '',
      displayName: 'World',
      groups: [],
      id: 'world-1',
      placements: [],
      sortOrder: 0,
      tags: [{
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-1',
        name: 'Heroes'
      }]
    },
    worldNode
  })
  expect(worldNode.children).toHaveLength(1)
  expect(worldNode.children[0]?.nodeKind).toBe('tagWrapper')
  expect(worldNode.children[0]?.children.map((child) => child.id)).toEqual(['tag-1'])
})

/**
 * resolveProjectHierarchyTreeTagBranchNodes
 * Builds compact wrapper and flat tag rows from settings.
 */
test('Test that resolveProjectHierarchyTreeTagBranchNodes respects tag display settings', () => {
  const world = {
    color: '#111',
    colorPalette: '',
    displayName: 'World',
    groups: [],
    id: 'world-1',
    placements: [],
    sortOrder: 0,
    tags: [{
      categoryCount: 0,
      documentCount: 1,
      id: 'tag-1',
      name: 'Alpha'
    }]
  }
  expect(resolveProjectHierarchyTreeTagBranchNodes({
    lazyPlaceholderApi,
    tagSettings: {
      compactTags: false,
      noTags: true,
      tagsAtTop: false
    },
    tagsLabel: 'Tags',
    world
  })).toEqual([])
  expect(resolveProjectHierarchyTreeTagBranchNodes({
    lazyPlaceholderApi,
    tagSettings: {
      compactTags: false,
      noTags: false,
      tagsAtTop: false
    },
    tagsLabel: 'Tags',
    world: {
      ...world,
      tags: []
    }
  })).toEqual([])
  const flat = resolveProjectHierarchyTreeTagBranchNodes({
    lazyPlaceholderApi,
    tagSettings: {
      compactTags: false,
      noTags: false,
      tagsAtTop: true
    },
    tagsLabel: 'Tags',
    world
  })
  expect(flat[0]?.nodeKind).toBe('tag')
  const compact = resolveProjectHierarchyTreeTagBranchNodes({
    lazyPlaceholderApi,
    tagSettings: {
      compactTags: true,
      noTags: false,
      tagsAtTop: false
    },
    tagsLabel: 'My Tags',
    world
  })
  expect(compact[0]?.nodeKind).toBe('tagWrapper')
  expect(compact[0]?.label).toBe('My Tags')
})

/**
 * mergeProjectHierarchyTreeWorldChildrenWithTags
 * Returns structural children when tag branch is empty.
 */
test('Test that mergeProjectHierarchyTreeWorldChildrenWithTags returns structural when tags empty', () => {
  const structural = [{ id: 'placement' }] as never
  expect(mergeProjectHierarchyTreeWorldChildrenWithTags({
    structuralChildren: structural,
    tagBranchNodes: [],
    tagsAtTop: true
  })).toBe(structural)
})

/**
 * patchProjectHierarchyTreeTagBranchLabelsInPlace
 * Patches wrapper and direct tag labels from world data.
 */
test('Test that patchProjectHierarchyTreeTagBranchLabelsInPlace updates wrapper and tag nodes', () => {
  const syncSpy = vi.fn()
  const tagNode = mapProjectHierarchyTreeTagToNode({
    lazyPlaceholderApi: {
      resolveLazyChildren: lazyPlaceholderApi.resolveLazyChildren,
      syncProjectHierarchyTreeNodeLazyChildren: syncSpy
    },
    tag: {
      categoryCount: 0,
      documentCount: 3,
      id: 'tag-1',
      name: 'Old'
    },
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  const wrapperNode = mapProjectHierarchyTreeTagWrapperNode({
    lazyPlaceholderApi,
    tags: [{
      categoryCount: 0,
      documentCount: 3,
      id: 'tag-1',
      name: 'Old'
    }],
    tagsLabel: 'Old label',
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  const worldNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [wrapperNode, tagNode],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }
  patchProjectHierarchyTreeTagBranchLabelsInPlace({
    lazyPlaceholderApi: {
      resolveLazyChildren: lazyPlaceholderApi.resolveLazyChildren,
      syncProjectHierarchyTreeNodeLazyChildren: syncSpy
    },
    resolveTagsLabel: () => 'New Tags',
    tagSettings: {
      compactTags: true,
      noTags: false,
      tagsAtTop: false
    },
    world: {
      ...sampleWorldWithTags,
      tags: [{
        categoryCount: 0,
        documentCount: 5,
        id: 'tag-1',
        name: 'Renamed'
      }]
    },
    worldNode
  })
  expect(wrapperNode.label).toBe('New Tags')
  expect(wrapperNode.children[0]?.label).toBe('Renamed')
  expect(wrapperNode.children[0]?.documentCount).toBe(5)
  expect(worldNode.children).toHaveLength(1)
  expect(worldNode.children[0]?.id).toBe(wrapperNode.id)
  expect(syncSpy).toHaveBeenCalled()
  patchProjectHierarchyTreeTagBranchLabelsInPlace({
    lazyPlaceholderApi: {
      resolveLazyChildren: lazyPlaceholderApi.resolveLazyChildren,
      syncProjectHierarchyTreeNodeLazyChildren: syncSpy
    },
    resolveTagsLabel: () => 'Ignored',
    tagSettings: {
      compactTags: false,
      noTags: true,
      tagsAtTop: false
    },
    world: sampleWorldWithTags,
    worldNode
  })
  expect(worldNode.children).toEqual([])
})

/**
 * resolveProjectHierarchyTreeTagRenameMergeConflict
 * Empty or unchanged names do not conflict.
 */
test('Test that resolveProjectHierarchyTreeTagRenameMergeConflict ignores empty and same names', () => {
  expect(resolveProjectHierarchyTreeTagRenameMergeConflict({
    existingTagNames: ['Heroes'],
    newName: '   ',
    renameTagCurrentName: 'Villains',
    renameTagId: 'tag-1'
  })).toBe(false)
  expect(resolveProjectHierarchyTreeTagRenameMergeConflict({
    existingTagNames: ['Heroes'],
    newName: 'Heroes',
    renameTagCurrentName: 'Heroes',
    renameTagId: 'tag-1'
  })).toBe(false)
})

/**
 * mapProjectHierarchyTreeToTopologyKey
 * Records flat tags and compact wrapper tag topology.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey includes tag topology rows', () => {
  const flatTagTree: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [buildTagNode()],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }]
  const flatKey = JSON.parse(mapProjectHierarchyTreeToTopologyKey(flatTagTree)) as {
    tags: Array<{ id: string, wrapperId: string | null }>
  }
  expect(flatKey.tags).toEqual([{
    id: 'tag-1',
    wrapperId: null
  }])

  const wrapper = mapProjectHierarchyTreeTagWrapperNode({
    lazyPlaceholderApi,
    tags: [{
      categoryCount: 0,
      documentCount: 0,
      id: 'tag-2',
      name: 'Places'
    }],
    tagsLabel: 'Tags',
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  const wrapperTree: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [wrapper],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }]
  const wrapperKey = JSON.parse(mapProjectHierarchyTreeToTopologyKey(wrapperTree)) as {
    tags: Array<{ id: string, wrapperId: string | null }>
  }
  expect(wrapperKey.tags).toEqual([{
    id: 'tag-2',
    wrapperId: wrapper.id
  }])
})

/**
 * persistProjectHierarchyTreeDraggedDocumentUnderTagReorder
 * Handles null tag, missing API, success, and error recovery.
 */
test('Test that persistProjectHierarchyTreeDraggedDocumentUnderTagReorder covers commit branches', async () => {
  const moved = buildUnderTagDocument('doc-1')
  const parent = buildTagNode()
  const siblings = [moved, buildUnderTagDocument('doc-2')]
  const refreshLayout = vi.fn(async () => undefined)
  const resyncTreeDataFromLayout = vi.fn()

  expect(await persistProjectHierarchyTreeDraggedDocumentUnderTagReorder({
    dragSiblingOrderSnapshot: null,
    movedNode: {
      ...moved,
      tagId: null
    },
    parentBucketChildren: siblings,
    parentNode: parent,
    refreshLayout,
    resyncTreeDataFromLayout
  })).toBeNull()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { faContentBridgeAPIs: { projectContent: {} } },
    writable: true
  })
  expect(await persistProjectHierarchyTreeDraggedDocumentUnderTagReorder({
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-2', 'doc-1'],
      parentDocumentId: null,
      placementId: 'placement-1',
      tagId: 'tag-1'
    },
    movedNode: moved,
    parentBucketChildren: siblings,
    parentNode: parent,
    refreshLayout,
    resyncTreeDataFromLayout
  })).toEqual({
    committed: false,
    emptiedParentDocumentIds: [],
    nestParentDocumentId: null,
    reloadChildrenNodeId: null
  })

  const reorderDocumentsUnderTag = vi.fn(async () => undefined)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: { reorderDocumentsUnderTag }
      }
    },
    writable: true
  })
  expect(await persistProjectHierarchyTreeDraggedDocumentUnderTagReorder({
    dragSiblingOrderSnapshot: null,
    movedNode: moved,
    parentBucketChildren: siblings,
    parentNode: parent,
    refreshLayout,
    resyncTreeDataFromLayout
  })).toEqual({
    committed: true,
    emptiedParentDocumentIds: [],
    nestParentDocumentId: null,
    reloadChildrenNodeId: null
  })
  expect(reorderDocumentsUnderTag).toHaveBeenCalledWith({
    orderedDocumentIds: ['doc-1', 'doc-2'],
    tagId: 'tag-1'
  })

  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const throwingReorder = vi.fn(async () => {
    throw new Error('reorder failed')
  })
  window.faContentBridgeAPIs = {
    projectContent: {
      reorderDocumentsUnderTag: throwingReorder
    }
  } as never
  const errorResult = await persistProjectHierarchyTreeDraggedDocumentUnderTagReorder({
    dragSiblingOrderSnapshot: {
      orderedDocumentIds: ['doc-1'],
      parentDocumentId: null,
      placementId: 'placement-1',
      tagId: 'tag-1'
    },
    movedNode: moved,
    parentBucketChildren: siblings,
    parentNode: parent,
    refreshLayout,
    resyncTreeDataFromLayout
  })
  expect(errorResult).toEqual({
    committed: false,
    emptiedParentDocumentIds: [],
    nestParentDocumentId: null,
    reloadChildrenNodeId: null
  })
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
  errorSpy.mockRestore()
})

/**
 * loadProjectHierarchyTreeTagNodeChildrenIfNeeded
 * Skips non-tag nodes, stages children, or merges into tree data.
 */
test('Test that loadProjectHierarchyTreeTagNodeChildrenIfNeeded covers lazy-load branches', async () => {
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: false,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'placement-1',
    label: 'Buildings',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#111',
    worldId: 'world-1'
  }
  expect(await loadProjectHierarchyTreeTagNodeChildrenIfNeeded({
    node: placementNode,
    publishTreeRevision: vi.fn(async () => undefined),
    treeData: ref([])
  })).toBe(false)

  const tagNode = buildTagNode()
  expect(await loadProjectHierarchyTreeTagNodeChildrenIfNeeded({
    node: tagNode,
    publishTreeRevision: vi.fn(async () => undefined),
    treeData: ref([])
  })).toBe(true)

  const stageLoadedChildrenForNode = vi.fn()
  const listDocumentsUnderTag = vi.fn(async () => ({
    items: [{
      documentBackgroundColor: '',
      documentId: 'doc-1',
      documentTextColor: '',
      displayName: 'Doc',
      extraClasses: '',
      isCategory: false,
      isDead: false,
      isFinished: false,
      isMinor: false,
      sortOrder: 0,
      templateId: null,
      treeOrderNumber: 0
    }]
  }))
  expect(await loadProjectHierarchyTreeTagNodeChildrenIfNeeded({
    listDocumentsUnderTag: listDocumentsUnderTag as never,
    node: tagNode,
    publishTreeRevision: vi.fn(async () => undefined),
    stageLoadedChildrenForNode,
    treeData: ref([{
      children: [tagNode],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#111',
      worldId: 'world-1'
    }])
  })).toBe(true)
  expect(stageLoadedChildrenForNode).toHaveBeenCalledWith('tag-1', expect.any(Array))

  const publishTreeRevision = vi.fn(async () => undefined)
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    children: [tagNode],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])
  await loadProjectHierarchyTreeTagNodeChildrenIfNeeded({
    listDocumentsUnderTag: listDocumentsUnderTag as never,
    node: tagNode,
    publishTreeRevision,
    treeData
  })
  expect(publishTreeRevision).toHaveBeenCalledWith('tag', 'tag-1')
})

/**
 * createProjectHierarchyTreeLazyLoadSessionWiring
 * listDocumentsUnderTag falls back when bridge API is missing.
 */
test('Test that lazy load session wiring handles missing listDocumentsUnderTag API', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { faContentBridgeAPIs: { projectContent: {} } },
    writable: true
  })
  const treeData = ref(mapWorkspaceLayoutToHierarchyTreeSkeleton([{
    ...sampleWorldWithTags,
    tags: [{
      categoryCount: 0,
      documentCount: 1,
      id: 'tag-1',
      name: 'Heroes'
    }]
  }]))
  const tagNode = treeData.value[0]?.children.find((child) => child.nodeKind === 'tag')
  expect(tagNode).toBeDefined()
  const wiring = createProjectHierarchyTreeLazyLoadSessionWiring({
    deferLazyLoadTreeRevisionPublish: ref(false),
    dragCommitPending: ref(false),
    dragExpandUiFrozen: ref(false),
    flushUiStatePersist: vi.fn(),
    getExpandedNodeIds: () => [],
    getForceSublevelCollapseInTree: () => false,
    getPendingRevealPath: () => [],
    getPreferredLanguageCode: () => 'en-US',
    getScrollTopPx: () => 0,
    getTreeRef: () => null,
    getTreeScrollHost: () => null,
    getWorlds: () => [sampleWorldWithTags],
    hierarchyStore: {
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn()
    },
    isTreeDragActive: ref(false),
    nextTick: async () => undefined,
    openNodeIds: ref(new Set()),
    pendingRevealPath: ref([]),
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    suppressTreeEmit: ref(false),
    treeData,
    watch
  })
  await wiring.lazyLoadWiring.loadChildrenForNode(tagNode!)
  expect(tagNode!.childrenLoaded).toBe(true)
})

/**
 * createProjectHierarchyTreeNodeContextMenuUiWiring
 * Tag add submenu hover handlers toggle open row index.
 */
test('Test that createProjectHierarchyTreeNodeContextMenuUiWiring drives tag submenu hover', () => {
  const ui = createProjectHierarchyTreeNodeContextMenuUiWiring({
    t: (key: string) => key
  })
  ui.onAddToTagSubmenuActivatorEnter()
  expect(ui.isAddToTagSubmenuOpen.value).toBe(true)
  ui.onAddToTagSubmenuModelUpdate(false)
  expect(ui.isAddToTagSubmenuOpen.value).toBe(false)
  ui.onRootMenuHide(vi.fn())
  expect(resolveProjectHierarchyTreeNodeContextMenuPointerAnchorStyle(null).opacity).toBe('0')
})

/**
 * resolveProjectHierarchyTreeNodeContextMenuSectionFlags
 * Tag, tag wrapper, and under-tag document menu sections.
 */
test('Test that resolveProjectHierarchyTreeNodeContextMenuSectionFlags covers tag nodes', () => {
  const tagFlags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(buildTagNode(), [])
  expect(tagFlags?.showsTagMenuRows).toBe(true)
  const underTagDoc = buildUnderTagDocument('doc-1')
  const docFlags = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(underTagDoc, [])
  expect(docFlags?.showsDocumentOpenEditRows).toBe(true)
  expect(docFlags?.showsCopyRows).toBe(true)
  expect(docFlags?.showsTagMenuRows).toBe(false)
  const labels = resolveProjectHierarchyTreeNodeContextMenuLabels((key) => key)
  expect(labels.deleteTagLabel).toBe('projectUI.projectHierarchyTree.contextMenu.deleteTag')
})

/**
 * createProjectHierarchyTreeSessionBulkContextMenuWiring
 * Sets tag anchor on tag context menu and clears on hide.
 */
test('Test that createProjectHierarchyTreeSessionBulkContextMenuWiring manages tag menu anchor', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    children: [buildTagNode()],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])
  const wiring = createProjectHierarchyTreeSessionBulkContextMenuWiring({
    applyOpenedDocumentTabs: vi.fn(),
    createTemporaryDocument: vi.fn(async () => 'temp'),
    dragExpandUiFrozen: ref(false),
    getOpenedDocumentTabs: () => [],
    getTreeRef: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    nextTick: async () => undefined,
    onAddNewDocumentRowClick: vi.fn(),
    openNodeIds: ref(new Set()),
    queuePersistExpandedNodeIds: vi.fn(),
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    resolvePreferredLanguageCode: () => 'en-US',
    resyncTreeDataFromLayout: vi.fn(),
    runDeferredLazyLoadBatch: vi.fn(async (run) => {
      await run()
    }),
    runFaAction: vi.fn(),
    suppressTreeEmit: ref(false),
    treeData,
    uiStateWiring: {
      reapplyHeTreeOpenState: vi.fn(),
      reapplyLatentDescendantExpandState: vi.fn(async () => undefined)
    }
  })
  wiring.onNodeRowContextMenu(buildTagNode(), {
    clientX: 1,
    clientY: 2,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  wiring.onRenameTagFromContextMenuClick()
  expect(wiring.renameTagDialogOpen.value).toBe(true)
  wiring.onDismissRenameTagDialog()
  wiring.onNodeContextMenuHide()
  wiring.onRenameTagFromContextMenuClick()
  expect(wiring.renameTagDialogOpen.value).toBe(false)
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring
 * Exposes tag dialog handlers from integrated bulk context menu wiring.
 */
test('Test that createProjectHierarchyTreeSessionHandlersWiring exposes tag dialog handlers', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    children: [buildTagNode()],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])
  const handlers = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp'),
    documentRowDragHoldWiring: {
      clearHoldSession: vi.fn(),
      getIsDragHoldArmed: () => false,
      handleDocumentRowPointerDown: vi.fn(),
      handleTreeDragStartCapture: vi.fn(),
      markDragStartedFromHold: vi.fn()
    },
    documentRowExpandClickGesture: {
      beginDocumentRowGesture: vi.fn(),
      clearDocumentRowGesture: vi.fn(),
      markDragStartedForGesture: vi.fn(),
      shouldDocumentRowClickToggleExpand: () => false
    },
    dragContext: { dragNode: null },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    getPersistedScrollTopPx: () => 0,
    getTreeScrollHost: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    nextTick: async () => undefined,
    onDocumentOpenRequest: vi.fn(),
    openIconExpandAnimationWiring: {
      scheduleOpenIconExpandAnimation: vi.fn()
    },
    openNodeIds: ref(new Set()),
    queuePersistExpandedNodeIds: vi.fn(),
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    resolvePreferredLanguageCode: () => 'en-US',
    runDeferredLazyLoadBatch: vi.fn(async (run) => {
      await run()
    }),
    runFaAction: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref(null),
    treeData,
    treeScrollHostRef: ref(null),
    uiStateWiring: {
      awaitHeTreeResyncIdle: async () => undefined,
      isProgrammaticHeTreeResyncActive: () => false,
      markNodeClosed: vi.fn(),
      markNodeOpen: vi.fn(),
      reapplyHeTreeOpenState: vi.fn(),
      reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
      resyncHeTreeAfterExpandPublish: vi.fn(async () => undefined)
    }
  })
  expect(handlers.onDeleteTagFromContextMenuClick).toBeTypeOf('function')
  expect(handlers.renameTagNameDraft).toBeDefined()
  handlers.onNodeRowContextMenu(buildTagNode(), {
    clientX: 0,
    clientY: 0,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  handlers.onDeleteTagFromContextMenuClick()
  expect(handlers.deleteTagConfirmOpen.value).toBe(true)
  handlers.onDismissDeleteTagDialog()
})

/**
 * bindProjectHierarchyTreeTagSessionWiring
 * Live resolvers use preview, settings, and defaults when settings are null.
 */
test('Test that bindProjectHierarchyTreeTagSessionWiring applies preview tag settings to skeleton', () => {
  bindProjectHierarchyTreeTagSessionWiring({
    S_FaActiveProject: (() => ({
      activeProject: null,
      hasActiveProject: false
    })) as never,
    S_FaOpenedDocuments: (() => ({
      createTemporaryDocument: vi.fn(async () => 'temp'),
      replaceOpenedDocumentTabs: vi.fn(),
      tabs: []
    })) as never,
    S_FaUserSettings: (() => ({
      appSettingsDialogPreview: {
        compactTags: true,
        noTags: false,
        tagsAtTop: true
      },
      settings: null
    })) as never,
    computed,
    dragContext: { dragNode: null } as never,
    hierarchyStore: {
      clearPendingDocumentRefreshIds: vi.fn(),
      clearPendingHierarchyNodeRefreshIds: vi.fn(),
      clearPendingRevealPath: vi.fn(),
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined),
      refreshUiState: vi.fn(async () => undefined),
      resetOnProjectClose: vi.fn(),
      uiState: { scrollTopPx: 0 }
    } as never,
    i18nT: () => 'Translated Tags',
    layoutRefreshGeneration: ref(0),
    nextTick: async () => undefined,
    onDocumentOpenRequest: vi.fn(),
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    pendingDocumentRefreshIds: ref([]),
    pendingHierarchyNodeRefreshIds: ref([]),
    pendingRevealPath: ref([]),
    ref,
    runFaAction: vi.fn(async () => undefined) as never,
    treeData: ref([]),
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch: vi.fn(),
    worlds: ref([sampleWorldWithTags])
  })
  const skeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorldWithTags])
  expect(skeleton[0]?.children.some((child) => child.nodeKind === 'tagWrapper')).toBe(true)
  expect(skeleton[0]?.children[0]?.label).toBe('Translated Tags')
  bindProjectHierarchyTreeTagSkeletonResolvers({
    resolveTagSettings: () => ({
      compactTags: false,
      noTags: true,
      tagsAtTop: false
    }),
    resolveTagsLabel: () => 'Hidden'
  })
  const hidden = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorldWithTags])
  expect(hidden[0]?.children.some((child) => child.nodeKind === 'tag' || child.nodeKind === 'tagWrapper')).toBe(false)
})

/**
 * createProjectHierarchyTreeTagRenameDialogWiring
 * Blocks confirm when draft is blank after trim.
 */
test('Test that createProjectHierarchyTreeTagRenameDialogWiring rejects blank rename confirm', () => {
  const wiring = createProjectHierarchyTreeTagRenameDialogWiring({
    applyOpenedDocumentTabs: vi.fn(),
    getOpenedDocumentTabs: () => [],
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    resolveTagContextMenuAnchor: () => buildTagNode(),
    resyncTreeDataFromLayout: vi.fn(),
    treeData: ref([])
  })
  wiring.onRenameTagFromContextMenuClick()
  wiring.renameTagNameDraft.value = '   '
  expect(wiring.renameTagCanConfirm.value).toBe(false)
  wiring.onConfirmRenameTag()
  expect(wiring.renameTagDialogOpen.value).toBe(true)
})

/**
 * projectHierarchyTreeDnD
 * Under-tag document drag targets stay within the same tag branch.
 */
test('Test that projectHierarchyTreeDnD handles under-tag reorder targets', () => {
  const dragged = buildUnderTagDocument('doc-1')
  const dragContext = { dragNode: { data: dragged } }
  expect(resolveProjectHierarchyTreeDragContext(dragged)).toBeNull()
  expect(isProjectHierarchyTreeDocumentDropParentValid({
    parentDocumentId: null,
    parentNode: buildTagNode()
  })).toBe(true)
  expect(isProjectHierarchyTreeNodeDroppable(buildTagNode(), dragContext)).toBe(true)
  expect(isProjectHierarchyTreeNodeDroppable(buildUnderTagDocument('doc-2'), dragContext)).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable({
    ...buildUnderTagDocument('doc-2'),
    tagId: 'other-tag'
  }, dragContext)).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable({
    children: [],
    childrenLoaded: true,
    documentId: 'doc-main',
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'doc-main',
    label: 'Main',
    nodeKind: 'document',
    placementId: 'placement-1',
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }, dragContext)).toBe(false)
})

/**
 * bindProjectHierarchyTreeTagSessionWiring
 * Falls back to persisted settings when preview fields are absent.
 */
test('Test that bindProjectHierarchyTreeTagSessionWiring uses settings when preview is empty', () => {
  bindProjectHierarchyTreeTagSessionWiring({
    S_FaActiveProject: (() => ({
      activeProject: null,
      hasActiveProject: false
    })) as never,
    S_FaOpenedDocuments: (() => ({
      createTemporaryDocument: vi.fn(async () => 'temp'),
      replaceOpenedDocumentTabs: vi.fn(),
      tabs: []
    })) as never,
    S_FaUserSettings: (() => ({
      appSettingsDialogPreview: {},
      settings: {
        compactTags: true,
        forceSublevelCollapseInTree: true,
        languageCode: 'de-DE',
        noTags: false,
        tagsAtTop: false
      }
    })) as never,
    computed,
    dragContext: { dragNode: null } as never,
    hierarchyStore: {
      clearPendingDocumentRefreshIds: vi.fn(),
      clearPendingHierarchyNodeRefreshIds: vi.fn(),
      clearPendingRevealPath: vi.fn(),
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined),
      refreshUiState: vi.fn(async () => undefined),
      resetOnProjectClose: vi.fn(),
      uiState: { scrollTopPx: 0 }
    } as never,
    i18nT: (key: string) => `i18n:${key}`,
    layoutRefreshGeneration: ref(0),
    nextTick: async () => undefined,
    onDocumentOpenRequest: vi.fn(),
    onMounted: vi.fn(),
    onUnmounted: vi.fn(),
    pendingDocumentRefreshIds: ref([]),
    pendingHierarchyNodeRefreshIds: ref([]),
    pendingRevealPath: ref([]),
    ref,
    runFaAction: vi.fn(async () => undefined) as never,
    treeData: ref([]),
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch: vi.fn(),
    worlds: ref([sampleWorldWithTags])
  })
  const skeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorldWithTags])
  const wrapperChild = skeleton[0]?.children.find((child) => child.nodeKind === 'tagWrapper')
  expect(wrapperChild).toBeDefined()
  expect(wrapperChild?.label).toBe('i18n:projectUI.projectHierarchyTree.tagsWrapperLabel')
})

/**
 * bindProjectHierarchyTreeTagSettingsResyncWatch
 * Resyncs when persisted settings supply tag chrome without preview.
 */
test('Test that bindProjectHierarchyTreeTagSettingsResyncWatch watches persisted settings', async () => {
  const forceResyncTreeDataFromLayout = vi.fn()
  const settings = ref({
    compactTags: false,
    noTags: false,
    tagsAtTop: false
  })
  const preview = ref<Record<string, boolean>>({})
  bindProjectHierarchyTreeTagSettingsResyncWatch({
    S_FaUserSettings: (() => ({
      appSettingsDialogPreview: preview.value,
      settings: settings.value
    })) as never,
    forceResyncTreeDataFromLayout,
    watch
  })
  settings.value = {
    compactTags: true,
    noTags: true,
    tagsAtTop: true
  }
  await import('vue').then(({ nextTick }) => nextTick())
  expect(forceResyncTreeDataFromLayout).toHaveBeenCalled()
})

/**
 * createProjectHierarchyTreeTagRenameDialogWiring
 * Returns false merge warning before rename dialog opens.
 */
test('Test that createProjectHierarchyTreeTagRenameDialogWiring merge warning starts false', () => {
  const wiring = createProjectHierarchyTreeTagRenameDialogWiring({
    applyOpenedDocumentTabs: vi.fn(),
    getOpenedDocumentTabs: () => [],
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    resolveTagContextMenuAnchor: () => null,
    resyncTreeDataFromLayout: vi.fn(),
    treeData: ref([{
      children: [buildTagNode()],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'world-1',
      label: 'World',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#111',
      worldId: 'world-1'
    }])
  })
  expect(wiring.renameTagMergeWarning.value).toBe(false)
  wiring.onRenameTagFromContextMenuClick()
  expect(wiring.renameTagDialogOpen.value).toBe(false)
})

/**
 * mapProjectHierarchyTreeToTopologyKey
 * Records group placement topology alongside tag rows.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey records grouped placement topology', () => {
  const tree: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [{
      children: [{
        children: [],
        childrenLoaded: true,
        documentId: null,
        groupId: 'group-1',
        hasChildren: false,
        icon: '',
        id: 'placement-1',
        label: 'Characters',
        nodeKind: 'templatePlacement',
        placementId: 'placement-1',
        worldColor: '#111',
        worldId: 'world-1'
      }],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'group-1',
      label: 'Group',
      nodeKind: 'group',
      placementId: null,
      worldColor: '#111',
      worldId: 'world-1'
    }, buildTagNode()],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }]
  const key = JSON.parse(mapProjectHierarchyTreeToTopologyKey(tree)) as {
    groups: Array<{ id: string, placementIds: string[] }>
    tags: Array<{ id: string }>
  }
  expect(key.groups[0]?.placementIds).toEqual(['placement-1'])
  expect(key.tags[0]?.id).toBe('tag-1')
})

/**
 * mapProjectHierarchyTreeToTopologyKey
 * Ignores non-tag children inside compact tag wrappers.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey ignores non-tag wrapper children', () => {
  const wrapper = mapProjectHierarchyTreeTagWrapperNode({
    lazyPlaceholderApi,
    tags: [{
      categoryCount: 0,
      documentCount: 0,
      id: 'tag-2',
      name: 'Places'
    }],
    tagsLabel: 'Tags',
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  wrapper.children.push({
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'stray',
    label: 'Stray',
    nodeKind: 'group',
    placementId: null,
    worldColor: '#111',
    worldId: 'world-1'
  })
  const key = JSON.parse(mapProjectHierarchyTreeToTopologyKey([{
    children: [wrapper],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])) as { tags: Array<{ id: string }> }
  expect(key.tags).toEqual([{
    id: 'tag-2',
    wrapperId: wrapper.id
  }])
})

/**
 * mapProjectHierarchyTreeToTopologyKey
 * Sorts world ids and records root-level template placements.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey sorts worlds and root placements', () => {
  const key = JSON.parse(mapProjectHierarchyTreeToTopologyKey([
    {
      children: [{
        children: [],
        childrenLoaded: true,
        documentId: null,
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'placement-root',
        label: 'Root placement',
        nodeKind: 'templatePlacement',
        placementId: 'placement-root',
        worldColor: '#111',
        worldId: 'world-b'
      }],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'world-b',
      label: 'World B',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#111',
      worldId: 'world-b'
    },
    {
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: '',
      id: 'world-a',
      label: 'World A',
      nodeKind: 'world',
      placementId: null,
      tagId: null,
      worldColor: '#111',
      worldId: 'world-a'
    }
  ])) as {
    placements: Array<{ groupId: string | null, id: string }>
    worlds: Array<{ id: string }>
  }
  expect(key.worlds.map((world) => world.id)).toEqual(['world-a', 'world-b'])
  expect(key.placements).toEqual([{
    groupId: null,
    id: 'placement-root'
  }])
})

/**
 * mapProjectHierarchyTreeToTopologyKey
 * Sorts grouped placement ids and group ids via compareTopologyIds.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey sorts grouped placement topology', () => {
  const key = JSON.parse(mapProjectHierarchyTreeToTopologyKey([{
    children: [{
      children: [{
        children: [],
        childrenLoaded: true,
        documentId: null,
        groupId: 'group-b',
        hasChildren: false,
        icon: '',
        id: 'placement-2',
        label: 'Places',
        nodeKind: 'templatePlacement',
        placementId: 'placement-2',
        worldColor: '#111',
        worldId: 'world-1'
      }, {
        children: [],
        childrenLoaded: true,
        documentId: null,
        groupId: 'group-b',
        hasChildren: false,
        icon: '',
        id: 'placement-1',
        label: 'Characters',
        nodeKind: 'templatePlacement',
        placementId: 'placement-1',
        worldColor: '#111',
        worldId: 'world-1'
      }],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: '',
      id: 'group-b',
      label: 'Group B',
      nodeKind: 'group',
      placementId: null,
      tagId: null,
      worldColor: '#111',
      worldId: 'world-1'
    }, {
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: '',
      id: 'group-a',
      label: 'Group A',
      nodeKind: 'group',
      placementId: null,
      tagId: null,
      worldColor: '#111',
      worldId: 'world-1'
    }],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])) as {
    groups: Array<{ id: string, placementIds: string[] }>
  }
  expect(key.groups.map((group) => group.id)).toEqual(['group-a', 'group-b'])
  expect(key.groups[1]?.placementIds).toEqual(['placement-1', 'placement-2'])
})

/**
 * mapProjectHierarchyTreeToTopologyKey
 * Sorts flat tag ids at the world root via tag topology snapshot.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey sorts flat tag ids', () => {
  const key = JSON.parse(mapProjectHierarchyTreeToTopologyKey([{
    children: [{
      children: [],
      childrenLoaded: false,
      categoryCount: 0,
      documentCount: 0,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-tag',
      id: 'tag-b',
      label: 'Places',
      nodeKind: 'tag',
      placementId: null,
      tagId: 'tag-b',
      worldColor: '#111',
      worldId: 'world-1'
    }, {
      children: [],
      childrenLoaded: false,
      categoryCount: 0,
      documentCount: 0,
      documentId: null,
      groupId: null,
      hasChildren: true,
      icon: 'mdi-tag',
      id: 'tag-a',
      label: 'Heroes',
      nodeKind: 'tag',
      placementId: null,
      tagId: 'tag-a',
      worldColor: '#111',
      worldId: 'world-1'
    }],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])) as {
    tags: Array<{ id: string, wrapperId: string | null }>
  }
  expect(key.tags).toEqual([
    {
      id: 'tag-a',
      wrapperId: null
    },
    {
      id: 'tag-b',
      wrapperId: null
    }
  ])
})

/**
 * mapProjectHierarchyTreeToTopologyKey
 * Sorts root-level placement topology rows.
 */
test('Test that mapProjectHierarchyTreeToTopologyKey sorts root placement ids', () => {
  const key = JSON.parse(mapProjectHierarchyTreeToTopologyKey([{
    children: [{
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: '',
      id: 'placement-b',
      label: 'Places',
      nodeKind: 'templatePlacement',
      placementId: 'placement-b',
      worldColor: '#111',
      worldId: 'world-1'
    }, {
      children: [],
      childrenLoaded: true,
      documentId: null,
      groupId: null,
      hasChildren: false,
      icon: '',
      id: 'placement-a',
      label: 'Characters',
      nodeKind: 'templatePlacement',
      placementId: 'placement-a',
      worldColor: '#111',
      worldId: 'world-1'
    }],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])) as {
    placements: Array<{ groupId: string | null, id: string }>
  }
  expect(key.placements).toEqual([
    {
      groupId: null,
      id: 'placement-a'
    },
    {
      groupId: null,
      id: 'placement-b'
    }
  ])
})

/**
 * bindProjectHierarchyTreeTagSettingsResyncWatch
 * Uses FA_USER_SETTINGS_DEFAULTS when settings and preview are both null.
 */
test('Test that bindProjectHierarchyTreeTagSettingsResyncWatch uses defaults when settings and preview are null', async () => {
  const forceResyncTreeDataFromLayout = vi.fn()
  const settings = ref<{
    compactTags: boolean
    noTags: boolean
    tagsAtTop: boolean
  } | null>(null)
  const preview = ref<{
    compactTags?: boolean
    noTags?: boolean
    tagsAtTop?: boolean
  } | null>(null)
  bindProjectHierarchyTreeTagSettingsResyncWatch({
    S_FaUserSettings: (() => ({
      appSettingsDialogPreview: preview.value,
      settings: settings.value
    })) as never,
    forceResyncTreeDataFromLayout,
    watch
  })
  forceResyncTreeDataFromLayout.mockClear()
  preview.value = {
    compactTags: !FA_USER_SETTINGS_DEFAULTS.compactTags
  }
  await nextTick()
  expect(forceResyncTreeDataFromLayout).toHaveBeenCalled()
})

function buildOpenedDocumentTabForTagDelete (): I_faOpenedDocumentTab {
  return {
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '',
    documentId: 'doc-1',
    documentTextColorDraft: '',
    editState: false,
    extraClassesDraft: '',
    hasUnsavedChanges: false,
    isCategoryDraft: false,
    isDeadDraft: false,
    isFinishedDraft: false,
    isMinorDraft: false,
    parentDocumentIdDraft: '',
    persistenceState: 'persisted',
    savedDisplayName: 'Hero',
    savedDocumentBackgroundColor: '',
    savedDocumentTextColor: '',
    savedExtraClasses: '',
    savedIsCategory: false,
    savedIsDead: false,
    savedIsFinished: false,
    savedIsMinor: false,
    savedParentDocumentId: '',
    savedTags: [{
      id: 'tag-1',
      name: 'Heroes'
    }],
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
    tabLabel: 'Character',
    tagsDraft: [{
      id: 'tag-1',
      name: 'Heroes'
    }],
    templateIcon: 'mdi-account',
    templateId: 'template-1',
    treeOrderNumberDraft: '',
    worldId: 'world-1'
  }
}

function findTagNodeInTree (treeNodes: readonly I_faProjectHierarchyTreeHeTreeNode[]): I_faProjectHierarchyTreeHeTreeNode | null {
  for (const worldNode of treeNodes) {
    for (const child of worldNode.children) {
      if (child.nodeKind === 'tag') {
        return child
      }
      if (child.nodeKind === 'tagWrapper') {
        const tagNode = child.children.find((row) => row.nodeKind === 'tag') ?? null
        if (tagNode !== null) {
          return tagNode
        }
      }
    }
  }
  return null
}

/**
 * bindProjectHierarchyTreeTagSessionWiring
 * Invokes session-bound callbacks for tabs, temp docs, language, and collapse settings.
 */
test('Test that bindProjectHierarchyTreeTagSessionWiring invokes session-bound inner callbacks', async () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-doc')
  const replaceOpenedDocumentTabs = vi.fn()
  const settings = ref<{
    compactTags: boolean
    forceSublevelCollapseInTree: boolean
    languageCode: string
    noTags: boolean
    tagsAtTop: boolean
  } | null>(null)
  const preview = ref<{
    compactTags?: boolean
    forceSublevelCollapseInTree?: boolean
    noTags?: boolean
    tagsAtTop?: boolean
  } | null>(null)
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([])
  const worlds = ref([sampleWorldWithTags])
  const mountedHooks: Array<() => void> = []
  const previousRequestAnimationFrame = window.requestAnimationFrame
  window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    const frameTimeMs = 0
    callback(frameTimeMs)
    return 0
  }) as typeof window.requestAnimationFrame
  window.faContentBridgeAPIs = {
    projectContent: {
      deleteTag: vi.fn(async () => undefined)
    }
  } as never

  const sessionApi = bindProjectHierarchyTreeTagSessionWiring({
    S_FaActiveProject: (() => ({
      activeProject: { id: 'project-1' },
      hasActiveProject: true
    })) as never,
    S_FaOpenedDocuments: (() => ({
      createTemporaryDocument,
      replaceOpenedDocumentTabs,
      tabs: [buildOpenedDocumentTabForTagDelete()]
    })) as never,
    S_FaUserSettings: (() => ({
      appSettingsDialogPreview: preview.value,
      settings: settings.value
    })) as never,
    computed,
    dragContext: { dragNode: null } as never,
    hierarchyStore: {
      clearPendingDocumentRefreshIds: vi.fn(),
      clearPendingHierarchyNodeRefreshIds: vi.fn(),
      clearPendingRevealPath: vi.fn(),
      flushUiStatePersist: vi.fn(),
      queuePersistExpandedNodeIds: vi.fn(),
      queuePersistScrollTopPx: vi.fn(),
      refreshLayout: vi.fn(async () => undefined),
      refreshUiState: vi.fn(async () => undefined),
      resetOnProjectClose: vi.fn(),
      uiState: { scrollTopPx: 0 }
    } as never,
    i18nT: (key: string) => `tr:${key}`,
    layoutRefreshGeneration: ref(0),
    nextTick,
    onDocumentOpenRequest: vi.fn(),
    onMounted: (hook) => {
      mountedHooks.push(hook)
    },
    onUnmounted: vi.fn(),
    pendingDocumentRefreshIds: ref([]),
    pendingHierarchyNodeRefreshIds: ref([]),
    pendingRevealPath: ref([]),
    ref,
    runFaAction: vi.fn(async () => undefined) as never,
    treeData,
    uiState: ref({
      expandedNodeIds: [],
      schemaVersion: 1,
      scrollTopPx: 0
    }),
    watch,
    worlds
  })

  const defaultSkeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorldWithTags])
  expect(defaultSkeleton[0]?.children.some((child) => child.nodeKind === 'tag')).toBe(true)

  sessionApi.forceResyncTreeDataFromLayout()
  expect(treeData.value.length).toBeGreaterThan(0)

  const tagNode = findTagNodeInTree(treeData.value)
  expect(tagNode).not.toBeNull()
  sessionApi.onNodeRowContextMenu(tagNode!, {
    clientX: 0,
    clientY: 0,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  sessionApi.onAddNewDocumentToThisTagFromContextMenuClick('placement-1')
  await Promise.resolve()
  expect(createTemporaryDocument).toHaveBeenCalledWith(expect.objectContaining({
    templateId: 'template-1',
    worldId: 'world-1'
  }))

  settings.value = {
    compactTags: false,
    forceSublevelCollapseInTree: true,
    languageCode: 'de-DE',
    noTags: false,
    tagsAtTop: false
  }
  sessionApi.onAddNewDocumentToThisTagFromContextMenuClick('placement-1')
  await Promise.resolve()
  expect(createTemporaryDocument.mock.calls.length).toBeGreaterThanOrEqual(2)

  preview.value = {
    forceSublevelCollapseInTree: true
  }
  const worldNode = treeData.value[0]
  expect(worldNode).toBeDefined()
  sessionApi.onNodeClose({
    data: worldNode!
  })

  sessionApi.onNodeRowContextMenu(tagNode!, {
    clientX: 0,
    clientY: 0,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  sessionApi.onDeleteTagFromContextMenuClick()
  sessionApi.onConfirmDeleteTag()
  await nextTick()
  await Promise.resolve()
  expect(replaceOpenedDocumentTabs).toHaveBeenCalled()

  preview.value = {
    compactTags: true,
    noTags: true,
    tagsAtTop: true
  }
  const hiddenSkeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorldWithTags])
  expect(hiddenSkeleton[0]?.children.some((child) => {
    return child.nodeKind === 'tag' || child.nodeKind === 'tagWrapper'
  })).toBe(false)

  for (const hook of mountedHooks) {
    hook()
  }
  window.requestAnimationFrame = previousRequestAnimationFrame
})

/**
 * resolveProjectHierarchyTreeNodeContextMenuSectionFlags
 * tagWrapper bulk-expand eligible vs ineligible returns.
 */
test('Test that resolveProjectHierarchyTreeNodeContextMenuSectionFlags covers tagWrapper bulk expand', () => {
  const wrapperWithTags = mapProjectHierarchyTreeTagWrapperNode({
    lazyPlaceholderApi,
    tags: [
      {
        categoryCount: 0,
        documentCount: 1,
        id: 'tag-a',
        name: 'A'
      },
      {
        categoryCount: 0,
        documentCount: 0,
        id: 'tag-b',
        name: 'B'
      }
    ],
    tagsLabel: 'Tags',
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  const tree: I_faProjectHierarchyTreeHeTreeNode[] = [{
    children: [wrapperWithTags],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }]
  const eligible = resolveProjectHierarchyTreeNodeContextMenuSectionFlags(wrapperWithTags, tree)
  expect(eligible?.showsBulkExpandRows).toBe(true)
  expect(eligible?.showsTagMenuRows).toBe(false)

  const emptyWrapper = mapProjectHierarchyTreeTagWrapperNode({
    lazyPlaceholderApi,
    tags: [],
    tagsLabel: 'Tags',
    world: {
      color: '#111',
      id: 'world-1'
    }
  })
  expect(resolveProjectHierarchyTreeNodeContextMenuSectionFlags(emptyWrapper, [{
    ...tree[0]!,
    children: [emptyWrapper]
  }])).toBeNull()
})

/**
 * createProjectHierarchyTreeSessionHandlersWiring
 * Uses optional-deps fallbacks when tab/layout helpers are omitted.
 */
test('Test that createProjectHierarchyTreeSessionHandlersWiring uses optional dep fallbacks', async () => {
  const loadedTag = buildTagNode({
    children: [buildUnderTagDocument('doc-1')],
    childrenLoaded: true
  })
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    children: [loadedTag],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: true,
    icon: '',
    id: 'world-1',
    label: 'World',
    nodeKind: 'world',
    placementId: null,
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }])
  const handlers = createProjectHierarchyTreeSessionHandlersWiring({
    createTemporaryDocument: vi.fn(async () => 'temp'),
    documentRowDragHoldWiring: {
      clearHoldSession: vi.fn(),
      getIsDragHoldArmed: () => false,
      handleDocumentRowPointerDown: vi.fn(),
      handleTreeDragStartCapture: vi.fn(),
      markDragStartedFromHold: vi.fn()
    },
    documentRowExpandClickGesture: {
      beginDocumentRowGesture: vi.fn(),
      clearDocumentRowGesture: vi.fn(),
      markDragStartedForGesture: vi.fn(),
      shouldDocumentRowClickToggleExpand: () => false
    },
    dragContext: { dragNode: null },
    dragExpandPostCommitGuard: ref(false),
    dragExpandUiFrozen: ref(false),
    getDragExpandedSnapshotNodeIds: () => null,
    getPersistedScrollTopPx: () => 0,
    getTreeScrollHost: () => null,
    lazyLoadWiring: {
      flushDeferredTreeRevisionPublish: vi.fn(),
      loadChildrenForNode: vi.fn(async () => undefined)
    },
    nextTick: async () => undefined,
    onDocumentOpenRequest: vi.fn(),
    openIconExpandAnimationWiring: {
      scheduleOpenIconExpandAnimation: vi.fn()
    },
    openNodeIds: ref(new Set()),
    queuePersistExpandedNodeIds: vi.fn(),
    requestAnimationFrame: (callback) => {
      callback()
      return 0
    },
    resolvePreferredLanguageCode: () => 'en-US',
    runDeferredLazyLoadBatch: vi.fn(async (run) => {
      await run()
    }),
    runFaAction: vi.fn(),
    suppressTreeEmit: ref(false),
    treeComponentRef: ref(null),
    treeData,
    treeScrollHostRef: ref(null),
    uiStateWiring: {
      awaitHeTreeResyncIdle: async () => undefined,
      isProgrammaticHeTreeResyncActive: () => false,
      markNodeClosed: vi.fn(),
      markNodeOpen: vi.fn(),
      reapplyHeTreeOpenState: vi.fn(),
      reapplyLatentDescendantExpandState: vi.fn(async () => undefined),
      resyncHeTreeAfterExpandPublish: vi.fn(async () => undefined)
    }
  })
  handlers.onNodeRowContextMenu(loadedTag, {
    clientX: 1,
    clientY: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  handlers.onRenameTagFromContextMenuClick()
  handlers.onDismissRenameTagDialog()
  handlers.onDeleteTagFromContextMenuClick()
  handlers.onDismissDeleteTagDialog()
  handlers.eachDraggableHandler({ data: loadedTag })
  handlers.setTreeComponentRef(null)
  handlers.setTreeScrollHostRef(null)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          deleteTag: vi.fn(async () => undefined),
          renameTag: vi.fn(async () => ({
            merged: true,
            mergedFromTagId: 'tag-source',
            tag: {
              createdAtMs: 1,
              id: 'tag-1',
              name: 'Renamed',
              updatedAtMs: 2,
              worldId: 'world-1'
            }
          }))
        }
      }
    },
    writable: true
  })
  handlers.onNodeRowContextMenu(loadedTag, {
    clientX: 1,
    clientY: 1,
    preventDefault: vi.fn()
  } as unknown as MouseEvent)
  handlers.onRenameTagFromContextMenuClick()
  handlers.renameTagNameDraft.value = 'Renamed'
  handlers.onConfirmRenameTag()
  await Promise.resolve()
  await Promise.resolve()
  handlers.onDeleteTagFromContextMenuClick()
  handlers.onConfirmDeleteTag()
  await Promise.resolve()
  await Promise.resolve()
})

/**
 * isProjectHierarchyTreeNodeDroppable
 * Under-tag drag guard branches including null tagId and cross-bucket rejects.
 */
test('Test that isProjectHierarchyTreeNodeDroppable covers under-tag guard branches', () => {
  const dragContext = {
    dragNode: {
      data: {
        ...buildUnderTagDocument('doc-1'),
        tagId: null
      }
    }
  }
  expect(isProjectHierarchyTreeNodeDroppable(buildTagNode(), dragContext as never)).toBe(false)

  const sameTagDrag = {
    dragNode: {
      data: buildUnderTagDocument('doc-1', 'tag-1')
    }
  }
  expect(isProjectHierarchyTreeNodeDroppable(buildTagNode({ tagId: 'tag-1' }), sameTagDrag as never)).toBe(true)
  expect(isProjectHierarchyTreeNodeDroppable(
    buildUnderTagDocument('doc-2', 'tag-1'),
    sameTagDrag as never
  )).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(
    buildUnderTagDocument('doc-1', 'tag-1'),
    sameTagDrag as never
  )).toBe(false)

  const mainDocDrag = {
    dragNode: {
      data: {
        children: [],
        childrenLoaded: true,
        documentId: 'doc-main',
        groupId: null,
        hasChildren: false,
        icon: '',
        id: 'doc-main',
        label: 'Main',
        nodeKind: 'document' as const,
        placementId: 'placement-1',
        tagId: null,
        worldColor: '#111',
        worldId: 'world-1'
      }
    }
  }
  expect(isProjectHierarchyTreeNodeDroppable(
    buildUnderTagDocument('doc-tag'),
    mainDocDrag as never
  )).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable({
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: '',
    id: 'placement-2',
    label: 'Other',
    nodeKind: 'templatePlacement',
    placementId: 'placement-2',
    worldColor: '#111',
    worldId: 'world-1'
  }, mainDocDrag as never)).toBe(false)
  expect(isProjectHierarchyTreeNodeDroppable(buildTagNode(), mainDocDrag as never)).toBe(false)
})

/**
 * patchWorkspaceLayoutPlacementNodeInPlace
 * Recurses into loaded document subtrees when patching icons.
 */
test('Test that patchWorkspaceLayoutPlacementNodeInPlace recurses document subtree icons', async () => {
  const { patchWorkspaceLayoutPlacementNodeInPlace } = await import(
    '../../functions/mapWorkspaceLayoutPlacementNodePatch'
  )
  const childDoc: I_faProjectHierarchyTreeHeTreeNode = {
    children: [],
    childrenLoaded: true,
    documentId: 'child-doc',
    groupId: null,
    hasChildren: false,
    icon: 'old',
    id: 'child-doc',
    label: 'Child',
    nodeKind: 'document',
    placementId: 'placement-1',
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }
  const parentDoc: I_faProjectHierarchyTreeHeTreeNode = {
    children: [childDoc],
    childrenLoaded: true,
    documentId: 'parent-doc',
    groupId: null,
    hasChildren: true,
    icon: 'old',
    id: 'parent-doc',
    label: 'Parent',
    nodeKind: 'document',
    placementId: 'placement-1',
    tagId: null,
    worldColor: '#111',
    worldId: 'world-1'
  }
  const placementNode: I_faProjectHierarchyTreeHeTreeNode = {
    children: [parentDoc],
    childrenLoaded: true,
    documentId: null,
    documentTemplateId: 'tpl-1',
    groupId: null,
    hasChildren: true,
    icon: 'old',
    id: 'placement-1',
    label: 'Characters',
    nodeKind: 'templatePlacement',
    placementId: 'placement-1',
    worldColor: '#111',
    worldId: 'world-1'
  }
  patchWorkspaceLayoutPlacementNodeInPlace({
    lazyPlaceholderApi,
    placement: {
      categoryCount: 0,
      displayName: 'Characters',
      documentCount: 1,
      documentTemplateId: 'tpl-1',
      groupId: null,
      groupSortOrder: null,
      hasChildren: true,
      icon: 'mdi-account',
      id: 'placement-1',
      nickname: 'Heroes',
      rootSortOrder: 0,
      titlePluralTranslations: {},
      titleSingularTranslations: {},
      worldId: 'world-1'
    },
    placementNode,
    resolvePlacementDisplayIcon: (icon) => `resolved:${icon}`
  })
  expect(placementNode.label).toBe('Heroes')
  expect(parentDoc.icon).toBe('resolved:mdi-account')
  expect(childDoc.icon).toBe('resolved:mdi-account')
})

/**
 * createProjectHierarchyTreeSyncWiring
 * forceResync clears tree when worlds list is empty.
 */
test('Test that createProjectHierarchyTreeSyncWiring forceResync clears empty worlds', () => {
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([buildTagNode()])
  const sync = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => [],
    nextTick: async () => undefined,
    suppressTreeEmit: ref(false),
    treeData
  })
  sync.forceResyncTreeDataFromLayout()
  expect(treeData.value).toEqual([])
})
