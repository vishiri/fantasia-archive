import { expect, test } from 'vitest'

import type { I_faProjectTagDocumentChild } from 'app/types/I_faProjectTagDomain'

import { sortProjectHierarchyTreeTagDocumentChildren } from '../projectHierarchyTreeTagDocumentSort'

const EMPTY = Number.MIN_SAFE_INTEGER

function child (input: {
  displayName: string
  documentId: string
  sortOrder?: number
  treeOrderNumber?: number
}): I_faProjectTagDocumentChild {
  return {
    documentId: input.documentId,
    displayName: input.displayName,
    templateId: null,
    isCategory: false,
    isFinished: false,
    isMinor: false,
    isDead: false,
    documentTextColor: '',
    documentBackgroundColor: '',
    treeOrderNumber: input.treeOrderNumber ?? EMPTY,
    extraClasses: '',
    sortOrder: input.sortOrder ?? 0
  }
}

test('sortProjectHierarchyTreeTagDocumentChildren orders names A to Z and Z to A', () => {
  const items = [
    child({
      displayName: 'Beta',
      documentId: 'b',
      sortOrder: 0
    }),
    child({
      displayName: 'Alpha',
      documentId: 'a',
      sortOrder: 1
    })
  ]
  expect(
    sortProjectHierarchyTreeTagDocumentChildren(items, 'name', 'asc').map((row) => row.documentId)
  ).toEqual(['a', 'b'])
  expect(
    sortProjectHierarchyTreeTagDocumentChildren(items, 'name', 'desc').map((row) => row.documentId)
  ).toEqual(['b', 'a'])
})

test('sortProjectHierarchyTreeTagDocumentChildren customOrder uses treeOrderNumber not sortOrder', () => {
  const items = [
    child({
      displayName: 'HighName',
      documentId: 'high',
      sortOrder: 0,
      treeOrderNumber: 90
    }),
    child({
      displayName: 'LowName',
      documentId: 'low',
      sortOrder: 1,
      treeOrderNumber: 10
    })
  ]
  expect(
    sortProjectHierarchyTreeTagDocumentChildren(items, 'customOrder', 'asc').map((row) => row.documentId)
  ).toEqual(['low', 'high'])
  expect(
    sortProjectHierarchyTreeTagDocumentChildren(items, 'customOrder', 'desc').map((row) => row.documentId)
  ).toEqual(['high', 'low'])
})

test('sortProjectHierarchyTreeTagDocumentChildren customOrder keeps empty tree order last', () => {
  const items = [
    child({
      displayName: 'Alpha',
      documentId: 'empty',
      sortOrder: 0,
      treeOrderNumber: EMPTY
    }),
    child({
      displayName: 'Zed',
      documentId: 'numbered',
      sortOrder: 1,
      treeOrderNumber: 5
    })
  ]
  expect(
    sortProjectHierarchyTreeTagDocumentChildren(items, 'customOrder', 'asc').map((row) => row.documentId)
  ).toEqual(['numbered', 'empty'])
  expect(
    sortProjectHierarchyTreeTagDocumentChildren(items, 'customOrder', 'desc').map((row) => row.documentId)
  ).toEqual(['numbered', 'empty'])
})

/**
 * sortProjectHierarchyTreeTagDocumentChildren
 * Name ties break on documentId; customOrder treats nullish tree order as empty and ties on name then id.
 */
test('sortProjectHierarchyTreeTagDocumentChildren breaks ties and treats nullish custom order as empty', () => {
  expect(
    sortProjectHierarchyTreeTagDocumentChildren([
      child({
        displayName: 'Same',
        documentId: 'c'
      }),
      child({
        displayName: 'Same',
        documentId: 'a'
      }),
      child({
        displayName: 'Same',
        documentId: 'b'
      })
    ], 'name', 'asc').map((row) => row.documentId)
  ).toEqual(['a', 'b', 'c'])
  expect(
    sortProjectHierarchyTreeTagDocumentChildren([
      child({
        displayName: 'Same',
        documentId: 'a'
      }),
      child({
        displayName: 'Same',
        documentId: 'a'
      })
    ], 'name', 'asc').map((row) => row.documentId)
  ).toEqual(['a', 'a'])

  const nullishEmpty: I_faProjectTagDocumentChild = {
    ...child({
      displayName: 'Nullish',
      documentId: 'nullish'
    }),
    treeOrderNumber: null as unknown as number
  }
  const undefinedEmpty: I_faProjectTagDocumentChild = {
    ...child({
      displayName: 'Undef',
      documentId: 'undef'
    }),
    treeOrderNumber: undefined as unknown as number
  }
  expect(
    sortProjectHierarchyTreeTagDocumentChildren([
      nullishEmpty,
      undefinedEmpty,
      child({
        displayName: 'Numbered',
        documentId: 'num',
        treeOrderNumber: 3
      })
    ], 'customOrder', 'asc').map((row) => row.documentId)
  ).toEqual(['num', 'nullish', 'undef'])

  // Both empty-vs-numbered comparator directions: empty first then numbered first.
  expect(
    sortProjectHierarchyTreeTagDocumentChildren([
      child({
        displayName: 'Alpha',
        documentId: 'empty-a',
        treeOrderNumber: EMPTY
      }),
      child({
        displayName: 'Zed',
        documentId: 'num-z',
        treeOrderNumber: 5
      }),
      child({
        displayName: 'Beta',
        documentId: 'empty-b',
        treeOrderNumber: EMPTY
      })
    ], 'customOrder', 'asc').map((row) => row.documentId)
  ).toEqual(['num-z', 'empty-a', 'empty-b'])
  expect(
    sortProjectHierarchyTreeTagDocumentChildren([
      child({
        displayName: 'Zed',
        documentId: 'num-z',
        treeOrderNumber: 5
      }),
      child({
        displayName: 'Alpha',
        documentId: 'empty-a',
        treeOrderNumber: EMPTY
      }),
      child({
        displayName: 'Mid',
        documentId: 'num-m',
        treeOrderNumber: 2
      })
    ], 'customOrder', 'desc').map((row) => row.documentId)
  ).toEqual(['num-z', 'num-m', 'empty-a'])

  expect(
    sortProjectHierarchyTreeTagDocumentChildren([
      child({
        displayName: 'Beta',
        documentId: 'b',
        treeOrderNumber: 7
      }),
      child({
        displayName: 'Alpha',
        documentId: 'a',
        treeOrderNumber: 7
      })
    ], 'customOrder', 'asc').map((row) => row.documentId)
  ).toEqual(['a', 'b'])
  expect(
    sortProjectHierarchyTreeTagDocumentChildren([
      child({
        displayName: 'Same',
        documentId: 'z',
        treeOrderNumber: 7
      }),
      child({
        displayName: 'Same',
        documentId: 'm',
        treeOrderNumber: 7
      }),
      child({
        displayName: 'Same',
        documentId: 'a',
        treeOrderNumber: 7
      })
    ], 'customOrder', 'desc').map((row) => row.documentId)
  ).toEqual(['a', 'm', 'z'])
})
