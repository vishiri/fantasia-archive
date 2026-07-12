import { expect, test } from 'vitest'

import {
  isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey
} from '../dialogProjectSettingsWorldTemplateLayoutTreeNodePresentation'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const groupNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: null,
  displayNameTranslations: { 'en-US': 'Group' },
  icon: 'mdi-folder-outline',
  id: 'group-a',
  label: 'Group',
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'group',
  templateDisplayName: '',
  usesNickname: false,
  worldAppendix: ''
}

const templateNodeWithoutDocuments: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: 'template-a',
  displayNameTranslations: {},
  icon: 'mdi-account',
  id: 'placement-a',
  label: 'Character',
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'template',
  templateDisplayName: 'Character',
  usesNickname: false,
  worldAppendix: ''
}

const templateNodeWithDocuments: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  ...templateNodeWithoutDocuments,
  documentCountInWorld: 3
}

/**
 * isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled
 * Blocks template placement remove when documents exist in the world.
 */
test('Test that isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled respects documentCountInWorld', () => {
  expect(isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled(groupNode)).toBe(false)
  expect(isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled(templateNodeWithoutDocuments)).toBe(false)
  expect(isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled(templateNodeWithDocuments)).toBe(true)
})

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey
 * Returns disabled tooltip key when template placement has connected documents.
 */
test('Test that resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey reflects remove disabled state', () => {
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey(groupNode)).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.removeGroupTooltip'
  )
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey(templateNodeWithoutDocuments)).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.removeTemplateTooltip'
  )
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey(templateNodeWithDocuments)).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.removeTemplateDisabledHasDocuments'
  )
})
