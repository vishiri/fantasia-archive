import { ref } from 'vue'
import type { Ref } from 'vue'
import type { QTooltip } from 'quasar'

type T_dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring = {
  armEditTooltip: () => void
  armRemoveTooltip: () => void
  dismissEditTooltip: () => void
  dismissRemoveTooltip: () => void
  editTooltipHoverEnabled: Ref<boolean>
  editTooltipRef: Ref<QTooltip | null>
  removeTooltipHoverEnabled: Ref<boolean>
  removeTooltipRef: Ref<QTooltip | null>
}

export function createDialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring (): T_dialogProjectSettingsWorldTemplateLayoutTreeNodeActionTooltipsWiring {
  const editTooltipRef = ref<QTooltip | null>(null)
  const removeTooltipRef = ref<QTooltip | null>(null)
  const editTooltipHoverEnabled = ref(true)
  const removeTooltipHoverEnabled = ref(true)

  function dismissEditTooltip (): void {
    editTooltipRef.value?.hide()
    editTooltipHoverEnabled.value = false
  }

  function dismissRemoveTooltip (): void {
    removeTooltipRef.value?.hide()
    removeTooltipHoverEnabled.value = false
  }

  function armEditTooltip (): void {
    editTooltipHoverEnabled.value = true
  }

  function armRemoveTooltip (): void {
    removeTooltipHoverEnabled.value = true
  }

  const armEditTooltipBinding = armEditTooltip
  const armRemoveTooltipBinding = armRemoveTooltip
  const dismissEditTooltipBinding = dismissEditTooltip
  const dismissRemoveTooltipBinding = dismissRemoveTooltip
  const editTooltipHoverEnabledBinding = editTooltipHoverEnabled
  const editTooltipRefBinding = editTooltipRef
  const removeTooltipHoverEnabledBinding = removeTooltipHoverEnabled
  const removeTooltipRefBinding = removeTooltipRef

  return {
    armEditTooltip: armEditTooltipBinding,
    armRemoveTooltip: armRemoveTooltipBinding,
    dismissEditTooltip: dismissEditTooltipBinding,
    dismissRemoveTooltip: dismissRemoveTooltipBinding,
    editTooltipHoverEnabled: editTooltipHoverEnabledBinding,
    editTooltipRef: editTooltipRefBinding,
    removeTooltipHoverEnabled: removeTooltipHoverEnabledBinding,
    removeTooltipRef: removeTooltipRefBinding
  }
}
