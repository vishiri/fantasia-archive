import type { Ref } from 'vue'
import { ref } from 'vue'

/** Delay before closing a submenu after pointer leaves the row and menu bridge gap. */
export const APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS = 250 as const

/**
 * Hover-driven submenu visibility for AppControlSingleMenu: nested QMenus are portaled, so a short
 * hide delay lets the pointer cross from the parent row into the submenu panel without flicker.
 */
export function createAppControlSingleMenuSubmenuHover (): {
  openSubmenuRowIndex: Ref<number | null>
  onRootMenuHide: () => void
  onSubmenuActivatorEnter: (index: number) => void
  onSubmenuActivatorLeave: () => void
  onSubmenuContentEnter: () => void
  onSubmenuContentLeave: () => void
  onSubmenuModelUpdate: (index: number, shown: boolean) => void
} {
  const openSubmenuRowIndex = ref<number | null>(null)
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function clearHideTimer (): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  function scheduleHide (): void {
    clearHideTimer()
    hideTimer = setTimeout(() => {
      openSubmenuRowIndex.value = null
      hideTimer = null
    }, APP_CONTROL_SINGLE_MENU_SUBMENU_HOVER_LEAVE_MS)
  }

  function onSubmenuActivatorEnter (index: number): void {
    clearHideTimer()
    openSubmenuRowIndex.value = index
  }

  function onSubmenuActivatorLeave (): void {
    scheduleHide()
  }

  function onSubmenuContentEnter (): void {
    clearHideTimer()
  }

  function onSubmenuContentLeave (): void {
    scheduleHide()
  }

  function onSubmenuModelUpdate (index: number, shown: boolean): void {
    if (shown) {
      clearHideTimer()
      openSubmenuRowIndex.value = index
      return
    }
    if (openSubmenuRowIndex.value === index) {
      openSubmenuRowIndex.value = null
    }
  }

  function onRootMenuHide (): void {
    clearHideTimer()
    openSubmenuRowIndex.value = null
  }

  return {
    onRootMenuHide,
    onSubmenuActivatorEnter,
    onSubmenuActivatorLeave,
    onSubmenuContentEnter,
    onSubmenuContentLeave,
    onSubmenuModelUpdate,
    openSubmenuRowIndex
  }
}
