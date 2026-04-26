import { onBeforeUnmount, ref } from 'vue'

/** Matches the previous `QTooltip` `delay` on this control (ms). */
const WINDOW_PROGRAM_STYLING_HELP_HOVER_OPEN_DELAY_MS = 500

/**
 * Sticky help surface for the program-styling window: opens after hover (same delay as the old
 * QTooltip) or via the default anchor click toggle; stays open until outside click, Escape, or
 * re-toggle on the help icon. Uses `noFocus` on QMenu so Monaco keeps editor focus.
 */
export function useWindowProgramStylingHelpMenu (): {
  helpKeybindMenuOpen: ReturnType<typeof ref<boolean>>
  onHelpIconMouseEnter: () => void
  onHelpIconMouseLeave: () => void
} {
  const helpKeybindMenuOpen = ref(false)
  let helpMenuHoverTimer: ReturnType<typeof setTimeout> | undefined

  function clearHelpMenuHoverTimer (): void {
    if (helpMenuHoverTimer === undefined) {
      return
    }
    clearTimeout(helpMenuHoverTimer)
    helpMenuHoverTimer = undefined
  }

  function onHelpIconMouseEnter (): void {
    clearHelpMenuHoverTimer()
    helpMenuHoverTimer = setTimeout(() => {
      helpMenuHoverTimer = undefined
      helpKeybindMenuOpen.value = true
    }, WINDOW_PROGRAM_STYLING_HELP_HOVER_OPEN_DELAY_MS)
  }

  function onHelpIconMouseLeave (): void {
    clearHelpMenuHoverTimer()
  }

  onBeforeUnmount(() => {
    clearHelpMenuHoverTimer()
  })

  return {
    helpKeybindMenuOpen,
    onHelpIconMouseEnter,
    onHelpIconMouseLeave
  }
}
