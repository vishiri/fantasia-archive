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

function bindActionTooltipUseApiFields (actionTooltipsWiring: T_actionTooltipsWiring) {
  const {
    armEditTooltip,
    armPlacementNicknameHoverTooltip,
    armRemoveTooltip,
    editTooltipHoverEnabled,
    editTooltipRef,
    hidePlacementNicknameHoverTooltip,
    placementNicknameHoverTooltipEnabled,
    placementNicknameHoverTooltipRef,
    removeTooltipHoverEnabled,
    removeTooltipRef,
    revealPlacementNicknameHoverTooltip,
    suppressPlacementNicknameHoverTooltip
  } = actionTooltipsWiring
  return {
    armEditTooltip,
    armPlacementNicknameHoverTooltip,
    armRemoveTooltip,
    editTooltipHoverEnabled,
    editTooltipRef,
    hidePlacementNicknameHoverTooltip,
    placementNicknameHoverTooltipEnabled,
    placementNicknameHoverTooltipRef,
    removeTooltipHoverEnabled,
    removeTooltipRef,
    revealPlacementNicknameHoverTooltip,
    suppressPlacementNicknameHoverTooltip
  }
}

function bindPresentationUseApiFields (presentationWiring: T_presentationWiring) {
  const {
    displayIconName,
    editTooltipText,
    missingTranslationsWarningTestLocator,
    missingTranslationsWarningTooltipText,
    nodeRootClassList,
    nodeTestLocator,
    placementNicknameHoverTooltipNicknameLine,
    placementNicknameHoverTooltipOffset,
    placementNicknameHoverTooltipOriginalNameLine,
    placementNicknameHoverTooltipTestText,
    removeDisabled,
    removeTooltipText,
    rowHasValidationError,
    showMissingTranslationsWarning,
    showPlacementNicknameHoverTooltip
  } = presentationWiring
  return {
    displayIconName,
    editTooltipText,
    missingTranslationsWarningTestLocator,
    missingTranslationsWarningTooltipText,
    nodeRootClassList,
    nodeTestLocator,
    placementNicknameHoverTooltipNicknameLine,
    placementNicknameHoverTooltipOffset,
    placementNicknameHoverTooltipOriginalNameLine,
    placementNicknameHoverTooltipTestText,
    removeDisabled,
    removeTooltipText,
    rowHasValidationError,
    showMissingTranslationsWarning,
    showPlacementNicknameHoverTooltip
  }
}

function bindInteractionUseApiFields (interactionWiring: T_interactionWiring) {
  const {
    onEditClick,
    onRemoveClick,
    onRenameContextMenu
  } = interactionWiring
  return {
    onEditClick,
    onRemoveClick,
    onRenameContextMenu
  }
}

function bindRenameMenuUseApiFields (renameMenuWiring: T_renameMenuWiring) {
  const {
    hasMenuPinnedAside,
    menuPinnedAsideLabelValue,
    menuPinnedAsideTooltipValue,
    menuPinnedAsideValue,
    onRenameTranslationsDraftUpdate,
    renameHasError,
    renameInputLabel,
    renameInputTestLocator,
    renameInputTestLocatorValue,
    renameMenuErrorMessage,
    renameMenuOpen,
    renameMenuStyle,
    renameTranslationsDraft,
    showTemplatePinnedAside,
    templateCanonicalName,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText,
    templateNicknameTooltipText
  } = renameMenuWiring
  return {
    hasMenuPinnedAside,
    menuPinnedAsideLabelValue,
    menuPinnedAsideTooltipValue,
    menuPinnedAsideValue,
    onRenameTranslationsDraftUpdate,
    renameHasError,
    renameInputLabel,
    renameInputTestLocator,
    renameInputTestLocatorValue,
    renameMenuErrorMessage,
    renameMenuOpen,
    renameMenuStyle,
    renameTranslationsDraft,
    showTemplatePinnedAside,
    templateCanonicalName,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText,
    templateNicknameTooltipText
  }
}

export function bindDialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi (params: {
  actionTooltipsWiring: T_actionTooltipsWiring
  interactionWiring: T_interactionWiring
  nodeAnchorRef: Ref<HTMLElement | null>
  presentationWiring: T_presentationWiring
  renameMenuWiring: T_renameMenuWiring
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeUseApi {
  const actionFields = bindActionTooltipUseApiFields(params.actionTooltipsWiring)
  const interactionFields = bindInteractionUseApiFields(params.interactionWiring)
  const nodeAnchorRef = params.nodeAnchorRef
  const presentationFields = bindPresentationUseApiFields(params.presentationWiring)
  const renameFields = bindRenameMenuUseApiFields(params.renameMenuWiring)
  const renameMenuWiring = params.renameMenuWiring
  return {
    ...actionFields,
    ...presentationFields,
    ...interactionFields,
    ...renameFields,
    nodeAnchorRef,
    renameMenuWiring
  }
}
