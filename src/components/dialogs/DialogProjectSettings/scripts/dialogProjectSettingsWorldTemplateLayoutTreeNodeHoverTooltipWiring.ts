import type { ComputedRef } from 'vue'

import {
  resolveFaProjectWorldTemplatePlacementNicknameFromFields
} from 'app/src/scripts/projectWorlds/faProjectWorldTemplatePlacementNickname_manager'

import {
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines,
  resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip
} from './functions/dialogProjectSettingsWorldTemplateLayoutTreeNodePresentation'
import type { T_faUserSettingsLanguageCode } from 'app/types/faUserSettingsLanguageRegistry'
import type { I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode } from 'app/types/I_dialogProjectSettingsWorlds'

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeHoverTooltipWiring (deps: {
  computed: typeof import('vue').computed
  i18n: {
    global: {
      t: (key: string) => string
    }
  }
  readCurrentLanguageCode: () => T_faUserSettingsLanguageCode
  readNode: () => I_dialogProjectSettingsWorldTemplateLayoutHeTreeNode
}): {
    placementNicknameHoverTooltipNicknameLine: ComputedRef<string | undefined>
    placementNicknameHoverTooltipOriginalNameLine: ComputedRef<string | undefined>
    placementNicknameHoverTooltipTestText: ComputedRef<string | undefined>
    showPlacementNicknameHoverTooltip: ComputedRef<boolean>
  } {
  const showPlacementNicknameHoverTooltip = deps.computed(() => {
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodeShowsPlacementNicknameHoverTooltip(
      deps.readNode()
    )
  })

  const placementNicknameHoverTooltipLines = deps.computed(() => {
    const node = deps.readNode()
    const resolvedNickname = resolveFaProjectWorldTemplatePlacementNicknameFromFields(
      node.nicknamePluralTranslations,
      node.nicknameSingularTranslations,
      deps.readCurrentLanguageCode()
    )
    return resolveDialogProjectSettingsWorldTemplateLayoutTreeNodePlacementNicknameHoverTooltipLines({
      nicknameLabel: deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverNicknameLabel'),
      node,
      originalNameLabel: deps.i18n.global.t('dialogs.projectSettings.fields.worldTemplateLayout.placementNicknameHoverOriginalNameLabel'),
      resolvedNickname
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

  return {
    placementNicknameHoverTooltipNicknameLine,
    placementNicknameHoverTooltipOriginalNameLine,
    placementNicknameHoverTooltipTestText,
    showPlacementNicknameHoverTooltip
  }
}
