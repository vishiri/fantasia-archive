import { computed, defineComponent, h, nextTick, ref, toRef } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import type { QTooltip } from 'quasar'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring'
import { clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocusWiring'
import { createUseDialogProjectSettingsWorldTemplateLayoutTreeNode } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeUseWiring'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError
} from '../functions/dialogProjectSettingsWorldTemplateLayoutTreeNodePresentation'
import {
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft,
  renameDialogProjectSettingsWorldTemplatePlacementNicknameDraft
} from '../dialogProjectSettingsWorldTemplateLayoutDraft'
import { dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey } from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

const groupNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
  children: [],
  documentCountInWorld: 0,
  documentTemplateId: null,
  icon: 'mdi-folder',
  id: 'group-a',
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
  documentTemplateId: 'template-a',
  icon: 'mdi-account',
  id: 'placement-a',
  label: 'Character',
  nickname: '',
  nodeKind: 'template',
  templateDisplayName: 'Character',
  usesNickname: false,
  worldAppendix: ''
}

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring
 * Dismisses tooltips and toggles hover enablement.
 */
test('Test that tree node action tooltip wiring dismisses and arms tooltips', () => {
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const editHide = vi.fn()
  const removeHide = vi.fn()
  wiring.editTooltipRef.value = { hide: editHide } as unknown as QTooltip
  wiring.removeTooltipRef.value = { hide: removeHide } as unknown as QTooltip

  wiring.dismissEditTooltip()
  wiring.dismissRemoveTooltip()
  expect(editHide).toHaveBeenCalled()
  expect(removeHide).toHaveBeenCalled()
  expect(wiring.editTooltipHoverEnabled.value).toBe(false)
  expect(wiring.removeTooltipHoverEnabled.value).toBe(false)

  wiring.armEditTooltip()
  wiring.armRemoveTooltip()
  expect(wiring.editTooltipHoverEnabled.value).toBe(true)
  expect(wiring.removeTooltipHoverEnabled.value).toBe(true)
})

