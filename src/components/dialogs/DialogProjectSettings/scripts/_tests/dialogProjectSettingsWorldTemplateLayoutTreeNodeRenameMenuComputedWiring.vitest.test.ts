import { ref } from 'vue'
import { expect, test } from 'vitest'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedWiring'
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

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState
 * Returns closed rename menu state when the node does not support rename.
 */
test('Test that rename menu computed state ignores unsupported node kinds', () => {
  const unsupportedNode = {
    ...groupNode,
    nodeKind: 'folder'
  } as unknown as I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  const openRenameMenuTarget = ref<string | null>(null)
  const computedState = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState({
    getNode: () => unsupportedNode,
    isGroupNameInvalid: () => false,
    openRenameMenuTarget,
    renameTranslationsDraft: ref({}),
    translateGroupNameErrorRequired: () => 'Group required'
  })

  expect(computedState.supportsRenameMenu.value).toBe(false)
  expect(computedState.renameMenuOpen.value).toBe(false)
  computedState.renameMenuOpen.value = true
  expect(openRenameMenuTarget.value).toBeNull()
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState
 * Closes rename menu only when the open target matches this node.
 */
test('Test that rename menu computed state closes only the active open target', () => {
  const openRenameMenuTarget = ref<string | null>('group:other-id')
  const computedState = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState({
    getNode: () => groupNode,
    isGroupNameInvalid: (displayNameTranslations) => (displayNameTranslations['en-US'] ?? '').trim().length === 0,
    openRenameMenuTarget,
    renameTranslationsDraft: ref({ 'en-US': 'Creatures' }),
    translateGroupNameErrorRequired: () => 'Group required'
  })

  computedState.renameMenuOpen.value = false
  expect(openRenameMenuTarget.value).toBe('group:other-id')
})
