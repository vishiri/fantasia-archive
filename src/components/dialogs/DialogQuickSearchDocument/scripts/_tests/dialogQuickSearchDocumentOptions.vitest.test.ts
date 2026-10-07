import { expect, test } from 'vitest'

import {
  FA_DIALOG_QUICK_SEARCH_DOCUMENT_CATEGORY_ICON,
  FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON,
  FA_DIALOG_QUICK_SEARCH_DOCUMENT_WORLD_ICON,
  buildDialogQuickSearchDocumentDocumentOptions,
  buildDialogQuickSearchDocumentWorldOptions,
  pickFirstDialogQuickSearchDocumentWorldId,
  resolveDialogQuickSearchDocumentOptionIcon,
  sortDialogQuickSearchDocumentWorldsBySortOrder
} from '../functions/dialogQuickSearchDocumentOptions'

/**
 * pickFirstDialogQuickSearchDocumentWorldId / buildDialogQuickSearchDocumentWorldOptions
 */
test('Test that world helpers sort by sortOrder and build labeled options', () => {
  const worlds = [
    {
      color: '#2196f3',
      displayNameTranslations: { 'en-US': 'Beta' },
      id: 'world-b',
      sortOrder: 1
    },
    {
      color: '#4caf50',
      displayNameTranslations: { 'en-US': 'Alpha' },
      id: 'world-a',
      sortOrder: 0
    }
  ]
  expect(pickFirstDialogQuickSearchDocumentWorldId(worlds)).toBe('world-a')
  expect(buildDialogQuickSearchDocumentWorldOptions({
    preferredLanguageCode: 'en-US',
    resolveWorldLabel: (translations) => translations['en-US'] ?? '',
    worlds
  }).map((row) => row.id)).toEqual(['world-a', 'world-b'])
})

/**
 * resolveDialogQuickSearchDocumentOptionIcon / buildDialogQuickSearchDocumentDocumentOptions
 */
test('Test that document options include categories and resolve icons', () => {
  const templatesById = new Map([
    ['tpl-hero', {
      id: 'tpl-hero',
      icon: 'mdi-account'
    }]
  ])
  const documents = [
    {
      displayName: 'Heroes folder',
      documentTextColor: null,
      id: 'cat-1',
      isCategory: true,
      sortOrder: 0,
      templateId: null
    },
    {
      displayName: 'Aria',
      documentTextColor: '#ff0000',
      id: 'doc-1',
      isCategory: false,
      sortOrder: 1,
      templateId: 'tpl-hero'
    },
    {
      displayName: 'Orphan',
      documentTextColor: null,
      id: 'doc-2',
      isCategory: false,
      sortOrder: 2,
      templateId: null
    }
  ]
  expect(resolveDialogQuickSearchDocumentOptionIcon(documents[0]!, templatesById))
    .toBe(FA_DIALOG_QUICK_SEARCH_DOCUMENT_CATEGORY_ICON)
  expect(resolveDialogQuickSearchDocumentOptionIcon(documents[1]!, templatesById))
    .toBe('mdi-account')
  expect(resolveDialogQuickSearchDocumentOptionIcon(documents[2]!, templatesById))
    .toBe(FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON)

  const options = buildDialogQuickSearchDocumentDocumentOptions({
    documents,
    resolveDocumentIcon: resolveDialogQuickSearchDocumentOptionIcon,
    templatesById
  })
  expect(options.map((row) => row.id)).toEqual(['doc-1', 'cat-1', 'doc-2'])
  expect(options[0]?.color).toBe('#ff0000')
  expect(options[1]?.icon).toBe(FA_DIALOG_QUICK_SEARCH_DOCUMENT_CATEGORY_ICON)
})

/**
 * sortDialogQuickSearchDocumentWorldsBySortOrder / pickFirstDialogQuickSearchDocumentWorldId
 * Equal sortOrder keeps list order; empty list yields null.
 */
test('Test that world sort keeps equal sortOrder list order and empty pick returns null', () => {
  expect(pickFirstDialogQuickSearchDocumentWorldId([])).toBeNull()
  const tied = [
    {
      id: 'world-b',
      sortOrder: 0
    },
    {
      id: 'world-a',
      sortOrder: 0
    }
  ]
  expect(sortDialogQuickSearchDocumentWorldsBySortOrder(tied).map((row) => row.id))
    .toEqual(['world-b', 'world-a'])
  expect(pickFirstDialogQuickSearchDocumentWorldId(tied)).toBe('world-b')
})

