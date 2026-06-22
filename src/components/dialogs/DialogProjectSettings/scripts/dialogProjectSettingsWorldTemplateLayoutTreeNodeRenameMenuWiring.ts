import { computed } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { CSSProperties } from 'vue'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuSessionWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuSessionWiring'
import type { T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring = {
  clearRenameMenuFocus: () => void
  closeRenameMenu: () => void
  contextMenuTestLocator: ComputedRef<string | undefined>
  hasMenuPinnedAside: ComputedRef<boolean>
  menuPinnedAsideLabelValue: ComputedRef<string | undefined>
  menuPinnedAsideTooltipValue: ComputedRef<string | undefined>
  menuPinnedAsideValue: ComputedRef<string | undefined>
  menuOffset: [number, number]
  onRenameMenuBeforeShow: () => void
  onRenameMenuHide: () => void
  onRenameMenuShow: () => void
  onRenameTranslationsDraftUpdate: (
    value: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
  ) => void
  openRenameMenu: () => void
  renameHasError: ComputedRef<boolean>
  renameInputLabel: ComputedRef<string>
  renameInputTestLocator: ComputedRef<string | undefined>
  renameInputTestLocatorValue: ComputedRef<string>
  renameMenuErrorMessage: ComputedRef<string | undefined>
  renameMenuOpen: WritableComputedRef<boolean>
  renameMenuStyle: Ref<CSSProperties | undefined>
  renameTranslationsDraft: Ref<T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft>
  showTemplatePinnedAside: ComputedRef<boolean>
  supportsRenameMenu: ComputedRef<boolean>
  templateCanonicalName: ComputedRef<string>
  templateCanonicalNameLabel: ComputedRef<string>
  templateCanonicalNameTooltipText: ComputedRef<string>
  templateNicknameTooltipText: ComputedRef<string>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring (deps: {
  emitRenameGroup: (groupId: string, displayNameTranslations: I_faLocaleStringTranslations) => void
  emitRenamePlacementNickname: (
    placementId: string,
    nicknameTranslations: I_faLocaleSingularPluralTranslations
  ) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  isGroupNameInvalid: (displayNameTranslations: I_faLocaleStringTranslations) => boolean
  nodeAnchorRef: Ref<HTMLElement | null>
  translateGroupNameErrorRequired: () => string
  translateGroupRenameInputLabel: () => string
  translateTemplateCanonicalNameLabel: () => string
  translateTemplateCanonicalNameTooltip: () => string
  translateTemplateNicknameLabel: () => string
  translateTemplateNicknameTooltip: () => string
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring {
  const menuOffset: [number, number] = [0, 4]

  const sessionWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuSessionWiring({
    emitRenameGroup: deps.emitRenameGroup,
    emitRenamePlacementNickname: deps.emitRenamePlacementNickname,
    getNode: deps.getNode,
    isGroupNameInvalid: deps.isGroupNameInvalid,
    nodeAnchorRef: deps.nodeAnchorRef,
    translateGroupNameErrorRequired: deps.translateGroupNameErrorRequired
  })

  const labelsWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring({
    getShowTemplateCanonicalName: () => sessionWiring.computedState.showTemplatePinnedAside.value,
    translateGroupRenameInputLabel: deps.translateGroupRenameInputLabel,
    translateTemplateCanonicalNameLabel: deps.translateTemplateCanonicalNameLabel,
    translateTemplateCanonicalNameTooltip: deps.translateTemplateCanonicalNameTooltip,
    translateTemplateNicknameLabel: deps.translateTemplateNicknameLabel,
    translateTemplateNicknameTooltip: deps.translateTemplateNicknameTooltip
  })

  const clearRenameMenuFocus = sessionWiring.handlersWiring.clearRenameMenuFocus
  const closeRenameMenu = sessionWiring.handlersWiring.closeRenameMenu
  const contextMenuTestLocator = sessionWiring.computedState.contextMenuTestLocator
  const hasMenuPinnedAside = sessionWiring.computedState.hasMenuPinnedAside
  const onRenameMenuBeforeShow = sessionWiring.handlersWiring.onRenameMenuBeforeShow
  const onRenameMenuHide = sessionWiring.handlersWiring.onRenameMenuHide
  const onRenameMenuShow = sessionWiring.handlersWiring.onRenameMenuShow
  const onRenameTranslationsDraftUpdate = sessionWiring.handlersWiring.onRenameTranslationsDraftUpdate
  const openRenameMenu = sessionWiring.handlersWiring.openRenameMenu
  const renameHasError = sessionWiring.computedState.renameHasError
  const renameInputLabel = labelsWiring.renameInputLabel
  const renameInputTestLocator = sessionWiring.computedState.renameInputTestLocator
  const renameMenuErrorMessage = sessionWiring.computedState.renameMenuErrorMessage
  const renameMenuOpen = sessionWiring.computedState.renameMenuOpen
  const renameMenuStyle = sessionWiring.menuStyleWiring.renameMenuStyle
  const renameTranslationsDraft = sessionWiring.renameTranslationsDraft
  const showTemplatePinnedAside = sessionWiring.computedState.showTemplatePinnedAside
  const supportsRenameMenu = sessionWiring.computedState.supportsRenameMenu
  const templateCanonicalName = sessionWiring.computedState.templateCanonicalName
  const templateCanonicalNameLabel = labelsWiring.templateCanonicalNameLabel
  const templateCanonicalNameTooltipText = labelsWiring.templateCanonicalNameTooltipText
  const templateNicknameTooltipText = labelsWiring.templateNicknameTooltipText

  const pinnedAsideWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring({
    computed,
    showTemplatePinnedAside,
    templateCanonicalName,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText
  })

  const renameInputTestLocatorValue = computed(() => {
    return renameInputTestLocator.value ??
      'dialogProjectSettings-worldTemplateLayoutRenameInput'
  })

  return {
    clearRenameMenuFocus,
    closeRenameMenu,
    contextMenuTestLocator,
    hasMenuPinnedAside,
    menuOffset,
    menuPinnedAsideLabelValue: pinnedAsideWiring.menuPinnedAsideLabelValue,
    menuPinnedAsideTooltipValue: pinnedAsideWiring.menuPinnedAsideTooltipValue,
    menuPinnedAsideValue: pinnedAsideWiring.menuPinnedAsideValue,
    onRenameMenuBeforeShow,
    onRenameMenuHide,
    onRenameMenuShow,
    onRenameTranslationsDraftUpdate,
    openRenameMenu,
    renameHasError,
    renameInputLabel,
    renameInputTestLocator,
    renameInputTestLocatorValue,
    renameMenuErrorMessage,
    renameMenuOpen,
    renameMenuStyle,
    renameTranslationsDraft,
    showTemplatePinnedAside,
    supportsRenameMenu,
    templateCanonicalName,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText,
    templateNicknameTooltipText
  }
}
