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
  nicknamePluralTranslations: { 'en-US': 'Alias' },
  nicknameSingularTranslations: {},
  nodeKind: 'template',
  templateDisplayName: 'Character',
  usesNickname: true,
  worldAppendix: 'of Eldoria'
}

function mountRenameMenuHarness (node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode): Promise<{
  emitRenameGroup: ReturnType<typeof vi.fn>
  emitRenamePlacementNickname: ReturnType<typeof vi.fn>
  nodeRef: ReturnType<typeof ref<I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode>>
  openRenameMenuTarget: ReturnType<typeof ref<string | null>>
  wiring: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>
}> {
  const nodeRef = ref(node)
  const openRenameMenuTarget = ref<string | null>(null)
  const emitRenameGroup = vi.fn()
  const emitRenamePlacementNickname = vi.fn()
  let wiring!: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>

  const Child = defineComponent({
    name: 'RenameMenuChild',
    setup () {
      const nodeAnchorRef = ref<HTMLElement | null>(document.createElement('div'))
      Object.defineProperty(nodeAnchorRef.value, 'clientWidth', {
        configurable: true,
        value: 500
      })
      wiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring({
        emitRenameGroup,
        emitRenamePlacementNickname,
        getNode: () => nodeRef.value,
        isGroupNameInvalid: (displayNameTranslations) => (displayNameTranslations['en-US'] ?? '').trim().length === 0,
        nodeAnchorRef,
        translateGroupNameErrorRequired: () => 'Group name required',
        translateGroupRenameInputLabel: () => 'Name of the group',
        translateTemplateCanonicalNameLabel: () => 'Document template name',
        translateTemplateCanonicalNameTooltip: () => 'Canonical tooltip',
        translateTemplateNicknameLabel: () => 'Nickname',
        translateTemplateNicknameTooltip: () => 'Nickname tooltip'
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
        emitRenameGroup,
        emitRenamePlacementNickname,
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
  expect(harness.wiring.showTemplatePinnedAside.value).toBe(false)
  expect(harness.wiring.renameInputLabel.value).toBe('Name of the group')
  expect(harness.wiring.templateCanonicalName.value).toBe('')

  harness.wiring.onRenameMenuBeforeShow()
  expect(harness.openRenameMenuTarget.value).toBe(targetKey)
  expect(harness.wiring.renameTranslationsDraft.value).toEqual({ 'en-US': 'Creatures' })

  harness.wiring.renameMenuOpen.value = true
  harness.wiring.onRenameTranslationsDraftUpdate({ 'en-US': 'Dragons' })
  expect(harness.emitRenameGroup).toHaveBeenCalledWith(groupNode.id, { 'en-US': 'Dragons' })

  harness.nodeRef.value = {
    ...groupNode,
    label: 'Updated label'
  }
  await nextTick()
  expect(harness.wiring.renameTranslationsDraft.value).toEqual({ 'en-US': 'Dragons' })

  harness.wiring.closeRenameMenu()
  expect(harness.openRenameMenuTarget.value).toBeNull()
  harness.wiring.onRenameMenuHide()
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring
 * openRenameMenu syncs draft and opens the shared menu target.
 */
test('Test that createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring openRenameMenu opens shared target', async () => {
  const harness = await mountRenameMenuHarness(groupNode)
  const targetKey = buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey('group', groupNode.id)

  harness.wiring.openRenameMenu()
  expect(harness.openRenameMenuTarget.value).toBe(targetKey)
  expect(harness.wiring.renameTranslationsDraft.value).toEqual({ 'en-US': 'Creatures' })
  expect(harness.wiring.renameMenuOpen.value).toBe(true)
})

/**
 * createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring
 * Renames placements by placement id and allows empty nicknames.
 */
test('Test that createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring renames placement nicknames', async () => {
  const harness = await mountRenameMenuHarness(templateNode)

  expect(harness.wiring.supportsRenameMenu.value).toBe(true)
  expect(harness.wiring.renameInputTestLocator.value).toBe(
    'dialogProjectSettings-worldTemplateLayoutTemplateRenameInput'
  )
  expect(harness.wiring.showTemplatePinnedAside.value).toBe(true)
  expect(harness.wiring.templateCanonicalName.value).toBe('Character')
  expect(harness.wiring.templateNicknameTooltipText.value).toBe('Nickname tooltip')
  expect(harness.wiring.templateCanonicalNameTooltipText.value).toBe('Canonical tooltip')

  harness.wiring.onRenameMenuBeforeShow()
  expect(harness.wiring.renameTranslationsDraft.value).toEqual({
    plural: { 'en-US': 'Alias' },
    singular: {}
  })
  harness.wiring.onRenameTranslationsDraftUpdate({
    plural: { 'en-US': 'Hero' },
    singular: {}
  })
  expect(harness.emitRenamePlacementNickname).toHaveBeenCalledWith(
    templateNode.id,
    {
      plural: { 'en-US': 'Hero' },
      singular: {}
    }
  )

  harness.wiring.renameMenuOpen.value = true
  harness.wiring.onRenameTranslationsDraftUpdate({
    plural: {},
    singular: {}
  })
  expect(harness.wiring.renameHasError.value).toBe(false)
  expect(harness.wiring.renameMenuErrorMessage.value).toBeUndefined()
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
        emitRenameGroup,
        emitRenamePlacementNickname: vi.fn(),
        getNode: () => nodeRef.value,
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
  expect(wiring.renameInputTestLocatorValue.value).toBe(
    'dialogProjectSettings-worldTemplateLayoutRenameInput'
  )
  wiring.onRenameTranslationsDraftUpdate({ 'en-US': 'Ignored' })
  expect(emitRenameGroup).not.toHaveBeenCalled()
  wiring.closeRenameMenu()
  wiring.onRenameMenuHide()
})

test('Test that rename menu draft update coalesces null model values to empty string', async () => {
  const harness = await mountRenameMenuHarness(groupNode)
  harness.wiring.onRenameTranslationsDraftUpdate({})
  expect(harness.emitRenameGroup).toHaveBeenCalledWith(groupNode.id, {})
})

test('Test that rename menu before-show caps max width from anchor minus action buttons', async () => {
  const harness = await mountRenameMenuHarness(groupNode)

  harness.wiring.onRenameMenuBeforeShow()
  expect(harness.wiring.renameMenuStyle.value).toEqual({
    maxWidth: '436px',
    minWidth: '436px',
    width: '436px'
  })
})
