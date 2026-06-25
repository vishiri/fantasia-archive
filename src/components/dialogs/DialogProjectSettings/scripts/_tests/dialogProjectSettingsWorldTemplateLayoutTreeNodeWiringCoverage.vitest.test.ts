/* eslint-disable vue/one-component-per-file -- colocated harness components for composable mounts */

import { computed, defineComponent, h, nextTick, ref, toRef, watch } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import type { QTooltip } from 'quasar'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import { FA_Q_TOOLTIP_DELAY_MS } from 'app/src/scripts/appGlobalManagementUI/faQTooltipDelay_manager'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring'
import { clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocusWiring'
import { createUseDialogProjectSettingsWorldTemplateLayoutTreeNode } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeUseWiring'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip
} from '../functions/dialogProjectSettingsWorldTemplateLayoutTreeNodePresentation'
import {
  createEmptyDialogProjectSettingsWorldTemplateLayoutDraft,
  renameDialogProjectSettingsWorldTemplatePlacementNicknameTranslationsDraft
} from '../dialogProjectSettingsWorldTemplateLayoutDraft'
import { dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey } from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
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

test('Test that tree node action tooltip wiring suppresses placement nickname hover tooltip', async () => {
  vi.useFakeTimers()
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const nicknameHide = vi.fn()
  const nicknameShow = vi.fn()
  wiring.placementNicknameHoverTooltipRef.value = {
    hide: nicknameHide,
    show: nicknameShow
  } as unknown as QTooltip

  wiring.suppressPlacementNicknameHoverTooltip()
  expect(nicknameHide).toHaveBeenCalled()
  expect(wiring.placementNicknameHoverTooltipEnabled.value).toBe(false)

  wiring.armPlacementNicknameHoverTooltip()
  expect(wiring.placementNicknameHoverTooltipEnabled.value).toBe(true)

  wiring.revealPlacementNicknameHoverTooltip()
  expect(nicknameShow).not.toHaveBeenCalled()
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).toHaveBeenCalled()

  wiring.hidePlacementNicknameHoverTooltip()
  expect(nicknameHide).toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that tree node action tooltip wiring skips reveal while rename menu is open', async () => {
  vi.useFakeTimers()
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring({
    getRenameMenuOpen: () => true
  })
  const nicknameShow = vi.fn()
  wiring.placementNicknameHoverTooltipRef.value = {
    hide: vi.fn(),
    show: nicknameShow
  } as unknown as QTooltip

  wiring.revealPlacementNicknameHoverTooltip()
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that tree node action tooltip wiring skips show inside nextTick when hover was disabled', async () => {
  vi.useFakeTimers()
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const nicknameShow = vi.fn()
  wiring.placementNicknameHoverTooltipRef.value = {
    hide: vi.fn(),
    show: nicknameShow
  } as unknown as QTooltip

  wiring.revealPlacementNicknameHoverTooltip()
  wiring.placementNicknameHoverTooltipEnabled.value = false
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that tree node action tooltip wiring clears pending reveal timer on hide', async () => {
  vi.useFakeTimers()
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const nicknameShow = vi.fn()
  wiring.placementNicknameHoverTooltipRef.value = {
    hide: vi.fn(),
    show: nicknameShow
  } as unknown as QTooltip

  wiring.revealPlacementNicknameHoverTooltip()
  wiring.hidePlacementNicknameHoverTooltip()
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that tree node action tooltip wiring skips show when hover is disabled after delay', async () => {
  vi.useFakeTimers()
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const nicknameShow = vi.fn()
  wiring.placementNicknameHoverTooltipRef.value = {
    hide: vi.fn(),
    show: nicknameShow
  } as unknown as QTooltip

  wiring.revealPlacementNicknameHoverTooltip()
  wiring.suppressPlacementNicknameHoverTooltip()
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).not.toHaveBeenCalled()
  vi.useRealTimers()
})

test('Test that tree node action tooltip wiring reveals nickname tooltip when enabled', async () => {
  vi.useFakeTimers()
  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring()
  const nicknameShow = vi.fn()
  wiring.placementNicknameHoverTooltipRef.value = {
    hide: vi.fn(),
    show: nicknameShow
  } as unknown as QTooltip

  wiring.revealPlacementNicknameHoverTooltip()
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).toHaveBeenCalled()

  wiring.revealPlacementNicknameHoverTooltip()
  wiring.placementNicknameHoverTooltipRef.value = null
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).toHaveBeenCalledTimes(1)
  vi.useRealTimers()
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
    getHasMenuPinnedAside: () => false,
    getUsesSingularPluralRenameMenu: () => false,
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
    getHasMenuPinnedAside: () => false,
    getUsesSingularPluralRenameMenu: () => false,
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
    getHasMenuPinnedAside: () => false,
    getUsesSingularPluralRenameMenu: () => false,
    nodeAnchorRef: ref(anchor)
  })

  wiring.syncRenameMenuMaxWidth()
  expect(wiring.renameMenuStyle.value?.width).toBe('358px')
})

