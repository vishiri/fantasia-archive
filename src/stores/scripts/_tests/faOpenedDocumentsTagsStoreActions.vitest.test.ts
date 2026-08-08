/** @vitest-environment jsdom */
import { expect, test, vi } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  applyFaOpenedDocumentTagsDraft,
  persistFaOpenedDocumentTagsAfterSave
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
 * Treats missing tagsDraft as an empty list when calling setDocumentTags.
 */
test('Test that persistFaOpenedDocumentTagsAfterSave treats missing tagsDraft as empty', async () => {
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
  expect(setDocumentTags).toHaveBeenCalledWith({
    documentId: 'doc-1',
    tags: []
  })
  expect(next.tagsDraft).toEqual([])
  expect(next.savedTags).toEqual([])
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
