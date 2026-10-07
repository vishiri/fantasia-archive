/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import { mergeOpenedDocumentSaveOntoLiveTab } from '../faOpenedDocumentsDraftTypedDuringSave'

function buildTab (
  tagsDraft: I_faOpenedDocumentTab['tagsDraft']
): I_faOpenedDocumentTab {
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
    tagsDraft,
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    treeOrderNumberDraft: '',
    worldId: 'world-1'
  }
}

/**
 * mergeOpenedDocumentSaveOntoLiveTab
 * Unloaded tags are not the same as an explicit empty draft.
 */
test('Test that mergeOpenedDocumentSaveOntoLiveTab keeps a tag clear made while tags were still unloaded', () => {
  const saved = buildTab(undefined)
  const live = buildTab([])
  const atStart = buildTab(undefined)
  const merged = mergeOpenedDocumentSaveOntoLiveTab(saved, live, atStart)
  expect(merged.tagsDraft).toEqual([])
})

/**
 * mergeOpenedDocumentSaveOntoLiveTab
 * A still-unloaded live draft stays unloaded when the save started unloaded.
 */
test('Test that mergeOpenedDocumentSaveOntoLiveTab keeps unloaded tags when the live draft is still unloaded', () => {
  const saved = buildTab(undefined)
  const live = buildTab(undefined)
  const atStart = buildTab(undefined)
  const merged = mergeOpenedDocumentSaveOntoLiveTab(saved, live, atStart)
  expect(merged.tagsDraft).toBeUndefined()
})

test('Test that mergeOpenedDocumentSaveOntoLiveTab keeps flag and parent drafts typed during save', () => {
  const saved = buildTab(undefined)
  const atStart = buildTab(undefined)
  const cases: Array<{
    field: 'documentTextColorDraft' | 'documentBackgroundColorDraft' | 'isCategoryDraft' | 'isFinishedDraft' | 'isMinorDraft' | 'isDeadDraft' | 'parentDocumentIdDraft' | 'treeOrderNumberDraft' | 'extraClassesDraft'
    value: boolean | string
  }> = [
    {
      field: 'documentTextColorDraft',
      value: '#112233'
    },
    {
      field: 'documentBackgroundColorDraft',
      value: '#AABBCC'
    },
    {
      field: 'isCategoryDraft',
      value: true
    },
    {
      field: 'isFinishedDraft',
      value: true
    },
    {
      field: 'isMinorDraft',
      value: true
    },
    {
      field: 'isDeadDraft',
      value: true
    },
    {
      field: 'parentDocumentIdDraft',
      value: 'parent-1'
    },
    {
      field: 'treeOrderNumberDraft',
      value: '4'
    },
    {
      field: 'extraClassesDraft',
      value: 'fa-extra'
    }
  ]
  for (const item of cases) {
    const live = {
      ...buildTab(undefined),
      [item.field]: item.value
    }
    const merged = mergeOpenedDocumentSaveOntoLiveTab(saved, live, atStart)
    expect(merged[item.field]).toBe(item.value)
  }
})
