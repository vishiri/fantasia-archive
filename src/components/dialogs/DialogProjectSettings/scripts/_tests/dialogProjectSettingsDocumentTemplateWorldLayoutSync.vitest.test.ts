import { expect, test } from 'vitest'

import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import { syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames } from '../dialogProjectSettingsDocumentTemplateWorldLayoutSync'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../dialogProjectSettingsWorldTemplateLayoutDraft'

const templateId = '660e8400-e29b-41d4-a716-446655440001'
const otherTemplateId = '660e8400-e29b-41d4-a716-446655440002'
const placementAId = '880e8400-e29b-41d4-a716-446655440001'
const placementBId = '880e8400-e29b-41d4-a716-446655440002'

const worldA: I_dialogProjectSettingsWorldDraft = {
  color: '',
  colorPallete: '',
  displayName: 'Realm A',
  documentCount: 0,
  id: '550e8400-e29b-41d4-a716-446655440000',
  templateLayout: {
    groups: [],
    placements: [
      {
        displayName: 'Character',
        documentCountInWorld: 0,
        documentTemplateId: templateId,
        groupId: null,
        groupSortOrder: null,
        icon: '',
        id: placementAId,
        rootSortOrder: 0,
        worldAppendix: ''
      }
    ]
  }
}

const worldB: I_dialogProjectSettingsWorldDraft = {
  ...worldA,
  displayName: 'Realm B',
  id: '550e8400-e29b-41d4-a716-446655440099',
  templateLayout: {
    groups: [],
    placements: [
      {
        displayName: 'Character',
        documentCountInWorld: 0,
        documentTemplateId: templateId,
        groupId: null,
        groupSortOrder: null,
        icon: '',
        id: placementBId,
        rootSortOrder: 0,
        worldAppendix: ''
      },
      {
        displayName: 'Location',
        documentCountInWorld: 0,
        documentTemplateId: otherTemplateId,
        groupId: null,
        groupSortOrder: null,
        icon: '',
        id: '880e8400-e29b-41d4-a716-446655440003',
        rootSortOrder: 1,
        worldAppendix: ''
      }
    ]
  }
}

/**
 * syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames
 * Keeps placement display names aligned with document template renames across worlds.
 */
test('Test that syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames renames matching placements in every world', () => {
  const nextWorlds = syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames(
    [worldA, worldB],
    templateId,
    'Hero'
  )

  expect(nextWorlds[0].templateLayout.placements[0].displayName).toBe('Hero')
  expect(nextWorlds[1].templateLayout.placements[0].displayName).toBe('Hero')
  expect(nextWorlds[1].templateLayout.placements[1].displayName).toBe('Location')
})

/**
 * syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames
 * Leaves worlds unchanged when no placement references the template id.
 */
test('Test that syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames leaves unrelated layouts unchanged', () => {
  const emptyLayoutWorld: I_dialogProjectSettingsWorldDraft = {
    ...worldA,
    templateLayout: createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  }
  const nextWorlds = syncDialogProjectSettingsWorldDraftTemplateLayoutPlacementDisplayNames(
    [emptyLayoutWorld],
    templateId,
    'Hero'
  )

  expect(nextWorlds[0].templateLayout.placements).toHaveLength(0)
})
