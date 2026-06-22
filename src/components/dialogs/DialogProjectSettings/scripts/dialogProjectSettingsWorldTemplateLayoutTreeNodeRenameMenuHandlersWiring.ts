import type { Ref } from 'vue'

import { clearDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocus } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuFocusWiring'
import {
  emitDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsUpdate,
  resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed
} from './dialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsWiring'
import type { T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring = {
  clearRenameMenuFocus: () => void
  closeRenameMenu: () => void
  onRenameMenuBeforeShow: () => void
  onRenameMenuHide: () => void
  onRenameMenuShow: () => void
  onRenameTranslationsDraftUpdate: (
    value: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
  ) => void
  openRenameMenu: () => void
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring (deps: {
  emitRenameGroup: (groupId: string, displayNameTranslations: I_faLocaleStringTranslations) => void
  emitRenamePlacementNickname: (
    placementId: string,
    nicknameTranslations: I_faLocaleSingularPluralTranslations
  ) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  getRenameMenuTargetKey: () => string | null
  nodeAnchorRef: Ref<HTMLElement | null>
  openRenameMenuTarget: Ref<string | null>
  renameTranslationsDraft: Ref<T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft>
  setRenameMenuOpen: (open: boolean) => void
  syncRenameMenuMaxWidth: () => void
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuHandlersWiring {
  function onRenameMenuBeforeShow (): void {
    deps.syncRenameMenuMaxWidth()
    const renameMenuTargetKey = deps.getRenameMenuTargetKey()
    if (renameMenuTargetKey !== null) {
      deps.openRenameMenuTarget.value = renameMenuTargetKey
    }
    deps.renameTranslationsDraft.value =
      resolveDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsDraftSeed(deps.getNode())
  }

  function closeRenameMenu (): void {
    deps.setRenameMenuOpen(false)
  }

  function openRenameMenu (): void {
    onRenameMenuBeforeShow()
    deps.setRenameMenuOpen(true)
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
    // Tree node SFC calls focusPreferredLanguageInput on FaLocaleTranslationsInput after show.
  }

  function onRenameTranslationsDraftUpdate (
    value: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
  ): void {
    deps.renameTranslationsDraft.value = value
    emitDialogProjectSettingsWorldTemplateLayoutRenameMenuTranslationsUpdate({
      emitRenameGroup: deps.emitRenameGroup,
      emitRenamePlacementNickname: deps.emitRenamePlacementNickname,
      node: deps.getNode(),
      translationsDraft: value
    })
  }

  return {
    clearRenameMenuFocus,
    closeRenameMenu,
    onRenameMenuBeforeShow,
    onRenameMenuHide,
    onRenameMenuShow,
    onRenameTranslationsDraftUpdate,
    openRenameMenu
  }
}
