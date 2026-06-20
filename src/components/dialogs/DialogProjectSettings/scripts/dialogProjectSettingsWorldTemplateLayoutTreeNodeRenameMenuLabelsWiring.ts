import { computed } from 'vue'
import type { ComputedRef } from 'vue'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring = {
  renameInputLabel: ComputedRef<string>
  templateCanonicalNameLabel: ComputedRef<string>
  templateCanonicalNameTooltipText: ComputedRef<string>
  templateNicknameTooltipText: ComputedRef<string>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring (deps: {
  getShowTemplateCanonicalName: () => boolean
  translateGroupRenameInputLabel: () => string
  translateTemplateCanonicalNameLabel: () => string
  translateTemplateCanonicalNameTooltip: () => string
  translateTemplateNicknameLabel: () => string
  translateTemplateNicknameTooltip: () => string
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuLabelsWiring {
  const renameInputLabel = computed(() => {
    if (deps.getShowTemplateCanonicalName()) {
      return deps.translateTemplateNicknameLabel()
    }
    return deps.translateGroupRenameInputLabel()
  })

  const templateCanonicalNameLabel = computed(() => {
    return deps.translateTemplateCanonicalNameLabel()
  })

  const templateNicknameTooltipText = computed(() => {
    if (!deps.getShowTemplateCanonicalName()) {
      return ''
    }
    return deps.translateTemplateNicknameTooltip()
  })

  const templateCanonicalNameTooltipText = computed(() => {
    if (!deps.getShowTemplateCanonicalName()) {
      return ''
    }
    return deps.translateTemplateCanonicalNameTooltip()
  })

  return {
    renameInputLabel,
    templateCanonicalNameLabel,
    templateCanonicalNameTooltipText,
    templateNicknameTooltipText
  }
}
