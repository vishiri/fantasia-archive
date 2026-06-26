import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type { I_ref } from 'app/types/I_vueCompositionShims'
import type { StoreGeneric } from 'app/types/I_vuePiniaInjected'

type T_faKeybindKeydownContext = {
  overrides: I_faKeybindsRoot['overrides']
  platform: NodeJS.Platform
  suspendGlobalKeybindDispatch: boolean
}

type T_faAppShellPageTransitionBindings = {
  appear: boolean
  enterActiveClass: string
  enterFromClass: string
  enterToClass: string
  leaveActiveClass: string
  leaveFromClass: string
  leaveToClass: string
}

type T_createMainLayoutDeps = {
  attachWindowKeydownListener: (handler: (event: KeyboardEvent) => void) => void
  detachWindowKeydownListener: (handler: (event: KeyboardEvent) => void) => void
  awaitWelcomeScreenAutoLoadBootCompletion: () => Promise<void>
  FA_APP_SHELL_DRAWER_TRANSITION_MS: number
  FA_APP_SHELL_PAGE_TRANSITION_BINDINGS: T_faAppShellPageTransitionBindings
  S_FaAppNoteboard: () => StoreGeneric
  S_FaAppStyling: () => StoreGeneric
  S_FaKeybinds: () => StoreGeneric
  S_FaProjectNoteboard: () => StoreGeneric
  S_FaProjectSidebar: () => StoreGeneric
  S_FaProjectStyling: () => StoreGeneric
  S_FaRecentProjects: () => StoreGeneric
  S_FaUserSettings: () => StoreGeneric
  computed: <T>(getter: () => T) => I_ref<T>
  createFaKeybindKeydownHandler: (
    getContext: () => T_faKeybindKeydownContext
  ) => (event: KeyboardEvent) => void
  ensureFaChromiumForwardedKeyChordListener: () => void
  createMainLayoutDrawerRail: (
    drawerDeps: {
      computed: <T>(getter: () => T) => I_ref<T>
    }
  ) => (showWorkspaceDrawer: I_ref<boolean>) => { appShellLayoutQuasarView: I_ref<string> }
  getFaKeybindKeydownContext: () => T_faKeybindKeydownContext
  hydrateFromBridgeOrReport: (runner: () => Promise<unknown>) => Promise<void>
  isFantasiaStorybookCanvas: () => boolean
  onMounted: (hook: () => void | Promise<void>) => void
  onUnmounted: (hook: () => void) => void
  ref: <T>(value: T) => I_ref<T>
  resolveMainLayoutOutletKey: (childRoutePath: string | undefined) => string
  resolveMainLayoutRouteClass: (showWorkspaceDrawer: boolean) => Record<string, boolean>
  resolveMainLayoutShowWorkspaceDrawer: (routePath: string) => boolean
  useRoute: () => { path?: string } | undefined
  watch: (
    source: I_ref<boolean>,
    effect: (show: boolean) => void,
    options?: { immediate?: boolean }
  ) => void
}

function resolveMainLayoutOutletKeyFromRoute (
  deps: T_createMainLayoutDeps,
  childRoute: { path?: string } | undefined
): string {
  return deps.resolveMainLayoutOutletKey(childRoute?.path)
}

