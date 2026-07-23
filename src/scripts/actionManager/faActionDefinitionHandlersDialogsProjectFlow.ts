import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_createFaActionDefinitionHandlersDialogsDeps } from 'app/types/I_createFaActionDefinitionHandlersDialogsDeps'

function maybeAutoOpenProjectNoteboardAfterHydrate (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): void {
  const projectNoteboardStore = deps.S_FaProjectNoteboard()
  deps.maybeAutoOpenFilledNoteboard({
    canOpen: deps.canOpenFloatingWindowWhileNoModal(),
    preventFilledPopup:
      deps.S_FaUserSettings().settings?.preventFilledProjectNoteBoardPopup ?? false,
    setWindowOpen: (open) => {
      projectNoteboardStore.setWindowOpen(open)
    },
    text: projectNoteboardStore.text
  })
}

export function buildFaActionDefinitionHandlersDialogsProjectFlow (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): {
    handleCreateNewProject: (payload: I_faActionPayloadMap['createNewProject']) => Promise<void>
    handleLoadExistingProject: (
      payload: I_faActionPayloadMap['loadExistingProject']
    ) => Promise<{ payloadPreview: string } | void>
    handleShowStartupTipsNotification: () => Promise<void>
  } {
  async function handleCreateNewProject (
    payload: I_faActionPayloadMap['createNewProject']
  ): Promise<void> {
    try {
      const outcome = await deps.S_FaActiveProject().createProjectFromUserInput(payload.projectName)
      if (outcome === 'canceled') {
        throw new deps.FaActionUserCanceledError()
      }
      deps.notifyFaProjectCreatedPositive()
      const projectHydrated = await deps.S_FaProjectNoteboard().refreshProjectNoteboard()
      if (projectHydrated) {
        maybeAutoOpenProjectNoteboardAfterHydrate(deps)
      }
      await deps.S_FaProjectSidebar().refreshProjectSidebar()
      await deps.S_FaProjectStyling().refreshProjectStyling()
    } finally {
      await deps.S_FaRecentProjects().refreshRecentProjects()
    }
  }

  async function handleLoadExistingProject (
    payload: I_faActionPayloadMap['loadExistingProject']
  ): Promise<{ payloadPreview: string } | void> {
    try {
      const pathArg = payload.filePath
      const outcome =
      pathArg !== undefined && pathArg.length > 0
        ? await deps.S_FaActiveProject().openProjectFromKnownPath(pathArg)
        : await deps.S_FaActiveProject().openProjectFromUserDialog()
      if (outcome === 'canceled' || outcome === 'superseded') {
        throw new deps.FaActionUserCanceledError()
      }
      if (outcome === 'opened') {
        deps.notifyFaProjectLoadedPositive()
        const projectHydrated = await deps.S_FaProjectNoteboard().refreshProjectNoteboard()
        if (projectHydrated) {
          maybeAutoOpenProjectNoteboardAfterHydrate(deps)
        }
        await deps.S_FaProjectSidebar().refreshProjectSidebar()
        await deps.S_FaProjectStyling().refreshProjectStyling()
      }
      if (outcome === 'reused' && payload.resumeActiveSession !== true) {
        deps.notifyFaProjectAlreadyActiveWarning()
      }
      const snap = deps.S_FaActiveProject().activeProject
      if (snap === null) {
        throw new Error('Project open returned no active project snapshot.')
      }
      const payloadPreview = deps.buildFaActionPayloadPreview({
        filePath: snap.filePath,
        projectName: snap.name
      })
      return { payloadPreview }
    } finally {
      await deps.S_FaRecentProjects().refreshRecentProjects()
    }
  }

  async function handleShowStartupTipsNotification (): Promise<void> {
    let hideMascot = false
    const userSettingsBridge = window.faContentBridgeAPIs?.faUserSettings
    if (userSettingsBridge?.getSettings !== undefined) {
      const persistedSettings = await userSettingsBridge.getSettings()
      if (persistedSettings.hideTooltipsStart === true) {
        return
      }
      hideMascot = persistedSettings.hidePlushes === true
    }

    deps.tipsTricksTriviaNotification(hideMascot)
  }

  return {
    handleCreateNewProject,
    handleLoadExistingProject,
    handleShowStartupTipsNotification
  }
}