test('Test that rename menu style wiring adds pinned aside and singular plural width', () => {
  const anchor = document.createElement('div')
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

  const wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuStyleWiring({
    getHasMenuPinnedAside: () => true,
    getUsesSingularPluralRenameMenu: () => true,
    nodeAnchorRef: ref(anchor)
  })

  wiring.syncRenameMenuMaxWidth()
  expect(wiring.renameMenuStyle.value?.width).toBe('788px')
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

test('Test that rename menu focus wiring skips blurring active element when another menu is open', () => {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.focus()

  clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(ref(null), {
    getOpenRenameMenuTargetKey: () => 'other-node',
    getRenameMenuTargetKey: () => 'this-node'
  })

  expect(document.activeElement).toBe(input)
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

/**
 * resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines
 * Builds nickname hover tooltip lines only when placement uses a nickname.
 */
test('Test that placement nickname hover tooltip helper formats lines only for nicknamed templates', () => {
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip(templateNode)).toBe(false)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines({
    nicknameLabel: 'Nickname',
    node: templateNode,
    originalNameLabel: 'Original name',
    resolvedNickname: ''
  })).toBeNull()

  const nicknamedNode = {
    ...templateNode,
    nicknamePluralTranslations: { 'en-US': 'Alias' },
    nicknameSingularTranslations: {},
    usesNickname: true
  }
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip(nicknamedNode)).toBe(true)
  expect(resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines({
    nicknameLabel: 'Nickname',
    node: nicknamedNode,
    originalNameLabel: 'Original name',
    resolvedNickname: 'Alias'
  })).toEqual({
    nicknameLine: 'Nickname - Alias',
    originalNameLine: 'Original name - Character'
  })
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
      nicknamePluralTranslations: {},
      nicknameSingularTranslations: {},
      rootSortOrder: 0,
      templateDisplayName: 'Character',
      worldAppendix: ''
    }
  ]

  const renamed = renameDialogProjectSettingsWorldTemplatePlacementNicknameTranslationsDraft(layout, 'other-placement', {
    plural: { 'en-US': 'Ignored' },
    singular: {}
  })
  expect(renamed.placements[0]?.nicknamePluralTranslations).toEqual({})
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
    toRef,
    watch
  })

  let api!: ReturnType<typeof useTreeNode>
  const Child = defineComponent({
    setup () {
      api = useTreeNode(
        {
          currentLanguageCode: 'en-US',
          documentTemplates: [],
          node: groupNode
        },
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
  api.onRenameTranslationsDraftUpdate({ 'en-US': 'Updated group' })
  expect(emitRenameGroup).toHaveBeenCalledWith('group-a', { 'en-US': 'Updated group' })
})

test('Test that tree node use wiring emits placement nickname rename for template nodes', async () => {
  const emitRenamePlacementNickname = vi.fn()
  const useTreeNode = createUseDialogProjectSettingsWorldTemplateLayoutTreeNode({
    computed,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    ref,
    toRef,
    watch
  })

  let api!: ReturnType<typeof useTreeNode>
  const Child = defineComponent({
    setup () {
      api = useTreeNode(
        {
          currentLanguageCode: 'en-US',
          documentTemplates: [],
          node: templateNode
        },
        ((event: string, ...args: unknown[]) => {
          if (event === 'renamePlacementNickname') {
            emitRenamePlacementNickname(...args)
          }
        }) as never
      )
      return () => h('div')
    }
  })

  mount(Child)
  await nextTick()

  api.onRenameTranslationsDraftUpdate({
    plural: { 'en-US': 'Hero' },
    singular: { 'en-US': 'Hero' }
  })
  expect(emitRenamePlacementNickname).toHaveBeenCalledWith('placement-a', {
    plural: { 'en-US': 'Hero' },
    singular: { 'en-US': 'Hero' }
  })
})

test('Test that tree node use wiring suppresses nickname hover tooltip while rename menu is open', async () => {
  vi.useFakeTimers()
  const openRenameMenuTarget = ref<string | null>(null)
  const nicknamedNode = {
    ...templateNode,
    nicknamePluralTranslations: { 'en-US': 'Alias' },
    nicknameSingularTranslations: {},
    usesNickname: true
  }
  const useTreeNode = createUseDialogProjectSettingsWorldTemplateLayoutTreeNode({
    computed,
    i18n: {
      global: {
        t: (key: string) => key
      }
    },
    ref,
    toRef,
    watch
  })

  let api!: ReturnType<typeof useTreeNode>
  const Child = defineComponent({
    setup () {
      api = useTreeNode(
        {
          currentLanguageCode: 'en-US',
          documentTemplates: [],
          node: nicknamedNode
        },
        vi.fn() as never
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

  const nicknameShow = vi.fn()
  api.placementNicknameHoverTooltipRef.value = {
    hide: vi.fn(),
    show: nicknameShow
  } as unknown as QTooltip

  api.onEditClick()
  expect(api.renameMenuOpen.value).toBe(true)
  api.revealPlacementNicknameHoverTooltip()
  await vi.advanceTimersByTimeAsync(FA_Q_TOOLTIP_DELAY_MS)
  await nextTick()
  expect(nicknameShow).not.toHaveBeenCalled()
  vi.useRealTimers()
})
