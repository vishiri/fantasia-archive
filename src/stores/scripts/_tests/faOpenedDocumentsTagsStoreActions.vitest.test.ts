/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'
import type { I_faProjectHierarchyTreeHeTreeNode } from 'app/types/I_faProjectHierarchyTreeDomain'

import {
  applyFaOpenedDocumentTagsDraft,
  persistFaOpenedDocumentTagsAfterSave,
  reconcileOpenedDocumentTabTagsOnHydrate,
  resolveOpenedDocumentTagRefreshNodeIdsAfterSave
} from '../faOpenedDocumentsTagsStoreActions'

function buildTab (): I_faOpenedDocumentTab {
  return {
    displayNameDraft: 'Hero',
    documentBackgroundColorDraft: '',
    documentId: 'doc-1',
    documentTextColorDraft: '',
    editState: true,
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
    savedTags: [],
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
    tabLabel: 'Character',
    tagsDraft: [],
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    treeOrderNumberDraft: '',
    worldId: 'world-1'
  }
}

/**
 * applyFaOpenedDocumentTagsDraft
 * Replaces tagsDraft and recomputes hasUnsavedChanges.
 */
test('Test that applyFaOpenedDocumentTagsDraft marks dirty when draft differs from saved', () => {
  const next = applyFaOpenedDocumentTagsDraft(buildTab(), [{
    id: 'tag-1',
    name: 'Heroes',
    isNew: true
  }])
  expect(next.tagsDraft).toEqual([{
    id: 'tag-1',
    name: 'Heroes',
    isNew: true
  }])
  expect(next.hasUnsavedChanges).toBe(true)
})

/**
 * persistFaOpenedDocumentTagsAfterSave
 * Returns the tab unchanged when setDocumentTags is unavailable.
 */
test('Test that persistFaOpenedDocumentTagsAfterSave no-ops without bridge API', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {}
      }
    },
    writable: true
  })
  const tab = buildTab()
  await expect(persistFaOpenedDocumentTagsAfterSave(tab, 'doc-1')).resolves.toBe(tab)
})

/**
 * persistFaOpenedDocumentTagsAfterSave
 * Aligns draft and saved tags from setDocumentTags result.
 */
test('Test that persistFaOpenedDocumentTagsAfterSave aligns draft with saved tags', async () => {
  const setDocumentTags = vi.fn(async () => ({
    items: [{
      id: 'tag-1',
      name: 'Heroes'
    }]
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          setDocumentTags
        }
      }
    },
    writable: true
  })
  const tab = applyFaOpenedDocumentTagsDraft(buildTab(), [{
    id: 'draft',
    name: 'Heroes',
    isNew: true
  }])
  const next = await persistFaOpenedDocumentTagsAfterSave(tab, 'doc-1')
  expect(setDocumentTags).toHaveBeenCalledWith({
    documentId: 'doc-1',
    tags: [{
      id: 'draft',
      name: 'Heroes',
      isNew: true
    }]
  })
  expect(next.savedTags).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
  expect(next.tagsDraft).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
  expect(next.hasUnsavedChanges).toBe(false)
})

/**
 * persistFaOpenedDocumentTagsAfterSave
 * Skips setDocumentTags when tags were never loaded.
 */
test('Test that persistFaOpenedDocumentTagsAfterSave skips when tags were not loaded', async () => {
  const setDocumentTags = vi.fn(async () => ({
    items: []
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          setDocumentTags
        }
      }
    },
    writable: true
  })
  const tab = buildTab()
  delete (tab as { tagsDraft?: unknown }).tagsDraft
  const next = await persistFaOpenedDocumentTagsAfterSave(tab, 'doc-1')
  expect(setDocumentTags).not.toHaveBeenCalled()
  expect(next).toBe(tab)
})

/**
 * persistFaOpenedDocumentTagsAfterSave
 * Uses component-testing overrides when setDocumentTags bridge is absent.
 */
