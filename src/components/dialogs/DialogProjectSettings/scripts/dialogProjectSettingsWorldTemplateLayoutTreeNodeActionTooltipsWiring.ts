import { nextTick, ref } from 'vue'
import type { Ref } from 'vue'
import type { QTooltip } from 'quasar'

import { FA_Q_TOOLTIP_DELAY_MS } from 'app/src/scripts/appGlobalManagementUI/functions/faQTooltipDelay'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring = {
  armEditTooltip: () => void
  armPlacementNicknameHoverTooltip: () => void
  armRemoveTooltip: () => void
  dismissEditTooltip: () => void
  dismissRemoveTooltip: () => void
  editTooltipHoverEnabled: Ref<boolean>
  editTooltipRef: Ref<QTooltip | null>
  placementNicknameHoverTooltipEnabled: Ref<boolean>
  placementNicknameHoverTooltipRef: Ref<QTooltip | null>
  removeTooltipHoverEnabled: Ref<boolean>
  removeTooltipRef: Ref<QTooltip | null>
  revealPlacementNicknameHoverTooltip: () => void
  hidePlacementNicknameHoverTooltip: () => void
  suppressPlacementNicknameHoverTooltip: () => void
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring (deps?: {
  getRenameMenuOpen?: () => boolean
  onBeforeUnmount?: (hook: () => void) => void
}): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring {
  const editTooltipRef = ref<QTooltip | null>(null)
  const removeTooltipRef = ref<QTooltip | null>(null)
  const placementNicknameHoverTooltipRef = ref<QTooltip | null>(null)
  const editTooltipHoverEnabled = ref(true)
  const removeTooltipHoverEnabled = ref(true)
  const placementNicknameHoverTooltipEnabled = ref(true)

  let placementNicknameHoverRevealTimerId: ReturnType<typeof setTimeout> | undefined

  function clearPlacementNicknameHoverRevealTimer (): void {
    if (placementNicknameHoverRevealTimerId === undefined) {
      return
    }
    clearTimeout(placementNicknameHoverRevealTimerId)
    placementNicknameHoverRevealTimerId = undefined
  }

  function dismissEditTooltip (): void {
    editTooltipRef.value?.hide()
    editTooltipHoverEnabled.value = false
  }

  function dismissRemoveTooltip (): void {
    removeTooltipRef.value?.hide()
    removeTooltipHoverEnabled.value = false
  }

  function suppressPlacementNicknameHoverTooltip (): void {
    clearPlacementNicknameHoverRevealTimer()
    placementNicknameHoverTooltipRef.value?.hide()
    placementNicknameHoverTooltipEnabled.value = false
  }

  function armEditTooltip (): void {
    editTooltipHoverEnabled.value = true
  }

  function armRemoveTooltip (): void {
    removeTooltipHoverEnabled.value = true
  }

  function armPlacementNicknameHoverTooltip (): void {
    placementNicknameHoverTooltipEnabled.value = true
  }

  function revealPlacementNicknameHoverTooltip (): void {
    if (deps?.getRenameMenuOpen?.()) {
      return
    }
    armPlacementNicknameHoverTooltip()
    clearPlacementNicknameHoverRevealTimer()
    placementNicknameHoverRevealTimerId = setTimeout(() => {
      placementNicknameHoverRevealTimerId = undefined
      void nextTick(() => {
        if (!placementNicknameHoverTooltipEnabled.value) {
          return
        }
        placementNicknameHoverTooltipRef.value?.show()
      })
    }, FA_Q_TOOLTIP_DELAY_MS)
  }

  function hidePlacementNicknameHoverTooltip (): void {
    clearPlacementNicknameHoverRevealTimer()
    placementNicknameHoverTooltipRef.value?.hide()
  }

  deps?.onBeforeUnmount?.(() => {
    clearPlacementNicknameHoverRevealTimer()
  })

  const armEditTooltipBinding = armEditTooltip
  const armPlacementNicknameHoverTooltipBinding = armPlacementNicknameHoverTooltip
  const armRemoveTooltipBinding = armRemoveTooltip
  const dismissEditTooltipBinding = dismissEditTooltip
  const dismissRemoveTooltipBinding = dismissRemoveTooltip
  const editTooltipHoverEnabledBinding = editTooltipHoverEnabled
  const editTooltipRefBinding = editTooltipRef
  const placementNicknameHoverTooltipEnabledBinding = placementNicknameHoverTooltipEnabled
  const placementNicknameHoverTooltipRefBinding = placementNicknameHoverTooltipRef
  const removeTooltipHoverEnabledBinding = removeTooltipHoverEnabled
  const removeTooltipRefBinding = removeTooltipRef
  const revealPlacementNicknameHoverTooltipBinding = revealPlacementNicknameHoverTooltip
  const hidePlacementNicknameHoverTooltipBinding = hidePlacementNicknameHoverTooltip
  const suppressPlacementNicknameHoverTooltipBinding = suppressPlacementNicknameHoverTooltip

  return {
    armEditTooltip: armEditTooltipBinding,
    armPlacementNicknameHoverTooltip: armPlacementNicknameHoverTooltipBinding,
    armRemoveTooltip: armRemoveTooltipBinding,
    dismissEditTooltip: dismissEditTooltipBinding,
    dismissRemoveTooltip: dismissRemoveTooltipBinding,
    editTooltipHoverEnabled: editTooltipHoverEnabledBinding,
    editTooltipRef: editTooltipRefBinding,
    placementNicknameHoverTooltipEnabled: placementNicknameHoverTooltipEnabledBinding,
    placementNicknameHoverTooltipRef: placementNicknameHoverTooltipRefBinding,
    removeTooltipHoverEnabled: removeTooltipHoverEnabledBinding,
    removeTooltipRef: removeTooltipRefBinding,
    revealPlacementNicknameHoverTooltip: revealPlacementNicknameHoverTooltipBinding,
    hidePlacementNicknameHoverTooltip: hidePlacementNicknameHoverTooltipBinding,
    suppressPlacementNicknameHoverTooltip: suppressPlacementNicknameHoverTooltipBinding
  }
}
