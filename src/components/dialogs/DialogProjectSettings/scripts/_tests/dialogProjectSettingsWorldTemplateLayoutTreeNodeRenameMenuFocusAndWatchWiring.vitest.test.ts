import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'
import type { QInput } from 'quasar'

import { clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocusWiring'
import { wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchWiring'

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

  clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(ref(anchor))

  expect(anchor.classList.contains('q-manual-focusable--focused')).toBe(false)
  document.body.removeChild(anchor)
})

test('Test that rename menu focus wiring no-ops when anchor ref is null', () => {
  clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(ref(null))
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
    getNodeLabel: () => nodeLabel.value,
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
    getNodeLabel: () => 'Label',
    renameDraft,
    renameInputRef,
    renameMenuOpen
  })

  isOpen.value = true
  await nextTick()
  await nextTick()
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
    worldAppendix: ''
  }
  let wiring!: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>
  const Child = defineComponent({
    setup () {
      wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring({
        emitRenameDocumentTemplate: vi.fn(),
        emitRenameGroup: vi.fn(),
        getNode: () => groupNode,
        isGroupNameInvalid: () => false,
        isTemplateNameInvalid: () => false,
        nodeAnchorRef: ref(document.createElement('div')),
        translateGroupNameErrorRequired: () => 'Group required',
        translateTemplateNameErrorRequired: () => 'Template required'
      })
      return () => h('div')
    }
  })

  mount(Child)
  await nextTick()
  wiring.onRenameMenuBeforeShow()
  expect(wiring.renameMenuOpen.value).toBe(true)
})
