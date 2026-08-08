/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'
import { computed, nextTick, ref, watch } from 'vue'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type {
  I_faProjectHierarchyTreeHeTreeNode,
  I_faProjectHierarchyTreeUiState
} from 'app/types/I_faProjectHierarchyTreeDomain'

vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('quasar')>()
  return {
    ...actual,
    Notify: {
      create: vi.fn()
    }
  }
})

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        t: (key: string) => key
      }
    }
  }
})

import { Notify } from 'quasar'

import { createProjectHierarchyTreeTagAddDocumentClickHandler } from '../projectHierarchyTreeTagAddDocumentWiring'
import { createProjectHierarchyTreeTagDeleteDialogWiring } from '../projectHierarchyTreeTagDeleteDialogWiring'
import { persistProjectHierarchyTreeTagDelete } from '../projectHierarchyTreeTagDeletePersistWiring'
import { createProjectHierarchyTreeTagDialogsWiring } from '../projectHierarchyTreeTagDialogsWiring'
import { createProjectHierarchyTreeTagRenameDialogWiring } from '../projectHierarchyTreeTagRenameDialogWiring'
import { persistProjectHierarchyTreeTagRename } from '../projectHierarchyTreeTagRenamePersistWiring'
import { bindProjectHierarchyTreeTagSessionWiring } from '../projectHierarchyTreeTagSessionBindWiring'
import { bindProjectHierarchyTreeTagSettingsResyncWatch, createProjectHierarchyTreeTagSettingsForceResyncWithExpandRestore } from '../projectHierarchyTreeTagSettingsResyncWiring'
import {
  bindProjectHierarchyTreeTagSkeletonResolvers,
  createProjectHierarchyTreeSyncWiring,
  mapWorkspaceLayoutToHierarchyTreeSkeleton
} from '../projectHierarchyTreeSyncMapperWiring'

function buildTab (): I_faOpenedDocumentTab {
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
    templateId: 'tpl-1',
    treeOrderNumberDraft: '',
    worldId: 'world-1'
  }
}

function buildTagNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
    children: [],
    childrenLoaded: true,
    documentId: null,
    groupId: null,
    hasChildren: false,
    icon: 'mdi-tag',
    id: 'tag-1',
    label: 'Heroes',
    nodeKind: 'tag',
    placementId: null,
    tagId: 'tag-1',
    worldColor: '#000',
    worldId: 'world-1'
  }
}

function buildPlacementNode (): I_faProjectHierarchyTreeHeTreeNode {
  return {
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
    titlePluralTranslations: { 'en-US': 'Characters' },
    titleSingularTranslations: { 'en-US': 'Character' },
    worldColor: '#000',
    worldId: 'world-1'
  }
}

function buildWorldTree (): I_faProjectHierarchyTreeHeTreeNode[] {
  return [{
    children: [buildTagNode(), buildPlacementNode()],
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
  }]
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
    isCategory: false,
    nickname: '',
    rootSortOrder: 0,
    titlePluralTranslations: {},
    titleSingularTranslations: {},
    worldId: 'world-1'
  }],
  sortOrder: 0,
  tags: [{
    categoryCount: 0,
    documentCount: 1,
    id: 'tag-1',
    name: 'Heroes'
  }]
}

/**
 * bindProjectHierarchyTreeTagSkeletonResolvers
 * Live resolvers feed mapWorkspaceLayoutToHierarchyTreeSkeleton tag chrome.
 */
test('Test that bindProjectHierarchyTreeTagSkeletonResolvers updates tag settings resolvers', () => {
  bindProjectHierarchyTreeTagSkeletonResolvers({
    resolveTagSettings: () => ({
      compactTags: true,
      noTags: false,
      tagsAtTop: true
    }),
    resolveTagsLabel: () => 'Live Tags'
  })
  const skeleton = mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorldWithTags])
  expect(skeleton.length).toBe(1)
  const sync = createProjectHierarchyTreeSyncWiring({
    getPreferredLanguageCode: () => 'en-US',
    getWorlds: () => [sampleWorldWithTags],
    nextTick: async () => undefined,
    suppressTreeEmit: ref(false),
    treeData: ref([])
  })
  sync.forceResyncTreeDataFromLayout()
  expect(sync.resyncTreeDataFromLayout().structureMatched).toBe(true)
  bindProjectHierarchyTreeTagSkeletonResolvers({
    resolveTagSettings: () => ({
      compactTags: false,
      noTags: true,
      tagsAtTop: false
    }),
    resolveTagsLabel: () => 'Hidden'
  })
  sync.forceResyncTreeDataFromLayout()
})

