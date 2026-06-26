import type { I_ref } from 'app/types/I_vueCompositionShims'

export function createMainLayoutDrawerRail (deps: {
  computed: <T>(getter: () => T) => I_ref<T>
}): (
    showWorkspaceDrawer: I_ref<boolean>
  ) => {
    appShellLayoutQuasarView: I_ref<string>
  } {
  return function useAppShellLayoutDrawerRail (_showWorkspaceDrawer: I_ref<boolean>) {
    const appShellLayoutQuasarView = deps.computed((): string => {
      return 'hHh lpr lFf'
    })

    return {
      appShellLayoutQuasarView
    }
  }
}
