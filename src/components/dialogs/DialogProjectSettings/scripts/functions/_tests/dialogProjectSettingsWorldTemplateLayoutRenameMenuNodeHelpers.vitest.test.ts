import { expect, test, vi } from 'vitest'

import {
  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage
} from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const groupNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder',
  id: '770e8400-e29b-41d4-a716-446655440001',
  label: 'Creatures',
  nickname: '',
  nodeKind: 'group',
  templateDisplayName: '',
  usesNickname: false,
  worldAppendix: ''
}

const templateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
  icon: 'mdi-account',
  id: '880e8400-e29b-41d4-a716-446655440001',
  label: 'Character',
  nickname: '',
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
    canonicalNameTestLocator: undefined,
    contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupContextMenu',
    renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutGroupRenameInput'
  })
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators('template')).toEqual({
    canonicalNameTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateCanonicalName',
    contextMenuTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateContextMenu',
    renameInputTestLocator: 'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput'
  })
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators(null)).toEqual({
    canonicalNameTestLocator: undefined,
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
    displayName: 'Dragons',
    emitRenameGroup,
    emitRenamePlacementNickname,
    node: groupNode
  })
  expect(emitRenameGroup).toHaveBeenCalledWith(groupNode.id, 'Dragons')

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayName: 'Hero',
    emitRenameGroup,
    emitRenamePlacementNickname,
    node: templateNode
  })
  expect(emitRenamePlacementNickname).toHaveBeenCalledWith(templateNode.id, 'Hero')
})

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage
 * Returns group validation messages only when group names are invalid.
 */
test('Test that rename menu validation helpers surface required-name errors', () => {
  const isInvalid = (displayName: string): boolean => displayName.trim().length === 0
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayName: '',
    isGroupNameInvalid: isInvalid,
    nodeKind: 'group',
    translateGroupNameErrorRequired: () => 'Group required'
  })).toBe('Group required')
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayName: 'OK',
    isGroupNameInvalid: isInvalid,
    nodeKind: 'template',
    translateGroupNameErrorRequired: () => 'Group required'
  })).toBeUndefined()
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayName: '',
    isGroupNameInvalid: isInvalid,
    nodeKind: 'template',
    translateGroupNameErrorRequired: () => 'Group required'
  })).toBeUndefined()
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
    displayName: '',
    isGroupNameInvalid: isInvalid,
    nodeKind: 'template'
  })).toBe(false)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
    displayName: '',
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
    displayName: 'Ignored',
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