/**
 * createProjectHierarchyTreeTagAddDocumentClickHandler
 * Creates a temporary document prefilled with the context-menu tag.
 */
test('Test that createProjectHierarchyTreeTagAddDocumentClickHandler creates tagged draft docs', async () => {
  const createTemporaryDocument = vi.fn(async () => 'temp-1')
  const tagNode = buildTagNode()
  const treeData = buildWorldTree()
  const onClick = createProjectHierarchyTreeTagAddDocumentClickHandler({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US',
    resolveTagContextMenuAnchor: () => tagNode,
    treeData
  })
  onClick('missing')
  expect(createTemporaryDocument).not.toHaveBeenCalled()
  onClick('placement-1')
  await Promise.resolve()
  expect(createTemporaryDocument).toHaveBeenCalledWith(expect.objectContaining({
    initialTagsDraft: [{
      id: 'tag-1',
      name: 'Heroes'
    }],
    templateId: 'tpl-1',
    worldId: 'world-1'
  }))
  const noAnchor = createProjectHierarchyTreeTagAddDocumentClickHandler({
    createTemporaryDocument,
    resolvePreferredLanguageCode: () => 'en-US',
    resolveTagContextMenuAnchor: () => null,
    treeData: { value: treeData }
  })
  noAnchor('placement-1')
  expect(createTemporaryDocument).toHaveBeenCalledTimes(1)
})

/**
 * persistProjectHierarchyTreeTagRename
 * Renames via bridge, rewrites open tabs, then refreshes layout.
 */
test('Test that persistProjectHierarchyTreeTagRename persists rename and refreshes', async () => {
  const applyOpenedDocumentTabs = vi.fn()
  const onDismiss = vi.fn()
  const refreshLayout = vi.fn(async () => undefined)
  const resyncTreeDataFromLayout = vi.fn()
  const renameTag = vi.fn(async () => ({
    merged: false,
    mergedFromTagId: null,
    tag: {
      createdAtMs: 1,
      id: 'tag-1',
      name: 'Villains',
      updatedAtMs: 2,
      worldId: 'world-1'
    }
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          renameTag
        }
      }
    },
    writable: true
  })
  await persistProjectHierarchyTreeTagRename({
    applyOpenedDocumentTabs,
    getOpenedDocumentTabs: () => [buildTab()],
    getTreeData: () => [],
    newName: 'Villains',
    onDismiss,
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout,
    resyncTreeDataFromLayout,
    tagId: 'tag-1'
  })
  expect(renameTag).toHaveBeenCalled()
  expect(applyOpenedDocumentTabs).toHaveBeenCalled()
  expect(onDismiss).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
})

/**
 * persistProjectHierarchyTreeTagRename
 * After merge, refreshes surviving loaded tag children.
 */
test('Test that persistProjectHierarchyTreeTagRename refreshes surviving tag after merge', async () => {
  const refreshHierarchyTreeNodes = vi.fn()
  const survivingTagNode = {
    children: [{
      children: [],
      childrenLoaded: true,
      id: 'doc-old',
      label: 'Old',
      nodeKind: 'document' as const
    }],
    childrenLoaded: true,
    id: 'tag-surviving',
    label: 'aaa',
    nodeKind: 'tag' as const,
    tagId: 'tag-surviving',
    worldId: 'world-1'
  }
  const renameTag = vi.fn(async () => ({
    merged: true,
    mergedFromTagId: 'tag-source',
    tag: {
      createdAtMs: 1,
      id: 'tag-surviving',
      name: 'aaa',
      updatedAtMs: 2,
      worldId: 'world-1'
    }
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          renameTag
        }
      }
    },
    writable: true
  })
  await persistProjectHierarchyTreeTagRename({
    applyOpenedDocumentTabs: vi.fn(),
    getOpenedDocumentTabs: () => [],
    getTreeData: () => [survivingTagNode as never],
    newName: 'aaa',
    onDismiss: vi.fn(),
    refreshHierarchyTreeNodes,
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    tagId: 'tag-source'
  })
  expect(refreshHierarchyTreeNodes).toHaveBeenCalledWith(['tag-surviving'])
})

