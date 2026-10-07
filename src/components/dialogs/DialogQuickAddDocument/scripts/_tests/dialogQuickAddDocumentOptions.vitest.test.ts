import { expect, test } from 'vitest'

import type { I_dialogQuickAddDocumentTemplateSource } from 'app/types/I_dialogQuickAddDocument'
import type { I_dialogQuickAddDocumentWorldSource } from 'app/types/I_dialogQuickAddDocument'

import {
  buildDialogQuickAddDocumentTemplateOptions,
  buildDialogQuickAddDocumentWorldOptions,
  collectDialogQuickAddDocumentTemplateIdsForWorld,
  findDialogQuickAddDocumentWorldById,
  pickFirstDialogQuickAddDocumentWorldId,
  sortDialogQuickAddDocumentWorldsBySortOrder
} from '../functions/dialogQuickAddDocumentOptions'

function makeWorld (
  id: string,
  sortOrder: number,
  templateIds: string[] = []
): I_dialogQuickAddDocumentWorldSource {
  return {
    color: '#4caf50',
    displayNameTranslations: { 'en-US': id },
    id,
    sortOrder,
    templateLayout: {
      groups: [],
      placements: templateIds.map((documentTemplateId, index) => ({
        documentTemplateId,
        groupId: null,
        groupSortOrder: null,
        rootSortOrder: index
      }))
    }
  }
}

function makeTemplate (
  id: string,
  plural: string
): I_dialogQuickAddDocumentTemplateSource {
  return {
    icon: `mdi-${id}`,
    id,
    titlePluralTranslations: { 'en-US': plural },
    titleSingularTranslations: { 'en-US': plural }
  }
}

/**
 * pickFirstDialogQuickAddDocumentWorldId
 * Prefers lowest sortOrder when preselecting on dialog open.
 */
test('Test that pickFirstDialogQuickAddDocumentWorldId returns first world by sortOrder ascending', () => {
  const worlds = [
    makeWorld('world-b', 2),
    makeWorld('world-a', 0),
    makeWorld('world-c', 1)
  ]
  expect(pickFirstDialogQuickAddDocumentWorldId(worlds)).toBe('world-a')
})

/**
 * pickFirstDialogQuickAddDocumentWorldId
 * Empty world list yields null.
 */
test('Test that pickFirstDialogQuickAddDocumentWorldId returns null for empty worlds', () => {
  expect(pickFirstDialogQuickAddDocumentWorldId([])).toBeNull()
})

/**
 * sortDialogQuickAddDocumentWorldsBySortOrder
 * Equal sortOrder keeps the incoming list order.
 */
test('Test that sortDialogQuickAddDocumentWorldsBySortOrder keeps equal sortOrder list order', () => {
  const sorted = sortDialogQuickAddDocumentWorldsBySortOrder([
    makeWorld('world-z', 1),
    makeWorld('world-a', 1)
  ])
  expect(sorted.map((world) => world.id)).toEqual(['world-z', 'world-a'])
})

/**
 * collectDialogQuickAddDocumentTemplateIdsForWorld
 * Dedupes placement documentTemplateId values in hierarchy order.
 */
test('Test that collectDialogQuickAddDocumentTemplateIdsForWorld dedupes placement template ids', () => {
  const world = makeWorld('world-a', 0, ['tpl-1', 'tpl-2', 'tpl-1'])
  expect(collectDialogQuickAddDocumentTemplateIdsForWorld(world)).toEqual(['tpl-1', 'tpl-2'])
})

/**
 * collectDialogQuickAddDocumentTemplateIdsForWorld
 * Null or undefined world yields an empty id list.
 */
test('Test that collectDialogQuickAddDocumentTemplateIdsForWorld returns empty for null world', () => {
  expect(collectDialogQuickAddDocumentTemplateIdsForWorld(null)).toEqual([])
  expect(collectDialogQuickAddDocumentTemplateIdsForWorld(undefined)).toEqual([])
})

/**
 * collectDialogQuickAddDocumentTemplateIdsForWorld
 * Skips empty documentTemplateId values and uses null sort fallbacks.
 */
