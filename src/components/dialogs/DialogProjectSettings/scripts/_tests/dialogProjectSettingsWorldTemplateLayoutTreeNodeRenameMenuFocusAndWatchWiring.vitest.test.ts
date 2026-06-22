import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import type { QInput } from 'quasar'

import { clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocusWiring'
import { shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus } from '../functions/shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus'
import { scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus } from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuFocusWiring'
import { wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchWiring'

const closedRenameMenuClearFocusOptions = {
  getOpenRenameMenuTargetKey: () => null,
  getRenameMenuTargetKey: () => null
}

/**
 * clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus
 * Clears Quasar manual focus classes and blurs active elements.
 */
test('Test that rename menu focus wiring clears anchor and focus helper blur state', () => {
  const focusHelper = document.createElement('div')
  focusHelper.className = 'q-focus-helper'
  const anchor = document.createElement('div')
  anchor.classList.add('q-manual-focusable--focused')
  anchor.appendChild(focusHelper)
  document.body.appendChild(anchor)
  anchor.focus()

  clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(
    ref(anchor),
    closedRenameMenuClearFocusOptions
  )

  expect(anchor.classList.contains('q-manual-focusable--focused')).toBe(false)
  document.body.removeChild(anchor)
})

test('Test that rename menu focus wiring no-ops when anchor ref is null', () => {
  clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(
    ref(null),
    closedRenameMenuClearFocusOptions
  )
})

test('Test that rename menu hide skips active blur when another row menu is open', () => {
  const input = document.createElement('input')
  document.body.appendChild(input)
  input.focus()

  clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(ref(null), {
    getOpenRenameMenuTargetKey: () => 'group:other-row',
    getRenameMenuTargetKey: () => 'group:this-row'
  })

  expect(document.activeElement).toBe(input)
  document.body.removeChild(input)
})

/**
 * shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus
 * Blurs active element only when no other rename menu owns the shared target.
 */
test('Test that rename menu active blur guard allows blur when menu fully closed', () => {
  expect(shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus(null, 'group:a')).toBe(true)
  expect(shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus('group:a', 'group:a')).toBe(true)
  expect(shouldClearDialogProjectSettingsWorldTemplateLayoutRenameMenuActiveElementFocus('group:b', 'group:a')).toBe(false)
})

/**
 * scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus
 * Retries focus after nextTick and requestAnimationFrame.
 */
test('Test that rename menu input focus scheduler retries after animation frame', async () => {
  const focus = vi.fn()
  let rafCallback: FrameRequestCallback | undefined
  scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus({
    focusRenameInput: focus,
    nextTick,
    requestAnimationFrame: (callback) => {
      rafCallback = callback
      return 1
    }
  })

  await nextTick()
  expect(focus).toHaveBeenCalledTimes(1)
  rafCallback?.(0)
  await nextTick()
  expect(focus).toHaveBeenCalledTimes(2)
})

/**
 * wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers
 * Resets rename draft from node label when the rename menu is closed.
 */
test('Test that rename menu label watcher updates draft when menu is closed', async () => {
  const nodeLabel = ref('Old')
  const renameDraft = ref('Old')
  const renameMenuOpen = computed({
    get: () => false,
    set: () => {}
  })

  wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers({
    getRenameDraftSeed: () => nodeLabel.value,
    renameDraft,
    renameInputRef: ref(null),
    renameMenuOpen
  })

  nodeLabel.value = 'Updated label'
  await nextTick()
  expect(renameDraft.value).toBe('Updated label')
})

/**
 * wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers
 * Focuses rename input when menu opens.
 */
test('Test that rename menu open watcher focuses the rename input on next tick', async () => {
  const renameDraft = ref('')
  const isOpen = ref(false)
  const renameMenuOpen = computed({
    get: () => isOpen.value,
    set: (value: boolean) => {
      isOpen.value = value
    }
  })
  const focus = vi.fn()
  const renameInputRef = ref({
    focus
  } as unknown as QInput)

  wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers({
    getRenameDraftSeed: () => 'Label',
    renameDraft,
    renameInputRef,
    renameMenuOpen
  })

  isOpen.value = true
  await nextTick()
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      void nextTick().then(resolve)
    })
  })
  expect(focus).toHaveBeenCalled()
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring
 * Uses local open-target ref when provide is missing.
 */
test('Test that rename menu wiring inject fallback keeps a local open target ref', async () => {
  const { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring } = await import('../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring')
  const groupNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: null,
    icon: 'mdi-folder',
    id: '770e8400-e29b-41d4-a716-446655440001',
    label: 'Creatures',
    nodeKind: 'group' as const,
    nickname: '',
    templateDisplayName: '',
    usesNickname: false,
    worldAppendix: ''
  }
  let wiring!: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>
  const Child = defineComponent({
    setup () {
      wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring({
        emitRenameGroup: vi.fn(),
        emitRenamePlacementNickname: vi.fn(),
        getNode: () => groupNode,
        isGroupNameInvalid: () => false,
        nodeAnchorRef: ref(document.createElement('div')),
        translateGroupNameErrorRequired: () => 'Group required',
        translateGroupRenameInputLabel: () => 'Name of the group',
        translateTemplateCanonicalNameLabel: () => 'Document template name',
        translateTemplateCanonicalNameTooltip: () => 'Canonical tooltip',
        translateTemplateNicknameLabel: () => 'Nickname',
        translateTemplateNicknameTooltip: () => 'Nickname tooltip'
      })
      return () => h('div')
    }
  })

  mount(Child)
  await nextTick()
  wiring.onRenameMenuBeforeShow()
  expect(wiring.renameMenuOpen.value).toBe(true)
})