/**
 * persistProjectHierarchyTreeTagRename
 * No-ops without renameTag and logs on rejection.
 */
test('Test that persistProjectHierarchyTreeTagRename handles missing API and errors', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {}
      }
    },
    writable: true
  })
  await persistProjectHierarchyTreeTagRename({
    applyOpenedDocumentTabs: vi.fn(),
    getOpenedDocumentTabs: () => [],
    getTreeData: () => [],
    newName: 'X',
    onDismiss: vi.fn(),
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    tagId: 'tag-1'
  })
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          renameTag: vi.fn(async () => {
            throw new Error('rename failed')
          })
        }
      }
    },
    writable: true
  })
  await persistProjectHierarchyTreeTagRename({
    applyOpenedDocumentTabs: vi.fn(),
    getOpenedDocumentTabs: () => [],
    getTreeData: () => [],
    newName: 'X',
    onDismiss: vi.fn(),
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    tagId: 'tag-1'
  })
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()
})

/**
 * persistProjectHierarchyTreeTagRename
 * Component-testing overrides with tagsByWorldId enable rename without bridge API.
 */
test('Test that persistProjectHierarchyTreeTagRename uses component-testing tag overrides', async () => {
  const { setFaComponentTestingProjectContentOverrides } = await import(
    'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
  )
  const renameTag = vi.fn(async () => ({
    merged: false,
    mergedFromTagId: null,
    tag: {
      createdAtMs: 1,
      id: 'tag-1',
      name: 'Villains',
      updatedAtMs: 2,
      worldId: 'world-1'
    }
  }))
  setFaComponentTestingProjectContentOverrides({
    tagsByWorldId: {
      'world-1': [{
        createdAtMs: 1,
        id: 'tag-1',
        name: 'Heroes',
        updatedAtMs: 1,
        worldId: 'world-1'
      }]
    }
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          renameTag
        }
      }
    },
    writable: true
  })
  const onDismiss = vi.fn()
  await persistProjectHierarchyTreeTagRename({
    applyOpenedDocumentTabs: vi.fn(),
    getOpenedDocumentTabs: () => [],
    getTreeData: () => [],
    newName: 'Villains',
    onDismiss,
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    resyncTreeDataFromLayout: vi.fn(),
    tagId: 'tag-1'
  })
  expect(onDismiss).toHaveBeenCalled()
  setFaComponentTestingProjectContentOverrides(null)
})

/**
 * persistProjectHierarchyTreeTagDelete
 * Component-testing overrides with tagsByWorldId enable delete without bridge API.
 */
test('Test that persistProjectHierarchyTreeTagDelete uses component-testing tag overrides', async () => {
  const { setFaComponentTestingProjectContentOverrides } = await import(
    'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
  )
  setFaComponentTestingProjectContentOverrides({
    tagsByWorldId: {
      'world-1': [{
        createdAtMs: 1,
        id: 'tag-1',
        name: 'Heroes',
        updatedAtMs: 1,
        worldId: 'world-1'
      }]
    }
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {}
      }
    },
    writable: true
  })
  const onDismiss = vi.fn()
  const refreshLayout = vi.fn(async () => undefined)
  await persistProjectHierarchyTreeTagDelete({
    applyOpenedDocumentTabs: vi.fn(),
    getOpenedDocumentTabs: () => [],
    onDismiss,
    refreshLayout,
    resyncTreeDataFromLayout: vi.fn(),
    tagId: 'tag-1'
  })
  expect(onDismiss).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
  expect(Notify.create).toHaveBeenCalled()
  setFaComponentTestingProjectContentOverrides(null)
})

/**
 * createProjectHierarchyTreeTagRenameDialogWiring
 * Opens, validates, warns on merge conflict, and confirms rename.
 */
