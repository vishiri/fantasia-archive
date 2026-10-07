import type { ComputedRef } from 'vue'

import { dropUndefinedRecordValues } from 'app/src-electron/shared/faExactOptionalRecordCompat'
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
  isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled,
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
  removeDisabled: ComputedRef<boolean>
  removeTooltipText: ComputedRef<string>
  rowHasValidationError: ComputedRef<boolean>
  showMissingTranslationsWarning: ComputedRef<boolean>
  missingTranslationsWarningTestLocator: ComputedRef<string>
  missingTranslationsWarningTooltipText: ComputedRef<string>
  showPlacementNicknameHoverTooltip: ComputedRef<boolean>
}

function assembleDialogProjectSettingsWorldTemplateLayoutTreeNodePresentation (input: {
  displayIconName: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['displayIconName']
  editTooltipText: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['editTooltipText']
  hoverTooltipWiring: ReturnType<typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring>
  missingTranslationsWarningWiring: ReturnType<
    typeof createDialogProjectSettingsWorldTemplateLayoutTreeNodeMissingTranslationsWarningWiring
  >
  nodeRootClassList: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['nodeRootClassList']
  nodeTestLocator: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['nodeTestLocator']
  placementNicknameHoverTooltipOffset: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['placementNicknameHoverTooltipOffset']
  removeDisabled: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['removeDisabled']
  removeTooltipText: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['removeTooltipText']
  rowHasValidationError: T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring['rowHasValidationError']
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring {
  const {
    missingTranslationsWarningTestLocator,
    missingTranslationsWarningTooltipText,
    showMissingTranslationsWarning
  } = input.missingTranslationsWarningWiring
  const {
    placementNicknameHoverTooltipNicknameLine,
    placementNicknameHoverTooltipOriginalNameLine,
    placementNicknameHoverTooltipTestText,
    showPlacementNicknameHoverTooltip
  } = input.hoverTooltipWiring
  const displayIconName = input.displayIconName
  const editTooltipText = input.editTooltipText
  const nodeRootClassList = input.nodeRootClassList
  const nodeTestLocator = input.nodeTestLocator
  const placementNicknameHoverTooltipOffset = input.placementNicknameHoverTooltipOffset
  const removeDisabled = input.removeDisabled
  const removeTooltipText = input.removeTooltipText
  const rowHasValidationError = input.rowHasValidationError
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

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring (deps: {
  computed: typeof import('vue').computed
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  props: {
    blankGroupIds?: ReadonlySet<string> | undefined
    currentLanguageCode: T_faUserSettingsLanguageCode
    documentTemplates: I_dialogProjectSettingsDocumentTemplateDraft[]
    duplicateDocumentTemplateIds?: ReadonlySet<string> | undefined
    invalidDocumentTemplateIds?: ReadonlySet<string> | undefined
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
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError(
      dropUndefinedRecordValues({
        blankGroupIds: deps.props.blankGroupIds,
        duplicateDocumentTemplateIds: deps.props.duplicateDocumentTemplateIds,
        invalidDocumentTemplateIds: deps.props.invalidDocumentTemplateIds,
        node: deps.props.node
      }) as {
        blankGroupIds?: ReadonlySet<string>
        duplicateDocumentTemplateIds?: ReadonlySet<string>
        invalidDocumentTemplateIds?: ReadonlySet<string>
        node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
      }
    )
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

  const removeDisabled = deps.computed(() => {
    return isDialogProjectSettingsWorldTemplateLayoutPlacementRemoveDisabled(deps.props.node)
  })

  const removeTooltipText = deps.computed(() => {
    return deps.i18n.global.t(
      resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey(deps.props.node)
    )
  })

  const hoverTooltipWiring = createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring({
    computed: deps.computed,
    i18n: deps.i18n,
    readCurrentLanguageCode: () => deps.props.currentLanguageCode,
    readNode: () => deps.props.node
  })

  return assembleDialogProjectSettingsWorldTemplateLayoutTreeNodePresentation({
    displayIconName,
    editTooltipText,
    hoverTooltipWiring,
    missingTranslationsWarningWiring,
    nodeRootClassList,
    nodeTestLocator,
    placementNicknameHoverTooltipOffset,
    removeDisabled,
    removeTooltipText,
    rowHasValidationError
  })
}