/**
 * buildDialogQuickSearchDocumentWorldOptions / resolveDialogQuickSearchDocumentOptionIcon
 * Empty labels fall back to id; blank template icons use the default glyph.
 */
test('Test that world and document helpers fall back empty labels and icons', () => {
  expect(buildDialogQuickSearchDocumentWorldOptions({
    preferredLanguageCode: 'en-US',
    resolveWorldLabel: () => '',
    worlds: [{
      color: '#000',
      displayNameTranslations: {},
      id: 'world-x',
      sortOrder: 0
    }]
  })).toEqual([{
    color: '#000',
    icon: FA_DIALOG_QUICK_SEARCH_DOCUMENT_WORLD_ICON,
    id: 'world-x',
    name: 'world-x'
  }])

  const blankTemplateMap = new Map([
    ['tpl-blank', {
      id: 'tpl-blank',
      icon: '   '
    }]
  ])
  expect(resolveDialogQuickSearchDocumentOptionIcon({
    displayName: 'Hero',
    documentTextColor: null,
    id: 'doc-blank',
    isCategory: false,
    sortOrder: 0,
    templateId: 'tpl-blank'
  }, blankTemplateMap)).toBe(FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON)
  expect(resolveDialogQuickSearchDocumentOptionIcon({
    displayName: 'Hero',
    documentTextColor: null,
    id: 'doc-missing',
    isCategory: false,
    sortOrder: 0,
    templateId: 'tpl-missing'
  }, blankTemplateMap)).toBe(FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON)
  expect(resolveDialogQuickSearchDocumentOptionIcon({
    displayName: 'Hero',
    documentTextColor: null,
    id: 'doc-empty-tpl',
    isCategory: false,
    sortOrder: 0,
    templateId: ''
  }, blankTemplateMap)).toBe(FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON)
})

/**
 * buildDialogQuickSearchDocumentDocumentOptions
 * Equal names tie-break by sortOrder then id; empty names fall back to id.
 */
test('Test that document options tie-break equal names and fall back empty names', () => {
  const options = buildDialogQuickSearchDocumentDocumentOptions({
    documents: [
      {
        displayName: 'Same',
        documentTextColor: '   ',
        id: 'doc-b',
        isCategory: false,
        sortOrder: 1,
        templateId: null
      },
      {
        displayName: 'Same',
        documentTextColor: null,
        id: 'doc-a',
        isCategory: false,
        sortOrder: 0,
        templateId: null
      },
      {
        displayName: 'Same',
        documentTextColor: null,
        id: 'doc-c',
        isCategory: false,
        sortOrder: 0,
        templateId: null
      },
      {
        displayName: '',
        documentTextColor: null,
        id: 'doc-empty-name',
        isCategory: false,
        sortOrder: 2,
        templateId: null
      }
    ],
    resolveDocumentIcon: () => FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON,
    templatesById: new Map()
  })
  expect(options.map((row) => row.id)).toEqual(['doc-empty-name', 'doc-a', 'doc-c', 'doc-b'])
  expect(options[1]?.color).toBeUndefined()
  expect(options[0]?.name).toBe('doc-empty-name')
})

/**
 * buildDialogQuickSearchDocumentDocumentOptions
 * Equal name and sort keep older createdAt before id.
 */
test('Test that document options keep older createdAt before id when names and sort match', () => {
  const options = buildDialogQuickSearchDocumentDocumentOptions({
    documents: [
      {
        createdAtMs: 2000,
        displayName: 'Same',
        documentTextColor: null,
        id: 'doc-aaa',
        isCategory: false,
        sortOrder: 0,
        templateId: null
      },
      {
        createdAtMs: 1000,
        displayName: 'Same',
        documentTextColor: null,
        id: 'doc-zzz',
        isCategory: false,
        sortOrder: 0,
        templateId: null
      }
    ],
    resolveDocumentIcon: () => FA_DIALOG_QUICK_SEARCH_DOCUMENT_DEFAULT_ICON,
    templatesById: new Map()
  })
  expect(options.map((row) => row.id)).toEqual(['doc-zzz', 'doc-aaa'])
})
