import type { ComputedRef } from 'vue'

import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'
import type { I_dialogProjectSettingsDocumentTemplateDraft } from 'app/types/I_dialogProjectSettingsDocumentTemplates'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

import {
  resolveDialogProjectSettingsDocumentTemplateDisplayIcon
} from './dialogProjectSettingsDocumentTemplatesDraft'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring'
import { createDialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring } from './dialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeDisplayIcon,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeEditTooltipI18nKey,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRootClassList,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeTestLocator
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeNodePresentation'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring = {
  displayIconName: ComputedRef<string>
  editTooltipText: ComputedRef<string>
  nodeRootClassList: ComputedRef<Record<string, boolean>>
  nodeTestLocator: ComputedRef<string>
  placementNicknameHoverTooltipNicknameLine: ComputedRef<string | undefined>
  placementNicknameHoverTooltipOffset: [number, number]
  placementNicknameHoverTooltipOriginalNameLine: ComputedRef<string | undefined>
  placementNicknameHoverTooltipTestText: ComputedRef<string | undefined>
  removeTooltipText: ComputedRef<string>
  rowHasValidationError: ComputedRef<boolean>
  showMissingTranslationsWarning: ComputedRef<boolean>
  missingTranslationsWarningTestLocator: ComputedRef<string>
  missingTranslationsWarningTooltipText: ComputedRef<string>
  showPlacementNicknameHoverTooltip: ComputedRef<boolean>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring (deps: {
  computed: typeof import('vue').computed
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  props: {
    blankGroupIds?: ReadonlySet<string>
    currentLanguageCode: T_faUserSettingsLanguageCode
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
    duplicateDocumentTemplateIds?: ReadonlySet<string>
    invalidDocumentTemplateIds?: ReadonlySet<string>
    node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  }
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring {
  const placementNicknameHoverTooltipOffset: [number, number] = [16, 0]

  const nodeTestLocator = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeTestLocator(deps.props.node)
  })

  const missingTranslationsWarningWiring =
    createDialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring({
      computed: deps.computed,
      i18n: deps.i18n,
      readCurrentLanguageCode: () => deps.props.currentLanguageCode,
      readDocumentTemplates: () => deps.props.documentTemplates,
      readNode: () => deps.props.node,
      readNodeTestLocator: () => nodeTestLocator.value
    })

  const displayIconName = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeDisplayIcon({
      emptyPlaceholderIcon: FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON,
      node: deps.props.node,
      resolveDocumentTemplateDisplayIcon: resolveDialogProjectSettingsDocumentTemplateDisplayIcon
    })
  })

  const rowHasValidationError = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError({
      blankGroupIds: deps.props.blankGroupIds,
      duplicateDocumentTemplateIds: deps.props.duplicateDocumentTemplateIds,
      invalidDocumentTemplateIds: deps.props.invalidDocumentTemplateIds,
      node: deps.props.node
    })
  })

  const nodeRootClassList = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRootClassList({
      nodeKind: deps.props.node.nodeKind,
      rowHasValidationError: rowHasValidationError.value
    })
  })

  const editTooltipText = deps.computed(() => {
    return deps.i18n.global.t(
      resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeEditTooltipI18nKey(deps.props.node.nodeKind)
    )
  })

  const removeTooltipText = deps.computed(() => {
    return deps.i18n.global.t(
      resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey(deps.props.node.nodeKind)
    )
  })

  const hoverTooltipWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring({
    computed: deps.computed,
    i18n: deps.i18n,
    readCurrentLanguageCode: () => deps.props.currentLanguageCode,
    readNode: () => deps.props.node
  })

  return {
    displayIconName,
    editTooltipText,
    missingTranslationsWarningTestLocator: missingTranslationsWarningWiring.missingTranslationsWarningTestLocator,
    missingTranslationsWarningTooltipText: missingTranslationsWarningWiring.missingTranslationsWarningTooltipText,
    nodeRootClassList,
    nodeTestLocator,
    placementNicknameHoverTooltipNicknameLine: hoverTooltipWiring.placementNicknameHoverTooltipNicknameLine,
    placementNicknameHoverTooltipOffset,
    placementNicknameHoverTooltipOriginalNameLine: hoverTooltipWiring.placementNicknameHoverTooltipOriginalNameLine,
    placementNicknameHoverTooltipTestText: hoverTooltipWiring.placementNicknameHoverTooltipTestText,
    removeTooltipText,
    rowHasValidationError,
    showMissingTranslationsWarning: missingTranslationsWarningWiring.showMissingTranslationsWarning,
    showPlacementNicknameHoverTooltip: hoverTooltipWiring.showPlacementNicknameHoverTooltip
  }
}
