import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { expect, test, vi } from 'vitest'

/* eslint-disable vue/one-component-per-file -- inject must be resolved from a mounted component setup */
import {
  buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey,
  dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey
} from '../dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring } from '../dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring'
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
  worldAppendix: ' of Eldoria'
}

function mountRenameMenuHarness (node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode): Promise<{
  emitRenameDocumentTemplate: ReturnType<typeof vi.fn>
  emitRenameGroup: ReturnType<typeof vi.fn>
  nodeRef: ReturnType<typeof ref<I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode>>
  openRenameMenuTarget: ReturnType<typeof ref<string | null>>
  wiring: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>
}> {
  const nodeRef = ref(node)
  const openRenameMenuTarget = ref<string | null>(null)
  const emitRenameGroup = vi.fn()
  const emitRenameDocumentTemplate = vi.fn()
  let wiring!: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>

  const Child = defineComponent({
    name: 'RenameMenuChild',
    setup () {
      const nodeAnchorRef = ref<HTMLElement | null>(document.createElement('div'))
      wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring({
        emitRenameDocumentTemplate,
        emitRenameGroup,
        getNode: () => nodeRef.value,
        isGroupNameInvalid: (displayName) => displayName.trim().length === 0,
        isTemplateNameInvalid: (displayName) => displayName.trim().length === 0,
        nodeAnchorRef,
        translateGroupNameErrorRequired: () => 'Group name required',
        translateTemplateNameErrorRequired: () => 'Template name required'
      })
      return () => h('div')
    }
  })

  const Parent = defineComponent({
    name: 'RenameMenuParent',
    setup () {
      return () => h(Child)
    }
  })

  return new Promise((resolve) => {
    mount(Parent, {
      global: {
        provide: {
          [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
        }
      }
    })
    void nextTick().then(() => {
      resolve({
        emitRenameDocumentTemplate,
        emitRenameGroup,
        nodeRef,
        openRenameMenuTarget,
        wiring
      })
    })
  })
}

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring
 * Opens and closes the shared rename menu for group nodes.
 */
test('Test that createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring renames groups through the shared menu', async () => {
  const harness = await mountRenameMenuHarness(groupNode)
  const targetKey = buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey('group', groupNode.id)

  expect(harness.wiring.supportsRenameMenu.value).toBe(true)
  expect(harness.wiring.contextMenuTestLocator.value).toBe(
    'dialogProjectSettings-worldTemplateLayoutGroupContextMenu'
  )

  harness.wiring.onRenameMenuBeforeShow()
  expect(harness.openRenameMenuTarget.value).toBe(targetKey)
  expect(harness.wiring.renameDraft.value).toBe('Creatures')

  harness.wiring.renameMenuOpen.value = true
  harness.wiring.onRenameDraftUpdate('Dragons')
  expect(harness.emitRenameGroup).toHaveBeenCalledWith(groupNode.id, 'Dragons')

  harness.nodeRef.value = {
    ...groupNode,
    label: 'Updated label'
  }
  await nextTick()
  expect(harness.wiring.renameDraft.value).toBe('Dragons')

  harness.wiring.closeRenameMenu()
  expect(harness.openRenameMenuTarget.value).toBeNull()
  harness.wiring.onRenameMenuHide()
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring
 * Renames document templates by documentTemplateId, not placement id.
 */
test('Test that createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring renames templates by documentTemplateId', async () => {
  const harness = await mountRenameMenuHarness(templateNode)

  expect(harness.wiring.supportsRenameMenu.value).toBe(true)
  expect(harness.wiring.renameInputTestLocator.value).toBe(
    'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput'
  )

  harness.wiring.onRenameMenuBeforeShow()
  harness.wiring.onRenameDraftUpdate('Hero')
  expect(harness.emitRenameDocumentTemplate).toHaveBeenCalledWith(
    templateNode.documentTemplateId,
    'Hero'
  )

  harness.wiring.renameMenuOpen.value = true
  harness.wiring.onRenameDraftUpdate('')
  expect(harness.wiring.renameHasError.value).toBe(true)
  expect(harness.wiring.renameMenuErrorMessage.value).toBe('Template name required')
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring
 * No-ops menu hooks when the node does not support rename.
 */
test('Test that rename menu wiring ignores unsupported nodes', async () => {
  const unsupportedNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: null,
    icon: 'mdi-folder',
    id: '770e8400-e29b-41d4-a716-446655440099',
    label: 'Unsupported',
    nodeKind: 'folder',
    worldAppendix: ''
  } as unknown as I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  const nodeRef = ref(unsupportedNode)
  const openRenameMenuTarget = ref<string | null>(null)
  const emitRenameGroup = vi.fn()
  let wiring!: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>

  const Child = defineComponent({
    name: 'UnsupportedRenameMenuChild',
    setup () {
      wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring({
        emitRenameDocumentTemplate: vi.fn(),
        emitRenameGroup,
        getNode: () => nodeRef.value,
        isGroupNameInvalid: () => false,
        isTemplateNameInvalid: () => false,
        nodeAnchorRef: ref(document.createElement('div')),
        translateGroupNameErrorRequired: () => 'Group required',
        translateTemplateNameErrorRequired: () => 'Template required'
      })
      return () => h('div')
    }
  })

  mount(defineComponent({
    setup: () => () => h(Child)
  }), {
    global: {
      provide: {
        [dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey as symbol]: openRenameMenuTarget
      }
    }
  })
  await nextTick()

  wiring.onRenameMenuBeforeShow()
  expect(openRenameMenuTarget.value).toBeNull()
  wiring.onRenameDraftUpdate('Ignored')
  expect(emitRenameGroup).not.toHaveBeenCalled()
  wiring.closeRenameMenu()
  wiring.onRenameMenuHide()
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring
 * Skips template rename when documentTemplateId is missing.
 */
test('Test that createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring skips templates without documentTemplateId', async () => {
  const missingTemplateIdNode: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode = {
    children: [],
    documentCountInWorld: 0,
    documentTemplateId: null,
    icon: 'mdi-account',
    id: '880e8400-e29b-41d4-a716-446655440099',
    label: 'Broken',
    nodeKind: 'template',
    worldAppendix: ''
  }
  const harness = await mountRenameMenuHarness(missingTemplateIdNode)

  harness.wiring.onRenameDraftUpdate('Hero')
  expect(harness.emitRenameDocumentTemplate).not.toHaveBeenCalled()
})
