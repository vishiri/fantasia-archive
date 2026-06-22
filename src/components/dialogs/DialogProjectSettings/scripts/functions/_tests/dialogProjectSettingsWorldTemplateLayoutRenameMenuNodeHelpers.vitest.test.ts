import { expect, test, vi } from 'vitest'

import {
  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate,
  isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage
} from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
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
  nicknamePluralTranslations: {},
  nicknameSingularTranslations: {},
  nodeKind: 'template',
  templateDisplayName: 'Character',
  usesNickname: false,
  worldAppendix: ''
}

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators
 * Maps node kinds to Playwright-facing rename menu locators.
 */
test('Test that resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators maps group and template locators', () => {
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(groupNode)).toBe('group')
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators('group')).toEqual({
    contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupContextMenu',
    renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupRenameInput'
  })
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators('template')).toEqual({
    contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateContextMenu',
    renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput'
  })
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators(null)).toEqual({
    contextMenuTestLocator: undefined,
    renameInputTestLocator: undefined
  })
})

/**
 * emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate
 * Emits group rename and placement nickname events from tree node data.
 */
test('Test that emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate emits rename events', () => {
  const emitRenameGroup = vi.fn()
  const emitRenamePlacementNickname = vi.fn()

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayNameTranslations: { 'en-US': 'Dragons' },
    emitRenameGroup,
    emitRenamePlacementNickname,
    node: groupNode
  })
  expect(emitRenameGroup).toHaveBeenCalledWith(groupNode.id, { 'en-US': 'Dragons' })

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayNameTranslations: { 'en-US': 'Hero' },
    emitRenameGroup,
    emitRenamePlacementNickname,
    nicknameTranslations: {
      plural: { 'en-US': 'Hero' },
      singular: {}
    },
    node: templateNode
  })
  expect(emitRenamePlacementNickname).toHaveBeenCalledWith(templateNode.id, {
    plural: { 'en-US': 'Hero' },
    singular: {}
  })
})

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage
 * Returns group validation messages only when group names are invalid.
 */
test('Test that rename menu validation helpers surface required-name errors', () => {
  const isInvalid = (displayNameTranslations: { 'en-US'?: string }): boolean => {
    return (displayNameTranslations['en-US'] ?? '').trim().length === 0
  }
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayNameTranslations: {},
    isGroupNameInvalid: isInvalid,
    nodeKind: 'group',
    translateGroupNameErrorRequired: () => 'Group required'
  })).toBe('Group required')
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayNameTranslations: { 'en-US': 'OK' },
    isGroupNameInvalid: isInvalid,
    nodeKind: 'template',
    translateGroupNameErrorRequired: () => 'Group required'
  })).toBeUndefined()
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayNameTranslations: {},
    isGroupNameInvalid: isInvalid,
    nodeKind: 'template',
    translateGroupNameErrorRequired: () => 'Group required'
  })).toBeUndefined()
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
    displayNameTranslations: {},
    isGroupNameInvalid: isInvalid,
    nodeKind: 'template'
  })).toBe(false)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
    displayNameTranslations: {},
    isGroupNameInvalid: isInvalid,
    nodeKind: null
  })).toBe(false)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind({
    ...groupNode,
    nodeKind: 'folder'
  } as unknown as typeof groupNode)).toBeNull()
})

/**
 * emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate
 * Ignores unsupported node kinds.
 */
test('Test that emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate ignores unsupported node kinds', () => {
  const emitRenameGroup = vi.fn()
  const emitRenamePlacementNickname = vi.fn()

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayNameTranslations: { 'en-US': 'Ignored' },
    emitRenameGroup,
    emitRenamePlacementNickname,
    node: {
      ...groupNode,
      nodeKind: 'folder'
    } as unknown as typeof groupNode
  })
  expect(emitRenameGroup).not.toHaveBeenCalled()
  expect(emitRenamePlacementNickname).not.toHaveBeenCalled()
})

/**
 * isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid
 * Treats non-string locale values as empty translations.
 */
test('Test that group name translation invalid helper ignores non-string locale values', () => {
  expect(isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid({})).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid({
    'en-US': 1 as unknown as string
  })).toBe(true)
  expect(isDialogProjectSettingsWorldTemplateLayoutGroupNameTranslationsInvalid({
    'en-US': 'Creatures'
  })).toBe(false)
})
