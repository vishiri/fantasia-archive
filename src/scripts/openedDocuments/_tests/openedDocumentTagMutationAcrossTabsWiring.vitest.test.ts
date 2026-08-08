/** @vitest-environment jsdom */
import { expect, test } from 'vitest'

import type { I_faOpenedDocumentTab } from 'app/types/I_faOpenedDocumentsDomain'

import {
  applyOpenedDocumentTagDeleteAcrossTabs,
  applyOpenedDocumentTagRenameAcrossTabs
} from '../openedDocumentTagMutationAcrossTabsWiring'

function buildTab (input: {
  tagsDraft: I_faOpenedDocumentTab['tagsDraft']
  savedTags: I_faOpenedDocumentTab['savedTags']
}): I_faOpenedDocumentTab {
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
    savedTags: input.savedTags,
    savedTreeOrderNumber: Number.MIN_SAFE_INTEGER,
    tabLabel: 'Character',
    tagsDraft: input.tagsDraft,
    templateIcon: 'mdi-account',
    templateId: 'tpl-1',
    treeOrderNumberDraft: '',
    worldId: 'world-1'
  }
}

test('applyOpenedDocumentTagRenameAcrossTabs renames matching tags', () => {
  const [next] = applyOpenedDocumentTagRenameAcrossTabs({
    merged: false,
    mergedFromTagId: null,
    survivingTagId: 'tag-1',
    survivingTagName: 'Villains',
    tabs: [
      buildTab({
        savedTags: [{
          id: 'tag-1',
          name: 'Heroes'
        }],
        tagsDraft: [{
          id: 'tag-1',
          name: 'Heroes'
        }]
      })
    ]
  })
  expect(next?.tagsDraft?.[0]?.name).toBe('Villains')
  expect(next?.savedTags?.[0]?.name).toBe('Villains')
  expect(next?.hasUnsavedChanges).toBe(false)
})

test('applyOpenedDocumentTagRenameAcrossTabs merges source into survivor', () => {
  const [next] = applyOpenedDocumentTagRenameAcrossTabs({
    merged: true,
    mergedFromTagId: 'tag-old',
    survivingTagId: 'tag-keep',
    survivingTagName: 'Heroes',
    tabs: [
      buildTab({
        savedTags: [
          {
            id: 'tag-old',
            name: 'heroes'
          },
          {
            id: 'tag-keep',
            name: 'Heroes'
          }
        ],
        tagsDraft: [
          {
            id: 'tag-old',
            name: 'heroes'
          },
          {
            id: 'tag-keep',
            name: 'Heroes'
          }
        ]
      })
    ]
  })
  expect(next?.tagsDraft).toEqual([{
    id: 'tag-keep',
    name: 'Heroes'
  }])
  expect(next?.savedTags).toEqual([{
    id: 'tag-keep',
    name: 'Heroes'
  }])
})

test('applyOpenedDocumentTagDeleteAcrossTabs removes deleted tag', () => {
  const [next] = applyOpenedDocumentTagDeleteAcrossTabs({
    deletedTagId: 'tag-1',
    tabs: [
      buildTab({
        savedTags: [
          {
            id: 'tag-1',
            name: 'Heroes'
          },
          {
            id: 'tag-2',
            name: 'Places'
          }
        ],
        tagsDraft: [
          {
            id: 'tag-1',
            name: 'Heroes'
          },
          {
            id: 'tag-2',
            name: 'Places'
          }
        ]
      })
    ]
  })
  expect(next?.tagsDraft).toEqual([{
    id: 'tag-2',
    name: 'Places'
  }])
  expect(next?.savedTags).toEqual([{
    id: 'tag-2',
    name: 'Places'
  }])
})

test('applyOpenedDocumentTagRenameAcrossTabs preserves isNew on unrelated draft tags', () => {
  const [next] = applyOpenedDocumentTagRenameAcrossTabs({
    merged: false,
    mergedFromTagId: null,
    survivingTagId: 'tag-1',
    survivingTagName: 'Villains',
    tabs: [
      buildTab({
        savedTags: [{
          id: 'tag-1',
          name: 'Heroes'
        }],
        tagsDraft: [
          {
            id: 'tag-1',
            name: 'Heroes'
          },
          {
            id: 'tag-new',
            name: 'Drafty',
            isNew: true
          }
        ]
      })
    ]
  })
  expect(next?.tagsDraft).toEqual([
    {
      id: 'tag-1',
      name: 'Villains'
    },
    {
      id: 'tag-new',
      name: 'Drafty',
      isNew: true
    }
  ])
})

test('applyOpenedDocumentTagRenameAcrossTabs tolerates missing tag lists', () => {
  const [next] = applyOpenedDocumentTagRenameAcrossTabs({
    merged: false,
    mergedFromTagId: null,
    survivingTagId: 'tag-1',
    survivingTagName: 'Villains',
    tabs: [
      buildTab({
        savedTags: undefined,
        tagsDraft: undefined
      })
    ]
  })
  expect(next?.tagsDraft).toEqual([])
  expect(next?.savedTags).toEqual([])
})

test('applyOpenedDocumentTagDeleteAcrossTabs tolerates missing tag lists', () => {
  const [next] = applyOpenedDocumentTagDeleteAcrossTabs({
    deletedTagId: 'tag-1',
    tabs: [
      buildTab({
        savedTags: undefined,
        tagsDraft: undefined
      })
    ]
  })
  expect(next?.tagsDraft).toEqual([])
  expect(next?.savedTags).toEqual([])
})