test('Test that createProjectHierarchyTreeTagRenameDialogWiring drives rename dialog state', async () => {
  const applyOpenedDocumentTabs = vi.fn()
  const refreshLayout = vi.fn(async () => undefined)
  const resyncTreeDataFromLayout = vi.fn()
  const tagNode = buildTagNode()
  const treeData = ref<I_faProjectHierarchyTreeHeTreeNode[]>([{
    children: [
      tagNode,
      {
        ...tagNode,
        id: 'tag-2',
        label: 'Places',
        tagId: 'tag-2'
      },
      buildPlacementNode()
    ],
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
  }])
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          renameTag: vi.fn(async () => ({
            merged: true,
            mergedFromTagId: 'tag-1',
            tag: {
              createdAtMs: 1,
              id: 'tag-2',
              name: 'Places',
              updatedAtMs: 2,
              worldId: 'world-1'
            }
          }))
        }
      }
    },
    writable: true
  })
  const wiring = createProjectHierarchyTreeTagRenameDialogWiring({
    applyOpenedDocumentTabs,
    getOpenedDocumentTabs: () => [buildTab()],
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout,
    resolveTagContextMenuAnchor: () => tagNode,
    resyncTreeDataFromLayout,
    treeData
  })
  wiring.onRenameTagFromContextMenuClick()
  expect(wiring.renameTagDialogOpen.value).toBe(true)
  expect(wiring.renameTagNameDraft.value).toBe('')
  expect(wiring.renameTagCanConfirm.value).toBe(false)
  expect(wiring.renameTagCurrentName.value).toBe('Heroes')
  wiring.renameTagNameDraft.value = 'Places'
  expect(wiring.renameTagCanConfirm.value).toBe(true)
  expect(wiring.renameTagMergeWarning.value).toBe(true)
  wiring.onConfirmRenameTag()
  await Promise.resolve()
  await Promise.resolve()
  expect(applyOpenedDocumentTabs).toHaveBeenCalled()
  wiring.onDismissRenameTagDialog()
  expect(wiring.renameTagDialogOpen.value).toBe(false)
  const noAnchor = createProjectHierarchyTreeTagRenameDialogWiring({
    applyOpenedDocumentTabs,
    getOpenedDocumentTabs: () => [],
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout,
    resolveTagContextMenuAnchor: () => null,
    resyncTreeDataFromLayout,
    treeData
  })
  noAnchor.onRenameTagFromContextMenuClick()
  noAnchor.onConfirmRenameTag()
})

/**
 * createProjectHierarchyTreeTagDeleteDialogWiring
 * Opens confirm dialog and deletes via bridge.
 */
test('Test that createProjectHierarchyTreeTagDeleteDialogWiring deletes tags', async () => {
  const applyOpenedDocumentTabs = vi.fn()
  const refreshLayout = vi.fn(async () => undefined)
  const resyncTreeDataFromLayout = vi.fn()
  const deleteTag = vi.fn(async () => undefined)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          deleteTag
        }
      }
    },
    writable: true
  })
  const wiring = createProjectHierarchyTreeTagDeleteDialogWiring({
    applyOpenedDocumentTabs,
    getOpenedDocumentTabs: () => [buildTab()],
    refreshLayout,
    resolveTagContextMenuAnchor: () => buildTagNode(),
    resyncTreeDataFromLayout
  })
  wiring.onDeleteTagFromContextMenuClick()
  expect(wiring.deleteTagConfirmOpen.value).toBe(true)
  expect(wiring.deleteTagName.value).toBe('Heroes')
  wiring.onConfirmDeleteTag()
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  expect(deleteTag).toHaveBeenCalledWith({ tagId: 'tag-1' })
  expect(applyOpenedDocumentTabs).toHaveBeenCalled()
  expect(refreshLayout).toHaveBeenCalled()
  expect(resyncTreeDataFromLayout).toHaveBeenCalled()
  expect(Notify.create).toHaveBeenCalledWith({
    group: false,
    message: 'projectUI.projectHierarchyTree.deleteTagSuccess',
    type: 'positive'
  })
  wiring.onDismissDeleteTagDialog()
  expect(wiring.deleteTagConfirmOpen.value).toBe(false)

  const missingApi = createProjectHierarchyTreeTagDeleteDialogWiring({
    applyOpenedDocumentTabs,
    getOpenedDocumentTabs: () => [],
    refreshLayout,
    resolveTagContextMenuAnchor: () => null,
    resyncTreeDataFromLayout
  })
  missingApi.onDeleteTagFromContextMenuClick()
  missingApi.onConfirmDeleteTag()

  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          deleteTag: vi.fn(async () => {
            throw new Error('delete failed')
          })
        }
      }
    },
    writable: true
  })
  const failing = createProjectHierarchyTreeTagDeleteDialogWiring({
    applyOpenedDocumentTabs,
    getOpenedDocumentTabs: () => [],
    refreshLayout,
    resolveTagContextMenuAnchor: () => buildTagNode(),
    resyncTreeDataFromLayout
  })
  failing.onDeleteTagFromContextMenuClick()
  failing.onConfirmDeleteTag()
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
  expect(errorSpy).toHaveBeenCalled()
  errorSpy.mockRestore()

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {}
      }
    },
    writable: true
  })
  const noDeleteApi = createProjectHierarchyTreeTagDeleteDialogWiring({
    applyOpenedDocumentTabs,
    getOpenedDocumentTabs: () => [],
    refreshLayout,
    resolveTagContextMenuAnchor: () => buildTagNode(),
    resyncTreeDataFromLayout
  })
  noDeleteApi.onDeleteTagFromContextMenuClick()
  noDeleteApi.onConfirmDeleteTag()
  await Promise.resolve()
})

