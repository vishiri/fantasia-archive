import { expect, test, vi } from 'vitest'

import {
  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsUpdate,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed
} from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsWiring'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const groupNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  displayNameTranslations: { 'en-US': 'Creatures' },
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder',
  id: '770e8400-e29b-41d4-a716-446655440001',
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
  documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
  icon: 'mdi-account',
  id: '880e8400-e29b-41d4-a716-446655440001',
  label: 'Character',
  nicknamePluralTranslations: { 'en-US': 'Hero' },
  nicknameSingularTranslations: {},
  nodeKind: 'template',
  templateDisplayName: 'Character',
  usesNickname: true,
  worldAppendix: ''
}

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed
 * Normalizes translation drafts from group and template tree nodes.
 */
test('Test that rename menu translation seed wiring normalizes group and template drafts', () => {
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed(groupNode)).toEqual({
    'en-US': 'Creatures'
  })
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed(templateNode)).toEqual({
    plural: { 'en-US': 'Hero' },
    singular: {}
  })
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed({
    ...groupNode,
    nodeKind: 'folder'
  } as unknown as typeof groupNode)).toEqual({})
})

/**
 * emitDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsUpdate
 * Emits normalized translation maps for supported node kinds.
 */
test('Test that rename menu translation emit wiring routes group and template updates', () => {
  const emitRenameGroup = vi.fn()
  const emitRenamePlacementNickname = vi.fn()

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsUpdate({
    emitRenameGroup,
    emitRenamePlacementNickname,
    node: groupNode,
    translationsDraft: { 'en-US': ' Dragons ' }
  })
  expect(emitRenameGroup).toHaveBeenCalledWith(groupNode.id, { 'en-US': 'Dragons' })

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsUpdate({
    emitRenameGroup,
    emitRenamePlacementNickname,
    node: templateNode,
    translationsDraft: {
      plural: { 'en-US': ' Alias ' },
      singular: {}
    }
  })
  expect(emitRenamePlacementNickname).toHaveBeenCalledWith(templateNode.id, {
    plural: { 'en-US': 'Alias' },
    singular: {}
  })
})
