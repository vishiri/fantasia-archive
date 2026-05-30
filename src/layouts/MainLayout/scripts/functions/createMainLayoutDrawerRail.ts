import type { I_ref } from 'app/types/I_vueCompositionShims'
export function createMainLayoutDrawerRail (deps: {
  FA_APP_SHELL_DRAWER_TRANSITION_MS: number
  computed: <T>(getter: () => T) => I_ref<T>
  ref: <T>(value: T) => I_ref<T>
  watch: (
    source: I_ref<boolean>,
    effect: (show: boolean) => void,
    options?: { immediate?: boolean }
  ) => void
}): (
    showWorkspaceDrawer: I_ref<boolean>
  ) => {
    appShellLayoutQuasarView: I_ref<string>
  } {
  return function useAppShellLayoutDrawerRail (showWorkspaceDrawer: I_ref<boolean>) {
    const layoutIncludesDrawerRail = deps.ref(false)
    let layoutRailReleaseTimer: ReturnType<typeof setTimeout> | undefined

    deps.watch(showWorkspaceDrawer, (show) => {
      if (layoutRailReleaseTimer !== undefined) {
        clearTimeout(layoutRailReleaseTimer)
        layoutRailReleaseTimer = undefined
      }

      if (show) {
        layoutIncludesDrawerRail.value = false
        layoutRailReleaseTimer = setTimeout(() => {
          layoutIncludesDrawerRail.value = true
          layoutRailReleaseTimer = undefined
        }, deps.FA_APP_SHELL_DRAWER_TRANSITION_MS)
        return
      }

      layoutIncludesDrawerRail.value = false
    }, {
      immediate: true
    })

    const appShellLayoutQuasarView = deps.computed((): string => {
      if (layoutIncludesDrawerRail.value) {
        return 'hHh Lpr lFf'
      }
      return 'hHh lpr lFf'
    })

    return {
      appShellLayoutQuasarView
    }
  }
}
