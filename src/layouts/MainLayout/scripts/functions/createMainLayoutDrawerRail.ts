import type { I_ref } from 'app/types/I_vueCompositionShims'
export function createMainLayoutDrawerRail (deps: {
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

    deps.watch(showWorkspaceDrawer, (show) => {
      layoutIncludesDrawerRail.value = show
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