test('Test that collectDialogQuickAddDocumentTemplateIdsForWorld skips empty ids and null sorts', () => {
  const world: I_dialogQuickAddDocumentWorldSource = {
    color: '#123456',
    displayNameTranslations: { 'en-US': 'world-a' },
    id: 'world-a',
    sortOrder: 0,
    templateLayout: {
      groups: [{
        id: 'group-1',
        rootSortOrder: 1
      }],
      placements: [
        {
          documentTemplateId: '',
          groupId: null,
          groupSortOrder: null,
          rootSortOrder: null
        },
        {
          documentTemplateId: 'tpl-root',
          groupId: null,
          groupSortOrder: null,
          rootSortOrder: 0
        },
        {
          documentTemplateId: 'tpl-in-group',
          groupId: 'group-1',
          groupSortOrder: null,
          rootSortOrder: null
        }
      ]
    }
  }
  expect(collectDialogQuickAddDocumentTemplateIdsForWorld(world)).toEqual([
    'tpl-root',
    'tpl-in-group'
  ])
})

/**
 * collectDialogQuickAddDocumentTemplateIdsForWorld
 * Matches hierarchy tree DFS: rootSortOrder across groups + root placements; groupSortOrder inside groups.
 */
test('Test that collectDialogQuickAddDocumentTemplateIdsForWorld follows hierarchy tree order', () => {
  const world: I_dialogQuickAddDocumentWorldSource = {
    color: '#123456',
    displayNameTranslations: { 'en-US': 'world-a' },
    id: 'world-a',
    sortOrder: 0,
    templateLayout: {
      groups: [{
        id: 'group-1',
        rootSortOrder: 0
      }],
      placements: [
        {
          documentTemplateId: 'tpl-root-late',
          groupId: null,
          groupSortOrder: null,
          rootSortOrder: 2
        },
        {
          documentTemplateId: 'tpl-in-group-b',
          groupId: 'group-1',
          groupSortOrder: 1,
          rootSortOrder: null
        },
        {
          documentTemplateId: 'tpl-in-group-a',
          groupId: 'group-1',
          groupSortOrder: 0,
          rootSortOrder: null
        },
        {
          documentTemplateId: 'tpl-root-mid',
          groupId: null,
          groupSortOrder: null,
          rootSortOrder: 1
        }
      ]
    }
  }
  expect(collectDialogQuickAddDocumentTemplateIdsForWorld(world)).toEqual([
    'tpl-in-group-a',
    'tpl-in-group-b',
    'tpl-root-mid',
    'tpl-root-late'
  ])
})

/**
 * buildDialogQuickAddDocumentTemplateOptions
 * Only templates placed on the selected world, in hierarchy order.
 */
test('Test that buildDialogQuickAddDocumentTemplateOptions lists only world-mapped templates', () => {
  const world = makeWorld('world-a', 0, ['tpl-hero', 'tpl-place'])
  const templatesById = new Map([
    ['tpl-hero', makeTemplate('tpl-hero', 'Heroes')],
    ['tpl-place', makeTemplate('tpl-place', 'Places')],
    ['tpl-other', makeTemplate('tpl-other', 'Other')]
  ])
  const options = buildDialogQuickAddDocumentTemplateOptions({
    preferredLanguageCode: 'en-US',
    resolveTemplateLabel: (template) => {
      return template.titlePluralTranslations['en-US'] ?? template.id
    },
    templatesById,
    world
  })
  expect(options.map((option) => option.id)).toEqual(['tpl-hero', 'tpl-place'])
  expect(options.map((option) => option.name)).toEqual(['Heroes', 'Places'])
})

/**
 * buildDialogQuickAddDocumentTemplateOptions
 * Worlds with no placements yield an empty template list.
 */
test('Test that buildDialogQuickAddDocumentTemplateOptions is empty when world has no placements', () => {
  const world = makeWorld('world-a', 0, [])
  const templatesById = new Map([
    ['tpl-hero', makeTemplate('tpl-hero', 'Heroes')],
    ['tpl-place', makeTemplate('tpl-place', 'Places')]
  ])
  const options = buildDialogQuickAddDocumentTemplateOptions({
    preferredLanguageCode: 'en-US',
    resolveTemplateLabel: (template) => {
      return template.titlePluralTranslations['en-US'] ?? template.id
    },
    templatesById,
    world
  })
  expect(options).toEqual([])
})

/**
 * buildDialogQuickAddDocumentWorldOptions
 * Labels resolve from display name translations.
 */
