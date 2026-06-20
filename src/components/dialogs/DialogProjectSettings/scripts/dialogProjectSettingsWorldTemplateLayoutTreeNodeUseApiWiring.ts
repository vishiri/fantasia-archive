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

export function bindDialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi (params: {
  actionTooltipsWiring: T_actionTooltipsWiring
  interactionWiring: T_interactionWiring
  nodeAnchorRef: Ref<HTMLElement | null>
  presentationWiring: T_presentationWiring
  renameMenuWiring: T_renameMenuWiring
}): {
    armEditTooltip: () => void
    armRemoveTooltip: () => void
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
    showTemplateCanonicalName: ComputedRef<boolean>
    templateCanonicalName: ComputedRef<string>
    templateCanonicalNameLabel: ComputedRef<string>
    templateCanonicalNameTooltipText: ComputedRef<string>
    templateNicknameTooltipText: ComputedRef<string>
    canonicalNameTestLocator: ComputedRef<string | undefined>
  } {
  const {
    actionTooltipsWiring,
    interactionWiring,
    nodeAnchorRef,
    presentationWiring,
    renameMenuWiring
  } = params

  const armEditTooltipBinding = actionTooltipsWiring.armEditTooltip
  const armRemoveTooltipBinding = actionTooltipsWiring.armRemoveTooltip
  const displayIconNameBinding = presentationWiring.displayIconName
  const editTooltipHoverEnabledBinding = actionTooltipsWiring.editTooltipHoverEnabled
  const editTooltipRefBinding = actionTooltipsWiring.editTooltipRef
  const editTooltipTextBinding = presentationWiring.editTooltipText
  const nodeAnchorRefBinding = nodeAnchorRef
  const nodeRootClassListBinding = presentationWiring.nodeRootClassList
  const nodeTestLocatorBinding = presentationWiring.nodeTestLocator
  const onEditClickBinding = interactionWiring.onEditClick
  const onRemoveClickBinding = interactionWiring.onRemoveClick
  const onRenameContextMenuBinding = interactionWiring.onRenameContextMenu
  const removeTooltipHoverEnabledBinding = actionTooltipsWiring.removeTooltipHoverEnabled
  const removeTooltipRefBinding = actionTooltipsWiring.removeTooltipRef
  const removeTooltipTextBinding = presentationWiring.removeTooltipText
  const renameMenuWiringBinding = renameMenuWiring
  const rowHasValidationErrorBinding = presentationWiring.rowHasValidationError

  return {
    armEditTooltip: armEditTooltipBinding,
    armRemoveTooltip: armRemoveTooltipBinding,
    canonicalNameTestLocator: renameMenuWiring.canonicalNameTestLocator,
    displayIconName: displayIconNameBinding,
    editTooltipHoverEnabled: editTooltipHoverEnabledBinding,
    editTooltipRef: editTooltipRefBinding,
    editTooltipText: editTooltipTextBinding,
    nodeAnchorRef: nodeAnchorRefBinding,
    nodeRootClassList: nodeRootClassListBinding,
    nodeTestLocator: nodeTestLocatorBinding,
    onEditClick: onEditClickBinding,
    onRemoveClick: onRemoveClickBinding,
    onRenameContextMenu: onRenameContextMenuBinding,
    removeTooltipHoverEnabled: removeTooltipHoverEnabledBinding,
    removeTooltipRef: removeTooltipRefBinding,
    removeTooltipText: removeTooltipTextBinding,
    renameDraft: renameMenuWiring.renameDraft,
    renameHasError: renameMenuWiring.renameHasError,
    renameInputLabel: renameMenuWiring.renameInputLabel,
    renameInputRef: renameMenuWiring.renameInputRef,
    renameMenuErrorMessage: renameMenuWiring.renameMenuErrorMessage,
    renameMenuOpen: renameMenuWiring.renameMenuOpen,
    renameMenuStyle: renameMenuWiring.renameMenuStyle,
    renameMenuWiring: renameMenuWiringBinding,
    rowHasValidationError: rowHasValidationErrorBinding,
    showTemplateCanonicalName: renameMenuWiring.showTemplateCanonicalName,
    templateCanonicalName: renameMenuWiring.templateCanonicalName,
    templateCanonicalNameLabel: renameMenuWiring.templateCanonicalNameLabel,
    templateCanonicalNameTooltipText: renameMenuWiring.templateCanonicalNameTooltipText,
    templateNicknameTooltipText: renameMenuWiring.templateNicknameTooltipText
  }
}
