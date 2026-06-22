import type { ComputedRef } from 'vue'

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeRenameMenuPinnedAsideWiring (deps: {
  computed: typeof import('vue').computed
  showTemplatePinnedAside: ComputedRef<boolean>
  templateCanonicalName: ComputedRef<string>
  templateCanonicalNameLabel: ComputedRef<string>
  templateCanonicalNameTooltipText: ComputedRef<string>
}): {
    menuPinnedAsideLabelValue: ComputedRef<string | undefined>
    menuPinnedAsideTooltipValue: ComputedRef<string | undefined>
    menuPinnedAsideValue: ComputedRef<string | undefined>
  } {
  const menuPinnedAsideLabelValue = deps.computed(() => {
    if (!deps.showTemplatePinnedAside.value) {
      return undefined
    }
    return deps.templateCanonicalNameLabel.value
  })

  const menuPinnedAsideTooltipValue = deps.computed(() => {
    if (!deps.showTemplatePinnedAside.value) {
      return undefined
    }
    return deps.templateCanonicalNameTooltipText.value
  })

  const menuPinnedAsideValue = deps.computed(() => {
    if (!deps.showTemplatePinnedAside.value) {
      return undefined
    }
    return deps.templateCanonicalName.value
  })

  return {
    menuPinnedAsideLabelValue,
    menuPinnedAsideTooltipValue,
    menuPinnedAsideValue
  }
}
