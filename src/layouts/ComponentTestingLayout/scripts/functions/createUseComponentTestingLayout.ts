export function createUseComponentTestingLayout (deps: {
  getMode: () => string | undefined
  hasFaKeybindsBridge: () => boolean
  hasFaUserSettingsBridge: () => boolean
  isFantasiaStorybookCanvas: () => boolean
  onMounted: (hook: () => void | Promise<void>) => void
  refreshKeybinds: () => Promise<void>
  refreshUserSettings: () => Promise<void>
  useRoute: () => { path: string }
}): () => { route: ReturnType<typeof deps.useRoute> } {
  return function useComponentTestingLayout () {
    const route = deps.useRoute()

    deps.onMounted(async () => {
      if (deps.isFantasiaStorybookCanvas()) {
        return
      }

      if (deps.getMode() !== 'electron') {
        return
      }

      if (deps.hasFaUserSettingsBridge()) {
        await deps.refreshUserSettings()
      }

      if (deps.hasFaKeybindsBridge()) {
        await deps.refreshKeybinds()
      }
    })

    return {
      route
    }
  }
}
