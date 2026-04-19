import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { useDialogKeybindSettingsTableLayout } from 'app/src/components/dialogs/DialogKeybindSettings/scripts/dialogKeybindSettingsTableLayoutObserve'

/**
 * Mirrors DialogKeybindSettings bounded q-table height: measures the scroll host element while the dialog is open
 * and applies max-height so the table body scrolls inside the viewport cap.
 */
export function useDialogActionMonitorTableLayout (dialogModel: Ref<boolean>): {
  dialogActionMonitorTableHeightStyle: ComputedRef<Record<string, string> | undefined>
  tableScrollHostRef: Ref<HTMLElement | null>
} {
  const tableScrollHostRef = ref<HTMLElement | null>(null)
  const { tableMaxHeightPx } = useDialogKeybindSettingsTableLayout({
    dialogModel,
    getSectionElement (): HTMLElement | null {
      return tableScrollHostRef.value
    }
  })
  const dialogActionMonitorTableHeightStyle = computed((): Record<string, string> | undefined => {
    const px = tableMaxHeightPx.value
    if (px === null) {
      return undefined
    }
    return {
      maxHeight: `${String(px)}px`
    }
  })
  return {
    dialogActionMonitorTableHeightStyle,
    tableScrollHostRef
  }
}
