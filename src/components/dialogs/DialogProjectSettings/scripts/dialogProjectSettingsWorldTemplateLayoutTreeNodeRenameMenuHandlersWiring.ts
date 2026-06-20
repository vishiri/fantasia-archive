import { nextTick } from 'vue'
import type { Ref } from 'vue'
import type { QInput } from 'quasar'

import { clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocusWiring'
import {
  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftSeed
} from './functions/dialogProjectSettingsWorldTemplateLayoutRenameMenuNodeHelpers'
import { scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus } from './functions/scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring = {
  clearRenameMenuFocus: () => void
  closeRenameMenu: () => void
  onRenameDraftUpdate: (value: string | number | null) => void
  onRenameMenuBeforeShow: () => void
  onRenameMenuHide: () => void
  onRenameMenuShow: () => void
  openRenameMenu: () => void
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring (deps: {
  emitRenameGroup: (groupId: string, displayName: string) => void
  emitRenamePlacementNickname: (placementId: string, nickname: string) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  getRenameMenuTargetKey: () => string | null
  nodeAnchorRef: Ref<HTMLElement | null>
  openRenameMenuTarget: Ref<string | null>
  renameDraft: Ref<string>
  renameInputRef: Ref<QInput | null>
  setRenameMenuOpen: (open: boolean) => void
  syncRenameMenuMaxWidth: () => void
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring {
  function onRenameMenuBeforeShow (): void {
    deps.syncRenameMenuMaxWidth()
    const renameMenuTargetKey = deps.getRenameMenuTargetKey()
    if (renameMenuTargetKey !== null) {
      deps.openRenameMenuTarget.value = renameMenuTargetKey
    }
    deps.renameDraft.value = resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftSeed(deps.getNode())
  }

  function closeRenameMenu (): void {
    deps.setRenameMenuOpen(false)
  }

  function focusRenameMenuInput (): void {
    deps.renameInputRef.value?.focus()
  }

  function scheduleRenameMenuInputFocus (): void {
    scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus({
      focusRenameInput: focusRenameMenuInput,
      nextTick,
      requestAnimationFrame: (callback) => window.requestAnimationFrame(callback)
    })
  }

  function openRenameMenu (): void {
    onRenameMenuBeforeShow()
    deps.setRenameMenuOpen(true)
    scheduleRenameMenuInputFocus()
  }

  function clearRenameMenuFocus (): void {
    clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus(deps.nodeAnchorRef, {
      getOpenRenameMenuTargetKey: () => deps.openRenameMenuTarget.value,
      getRenameMenuTargetKey: deps.getRenameMenuTargetKey
    })
  }

  function onRenameMenuHide (): void {
    clearRenameMenuFocus()
  }

  function onRenameMenuShow (): void {
    scheduleRenameMenuInputFocus()
  }

  function onRenameDraftUpdate (value: string | number | null): void {
    const next = String(value ?? '')
    deps.renameDraft.value = next
    emitDialogProjectSettingsWorldTemplateLayoutRenameMenuDraftUpdate({
      displayName: next,
      emitRenameGroup: deps.emitRenameGroup,
      emitRenamePlacementNickname: deps.emitRenamePlacementNickname,
      node: deps.getNode()
    })
  }

  return {
    clearRenameMenuFocus,
    closeRenameMenu,
    onRenameDraftUpdate,
    onRenameMenuBeforeShow,
    onRenameMenuHide,
    onRenameMenuShow,
    openRenameMenu
  }
}
