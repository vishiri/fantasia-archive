type T_faNoteboardAutoOpenWindowStore = {
  setWindowOpen: (open: boolean) => void
  text: string
}

type T_mainLayoutNoteboardHydrateDeps = {
  awaitWelcomeScreenAutoLoadBootCompletion: () => Promise<void>
  canOpenFloatingWindowWhileNoModal: () => boolean
  hydrateFromBridgeOrReport: (runner: () => Promise<unknown>) => Promise<void>
  maybeAutoOpenFilledNoteboard: (input: {
    canOpen: boolean
    preventFilledPopup: boolean
    setWindowOpen: (open: boolean) => void
    text: string
  }) => void
  S_FaActiveProject: () => { hasActiveProject: boolean }
  S_FaAppNoteboard: () => T_faNoteboardAutoOpenWindowStore & {
    refreshNoteboard: () => Promise<boolean>
  }
  S_FaProjectNoteboard: () => T_faNoteboardAutoOpenWindowStore & {
    refreshProjectNoteboard: () => Promise<boolean>
  }
  S_FaProjectSidebar: () => { refreshProjectSidebar: () => Promise<unknown> }
  S_FaProjectStyling: () => { refreshProjectStyling: () => Promise<unknown> }
  S_FaRecentProjects: () => { refreshRecentProjects: () => Promise<void> }
  S_FaUserSettings: () => {
    settings: {
      preventFilledAppNoteBoardPopup: boolean
      preventFilledProjectNoteBoardPopup: boolean
    } | null
  }
}

/**
 * Hydrates the app noteboard at Electron boot and auto-opens when filled unless prevented.
 */
export async function hydrateMainLayoutAppNoteboardWithAutoOpen (
  deps: T_mainLayoutNoteboardHydrateDeps
): Promise<void> {
  if (window.faContentBridgeAPIs?.faAppNoteboard === undefined) {
    return
  }
  const appNoteboardStore = deps.S_FaAppNoteboard()
  const appHydrated = await appNoteboardStore.refreshNoteboard()
  if (!appHydrated) {
    return
  }
  deps.maybeAutoOpenFilledNoteboard({
    canOpen: deps.canOpenFloatingWindowWhileNoModal(),
    preventFilledPopup:
      deps.S_FaUserSettings().settings?.preventFilledAppNoteBoardPopup ?? false,
    setWindowOpen: (open) => {
      appNoteboardStore.setWindowOpen(open)
    },
    text: appNoteboardStore.text
  })
}

/**
 * After welcome auto-load, hydrates project surfaces and auto-opens a filled project noteboard.
 */
export async function hydrateMainLayoutProjectSurfacesWithAutoOpen (
  deps: T_mainLayoutNoteboardHydrateDeps
): Promise<void> {
  if (window.faContentBridgeAPIs?.projectManagement === undefined) {
    return
  }
  await deps.awaitWelcomeScreenAutoLoadBootCompletion()
  await deps.S_FaRecentProjects().refreshRecentProjects()
  await deps.hydrateFromBridgeOrReport(async () => {
    const projectNoteboardStore = deps.S_FaProjectNoteboard()
    const projectHydrated = await projectNoteboardStore.refreshProjectNoteboard()
    if (!projectHydrated || !deps.S_FaActiveProject().hasActiveProject) {
      return
    }
    deps.maybeAutoOpenFilledNoteboard({
      canOpen: deps.canOpenFloatingWindowWhileNoModal(),
      preventFilledPopup:
        deps.S_FaUserSettings().settings?.preventFilledProjectNoteBoardPopup ?? false,
      setWindowOpen: (open) => {
        projectNoteboardStore.setWindowOpen(open)
      },
      text: projectNoteboardStore.text
    })
  })
  await deps.hydrateFromBridgeOrReport(() => deps.S_FaProjectSidebar().refreshProjectSidebar())
  await deps.hydrateFromBridgeOrReport(() => deps.S_FaProjectStyling().refreshProjectStyling())
}
