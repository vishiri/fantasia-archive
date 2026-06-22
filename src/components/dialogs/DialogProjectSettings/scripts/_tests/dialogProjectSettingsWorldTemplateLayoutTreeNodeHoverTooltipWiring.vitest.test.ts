import { computed } from 'vue'
import { expect, test } from 'vitest'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const templateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  displayNameTranslations: {},
  documentCountInWorld: 0,
  documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
  icon: 'mdi-account',
  id: '880e8400-e29b-41d4-a716-446655440001',
  label: 'Hero',
  nicknamePluralTranslations: { 'en-US': 'Hero' },
  nicknameSingularTranslations: {},
  nodeKind: 'template',
  templateDisplayName: 'Character',
  usesNickname: true,
  worldAppendix: ''
}

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring
 * Builds nickname hover tooltip lines for nicknamed placement rows.
 */
test('Test that tree node hover tooltip wiring formats nickname lines for nicknamed templates', () => {
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring({
    computed,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    readCurrentLanguageCode: () => 'en-US',
    readNode: () => templateNode
  })

  expect(wiring.showPlacementNicknameHoverTooltip.value).toBe(true)
  expect(wiring.placementNicknameHoverTooltipNicknameLine.value).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverNicknameLabel - Hero'
  )
  expect(wiring.placementNicknameHoverTooltipOriginalNameLine.value).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel - Character'
  )
  expect(wiring.placementNicknameHoverTooltipTestText.value).toContain('Hero')
})

test('Test that tree node hover tooltip wiring returns undefined test text without nickname', () => {
  const plainTemplateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
    ...templateNode,
    nicknamePluralTranslations: {},
    nicknameSingularTranslations: {},
    usesNickname: false
  }
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring({
    computed,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    readCurrentLanguageCode: () => 'en-US',
    readNode: () => plainTemplateNode
  })

  expect(wiring.showPlacementNicknameHoverTooltip.value).toBe(false)
  expect(wiring.placementNicknameHoverTooltipTestText.value).toBeUndefined()
})
