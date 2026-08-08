import { expect, test } from 'vitest'

import {
  mapOpenedDocumentSavedTagsToDraft,
  mapOpenedDocumentTagsDraftToSetInput,
  resolveOpenedDocumentTagsFingerprint
} from '../openedDocumentTagsDomain'

test('resolveOpenedDocumentTagsFingerprint is stable across order', () => {
  const left = resolveOpenedDocumentTagsFingerprint([
    {
      id: 'b',
      name: 'B'
    },
    {
      id: 'a',
      name: 'A'
    }
  ])
  const right = resolveOpenedDocumentTagsFingerprint([
    {
      id: 'a',
      name: 'A'
    },
    {
      id: 'b',
      name: 'B'
    }
  ])
  expect(left).toBe(right)
})

test('resolveOpenedDocumentTagsFingerprint differs when isNew set', () => {
  expect(resolveOpenedDocumentTagsFingerprint([
    {
      id: 'a',
      name: 'A',
      isNew: true
    }
  ])).not.toBe(resolveOpenedDocumentTagsFingerprint([
    {
      id: 'a',
      name: 'A'
    }
  ]))
})

test('mapOpenedDocumentSavedTagsToDraft strips extras', () => {
  expect(mapOpenedDocumentSavedTagsToDraft([
    {
      id: 't1',
      name: 'Heroes'
    }
  ])).toEqual([
    {
      id: 't1',
      name: 'Heroes'
    }
  ])
})

test('mapOpenedDocumentTagsDraftToSetInput trims and drops empty names', () => {
  expect(mapOpenedDocumentTagsDraftToSetInput([
    {
      id: 't1',
      name: '  Heroes  ',
      isNew: true
    },
    {
      id: 't2',
      name: '   '
    }
  ])).toEqual([
    {
      id: 't1',
      isNew: true,
      name: 'Heroes'
    }
  ])
})
