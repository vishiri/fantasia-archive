import { nextTick, ref } from 'vue'
import type { Ref } from 'vue'
import type { QTooltip } from 'quasar'

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
  suppressPlacementNicknameHoverTooltip: () => void
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring (): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring {
  const editTooltipRef = ref<QTooltip | null>(null)
  const removeTooltipRef = ref<QTooltip | null>(null)
  const placementNicknameHoverTooltipRef = ref<QTooltip | null>(null)
  const editTooltipHoverEnabled = ref(true)
  const removeTooltipHoverEnabled = ref(true)
  const placementNicknameHoverTooltipEnabled = ref(true)

  function dismissEditTooltip (): void {
    editTooltipRef.value?.hide()
    editTooltipHoverEnabled.value = false
  }

  function dismissRemoveTooltip (): void {
    removeTooltipRef.value?.hide()
    removeTooltipHoverEnabled.value = false
  }

  function suppressPlacementNicknameHoverTooltip (): void {
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
    armPlacementNicknameHoverTooltip()
    void nextTick(() => {
      if (!placementNicknameHoverTooltipEnabled.value) {
        return
      }
      placementNicknameHoverTooltipRef.value?.show()
    })
  }

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
    suppressPlacementNicknameHoverTooltip: suppressPlacementNicknameHoverTooltipBinding
  }
}