/**
 * createProjectHierarchyTreeTagDialogsWiring
 * Composes rename/delete/add-to-tag handlers and placement options.
 */
test('Test that createProjectHierarchyTreeTagDialogsWiring exposes composed tag dialog API', async () => {
  const createTemporaryDocument = vi.fn(async () => 'temp')
  const treeData = ref(buildWorldTree())
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          deleteTag: vi.fn(async () => undefined),
          renameTag: vi.fn(async () => ({
            merged: false,
            mergedFromTagId: null,
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
  const wiring = createProjectHierarchyTreeTagDialogsWiring({
    applyOpenedDocumentTabs: vi.fn(),
    createTemporaryDocument,
    getOpenedDocumentTabs: () => [],
    refreshHierarchyTreeNodes: vi.fn(),
    refreshLayout: vi.fn(async () => undefined),
    resolvePreferredLanguageCode: () => 'en-US',
    resyncTreeDataFromLayout: vi.fn(),
    treeData
  })
  expect(wiring.addDocumentPlacementOptions.value).toEqual([])
  wiring.setTagContextMenuAnchorNodeId('tag-1')
  expect(wiring.resolveTagContextMenuAnchor()?.tagId).toBe('tag-1')
  expect(wiring.addDocumentPlacementOptions.value).toEqual([
    expect.objectContaining({
      label: 'Character',
      nodeId: 'placement-1',
      templateId: 'tpl-1'
    })
  ])
  wiring.onAddNewDocumentToThisTagClick('placement-1')
  await Promise.resolve()
  expect(createTemporaryDocument).toHaveBeenCalled()
  wiring.onRenameTagFromContextMenuClick()
  expect(wiring.renameTagDialogOpen.value).toBe(true)
  wiring.onDismissRenameTagDialog()
  wiring.onDeleteTagFromContextMenuClick()
  expect(wiring.deleteTagConfirmOpen.value).toBe(true)
  wiring.onDismissDeleteTagDialog()
  wiring.setTagContextMenuAnchorNodeId('missing')
  expect(wiring.resolveTagContextMenuAnchor()).toBeNull()
  wiring.setTagContextMenuAnchorNodeId(null)
})

/**
 * bindProjectHierarchyTreeTagSettingsResyncWatch
 * Rebuilds tree when tag display settings change.
 */
test('Test that bindProjectHierarchyTreeTagSettingsResyncWatch watches tag settings', async () => {
  const forceResyncTreeDataFromLayout = vi.fn()
  const settings = ref({
    compactTags: false,
    noTags: false,
    tagsAtTop: false
  })
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
  settings.value = {
    compactTags: true,
    noTags: false,
    tagsAtTop: true
  }
  await nextTick()
  expect(forceResyncTreeDataFromLayout).toHaveBeenCalled()
  preview.value = {
    compactTags: false,
    noTags: true,
    tagsAtTop: false
  }
  await nextTick()
  expect(forceResyncTreeDataFromLayout.mock.calls.length).toBeGreaterThanOrEqual(1)
})

/**
 * createProjectHierarchyTreeTagSettingsForceResyncWithExpandRestore
 * Restores captured expand ids after force resync.
 */
test('Test that createProjectHierarchyTreeTagSettingsForceResyncWithExpandRestore restores expand', async () => {
  const forceResyncTreeDataFromLayout = vi.fn()
  const restoreExpandedSnapshot = vi.fn(async () => undefined)
  const uiState = ref<I_faProjectHierarchyTreeUiState>({
    expandedNodeIds: ['world-1', 'group-1'],
    schemaVersion: 1,
    scrollTopPx: 0
  })
  const run = createProjectHierarchyTreeTagSettingsForceResyncWithExpandRestore({
    forceResyncTreeDataFromLayout,
    restoreExpandedSnapshot,
    uiState
  })
  run()
  expect(forceResyncTreeDataFromLayout).toHaveBeenCalledTimes(1)
  await Promise.resolve()
  expect(restoreExpandedSnapshot).toHaveBeenCalledWith(
    ['world-1', 'group-1'],
    { skipAncestorPrune: true }
  )
})

/**
 * bindProjectHierarchyTreeTagSessionWiring
 * Binds tag skeleton resolvers and settings resync onto session wiring.
 */
test('Test that bindProjectHierarchyTreeTagSessionWiring returns session API', () => {
  const createTemporaryDocument = vi.fn(async () => 'temp')
  const replaceOpenedDocumentTabs = vi.fn()
  const hierarchyStore = {
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
  }
  const sessionApi = bindProjectHierarchyTreeTagSessionWiring({
    S_FaActiveProject: (() => ({
      activeProject: null,
      hasActiveProject: false
    })) as never,
    S_FaOpenedDocuments: (() => ({
      createTemporaryDocument,
      replaceOpenedDocumentTabs,
      tabs: []
    })) as never,
    S_FaUserSettings: (() => ({
      appSettingsDialogPreview: {
        compactTags: true,
        noTags: false,
        tagsAtTop: true
      },
      settings: {
        compactTags: false,
        forceSublevelCollapseInTree: false,
        languageCode: 'en-US',
        noTags: false,
        tagsAtTop: false
      }
    })) as never,
    computed,
    dragContext: {
      dragNode: null
    } as never,
    hierarchyStore: hierarchyStore as never,
    i18nT: (key: string) => key,
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
    worlds: ref([])
  })
  expect(sessionApi.forceResyncTreeDataFromLayout).toBeTypeOf('function')
  expect(sessionApi.onNodeClick).toBeTypeOf('function')
  mapWorkspaceLayoutToHierarchyTreeSkeleton([sampleWorldWithTags])
})

/**
 * projectHierarchyTree_manager
 * createUseProjectHierarchyTree receives i18nT wired from vue-i18n.
 */
test('Test that projectHierarchyTree_manager wires i18nT into useProjectHierarchyTree', async () => {
  vi.resetModules()
  const i18nKeys: string[] = []
  vi.doMock('app/i18n/externalFileLoader', () => {
    return {
      i18n: {
        global: {
          t: (key: string) => {
            i18nKeys.push(key)
            return key
          }
        }
      }
    }
  })
  vi.doMock('../createUseProjectHierarchyTree', () => {
    return {
      createUseProjectHierarchyTree: (deps: { i18nT: (key: string) => string }) => {
        deps.i18nT('projectUI.projectHierarchyTree.tagsWrapperLabel')
        return () => ({})
      }
    }
  })
  vi.doMock('../projectHierarchyTreeVirtualListBufferWiring', () => {
    return {}
  })
  vi.doMock('../projectHierarchyTreeDisplayChromeWiring', () => {
    return {
      applyProjectHierarchyTreeTreeNodeKindClass: vi.fn(),
      clearProjectHierarchyTreeTreeNodeKindClass: vi.fn(),
      resolveProjectHierarchyTreeDocumentAppearanceChrome: vi.fn(),
      resolveProjectHierarchyTreePlacementDisplayIcon: vi.fn()
    }
  })
  const mod = await import('../projectHierarchyTree_manager')
  expect(mod.useProjectHierarchyTree).toBeTypeOf('function')
  expect(i18nKeys).toContain('projectUI.projectHierarchyTree.tagsWrapperLabel')
})
