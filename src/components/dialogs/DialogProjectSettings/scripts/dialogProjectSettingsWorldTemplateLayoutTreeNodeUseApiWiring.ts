import type { ComputedRef, CSSProperties, Ref, WritableComputedRef } from 'vue'
import type { QInput, QTooltip } from 'quasar'

import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring'
import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring'
import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring'
import type { createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring'

type T_actionTooltipsWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring>
type T_interactionWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeInteractionWiring>
type T_presentationWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring>
type T_renameMenuWiring = ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuWiring>

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi = {
  armEditTooltip: () => void
  armPlacementNicknameHoverTooltip: () => void
  armRemoveTooltip: () => void
  canonicalNameTestLocator: ComputedRef<string | undefined>
  displayIconName: ComputedRef<string>
  editTooltipHoverEnabled: Ref<boolean>
  editTooltipRef: Ref<QTooltip | null>
  editTooltipText: ComputedRef<string>
  nodeAnchorRef: Ref<HTMLElement | null>
  nodeRootClassList: ComputedRef<Record<string, boolean>>
  nodeTestLocator: ComputedRef<string>
  onEditClick: () => void
  onRemoveClick: () => void
  onRenameContextMenu: () => void
  placementNicknameHoverTooltipEnabled: Ref<boolean>
  placementNicknameHoverTooltipNicknameLine: ComputedRef<string | undefined>
  placementNicknameHoverTooltipOffset: [number, number]
  placementNicknameHoverTooltipOriginalNameLine: ComputedRef<string | undefined>
  placementNicknameHoverTooltipRef: Ref<QTooltip | null>
  placementNicknameHoverTooltipTestText: ComputedRef<string | undefined>
  revealPlacementNicknameHoverTooltip: () => void
  removeTooltipHoverEnabled: Ref<boolean>
  removeTooltipRef: Ref<QTooltip | null>
  removeTooltipText: ComputedRef<string>
  renameDraft: Ref<string>
  renameHasError: ComputedRef<boolean>
  renameInputLabel: ComputedRef<string | undefined>
  renameInputRef: Ref<QInput | null>
  renameMenuErrorMessage: ComputedRef<string | undefined>
  renameMenuOpen: WritableComputedRef<boolean>
  renameMenuStyle: Ref<CSSProperties | undefined>
  renameMenuWiring: T_renameMenuWiring
  rowHasValidationError: ComputedRef<boolean>
  showPlacementNicknameHoverTooltip: ComputedRef<boolean>
  suppressPlacementNicknameHoverTooltip: () => void
  showTemplateCanonicalName: ComputedRef<boolean>
  templateCanonicalName: ComputedRef<string>
  templateCanonicalNameLabel: ComputedRef<string>
  templateCanonicalNameTooltipText: ComputedRef<string>
  templateNicknameTooltipText: ComputedRef<string>
}

export function bindDialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi (params: {
  actionTooltipsWiring: T_actionTooltipsWiring
  interactionWiring: T_interactionWiring
  nodeAnchorRef: Ref<HTMLElement | null>
  presentationWiring: T_presentationWiring
  renameMenuWiring: T_renameMenuWiring
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi {
  const actionTooltipsWiring = params.actionTooltipsWiring
  const interactionWiring = params.interactionWiring
  const nodeAnchorRef = params.nodeAnchorRef
  const presentationWiring = params.presentationWiring
  const renameMenuWiring = params.renameMenuWiring

  return {
    armEditTooltip: actionTooltipsWiring.armEditTooltip,
    armPlacementNicknameHoverTooltip: actionTooltipsWiring.armPlacementNicknameHoverTooltip,
    armRemoveTooltip: actionTooltipsWiring.armRemoveTooltip,
    canonicalNameTestLocator: renameMenuWiring.canonicalNameTestLocator,
    displayIconName: presentationWiring.displayIconName,
    editTooltipHoverEnabled: actionTooltipsWiring.editTooltipHoverEnabled,
    editTooltipRef: actionTooltipsWiring.editTooltipRef,
    editTooltipText: presentationWiring.editTooltipText,
    nodeAnchorRef,
    nodeRootClassList: presentationWiring.nodeRootClassList,
    nodeTestLocator: presentationWiring.nodeTestLocator,
    onEditClick: interactionWiring.onEditClick,
    onRemoveClick: interactionWiring.onRemoveClick,
    onRenameContextMenu: interactionWiring.onRenameContextMenu,
    placementNicknameHoverTooltipEnabled: actionTooltipsWiring.placementNicknameHoverTooltipEnabled,
    placementNicknameHoverTooltipNicknameLine: presentationWiring.placementNicknameHoverTooltipNicknameLine,
    placementNicknameHoverTooltipOffset: presentationWiring.placementNicknameHoverTooltipOffset,
    placementNicknameHoverTooltipOriginalNameLine: presentationWiring.placementNicknameHoverTooltipOriginalNameLine,
    placementNicknameHoverTooltipRef: actionTooltipsWiring.placementNicknameHoverTooltipRef,
    placementNicknameHoverTooltipTestText: presentationWiring.placementNicknameHoverTooltipTestText,
    removeTooltipHoverEnabled: actionTooltipsWiring.removeTooltipHoverEnabled,
    removeTooltipRef: actionTooltipsWiring.removeTooltipRef,
    removeTooltipText: presentationWiring.removeTooltipText,
    renameDraft: renameMenuWiring.renameDraft,
    renameHasError: renameMenuWiring.renameHasError,
    renameInputLabel: renameMenuWiring.renameInputLabel,
    renameInputRef: renameMenuWiring.renameInputRef,
    renameMenuErrorMessage: renameMenuWiring.renameMenuErrorMessage,
    renameMenuOpen: renameMenuWiring.renameMenuOpen,
    renameMenuStyle: renameMenuWiring.renameMenuStyle,
    renameMenuWiring,
    revealPlacementNicknameHoverTooltip: actionTooltipsWiring.revealPlacementNicknameHoverTooltip,
    rowHasValidationError: presentationWiring.rowHasValidationError,
    showPlacementNicknameHoverTooltip: presentationWiring.showPlacementNicknameHoverTooltip,
    suppressPlacementNicknameHoverTooltip: actionTooltipsWiring.suppressPlacementNicknameHoverTooltip,
    showTemplateCanonicalName: renameMenuWiring.showTemplateCanonicalName,
    templateCanonicalName: renameMenuWiring.templateCanonicalName,
    templateCanonicalNameLabel: renameMenuWiring.templateCanonicalNameLabel,
    templateCanonicalNameTooltipText: renameMenuWiring.templateCanonicalNameTooltipText,
    templateNicknameTooltipText: renameMenuWiring.templateNicknameTooltipText
  }
}
