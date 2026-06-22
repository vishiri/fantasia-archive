import { expect, test } from 'vitest'

import {
  appendDialogProjectSettingsWorldTemplateGroupDraft,
  appendDialogProjectSettingsWorldTemplatePlacementDraft,
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft
} from '../dialogProjectSettingsWorldTemplateLayoutDraft'
import { removeDialogProjectSettingsWorldTemplateGroupDraft } from '../dialogProjectSettingsWorldTemplateLayoutGroupDraft'

/**
 * removeDialogProjectSettingsWorldTemplateGroupDraft
 * Shifts later root placements when a group with children is removed.
 */
test('Test that remove group draft shifts later root placements after group removal', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  const groupId = layout.groups[0]?.id ?? ''
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
    icon: 'mdi-account',
    templateDisplayName: 'Character',
    worldAppendix: ''
  })
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: '770e8400-e29b-41d4-a716-446655440002',
    icon: 'mdi-map',
    templateDisplayName: 'Location',
    worldAppendix: ''
  })
  const trailingRootPlacementId = layout.placements[1]?.id ?? ''
  layout = {
    ...layout,
    placements: layout.placements.map((placement, index) => {
      if (index === 0) {
        return {
          ...placement,
          groupId,
          groupSortOrder: 0,
          rootSortOrder: null
        }
      }
      return placement
    })
  }

  const nextLayout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, groupId)
  const trailingPlacement = nextLayout.placements.find((placement) => placement.id === trailingRootPlacementId)
  expect(trailingPlacement?.groupId).toBeNull()
  expect(trailingPlacement?.rootSortOrder).toBeGreaterThan(0)
})

test('Test that remove group draft leaves earlier root placements unchanged', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
    icon: 'mdi-account',
    templateDisplayName: 'Character',
    worldAppendix: ''
  })
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  const earlyRootPlacementId = layout.placements[0]?.id ?? ''
  const earlyRootSortOrder = layout.placements[0]?.rootSortOrder ?? 0
  const groupId = layout.groups[0]?.id ?? ''

  const nextLayout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, groupId)
  const earlyPlacement = nextLayout.placements.find((placement) => placement.id === earlyRootPlacementId)
  expect(earlyPlacement?.rootSortOrder).toBe(earlyRootSortOrder)
})

test('Test that remove group draft no-ops for unknown group id', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  const nextLayout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, 'missing-group')
  expect(nextLayout).toBe(layout)
})

test('Test that remove group draft shifts later groups when removed group had children', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'First')
  const firstGroupId = layout.groups[0]?.id ?? ''
  layout = {
    ...layout,
    placements: [
      {
        documentCountInWorld: 0,
        documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
        groupId: firstGroupId,
        groupSortOrder: 0,
        icon: 'mdi-account',
        id: 'placement-a',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        rootSortOrder: null,
        templateDisplayName: 'Character',
        worldAppendix: ''
      },
      {
        documentCountInWorld: 0,
        documentTemplateId: '770e8400-e29b-41d4-a716-446655440002',
        groupId: firstGroupId,
        groupSortOrder: 1,
        icon: 'mdi-map',
        id: 'placement-b',
        nicknamePluralTranslations: {},
        nicknameSingularTranslations: {},
        rootSortOrder: null,
        templateDisplayName: 'Location',
        worldAppendix: ''
      }
    ]
  }
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Second')
  const secondGroupId = layout.groups[1]?.id ?? ''
  const secondGroupRootBefore = layout.groups.find((group) => group.id === secondGroupId)?.rootSortOrder ?? 0

  const nextLayout = removeDialogProjectSettingsWorldTemplateGroupDraft(layout, firstGroupId)
  const secondGroup = nextLayout.groups.find((group) => group.id === secondGroupId)
  expect(secondGroup?.rootSortOrder).toBe(secondGroupRootBefore + 1)
})
