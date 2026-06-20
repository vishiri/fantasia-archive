import type { ComputedRef } from 'vue'

import {
  resolveDialogProjectSettingsDocumentTemplateDisplayIcon
} from './functions/dialogProjectSettingsDocumentTemplatesDraft'
import {
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeDisplayIcon,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeEditTooltipI18nKey,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeHasValidationError,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRemoveTooltipI18nKey,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeRootClassList,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeTestLocator
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeNodePresentation'
import { FA_ICON_PICKER_EMPTY_PLACEHOLDER_ICON } from 'app/types/I_faIconPickerInput'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

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
    duplicateDocumentTemplateIds?: ReadonlySet<string>
    invalidDocumentTemplateIds?: ReadonlySet<string>
    node: I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
  }
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodePresentationWiring {
  const placementNicknameHoverTooltipOffset: [number, number] = [16, 0]

  const nodeTestLocator = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeTestLocator(deps.props.node)
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

  const showPlacementNicknameHoverTooltip = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip(deps.props.node)
  })

  const placementNicknameHoverTooltipLines = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines({
      nicknameLabel: deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverNicknameLabel'),
      node: deps.props.node,
      originalNameLabel: deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel')
    })
  })

  const placementNicknameHoverTooltipNicknameLine = deps.computed(() => {
    return placementNicknameHoverTooltipLines.value?.nicknameLine
  })

  const placementNicknameHoverTooltipOriginalNameLine = deps.computed(() => {
    return placementNicknameHoverTooltipLines.value?.originalNameLine
  })

  const placementNicknameHoverTooltipTestText = deps.computed(() => {
    const lines = placementNicknameHoverTooltipLines.value
    if (lines === null) {
      return undefined
    }
    return `${lines.nicknameLine}\n${lines.originalNameLine}`
  })

  const displayIconNameBinding = displayIconName
  const editTooltipTextBinding = editTooltipText
  const nodeRootClassListBinding = nodeRootClassList
  const nodeTestLocatorBinding = nodeTestLocator
  const placementNicknameHoverTooltipNicknameLineBinding = placementNicknameHoverTooltipNicknameLine
  const placementNicknameHoverTooltipOffsetBinding = placementNicknameHoverTooltipOffset
  const placementNicknameHoverTooltipOriginalNameLineBinding = placementNicknameHoverTooltipOriginalNameLine
  const placementNicknameHoverTooltipTestTextBinding = placementNicknameHoverTooltipTestText
  const removeTooltipTextBinding = removeTooltipText
  const rowHasValidationErrorBinding = rowHasValidationError
  const showPlacementNicknameHoverTooltipBinding = showPlacementNicknameHoverTooltip

  return {
    displayIconName: displayIconNameBinding,
    editTooltipText: editTooltipTextBinding,
    nodeRootClassList: nodeRootClassListBinding,
    nodeTestLocator: nodeTestLocatorBinding,
    placementNicknameHoverTooltipNicknameLine: placementNicknameHoverTooltipNicknameLineBinding,
    placementNicknameHoverTooltipOffset: placementNicknameHoverTooltipOffsetBinding,
    placementNicknameHoverTooltipOriginalNameLine: placementNicknameHoverTooltipOriginalNameLineBinding,
    placementNicknameHoverTooltipTestText: placementNicknameHoverTooltipTestTextBinding,
    removeTooltipText: removeTooltipTextBinding,
    rowHasValidationError: rowHasValidationErrorBinding,
    showPlacementNicknameHoverTooltip: showPlacementNicknameHoverTooltipBinding
  }
}