test('Test that tree node action tooltip wiring dismiss no-ops when refs are null', () => {
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  wiring.dismissEditTooltip()
  wiring.dismissRemoveTooltip()
  expect(wiring.editTooltipHoverEnabled.value).toBe(false)
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring
 * Routes remove and rename interactions by node kind.
 */
test('Test that tree node interaction wiring removes groups and placements', () => {
  const actionTooltipsWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const emitDeleteGroup = vi.fn()
  const emitRemovePlacement = vi.fn()
  const openRenameMenu = vi.fn()
  const supportsRenameMenu = ref(true)

  const groupInteraction = createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring({
    actionTooltipsWiring,
    emitDeleteGroup,
    emitRemovePlacement,
    getNodeKind: () => 'group',
    renameMenuWiring: {
      openRenameMenu,
      supportsRenameMenu
    } as never
  })

  groupInteraction.onRemoveClick()
  expect(emitDeleteGroup).toHaveBeenCalled()
  expect(emitRemovePlacement).not.toHaveBeenCalled()

  const templateInteraction = createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring({
    actionTooltipsWiring,
    emitDeleteGroup,
    emitRemovePlacement,
    getNodeKind: () => 'template',
    renameMenuWiring: {
      openRenameMenu,
      supportsRenameMenu
    } as never
  })

  templateInteraction.onRemoveClick()
  expect(emitRemovePlacement).toHaveBeenCalled()
})

test('Test that tree node interaction wiring opens rename menu on edit and guarded context menu', () => {
  const actionTooltipsWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const openRenameMenu = vi.fn()
  const supportsRenameMenu = ref(false)

  const interaction = createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring({
    actionTooltipsWiring,
    emitDeleteGroup: vi.fn(),
    emitRemovePlacement: vi.fn(),
    getNodeKind: () => 'template',
    renameMenuWiring: {
      openRenameMenu,
      supportsRenameMenu
    } as never
  })

  interaction.onRenameContextMenu()
  expect(openRenameMenu).not.toHaveBeenCalled()

  supportsRenameMenu.value = true
  interaction.onRenameContextMenu()
  interaction.onEditClick()
  expect(openRenameMenu).toHaveBeenCalledTimes(2)
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring
 * Exposes template-only tooltip labels when canonical name row is shown.
 */
test('Test that rename menu labels wiring returns group vs template label sets', () => {
  const groupLabels = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring({
    getShowTemplateCanonicalName: () => false,
    translateGroupRenameInputLabel: () => 'Name of the group',
    translateTemplateCanonicalNameLabel: () => 'Document template name',
    translateTemplateCanonicalNameTooltip: () => 'Canonical tooltip',
    translateTemplateNicknameLabel: () => 'Nickname',
    translateTemplateNicknameTooltip: () => 'Nickname tooltip'
  })

  expect(groupLabels.renameInputLabel.value).toBe('Name of the group')
  expect(groupLabels.templateNicknameTooltipText.value).toBe('')
  expect(groupLabels.templateCanonicalNameTooltipText.value).toBe('')

  const templateLabels = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring({
    getShowTemplateCanonicalName: () => true,
    translateGroupRenameInputLabel: () => 'Name of the group',
    translateTemplateCanonicalNameLabel: () => 'Document template name',
    translateTemplateCanonicalNameTooltip: () => 'Canonical tooltip',
    translateTemplateNicknameLabel: () => 'Nickname',
    translateTemplateNicknameTooltip: () => 'Nickname tooltip'
  })

  expect(templateLabels.renameInputLabel.value).toBe('Nickname')
  expect(templateLabels.templateNicknameTooltipText.value).toBe('Nickname tooltip')
  expect(templateLabels.templateCanonicalNameTooltipText.value).toBe('Canonical tooltip')
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring
 * Computes rename menu width from anchor and action button geometry.
 */
test('Test that rename menu style wiring clears style when anchor is missing', () => {
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring({
    nodeAnchorRef: ref(null)
  })

  wiring.syncRenameMenuMaxWidth()
  expect(wiring.renameMenuStyle.value).toBeUndefined()
})

test('Test that rename menu style wiring measures anchor without actions element', () => {
  const anchor = document.createElement('div')
  Object.defineProperty(anchor, 'clientWidth', {
    configurable: true,
    value: 400
  })
  anchor.getBoundingClientRect = () => ({
    bottom: 0,
    height: 0,
    left: 100,
    right: 0,
    toJSON: () => ({}),
    top: 0,
    width: 400,
    x: 100,
    y: 0
  })

  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring({
    nodeAnchorRef: ref(anchor)
  })

  wiring.syncRenameMenuMaxWidth()
  expect(wiring.renameMenuStyle.value?.width).toBe('336px')
})

test('Test that rename menu style wiring measures anchor with actions element', () => {
  const anchor = document.createElement('div')
  const actions = document.createElement('div')
  actions.className = 'dialogProjectSettingsWorldTemplateLayoutTreeNode__actions'
  anchor.appendChild(actions)
  Object.defineProperty(anchor, 'clientWidth', {
    configurable: true,
    value: 500
  })
  anchor.getBoundingClientRect = () => ({
    bottom: 0,
    height: 0,
    left: 50,
    right: 0,
    toJSON: () => ({}),
    top: 0,
    width: 500,
    x: 50,
    y: 0
  })
  actions.getBoundingClientRect = () => ({
    bottom: 0,
    height: 0,
    left: 420,
    right: 0,
    toJSON: () => ({}),
    top: 0,
    width: 80,
    x: 420,
    y: 0
  })

  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring({
    nodeAnchorRef: ref(anchor)
  })

  wiring.syncRenameMenuMaxWidth()
  expect(wiring.renameMenuStyle.value?.width).toBe('358px')
})

test('Test that rename menu focus wiring blurs document active element', () => {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.focus()
  expect(document.activeElement).toBe(input)

  clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(ref(null), {
    getOpenRenameMenuTargetKey: () => null,
    getRenameMenuTargetKey: () => null
  })

  expect(document.activeElement).not.toBe(input)
  document.body.removeChild(input)
})

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError
 * Covers unsupported node kinds and empty template ids.
 */
test('Test that tree node validation helper handles group blank and template duplicate states', () => {
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError({
    blankGroupIds: new Set(['group-a']),
    node: groupNode
  })).toBe(true)

  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError({
    duplicateDocumentTemplateIds: new Set(['template-a']),
    node: templateNode
  })).toBe(true)

  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError({
    invalidDocumentTemplateIds: new Set(['template-a']),
    node: templateNode
  })).toBe(true)

  const unsupportedNode = {
    ...groupNode,
    nodeKind: 'folder'
  } as unknown as I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError({
    node: unsupportedNode
  })).toBe(false)

  const missingTemplateIdNode = {
    ...templateNode,
    documentTemplateId: null
  }
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError({
    duplicateDocumentTemplateIds: new Set(['template-a']),
    node: missingTemplateIdNode
  })).toBe(false)
})

test('Test that rename placement nickname draft leaves non-matching placements unchanged', () => {
  const layout = createEmptyDialogProjectSettingsWorldTemplateLayoutDraft()
  layout.placements = [
    {
      documentCountInWorld: 0,
      documentTemplateId: 'template-a',
      groupId: null,
      groupSortOrder: null,
      icon: 'mdi-account',
      id: 'placement-a',
      nickname: '',
      rootSortOrder: 0,
      templateDisplayName: 'Character',
      worldAppendix: ''
    }
  ]

  const renamed = renameDialogProjectSettingsWorldTemplatePlacementNicknameDraft(
    layout,
    'other-placement',
    'Ignored'
  )
  expect(renamed.placements[0]?.nickname).toBe('')
})

/**
 * createUseDialogProjectSettingsWorldTemplateLayoutTreeNode
 * Wires full tree node composable API for group nodes.
 */
test('Test that tree node use wiring composes presentation and rename handlers', async () => {
  const openRenameMenuTarget = ref<string | null>(null)
  const emitRenameGroup = vi.fn()
  const emitDeleteGroup = vi.fn()
  const useTreeNode = createUseDialogProjectSettingsWorldTemplateLayoutTreeNode({
    computed,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    ref,
    toRef
  })

  let api!: ReturnType<typeof useTreeNode>
  const Child = defineComponent({
    setup () {
      api = useTreeNode(
        { node: groupNode },
        ((event: string, ...args: unknown[]) => {
          if (event === 'renameGroup') {
            emitRenameGroup(...args)
          }
          if (event === 'deleteGroup') {
            emitDeleteGroup(...args)
          }
        }) as never
      )
      return () => h('div')
    }
  })

  mount(Child, {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })
  await nextTick()

  expect(api.nodeTestLocator.value).toContain('group-a')
  api.onEditClick()
  expect(openRenameMenuTarget.value).toContain('group-a')
  api.onRemoveClick()
  expect(emitDeleteGroup).toHaveBeenCalledWith('group-a')
})
