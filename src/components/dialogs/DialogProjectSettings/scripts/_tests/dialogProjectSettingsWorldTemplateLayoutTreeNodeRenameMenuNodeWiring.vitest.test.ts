import { ref } from 'vue'
import { expect, test, vi } from 'vitest'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const groupNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  displayNameTranslations: { 'en-US': 'Creatures' },
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder',
  id: 'group-a',
  label: 'Creatures',
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'group',
  templateDisplayName: '',
  usesNickname: false,
  worldAppendix: ''
}

const templateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  displayNameTranslations: {},
  documentCountInWorld: 0,
  documentTemplateId: 'template-a',
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

test('Test that createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring wires group i18n labels', () => {
  const t = vi.fn((key: string) => key)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring({
    emitRenameGroup: vi.fn(),
    emitRenamePlacementNickname: vi.fn(),
    getNode: () => groupNode,
    i18n: {
      global: { t }
    },
    nodeAnchorRef: ref(null)
  })

  expect(wiring.renameInputLabel.value).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.groupRenameInputLabel'
  )
  expect(wiring.templateNicknameTooltipText.value).toBe('')
})

test('Test that createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring wires template i18n labels', () => {
  const t = vi.fn((key: string) => key)
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuNodeWiring({
    emitRenameGroup: vi.fn(),
    emitRenamePlacementNickname: vi.fn(),
    getNode: () => templateNode,
    i18n: {
      global: { t }
    },
    nodeAnchorRef: ref(null)
  })

  expect(wiring.templateCanonicalNameTooltipText.value).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.templateCanonicalNameTooltip'
  )
  expect(wiring.renameInputLabel.value).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.templateNicknameLabel'
  )
  expect(wiring.templateNicknameTooltipText.value).toBe(
    'dialogs.projectSettings.fields.worldTemplateLayout.templateNicknameTooltip'
  )
  expect(t).toHaveBeenCalled()
})
