import {
  computed,
  ref,
  watch,
  type Ref
} from 'vue'

import { FA_APP_SHELL_DRAWER_TRANSITION_MS } from 'app/src/scripts/appRouting/faAppShellPageTransition'

/**
 * Delays switching QLayout view to capital L until after the drawer slide finishes,
 * so the page does not reflow while the panel is still animating.
 */
export function useAppShellLayoutDrawerRail (showWorkspaceDrawer: Ref<boolean>) {
  const layoutIncludesDrawerRail = ref(false)
  let layoutRailReleaseTimer: ReturnType<typeof setTimeout> | undefined

  watch(showWorkspaceDrawer, (show) => {
    if (layoutRailReleaseTimer !== undefined) {
      clearTimeout(layoutRailReleaseTimer)
      layoutRailReleaseTimer = undefined
    }

    if (show) {
      layoutIncludesDrawerRail.value = false
      layoutRailReleaseTimer = setTimeout(() => {
        layoutIncludesDrawerRail.value = true
        layoutRailReleaseTimer = undefined
      }, FA_APP_SHELL_DRAWER_TRANSITION_MS)
      return
    }

    layoutIncludesDrawerRail.value = false
  }, {
    immediate: true
  })

  const appShellLayoutQuasarView = computed((): string => {
    if (layoutIncludesDrawerRail.value) {
      return 'hHh Lpr lFf'
    }
    return 'hHh lpr lFf'
  })

  return {
    appShellLayoutQuasarView
  }
}
