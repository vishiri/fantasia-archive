import type { I_faProjectDocumentTemplateSnapshotItem } from 'app/types/I_faProjectDocumentTemplateDomain'
import type { I_faProjectSettingsPatch } from 'app/types/I_faProjectSettingsDomain'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'

type T_createFaActionDefinitionHandlersProjectSettingsDeps = {
  notifyCreate: (options: { group: boolean, message: string, type: string }) => void
  i18n: { global: { t: (key: string) => string } }
  S_FaActiveProject: () => {
    hasActiveProject: boolean
    isProjectReplacementInFlight: () => boolean
    readProjectContentEpoch: () => number
  }
  S_FaProjectSettings: () => {
    updateProjectSettings: (
      patch: I_faProjectSettingsPatch,
      epochAtStart?: number
    ) => Promise<void>
  }
  S_FaProjectHierarchyTree: () => {
    bumpDocumentCensusRefreshGeneration: () => void
    reloadDocumentIndexFromBridge: () => Promise<void>
  }
  S_FaProjectWorkspaceWorlds: () => { refreshWorkspaceWorlds: () => Promise<void> }
  faProjectWorldsPersistSnapshotFromDialog: (items: I_faProjectWorldSnapshotItem[]) => Promise<void>
  faProjectDocumentTemplatesPersistSnapshotFromDialog: (
    items: I_faProjectDocumentTemplateSnapshotItem[]
  ) => Promise<void>
  createProjectSwitchCanceledError: () => Error
}

type T_saveProjectSettingsPayload = {
  documentTemplates?: I_faProjectDocumentTemplateSnapshotItem[]
  settings: I_faProjectSettingsPatch
  worlds?: I_faProjectWorldSnapshotItem[]
}

function throwIfProjectContentEpochMoved (
  deps: T_createFaActionDefinitionHandlersProjectSettingsDeps,
  epochAtStart: number
): void {
  const activeProject = deps.S_FaActiveProject()
  if (activeProject.isProjectReplacementInFlight()) {
    throw deps.createProjectSwitchCanceledError()
  }
  if (activeProject.readProjectContentEpoch() !== epochAtStart) {
    throw deps.createProjectSwitchCanceledError()
  }
}

async function handleSaveProjectSettings (
  deps: T_createFaActionDefinitionHandlersProjectSettingsDeps,
  payload: T_saveProjectSettingsPayload
): Promise<void> {
  if (!deps.S_FaActiveProject().hasActiveProject) {
    throw new Error(deps.i18n.global.t('globalFunctionality.faProjectSettings.saveError'))
  }
  const epochAtStart = deps.S_FaActiveProject().readProjectContentEpoch()
  await deps.S_FaProjectSettings().updateProjectSettings(payload.settings, epochAtStart)
  throwIfProjectContentEpochMoved(deps, epochAtStart)
  let shouldRefreshOverviewDocumentCensus = false
  if (payload.documentTemplates !== undefined) {
    await deps.faProjectDocumentTemplatesPersistSnapshotFromDialog(payload.documentTemplates)
    throwIfProjectContentEpochMoved(deps, epochAtStart)
    shouldRefreshOverviewDocumentCensus = true
  }
  if (payload.worlds !== undefined) {
    await deps.faProjectWorldsPersistSnapshotFromDialog(payload.worlds)
    throwIfProjectContentEpochMoved(deps, epochAtStart)
    await deps.S_FaProjectWorkspaceWorlds().refreshWorkspaceWorlds()
    throwIfProjectContentEpochMoved(deps, epochAtStart)
    await deps.S_FaProjectHierarchyTree().reloadDocumentIndexFromBridge()
    throwIfProjectContentEpochMoved(deps, epochAtStart)
    shouldRefreshOverviewDocumentCensus = true
  }
  if (shouldRefreshOverviewDocumentCensus) {
    deps.S_FaProjectHierarchyTree().bumpDocumentCensusRefreshGeneration()
  }
  const saveSuccessMessage = deps.i18n.global.t('globalFunctionality.faProjectSettings.saveSuccess')
  deps.notifyCreate({
    group: false,
    type: 'positive',
    message: saveSuccessMessage
  })
}

export function createFaActionDefinitionHandlersProjectSettings (
  deps: T_createFaActionDefinitionHandlersProjectSettingsDeps
): {
    handleSaveProjectSettings: (payload: T_saveProjectSettingsPayload) => Promise<void>
  } {
  function boundHandleSaveProjectSettings (
    payload: T_saveProjectSettingsPayload
  ): Promise<void> {
    return handleSaveProjectSettings(deps, payload)
  }
  return {
    handleSaveProjectSettings: boundHandleSaveProjectSettings
  }
}
