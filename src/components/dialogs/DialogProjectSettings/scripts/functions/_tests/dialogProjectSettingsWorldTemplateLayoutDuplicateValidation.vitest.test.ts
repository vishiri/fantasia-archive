import { expect, test } from 'vitest'

import {
  collectBlankTemplateGroupIdsInWorldTemplateLayout,
  collectDuplicateDocumentTemplateIdsInWorldTemplateLayout,
  hasDialogProjectSettingsWorldTemplateLayoutDuplicatePlacementError,
  isDialogProjectSettingsWorldTemplatePlacementDuplicate,
  worldTemplateLayoutHasInvalidDocumentTemplatePlacements
} from '../dialogProjectSettingsWorldTemplateLayoutDuplicateValidation'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../../dialogProjectSettingsWorldTemplateLayoutDraft'

/**
 * dialogProjectSettingsWorldTemplateLayoutDuplicateValidation
 * Detects duplicate document_template_id placements in one layout draft.
 */
test('Test that duplicate validation collects repeated document template ids', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Character',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    },
    {
      displayName: 'Character copy',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-b',
      rootSortOrder: 1,
      worldAppendix: ''
    }
  ]
  expect(collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(layout)).toEqual(new Set(['template-a']))
  expect(hasDialogProjectSettingsWorldTemplateLayoutDuplicatePlacementError(layout)).toBe(true)
  expect(isDialogProjectSettingsWorldTemplatePlacementDuplicate(layout.placements[0]!, layout)).toBe(true)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDuplicateValidation
 * Unique placements do not trigger duplicate errors.
 */
test('Test that duplicate validation ignores unique document template ids', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Character',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    },
    {
      displayName: 'Location',
      documentCountInWorld: 0,
      documentTemplateId: 'template-b',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-map',
      id: 'placement-b',
      rootSortOrder: 1,
      worldAppendix: ''
    }
  ]
  expect(hasDialogProjectSettingsWorldTemplateLayoutDuplicatePlacementError(layout)).toBe(false)
  expect(isDialogProjectSettingsWorldTemplatePlacementDuplicate(layout.placements[0]!, layout)).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDuplicateValidation
 * Ignores blank document template ids when checking duplicate placements.
 */
test('Test that duplicate validation ignores blank document template ids', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Blank',
      documentCountInWorld: 0,
      documentTemplateId: '',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  expect(collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(layout)).toEqual(new Set())
  expect(isDialogProjectSettingsWorldTemplatePlacementDuplicate(layout.placements[0]!, layout)).toBe(false)
  expect(hasDialogProjectSettingsWorldTemplateLayoutDuplicatePlacementError(layout)).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDuplicateValidation
 * Marks only repeated document template ids as duplicate placements.
 */
test('Test that duplicate validation flags repeated ids but not unique placements in same layout', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Character',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    },
    {
      displayName: 'Character copy',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-b',
      rootSortOrder: 1,
      worldAppendix: ''
    },
    {
      displayName: 'Location',
      documentCountInWorld: 0,
      documentTemplateId: 'template-b',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-map',
      id: 'placement-c',
      rootSortOrder: 2,
      worldAppendix: ''
    }
  ]
  expect(isDialogProjectSettingsWorldTemplatePlacementDuplicate(layout.placements[2]!, layout)).toBe(false)
  expect(collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(layout)).toEqual(new Set(['template-a']))
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDuplicateValidation
 * Ignores additional repeats after a document template id is already marked duplicate.
 */
test('Test that duplicate validation ignores third repeats of the same document template id', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Character',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    },
    {
      displayName: 'Character copy',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-b',
      rootSortOrder: 1,
      worldAppendix: ''
    },
    {
      displayName: 'Character copy 2',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-c',
      rootSortOrder: 2,
      worldAppendix: ''
    }
  ]
  expect(collectDuplicateDocumentTemplateIdsInWorldTemplateLayout(layout)).toEqual(new Set(['template-a']))
  expect(hasDialogProjectSettingsWorldTemplateLayoutDuplicatePlacementError(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  )).toBe(false)
  expect(collectBlankTemplateGroupIdsInWorldTemplateLayout(
    createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  )).toEqual(new Set())
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDuplicateValidation
 * Ignores duplicate checks for placements with blank document template ids.
 */
test('Test that duplicate validation ignores blank placement ids even when layout has duplicates', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Character',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    },
    {
      displayName: 'Character copy',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-b',
      rootSortOrder: 1,
      worldAppendix: ''
    },
    {
      displayName: 'Blank',
      documentCountInWorld: 0,
      documentTemplateId: '',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-c',
      rootSortOrder: 2,
      worldAppendix: ''
    }
  ]
  expect(isDialogProjectSettingsWorldTemplatePlacementDuplicate(layout.placements[2]!, layout)).toBe(false)
})

/**
 * dialogProjectSettingsWorldTemplateLayoutDuplicateValidation
 * Collects group ids whose display names are blank after trim.
 */
test('Test that blank group validation collects empty group display names', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.groups = [
    {
      displayName: 'Creatures',
      id: 'group-a',
      rootSortOrder: 0
    },
    {
      displayName: '   ',
      id: 'group-b',
      rootSortOrder: 1
    },
    {
      displayName: '',
      id: 'group-c',
      rootSortOrder: 2
    }
  ]
  expect(collectBlankTemplateGroupIdsInWorldTemplateLayout(layout)).toEqual(new Set(['group-b', 'group-c']))
})

/**
 * worldTemplateLayoutHasInvalidDocumentTemplatePlacements
 * Flags layouts that reference invalid document template ids.
 */
test('Test that invalid document template placement validation detects bad template ids', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      displayName: 'Character',
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      rootSortOrder: 0,
      worldAppendix: ''
    }
  ]
  expect(worldTemplateLayoutHasInvalidDocumentTemplatePlacements(layout, new Set())).toBe(false)
  expect(worldTemplateLayoutHasInvalidDocumentTemplatePlacements(layout, new Set(['template-b']))).toBe(false)
  expect(worldTemplateLayoutHasInvalidDocumentTemplatePlacements(layout, new Set(['template-a']))).toBe(true)
})
