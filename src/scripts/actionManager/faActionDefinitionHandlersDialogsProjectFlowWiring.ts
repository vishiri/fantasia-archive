import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import type { I_createFaActionDefinitionHandlersDialogsDeps } from 'app/types/I_createFaActionDefinitionHandlersDialogsDeps'

import { syncHideHierarchyTreeWhenNoWorldTemplatePlacements } from 'app/src/scripts/projectWorlds/functions/faProjectWorldTemplatePlacementHideHierarchyTree'

async function maybeAutoHideHierarchyTreeWhenNoWorldTemplatePlacements (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  const hierarchyTreeStore = deps.S_FaProjectHierarchyTree()
  const userSettingsStore = deps.S_FaUserSettings()
  const activeProject = deps.S_FaActiveProject()
  const epochAtStart = activeProject.readProjectContentEpoch()
  const projectStillCurrent = (): boolean => {
    if (activeProject.isProjectReplacementInFlight()) {
      return false
    }
    return activeProject.readProjectContentEpoch() === epochAtStart
  }
  await syncHideHierarchyTreeWhenNoWorldTemplatePlacements({
    getHideHierarchyTree: () => userSettingsStore.settings?.hideHierarchyTree === true,
    getWorlds: () => hierarchyTreeStore.worlds,
    patchHideHierarchyTree: async (hideHierarchyTree) => {
      await userSettingsStore.patchSettingsSilently({ hideHierarchyTree })
    },
    projectStillCurrent,
    refreshLayout: async () => {
      await hierarchyTreeStore.refreshLayout()
    }
  })
}

function projectOpenFlowStillCurrent (
  deps: I_createFaActionDefinitionHandlersDialogsDeps,
  epochAtStart: number
): boolean {
  const activeProject = deps.S_FaActiveProject()
  if (activeProject.isProjectReplacementInFlight()) {
    return false
  }
  return activeProject.readProjectContentEpoch() === epochAtStart
}

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

async function showStartupTipsNotification (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  let hideMascot = false
  const userSettingsBridge = window.faContentBridgeAPIs?.faUserSettings
  if (userSettingsBridge?.getSettings !== undefined) {
    const persistedSettings = await userSettingsBridge.getSettings()
    if (persistedSettings.hideTooltipsStart === true) {
      return
    }
    hideMascot = persistedSettings.hidePlushes === true
  }
  if (deps.S_FaActiveProject().hasActiveProject) {
    return
  }
  deps.tipsTricksTriviaNotification(hideMascot)
}

export function buildFaActionDefinitionHandlersDialogsProjectFlow (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): {
    handleCreateNewProject: (payload: I_faActionPayloadMap['createNewProject']) => Promise<void>
    handleLoadExistingProject: (
      payload: I_faActionPayloadMap['loadExistingProject']
    ) => Promise<{ payloadPreview: string } | void>
    handleShowStartupTipsNotification: () => Promise<void>
    handleCheckForAppUpdates: (
      payload: I_faActionPayloadMap['checkForAppUpdates']
    ) => Promise<void>
  } {
  async function handleCreateNewProject (
    payload: I_faActionPayloadMap['createNewProject']
  ): Promise<void> {
    await Promise.resolve()
      .then(async () => {
        const outcome = await deps.S_FaActiveProject().createProjectFromUserInput(payload.projectName)
        if (outcome === 'canceled' || outcome === 'superseded') {
          throw new deps.FaActionUserCanceledError()
        }
        deps.notifyFaProjectCreatedPositive()
        const epochAtStart = deps.S_FaActiveProject().readProjectContentEpoch()
        const projectHydrated = await deps.S_FaProjectNoteboard().refreshProjectNoteboard()
        if (projectHydrated && projectOpenFlowStillCurrent(deps, epochAtStart)) {
          maybeAutoOpenProjectNoteboardAfterHydrate(deps)
        }
        await deps.S_FaProjectSidebar().refreshProjectSidebar()
        await deps.S_FaProjectStyling().refreshProjectStyling()
        await maybeAutoHideHierarchyTreeWhenNoWorldTemplatePlacements(deps)
      })
      .finally(async () => {
        await deps.S_FaRecentProjects().refreshRecentProjects()
      })
  }

  async function handleLoadExistingProject (
    payload: I_faActionPayloadMap['loadExistingProject']
  ): Promise<{ payloadPreview: string } | void> {
    return await Promise.resolve()
      .then(async () => {
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
          const epochAtStart = deps.S_FaActiveProject().readProjectContentEpoch()
          const projectHydrated = await deps.S_FaProjectNoteboard().refreshProjectNoteboard()
          if (projectHydrated && projectOpenFlowStillCurrent(deps, epochAtStart)) {
            maybeAutoOpenProjectNoteboardAfterHydrate(deps)
          }
          await deps.S_FaProjectSidebar().refreshProjectSidebar()
          await deps.S_FaProjectStyling().refreshProjectStyling()
          await maybeAutoHideHierarchyTreeWhenNoWorldTemplatePlacements(deps)
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
      })
      .finally(async () => {
        await deps.S_FaRecentProjects().refreshRecentProjects()
      })
  }

  const handleShowStartupTipsNotification = (): Promise<void> => {
    return showStartupTipsNotification(deps)
  }

  async function handleCheckForAppUpdates (
    payload: I_faActionPayloadMap['checkForAppUpdates']
  ): Promise<void> {
    await deps.checkForAppUpdates(payload.source)
  }

  return {
    handleCreateNewProject,
    handleLoadExistingProject,
    handleShowStartupTipsNotification,
    handleCheckForAppUpdates
  }
}
