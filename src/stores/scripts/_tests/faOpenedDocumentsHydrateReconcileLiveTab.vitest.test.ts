import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  applyOpenedDocumentHydrateReconcileOntoLiveTab,
  mergeOpenedDocumentHydrateReconcileOntoLiveTabs
} from '../faOpenedDocumentsHydrateReconcileLiveTab'

function buildTab (documentId: string, displayName: string): I_faOpenedDocumentTab {
  return {
    displayNameDraft: displayName,
    documentBackgroundColorDraft: '',
    documentId,
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
    savedDisplayName: displayName,
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
    tabLabel: displayName,
    tagsDraft: [],
    templateIcon: 'mdi-account',
    treeOrderNumberDraft: ''
  }
}

/**
 * applyOpenedDocumentHydrateReconcileOntoLiveTab
 * A draft typed during the row read stays. Unchanged drafts take the database value.
 */
test('Test that applyOpenedDocumentHydrateReconcileOntoLiveTab keeps a name typed during the read', () => {
  const startTab = buildTab('doc-1', 'Hero')
  const liveTab = {
    ...startTab,
    displayNameDraft: 'Hero revised',
    hasUnsavedChanges: true
  }
  const reconciledTab = {
    ...startTab,
    displayNameDraft: 'Hero from database',
    savedDisplayName: 'Hero from database'
  }
  const merged = applyOpenedDocumentHydrateReconcileOntoLiveTab(
    startTab,
    liveTab,
    reconciledTab
  )
  expect(merged.displayNameDraft).toBe('Hero revised')
  expect(merged.savedDisplayName).toBe('Hero from database')
  expect(merged.hasUnsavedChanges).toBe(true)
})

test('Test that applyOpenedDocumentHydrateReconcileOntoLiveTab keeps tag edits made during the read', () => {
  const startTab = buildTab('doc-1', 'Hero')
  const unloadedLive = {
    ...startTab,
    tagsDraft: undefined
  }
  const reconciledTab = {
    ...startTab,
    tagsDraft: [{
      id: 'tag-db',
      isNew: false,
      name: 'Database'
    }]
  }
  const keptUnloaded = applyOpenedDocumentHydrateReconcileOntoLiveTab(
    startTab,
    unloadedLive,
    reconciledTab
  )
  expect(keptUnloaded.tagsDraft).toBeUndefined()

  const sameNameLive = {
    ...startTab,
    tagsDraft: [{
      id: 'tag-1',
      isNew: false,
      name: 'Quest'
    }]
  }
  const sameNameStart = {
    ...startTab,
    tagsDraft: [{
      id: 'tag-1',
      isNew: false,
      name: 'Quest'
    }]
  }
  const keptDatabase = applyOpenedDocumentHydrateReconcileOntoLiveTab(
    sameNameStart,
    sameNameLive,
    reconciledTab
  )
  expect(keptDatabase.tagsDraft).toEqual(reconciledTab.tagsDraft)

  const renamedLive = {
    ...startTab,
    tagsDraft: [{
      id: 'tag-1',
      isNew: false,
      name: 'Quest renamed'
    }]
  }
  const keptRename = applyOpenedDocumentHydrateReconcileOntoLiveTab(
    sameNameStart,
    renamedLive,
    reconciledTab
  )
  expect(keptRename.tagsDraft).toEqual(renamedLive.tagsDraft)
})

/**
 * mergeOpenedDocumentHydrateReconcileOntoLiveTabs
 * Tabs opened during reconcile stay. Tabs closed during reconcile stay closed.
 */
test('Test that mergeOpenedDocumentHydrateReconcileOntoLiveTabs follows the live tab list', () => {
  const startTab = buildTab('doc-1', 'Hero')
  const openedDuringRead = buildTab('doc-2', 'Villain')
  const reconciledTab = {
    ...startTab,
    savedDisplayName: 'Hero from database'
  }
  const merged = mergeOpenedDocumentHydrateReconcileOntoLiveTabs({
    droppedDocumentIds: new Set<string>(),
    liveTabs: [openedDuringRead],
    reconciledByDocumentId: new Map([['doc-1', reconciledTab]]),
    startTabs: [startTab]
  })
  expect(merged.map((tab) => tab.documentId)).toEqual(['doc-2'])
})
