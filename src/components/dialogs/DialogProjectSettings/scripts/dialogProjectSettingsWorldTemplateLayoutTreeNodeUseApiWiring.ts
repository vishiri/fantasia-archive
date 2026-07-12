import type { ComputedRef, CSSProperties, Ref, WritableComputedRef } from 'vue'
import type { QTooltip } from 'quasar'

import type { T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft } from 'app/types/T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft'
import type { I_faLocaleSingularPluralTranslations } from 'app/types/I_faLocaleSingularPluralTranslations'
import type { I_faLocaleStringTranslations } from 'app/types/I_faLocaleStringTranslations'

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
  displayIconName: ComputedRef<string>
  editTooltipHoverEnabled: Ref<boolean>
  editTooltipRef: Ref<QTooltip | null>
  editTooltipText: ComputedRef<string>
  hasMenuPinnedAside: ComputedRef<boolean>
  nodeAnchorRef: Ref<HTMLElement | null>
  nodeRootClassList: ComputedRef<Record<string, boolean>>
  nodeTestLocator: ComputedRef<string>
  menuPinnedAsideLabelValue: ComputedRef<string | undefined>
  menuPinnedAsideTooltipValue: ComputedRef<string | undefined>
  menuPinnedAsideValue: ComputedRef<string | undefined>
  missingTranslationsWarningTestLocator: ComputedRef<string>
  missingTranslationsWarningTooltipText: ComputedRef<string>
  onEditClick: () => void
  onRemoveClick: () => void
  onRenameContextMenu: () => void
  onRenameTranslationsDraftUpdate: (
    value: I_faLocaleStringTranslations | I_faLocaleSingularPluralTranslations
  ) => void
  placementNicknameHoverTooltipEnabled: Ref<boolean>
  placementNicknameHoverTooltipNicknameLine: ComputedRef<string | undefined>
  placementNicknameHoverTooltipOffset: [number, number]
  placementNicknameHoverTooltipOriginalNameLine: ComputedRef<string | undefined>
  placementNicknameHoverTooltipRef: Ref<QTooltip | null>
  placementNicknameHoverTooltipTestText: ComputedRef<string | undefined>
  revealPlacementNicknameHoverTooltip: () => void
  hidePlacementNicknameHoverTooltip: () => void
  removeDisabled: ComputedRef<boolean>
  removeTooltipHoverEnabled: Ref<boolean>
  removeTooltipRef: Ref<QTooltip | null>
  removeTooltipText: ComputedRef<string>
  renameHasError: ComputedRef<boolean>
  renameInputLabel: ComputedRef<string>
  renameInputTestLocator: ComputedRef<string | undefined>
  renameInputTestLocatorValue: ComputedRef<string>
  renameMenuErrorMessage: ComputedRef<string | undefined>
  renameMenuOpen: WritableComputedRef<boolean>
  renameMenuStyle: Ref<CSSProperties | undefined>
  renameMenuWiring: T_renameMenuWiring
  renameTranslationsDraft: Ref<T_dialogProjectSettingsWorldTemplateLayoutRenameTranslationsDraft>
  rowHasValidationError: ComputedRef<boolean>
  showMissingTranslationsWarning: ComputedRef<boolean>
  showPlacementNicknameHoverTooltip: ComputedRef<boolean>
  showTemplatePinnedAside: ComputedRef<boolean>
  suppressPlacementNicknameHoverTooltip: () => void
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
    displayIconName: presentationWiring.displayIconName,
    editTooltipHoverEnabled: actionTooltipsWiring.editTooltipHoverEnabled,
    editTooltipRef: actionTooltipsWiring.editTooltipRef,
    editTooltipText: presentationWiring.editTooltipText,
    hasMenuPinnedAside: renameMenuWiring.hasMenuPinnedAside,
    menuPinnedAsideLabelValue: renameMenuWiring.menuPinnedAsideLabelValue,
    menuPinnedAsideTooltipValue: renameMenuWiring.menuPinnedAsideTooltipValue,
    menuPinnedAsideValue: renameMenuWiring.menuPinnedAsideValue,
    hidePlacementNicknameHoverTooltip: actionTooltipsWiring.hidePlacementNicknameHoverTooltip,
    missingTranslationsWarningTestLocator: presentationWiring.missingTranslationsWarningTestLocator,
    missingTranslationsWarningTooltipText: presentationWiring.missingTranslationsWarningTooltipText,
    nodeAnchorRef,
    nodeRootClassList: presentationWiring.nodeRootClassList,
    nodeTestLocator: presentationWiring.nodeTestLocator,
    onEditClick: interactionWiring.onEditClick,
    onRemoveClick: interactionWiring.onRemoveClick,
    onRenameContextMenu: interactionWiring.onRenameContextMenu,
    onRenameTranslationsDraftUpdate: renameMenuWiring.onRenameTranslationsDraftUpdate,
    placementNicknameHoverTooltipEnabled: actionTooltipsWiring.placementNicknameHoverTooltipEnabled,
    placementNicknameHoverTooltipNicknameLine: presentationWiring.placementNicknameHoverTooltipNicknameLine,
    placementNicknameHoverTooltipOffset: presentationWiring.placementNicknameHoverTooltipOffset,
    placementNicknameHoverTooltipOriginalNameLine: presentationWiring.placementNicknameHoverTooltipOriginalNameLine,
    placementNicknameHoverTooltipRef: actionTooltipsWiring.placementNicknameHoverTooltipRef,
    placementNicknameHoverTooltipTestText: presentationWiring.placementNicknameHoverTooltipTestText,
    removeDisabled: presentationWiring.removeDisabled,
    removeTooltipHoverEnabled: actionTooltipsWiring.removeTooltipHoverEnabled,
    removeTooltipRef: actionTooltipsWiring.removeTooltipRef,
    removeTooltipText: presentationWiring.removeTooltipText,
    renameHasError: renameMenuWiring.renameHasError,
    renameInputLabel: renameMenuWiring.renameInputLabel,
    renameInputTestLocator: renameMenuWiring.renameInputTestLocator,
    renameInputTestLocatorValue: renameMenuWiring.renameInputTestLocatorValue,
    renameMenuErrorMessage: renameMenuWiring.renameMenuErrorMessage,
    renameMenuOpen: renameMenuWiring.renameMenuOpen,
    renameMenuStyle: renameMenuWiring.renameMenuStyle,
    renameMenuWiring,
    renameTranslationsDraft: renameMenuWiring.renameTranslationsDraft,
    revealPlacementNicknameHoverTooltip: actionTooltipsWiring.revealPlacementNicknameHoverTooltip,
    rowHasValidationError: presentationWiring.rowHasValidationError,
    showMissingTranslationsWarning: presentationWiring.showMissingTranslationsWarning,
    showPlacementNicknameHoverTooltip: presentationWiring.showPlacementNicknameHoverTooltip,
    showTemplatePinnedAside: renameMenuWiring.showTemplatePinnedAside,
    suppressPlacementNicknameHoverTooltip: actionTooltipsWiring.suppressPlacementNicknameHoverTooltip,
    templateCanonicalName: renameMenuWiring.templateCanonicalName,
    templateCanonicalNameLabel: renameMenuWiring.templateCanonicalNameLabel,
    templateCanonicalNameTooltipText: renameMenuWiring.templateCanonicalNameTooltipText,
    templateNicknameTooltipText: renameMenuWiring.templateNicknameTooltipText
  }
}
