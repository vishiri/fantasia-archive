import { inject, ref } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { QInput } from 'quasar'

import {
  createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState
} from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedWiring'
import { dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey } from './dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import { clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocusWiring'
import { wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchWiring'
import { emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate } from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring = {
  clearRenameMenuFocus: () => void
  closeRenameMenu: () => void
  contextMenuTestLocator: ComputedRef<string | undefined>
  menuOffset: [number, number]
  onRenameDraftUpdate: (value: string | number | null) => void
  onRenameMenuBeforeShow: () => void
  onRenameMenuHide: () => void
  renameDraft: Ref<string>
  renameHasError: ComputedRef<boolean>
  renameInputRef: Ref<QInput | null>
  renameInputTestLocator: ComputedRef<string | undefined>
  renameMenuErrorMessage: ComputedRef<string | undefined>
  renameMenuOpen: WritableComputedRef<boolean>
  supportsRenameMenu: ComputedRef<boolean>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring (deps: {
  emitRenameDocumentTemplate: (documentTemplateId: string, displayName: string) => void
  emitRenameGroup: (groupId: string, displayName: string) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  isGroupNameInvalid: (displayName: string) => boolean
  isTemplateNameInvalid: (displayName: string) => boolean
  nodeAnchorRef: Ref<HTMLElement | null>
  translateGroupNameErrorRequired: () => string
  translateTemplateNameErrorRequired: () => string
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring {
  const renameDraft = ref('')
  const renameInputRef = ref<QInput | null>(null)
  const menuOffset: [number, number] = [0, 4]

  const openRenameMenuTarget = inject(
    dialogProjectSettingsWorldTemplateLayoutOpenRenameMenuTargetKey,
    () => ref<string | null>(null),
    true
  )

  const computedState = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState({
    getNode: deps.getNode,
    isGroupNameInvalid: deps.isGroupNameInvalid,
    isTemplateNameInvalid: deps.isTemplateNameInvalid,
    openRenameMenuTarget,
    renameDraft,
    translateGroupNameErrorRequired: deps.translateGroupNameErrorRequired,
    translateTemplateNameErrorRequired: deps.translateTemplateNameErrorRequired
  })

  wireDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWatchers({
    getNodeLabel: () => deps.getNode().label,
    renameDraft,
    renameInputRef,
    renameMenuOpen: computedState.renameMenuOpen
  })

  function onRenameMenuBeforeShow (): void {
    if (computedState.renameMenuTargetKey.value !== null) {
      openRenameMenuTarget.value = computedState.renameMenuTargetKey.value
    }
    renameDraft.value = deps.getNode().label
  }

  function closeRenameMenu (): void {
    computedState.renameMenuOpen.value = false
  }

  function onRenameMenuHide (): void {
    clearRenameMenuFocus()
  }

  function clearRenameMenuFocus (): void {
    clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(deps.nodeAnchorRef)
  }

  function onRenameDraftUpdate (value: string | number | null): void {
    const next = String(value ?? '')
    renameDraft.value = next
    emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
      displayName: next,
      emitRenameDocumentTemplate: deps.emitRenameDocumentTemplate,
      emitRenameGroup: deps.emitRenameGroup,
      node: deps.getNode()
    })
  }

  const clearRenameMenuFocusBinding = clearRenameMenuFocus
  const closeRenameMenuBinding = closeRenameMenu
  const contextMenuTestLocatorBinding = computedState.contextMenuTestLocator
  const onRenameDraftUpdateBinding = onRenameDraftUpdate
  const onRenameMenuBeforeShowBinding = onRenameMenuBeforeShow
  const onRenameMenuHideBinding = onRenameMenuHide
  const renameDraftBinding = renameDraft
  const renameHasErrorBinding = computedState.renameHasError
  const renameInputRefBinding = renameInputRef
  const renameInputTestLocatorBinding = computedState.renameInputTestLocator
  const renameMenuErrorMessageBinding = computedState.renameMenuErrorMessage
  const renameMenuOpenBinding = computedState.renameMenuOpen
  const supportsRenameMenuBinding = computedState.supportsRenameMenu

  return {
    clearRenameMenuFocus: clearRenameMenuFocusBinding,
    closeRenameMenu: closeRenameMenuBinding,
    contextMenuTestLocator: contextMenuTestLocatorBinding,
    menuOffset,
    onRenameDraftUpdate: onRenameDraftUpdateBinding,
    onRenameMenuBeforeShow: onRenameMenuBeforeShowBinding,
    onRenameMenuHide: onRenameMenuHideBinding,
    renameDraft: renameDraftBinding,
    renameHasError: renameHasErrorBinding,
    renameInputRef: renameInputRefBinding,
    renameInputTestLocator: renameInputTestLocatorBinding,
    renameMenuErrorMessage: renameMenuErrorMessageBinding,
    renameMenuOpen: renameMenuOpenBinding,
    supportsRenameMenu: supportsRenameMenuBinding
  }
}
