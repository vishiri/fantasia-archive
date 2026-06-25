import { expect, test } from 'vitest'

import {
  buildHeTreeNodesFromWorldTemplateLayoutDraft,
  resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel,
  resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname
} from '../dialogProjectSettingsWorldTemplateLayoutTreeBuildWiring'
import { createEmptyDialogProjectSettingsWorldTemplateLayoutDraft } from '../dialogProjectSettingsWorldTemplateLayoutDraft'
import { appendDialogProjectSettingsWorldTemplateGroupDraft } from '../dialogProjectSettingsWorldTemplateLayoutDraft'
import { appendDialogProjectSettingsWorldTemplatePlacementDraft } from '../dialogProjectSettingsWorldTemplateLayoutDraft'

/**
 * dialogProjectSettingsWorldTemplateLayoutTreeBuildWiring
 * Builds localized he-tree labels from translation maps.
 */
test('Test that tree build wiring resolves placement labels from nickname translations', () => {
  let layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout = appendDialogProjectSettingsWorldTemplateGroupDraft(layout, 'en-US', 'Creatures')
  layout = appendDialogProjectSettingsWorldTemplatePlacementDraft(layout, {
    documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
    icon: 'mdi-account',
    templateDisplayName: 'Character',
    worldAppendix: ''
  })
  layout = {
    ...layout,
    placements: [
      {
        ...layout.placements[0]!,
        nicknamePluralTranslations: { 'en-US': 'Hero' },
        nicknameSingularTranslations: {},
      }
    ]
  }

  const nodes = buildHeTreeNodesFromWorldTemplateLayoutDraft(layout, 'en-US')
  expect(nodes[0]!?.label).toBe('Creatures')
  expect(nodes[1]!?.label).toBe('Hero')
  expect(resolveDialogProjectSettingsWorldTemplatePlacementUsesNickname({
    languageCode: 'en-US',
    nicknamePluralTranslations: { 'en-US': 'Hero' },
    nicknameSingularTranslations: {},
  })).toBe(true)
  expect(resolveDialogProjectSettingsWorldTemplatePlacementEffectiveLabel({
    languageCode: 'en-US',
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    templateDisplayName: 'Character'
  })).toBe('Character')
})