test('Test that buildDialogQuickAddDocumentWorldOptions labels worlds for q-select', () => {
  const options = buildDialogQuickAddDocumentWorldOptions({
    preferredLanguageCode: 'en-US',
    resolveWorldLabel: (translations) => translations['en-US'] ?? '',
    worlds: [
      makeWorld('world-b', 1),
      makeWorld('world-a', 0)
    ]
  })
  expect(options).toEqual([
    {
      color: '#4caf50',
      icon: 'mdi-earth',
      id: 'world-a',
      name: 'world-a'
    },
    {
      color: '#4caf50',
      icon: 'mdi-earth',
      id: 'world-b',
      name: 'world-b'
    }
  ])
})

/**
 * buildDialogQuickAddDocumentWorldOptions
 * Empty resolved labels fall back to the world id.
 */
test('Test that buildDialogQuickAddDocumentWorldOptions falls back to world id for empty labels', () => {
  const options = buildDialogQuickAddDocumentWorldOptions({
    preferredLanguageCode: 'en-US',
    resolveWorldLabel: () => '',
    worlds: [makeWorld('world-a', 0)]
  })
  expect(options[0]?.name).toBe('world-a')
})

/**
 * buildDialogQuickAddDocumentTemplateOptions
 * Skips missing templates and falls back to id when the label is empty.
 */
test('Test that buildDialogQuickAddDocumentTemplateOptions skips missing templates and empty labels', () => {
  const world = makeWorld('world-a', 0, ['tpl-missing', 'tpl-hero'])
  const templatesById = new Map([
    ['tpl-hero', makeTemplate('tpl-hero', '')]
  ])
  const options = buildDialogQuickAddDocumentTemplateOptions({
    preferredLanguageCode: 'en-US',
    resolveTemplateLabel: (template) => {
      return template.titlePluralTranslations['en-US'] ?? ''
    },
    templatesById,
    world
  })
  expect(options).toEqual([{
    icon: 'mdi-tpl-hero',
    id: 'tpl-hero',
    name: 'tpl-hero'
  }])
})

/**
 * findDialogQuickAddDocumentWorldById
 * Returns the matching world or null for missing or empty ids.
 */
test('Test that findDialogQuickAddDocumentWorldById resolves or returns null', () => {
  const worlds = [
    makeWorld('world-a', 0),
    makeWorld('world-b', 1)
  ]
  expect(findDialogQuickAddDocumentWorldById(worlds, 'world-b')?.id).toBe('world-b')
  expect(findDialogQuickAddDocumentWorldById(worlds, null)).toBeNull()
  expect(findDialogQuickAddDocumentWorldById(worlds, '')).toBeNull()
  expect(findDialogQuickAddDocumentWorldById(worlds, 'missing')).toBeNull()
})

/**
 * collectDialogQuickAddDocumentTemplateIdsForWorld
 * Sorts grouped placements by numeric groupSortOrder.
 */
test('Test that collectDialogQuickAddDocumentTemplateIdsForWorld sorts group placements by groupSortOrder', () => {
  const world: I_dialogQuickAddDocumentWorldSource = {
    color: '#123456',
    displayNameTranslations: { 'en-US': 'world-a' },
    id: 'world-a',
    sortOrder: 0,
    templateLayout: {
      groups: [{
        id: 'group-1',
        rootSortOrder: 0
      }],
      placements: [
        {
          documentTemplateId: 'tpl-late',
          groupId: 'group-1',
          groupSortOrder: 5,
          rootSortOrder: null
        },
        {
          documentTemplateId: 'tpl-early',
          groupId: 'group-1',
          groupSortOrder: 1,
          rootSortOrder: null
        }
      ]
    }
  }
  expect(collectDialogQuickAddDocumentTemplateIdsForWorld(world)).toEqual([
    'tpl-early',
    'tpl-late'
  ])
})

/**
 * buildDialogQuickAddDocumentTemplateOptions
 * Null world yields no template options.
 */
test('Test that buildDialogQuickAddDocumentTemplateOptions is empty for null world', () => {
  const options = buildDialogQuickAddDocumentTemplateOptions({
    preferredLanguageCode: 'en-US',
    resolveTemplateLabel: () => 'X',
    templatesById: new Map([
      ['tpl-hero', makeTemplate('tpl-hero', 'Heroes')]
    ]),
    world: null
  })
  expect(options).toEqual([])
})