function useMainLayout (
  deps: T_createMainLayoutDeps,
  useAppShellLayoutDrawerRail: (showWorkspaceDrawer: I_ref<boolean>) => { appShellLayoutQuasarView: I_ref<string> }
): {
    FA_APP_SHELL_DRAWER_TRANSITION_MS: number
    FA_APP_SHELL_PAGE_TRANSITION_BINDINGS: T_faAppShellPageTransitionBindings
    appShellLayoutQuasarView: I_ref<string>
    appShellLayoutRouteClass: I_ref<Record<string, boolean>>
    isFantasiaStorybookCanvas: () => boolean
    resolveMainLayoutOutletKeyFromRoute: (childRoute: { path?: string } | undefined) => string
    showWorkspaceDrawer: I_ref<boolean>
  } {
  const route = deps.useRoute()
  const mainLayoutRoutePath = deps.computed((): string => route?.path ?? '/')
  const showWorkspaceDrawer = deps.computed((): boolean => {
    return deps.resolveMainLayoutShowWorkspaceDrawer(mainLayoutRoutePath.value)
  })
  const { appShellLayoutQuasarView } = useAppShellLayoutDrawerRail(showWorkspaceDrawer)
  const appShellLayoutRouteClass = deps.computed((): Record<string, boolean> => {
    return deps.resolveMainLayoutRouteClass(showWorkspaceDrawer.value)
  })
  let faKeybindKeydownHandler: ((event: KeyboardEvent) => void) | undefined

  deps.onMounted(async () => {
    if (deps.isFantasiaStorybookCanvas()) {
      return
    }
    if (process.env.MODE !== 'electron') {
      return
    }
    if (window.faContentBridgeAPIs?.faUserSettings !== undefined) {
      await deps.S_FaUserSettings().refreshSettings()
    }
    if (window.faContentBridgeAPIs?.faKeybinds !== undefined) {
      const faKeybindsStore = deps.S_FaKeybinds()
      await deps.hydrateFromBridgeOrReport(() => faKeybindsStore.refreshKeybinds())
      deps.ensureFaChromiumForwardedKeyChordListener()
      faKeybindKeydownHandler = deps.createFaKeybindKeydownHandler(deps.getFaKeybindKeydownContext)
      deps.attachWindowKeydownListener(faKeybindKeydownHandler)
    }
    // Hydrate app-wide floating-window stores before skip-welcome boot completes so reopen uses persisted frame geometry.
    if (window.faContentBridgeAPIs?.faAppStyling !== undefined) {
      await deps.hydrateFromBridgeOrReport(() => deps.S_FaAppStyling().refreshAppStyling())
    }
    if (window.faContentBridgeAPIs?.faAppNoteboard !== undefined) {
      await deps.S_FaAppNoteboard().refreshNoteboard()
    }
    if (window.faContentBridgeAPIs?.projectManagement !== undefined) {
      await deps.awaitWelcomeScreenAutoLoadBootCompletion()
      await deps.S_FaRecentProjects().refreshRecentProjects()
      await deps.hydrateFromBridgeOrReport(() => deps.S_FaProjectNoteboard().refreshProjectNoteboard())
      await deps.hydrateFromBridgeOrReport(() => deps.S_FaProjectSidebar().refreshProjectSidebar())
      await deps.hydrateFromBridgeOrReport(() => deps.S_FaProjectStyling().refreshProjectStyling())
    }
  })

  deps.onUnmounted(() => {
    if (faKeybindKeydownHandler !== undefined) {
      deps.detachWindowKeydownListener(faKeybindKeydownHandler)
    }
  })

  return {
    FA_APP_SHELL_DRAWER_TRANSITION_MS: deps.FA_APP_SHELL_DRAWER_TRANSITION_MS,
    FA_APP_SHELL_PAGE_TRANSITION_BINDINGS: deps.FA_APP_SHELL_PAGE_TRANSITION_BINDINGS,
    appShellLayoutQuasarView,
    appShellLayoutRouteClass,
    isFantasiaStorybookCanvas: deps.isFantasiaStorybookCanvas,
    resolveMainLayoutOutletKeyFromRoute: (childRoute) => resolveMainLayoutOutletKeyFromRoute(deps, childRoute),
    showWorkspaceDrawer
  }
}

export function createMainLayout (deps: T_createMainLayoutDeps): {
  useAppShellLayoutDrawerRail: (showWorkspaceDrawer: I_ref<boolean>) => { appShellLayoutQuasarView: I_ref<string> }
  useMainLayout: () => ReturnType<typeof useMainLayout>
} {
  const useAppShellLayoutDrawerRail = deps.createMainLayoutDrawerRail({
    computed: deps.computed
  })

  return {
    useAppShellLayoutDrawerRail,
    useMainLayout: () => useMainLayout(deps, useAppShellLayoutDrawerRail)
  }
}
