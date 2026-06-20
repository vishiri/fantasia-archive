import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { CSSProperties } from 'vue'
import type { QInput } from 'quasar'

import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuSessionWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuSessionWiring'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring = {
  canonicalNameTestLocator: ComputedRef<string | undefined>
  clearRenameMenuFocus: () => void
  closeRenameMenu: () => void
  contextMenuTestLocator: ComputedRef<string | undefined>
  openRenameMenu: () => void
  menuOffset: [number, number]
  onRenameDraftUpdate: (value: string | number | null) => void
  onRenameMenuBeforeShow: () => void
  onRenameMenuHide: () => void
  onRenameMenuShow: () => void
  renameDraft: Ref<string>
  renameHasError: ComputedRef<boolean>
  renameInputLabel: ComputedRef<string>
  renameInputRef: Ref<QInput | null>
  renameInputTestLocator: ComputedRef<string | undefined>
  renameMenuErrorMessage: ComputedRef<string | undefined>
  renameMenuOpen: WritableComputedRef<boolean>
  renameMenuStyle: Ref<CSSProperties | undefined>
  showTemplateCanonicalName: ComputedRef<boolean>
  supportsRenameMenu: ComputedRef<boolean>
  templateCanonicalName: ComputedRef<string>
  templateCanonicalNameLabel: ComputedRef<string>
  templateCanonicalNameTooltipText: ComputedRef<string>
  templateNicknameTooltipText: ComputedRef<string>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring (deps: {
  emitRenameGroup: (groupId: string, displayName: string) => void
  emitRenamePlacementNickname: (placementId: string, nickname: string) => void
  getNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  isGroupNameInvalid: (displayName: string) => boolean
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
    getShowTemplateCanonicalName: () => sessionWiring.computedState.showTemplateCanonicalName.value,
    translateGroupRenameInputLabel: deps.translateGroupRenameInputLabel,
    translateTemplateCanonicalNameLabel: deps.translateTemplateCanonicalNameLabel,
    translateTemplateCanonicalNameTooltip: deps.translateTemplateCanonicalNameTooltip,
    translateTemplateNicknameLabel: deps.translateTemplateNicknameLabel,
    translateTemplateNicknameTooltip: deps.translateTemplateNicknameTooltip
  })

  const canonicalNameTestLocator = sessionWiring.computedState.canonicalNameTestLocator
  const clearRenameMenuFocus = sessionWiring.handlersWiring.clearRenameMenuFocus
  const closeRenameMenu = sessionWiring.handlersWiring.closeRenameMenu
  const contextMenuTestLocator = sessionWiring.computedState.contextMenuTestLocator
  const onRenameDraftUpdate = sessionWiring.handlersWiring.onRenameDraftUpdate
  const onRenameMenuBeforeShow = sessionWiring.handlersWiring.onRenameMenuBeforeShow
  const onRenameMenuHide = sessionWiring.handlersWiring.onRenameMenuHide
  const onRenameMenuShow = sessionWiring.handlersWiring.onRenameMenuShow
  const openRenameMenu = sessionWiring.handlersWiring.openRenameMenu
  const renameDraft = sessionWiring.renameDraft
  const renameHasError = sessionWiring.computedState.renameHasError
  const renameInputLabel = labelsWiring.renameInputLabel
  const renameInputRef = sessionWiring.renameInputRef
  const renameInputTestLocator = sessionWiring.computedState.renameInputTestLocator
  const renameMenuErrorMessage = sessionWiring.computedState.renameMenuErrorMessage
  const renameMenuOpen = sessionWiring.computedState.renameMenuOpen
  const renameMenuStyle = sessionWiring.menuStyleWiring.renameMenuStyle
  const showTemplateCanonicalName = sessionWiring.computedState.showTemplateCanonicalName
  const supportsRenameMenu = sessionWiring.computedState.supportsRenameMenu
  const templateCanonicalName = sessionWiring.computedState.templateCanonicalName
  const templateCanonicalNameLabel = labelsWiring.templateCanonicalNameLabel
  const templateCanonicalNameTooltipText = labelsWiring.templateCanonicalNameTooltipText
  const templateNicknameTooltipText = labelsWiring.templateNicknameTooltipText

  return {
    canonicalNameTestLocator,
    clearRenameMenuFocus,
    closeRenameMenu,
    contextMenuTestLocator,
    menuOffset,
    onRenameDraftUpdate,
    onRenameMenuBeforeShow,
    onRenameMenuHide,
    onRenameMenuShow,
    openRenameMenu,
    renameDraft,
    renameHasError,
    renameInputLabel,
    renameInputRef,
    renameInputTestLocator,
    renameMenuErrorMessage,
    renameMenuOpen,
    renameMenuStyle,
    showTemplateCanonicalName,
    supportsRenameMenu,
    templateCanonicalName,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText,
    templateNicknameTooltipText
  }
}
