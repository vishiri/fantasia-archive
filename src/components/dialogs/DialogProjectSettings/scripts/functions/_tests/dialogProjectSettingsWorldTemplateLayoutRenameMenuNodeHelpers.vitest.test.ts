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
  nodeKind: 'group',
  worldAppendix: ''
}

const templateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: '660e8400-e29b-41d4-a716-446655440001',
  icon: 'mdi-account',
  id: '880e8400-e29b-41d4-a716-446655440001',
  label: 'Character',
  nodeKind: 'template',
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
 * Emits group and template rename events from tree node data.
 */
test('Test that emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate emits rename events', () => {
  const emitRenameGroup = vi.fn()
  const emitRenameDocumentTemplate = vi.fn()

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayName: 'Dragons',
    emitRenameDocumentTemplate,
    emitRenameGroup,
    node: groupNode
  })
  expect(emitRenameGroup).toHaveBeenCalledWith(groupNode.id, 'Dragons')

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayName: 'Hero',
    emitRenameDocumentTemplate,
    emitRenameGroup,
    node: templateNode
  })
  expect(emitRenameDocumentTemplate).toHaveBeenCalledWith(templateNode.documentTemplateId, 'Hero')
})

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage
 * Returns group and template validation messages only when names are invalid.
 */
test('Test that rename menu validation helpers surface required-name errors', () => {
  const isInvalid = (displayName: string): boolean => displayName.trim().length === 0
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayName: '',
    isGroupNameInvalid: isInvalid,
    isTemplateNameInvalid: isInvalid,
    nodeKind: 'group',
    translateGroupNameErrorRequired: () => 'Group required',
    translateTemplateNameErrorRequired: () => 'Template required'
  })).toBe('Group required')
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayName: 'OK',
    isGroupNameInvalid: isInvalid,
    isTemplateNameInvalid: isInvalid,
    nodeKind: 'template',
    translateGroupNameErrorRequired: () => 'Group required',
    translateTemplateNameErrorRequired: () => 'Template required'
  })).toBeUndefined()
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
    displayName: '',
    isGroupNameInvalid: isInvalid,
    isTemplateNameInvalid: isInvalid,
    nodeKind: 'template',
    translateGroupNameErrorRequired: () => 'Group required',
    translateTemplateNameErrorRequired: () => 'Template required'
  })).toBe('Template required')
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
    displayName: '',
    isGroupNameInvalid: isInvalid,
    isTemplateNameInvalid: isInvalid,
    nodeKind: 'template'
  })).toBe(true)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
    displayName: '',
    isGroupNameInvalid: isInvalid,
    isTemplateNameInvalid: isInvalid,
    nodeKind: null
  })).toBe(false)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind({
    ...groupNode,
    nodeKind: 'folder'
  } as unknown as typeof groupNode)).toBeNull()
})

/**
 * emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate
 * Skips template emit when documentTemplateId is blank.
 */
test('Test that emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate skips blank template ids', () => {
  const emitRenameGroup = vi.fn()
  const emitRenameDocumentTemplate = vi.fn()
  const blankTemplateNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
    ...templateNode,
    documentTemplateId: ''
  }
  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayName: 'Hero',
    emitRenameDocumentTemplate,
    emitRenameGroup,
    node: blankTemplateNode
  })
  expect(emitRenameDocumentTemplate).not.toHaveBeenCalled()

  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
    displayName: 'Ignored',
    emitRenameDocumentTemplate,
    emitRenameGroup,
    node: {
      ...groupNode,
      nodeKind: 'folder'
    } as unknown as typeof groupNode
  })
  expect(emitRenameGroup).not.toHaveBeenCalled()
})
