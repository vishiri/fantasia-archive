import { computed } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'

import {
  buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey
} from './dialogProjectSettingsWorldTemplateLayoutRenameMenuProvide'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage
} from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState = {
  contextMenuTestLocator: ComputedRef<string | undefined>
  renameHasError: ComputedRef<boolean>
  renameInputTestLocator: ComputedRef<string | undefined>
  renameMenuErrorMessage: ComputedRef<string | undefined>
  renameMenuOpen: WritableComputedRef<boolean>
  renameMenuTargetKey: ComputedRef<string | null>
  supportsRenameMenu: ComputedRef<boolean>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState (deps: {
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  isGroupNameInvalid: (displayName: string) => boolean
  isTemplateNameInvalid: (displayName: string) => boolean
  openRenameMenuTarget: Ref<string | null>
  renameDraft: Ref<string>
  translateGroupNameErrorRequired: () => string
  translateTemplateNameErrorRequired: () => string
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuComputedState {
  const renameMenuTargetKey = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    if (nodeKind === null) {
      return null
    }
    return buildDialogProjectSettingsWorldTemplateLayoutRenameMenuTargetKey(
      nodeKind,
      deps.getNode().id
    )
  })

  const supportsRenameMenu = computed(() => renameMenuTargetKey.value !== null)

  const renameMenuOpen = computed({
    get (): boolean {
      if (renameMenuTargetKey.value === null) {
        return false
      }
      return deps.openRenameMenuTarget.value === renameMenuTargetKey.value
    },
    set (open: boolean): void {
      if (renameMenuTargetKey.value === null) {
        return
      }
      if (open) {
        deps.openRenameMenuTarget.value = renameMenuTargetKey.value
        return
      }
      if (deps.openRenameMenuTarget.value === renameMenuTargetKey.value) {
        deps.openRenameMenuTarget.value = null
      }
    }
  })

  const contextMenuTestLocator = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators(nodeKind)
      .contextMenuTestLocator
  })

  const renameInputTestLocator = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTestLocators(nodeKind)
      .renameInputTestLocator
  })

  const renameHasError = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuHasError({
      displayName: deps.renameDraft.value,
      isGroupNameInvalid: deps.isGroupNameInvalid,
      isTemplateNameInvalid: deps.isTemplateNameInvalid,
      nodeKind
    })
  })

  const renameMenuErrorMessage = computed(() => {
    const nodeKind = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuNodeKind(deps.getNode())
    return resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuValidationErrorMessage({
      displayName: deps.renameDraft.value,
      isGroupNameInvalid: deps.isGroupNameInvalid,
      isTemplateNameInvalid: deps.isTemplateNameInvalid,
      nodeKind,
      translateGroupNameErrorRequired: deps.translateGroupNameErrorRequired,
      translateTemplateNameErrorRequired: deps.translateTemplateNameErrorRequired
    })
  })

  const contextMenuTestLocatorBinding = contextMenuTestLocator
  const renameHasErrorBinding = renameHasError
  const renameInputTestLocatorBinding = renameInputTestLocator
  const renameMenuErrorMessageBinding = renameMenuErrorMessage
  const renameMenuOpenBinding = renameMenuOpen
  const renameMenuTargetKeyBinding = renameMenuTargetKey
  const supportsRenameMenuBinding = supportsRenameMenu

  return {
    contextMenuTestLocator: contextMenuTestLocatorBinding,
    renameHasError: renameHasErrorBinding,
    renameInputTestLocator: renameInputTestLocatorBinding,
    renameMenuErrorMessage: renameMenuErrorMessageBinding,
    renameMenuOpen: renameMenuOpenBinding,
    renameMenuTargetKey: renameMenuTargetKeyBinding,
    supportsRenameMenu: supportsRenameMenuBinding
  }
}