test('Test that persistFaOpenedDocumentTagsAfterSave uses overrides when present', async () => {
  const { setFaComponentTestingProjectContentOverrides } = await import(
    'app/src/scripts/componentTesting/faComponentTestingProjectContentOverridesWiring'
  )
  setFaComponentTestingProjectContentOverrides({
    documentTagsByDocumentId: {},
    documentsById: {
      'doc-1': {
        createdAtMs: 1,
        displayName: 'Hero',
        documentBackgroundColor: null,
        documentTextColor: null,
        extraClasses: '',
        id: 'doc-1',
        isCategory: false,
        isDead: false,
        isFinished: false,
        isMinor: false,
        parentDocumentId: null,
        placementId: null,
        sortOrder: 0,
        templateId: null,
        treeOrderNumber: Number.MIN_SAFE_INTEGER,
        updatedAtMs: 1,
        worldId: 'world-1'
      }
    },
    tagsByWorldId: {
      'world-1': []
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
  const tab = applyFaOpenedDocumentTagsDraft(buildTab(), [{
    id: 'tag-new',
    name: 'Places',
    isNew: true
  }])
  const next = await persistFaOpenedDocumentTagsAfterSave(tab, 'doc-1')
  expect(next.savedTags).toEqual([{
    id: 'tag-new',
    name: 'Places'
  }])
  expect(next.hasUnsavedChanges).toBe(false)
  setFaComponentTestingProjectContentOverrides(null)
})

test('Test that reconcileOpenedDocumentTabTagsOnHydrate reloads tags hidden by an empty snapshot', async () => {
  const listDocumentTags = vi.fn(async () => ({
    items: [{
      id: 'tag-1',
      name: 'Heroes'
    }]
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listDocumentTags
        }
      }
    },
    writable: true
  })
  const next = await reconcileOpenedDocumentTabTagsOnHydrate(buildTab())
  expect(listDocumentTags).toHaveBeenCalledWith({ documentId: 'doc-1' })
  expect(next.savedTags).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
  expect(next.tagsDraft).toEqual([{
    id: 'tag-1',
    name: 'Heroes'
  }])
})

test('Test that reconcileOpenedDocumentTabTagsOnHydrate reloads tags when the draft was never loaded', async () => {
  const listDocumentTags = vi.fn(async () => ({
    items: [{
      id: 'tag-db',
      name: 'Database'
    }]
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listDocumentTags
        }
      }
    },
    writable: true
  })
  const tab = buildTab()
  tab.savedTags = [{
    id: 'tag-1',
    name: 'Heroes'
  }]
  tab.tagsDraft = undefined
  const next = await reconcileOpenedDocumentTabTagsOnHydrate(tab)
  expect(listDocumentTags).toHaveBeenCalledWith({ documentId: 'doc-1' })
  expect(next.savedTags).toEqual([{
    id: 'tag-db',
    name: 'Database'
  }])
  expect(next.tagsDraft).toEqual([{
    id: 'tag-db',
    name: 'Database'
  }])
})

test('Test that reconcileOpenedDocumentTabTagsOnHydrate keeps an unsaved tag draft', async () => {
  const listDocumentTags = vi.fn(async () => ({
    items: [{
      id: 'tag-db',
      name: 'Database'
    }]
  }))
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listDocumentTags
        }
      }
    },
    writable: true
  })
  const tab = buildTab()
  tab.savedTags = [{
    id: 'tag-1',
    name: 'Heroes'
  }]
  tab.tagsDraft = [{
    id: 'tag-1',
    name: 'Heroes'
  }, {
    id: 'tag-2',
    name: 'Villains'
  }]
  const next = await reconcileOpenedDocumentTabTagsOnHydrate(tab)
  expect(listDocumentTags).not.toHaveBeenCalled()
  expect(next.tagsDraft).toEqual(tab.tagsDraft)
  expect(next.savedTags).toEqual(tab.savedTags)
})

test('Test that reconcileOpenedDocumentTabTagsOnHydrate keeps snapshot tags when list API is missing', async () => {
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {}
      }
    },
    writable: true
  })
  const tab = buildTab()
  tab.savedTags = [{
    id: 'tag-1',
    name: 'Heroes'
  }]
  tab.tagsDraft = [{
    id: 'tag-1',
    name: 'Heroes'
  }]
  const next = await reconcileOpenedDocumentTabTagsOnHydrate(tab)
  expect(next.savedTags).toEqual(tab.savedTags)
  expect(next.tagsDraft).toEqual(tab.tagsDraft)
})

test('Test that reconcileOpenedDocumentTabTagsOnHydrate keeps snapshot tags when the list fails', async () => {
  const listDocumentTags = vi.fn(async () => {
    throw new Error('list-fail')
  })
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      faContentBridgeAPIs: {
        projectContent: {
          listDocumentTags
        }
      }
    },
    writable: true
  })
  const tab = buildTab()
  const next = await reconcileOpenedDocumentTabTagsOnHydrate(tab)
  expect(next.savedTags).toEqual(tab.savedTags)
  expect(next.tagsDraft).toEqual(tab.tagsDraft)
})

test('Test that resolveOpenedDocumentTagRefreshNodeIdsAfterSave reloads a newly saved tag', () => {
  const loadedTag = {
    children: [],
    childrenLoaded: true,
    id: 'tag-node-saved',
    nodeKind: 'tag',
    tagId: 'tag-saved'
  } as unknown as I_faProjectHierarchyTreeHeTreeNode
  expect(resolveOpenedDocumentTagRefreshNodeIdsAfterSave(
    [loadedTag],
    [],
    ['tag-saved']
  )).toEqual(['tag-node-saved'])
  expect(resolveOpenedDocumentTagRefreshNodeIdsAfterSave(
    [loadedTag],
    ['tag-saved'],
    ['tag-saved']
  )).toBeNull()
})
