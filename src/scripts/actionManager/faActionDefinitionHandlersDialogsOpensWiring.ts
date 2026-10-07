import type { I_createFaActionDefinitionHandlersDialogsDeps } from 'app/types/I_createFaActionDefinitionHandlersDialogsDeps'
import type { T_faProjectMediaPanel } from 'app/types/I_faProjectMediaDomain'

import { resolveFaProjectMediaOpenPanel } from 'app/src/scripts/faProjectMedia/faProjectMedia_manager'

async function handleOpenKeybindSettingsDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  if (deps.tryDismissFaComponentDialogIfOpen('KeybindSettings')) {
    return
  }
  deps.openDialogComponent('KeybindSettings')
}

async function handleOpenAppSettingsDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  if (deps.tryDismissFaComponentDialogIfOpen('AppSettings')) {
    return
  }
  deps.openDialogComponent('AppSettings')
}

async function handleOpenProjectSettingsDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps,
  payload?: { initialTab?: string } | void
): Promise<void> {
  if (deps.tryDismissFaComponentDialogIfOpen('ProjectSettings')) {
    return
  }
  if (!deps.S_FaActiveProject().hasActiveProject) {
    return
  }
  const initialTab =
    payload !== undefined && payload !== null && typeof payload === 'object'
      ? payload.initialTab
      : undefined
  deps.setProjectSettingsInitialTab(initialTab ?? null)
  deps.openDialogComponent('ProjectSettings')
}

async function handleOpenAppStylingWindow (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  deps.openDialogComponent('WindowAppStyling')
}

async function handleOpenProjectStylingWindow (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  if (!deps.S_FaActiveProject().hasActiveProject) {
    return
  }
  if (!deps.canOpenFloatingWindowWhileNoModal()) {
    return
  }
  deps.openDialogComponent('WindowProjectStyling')
}

async function handleOpenAdvancedSearchGuideDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  if (deps.tryDismissFaMarkdownDocumentIfOpen('advancedSearchGuide')) {
    return
  }
  deps.openDialogMarkdownDocument('advancedSearchGuide')
}

async function handleOpenChangelogDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  deps.openDialogMarkdownDocument('changeLog')
}

async function handleOpenLicenseDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  deps.openDialogMarkdownDocument('license')
}

async function handleOpenAboutFantasiaArchiveDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  deps.openDialogComponent('AboutFantasiaArchive')
}

async function handleOpenTipsTricksTriviaDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  deps.openDialogMarkdownDocument('tipsTricksTrivia')
}

async function handleOpenActionMonitorDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  if (deps.tryDismissFaComponentDialogIfOpen('ActionMonitor')) {
    return
  }
  deps.openDialogComponent('ActionMonitor')
}

async function handleOpenImportExportAppConfigDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  deps.openDialogComponent('ImportExportAppConfig')
}

async function handleOpenNewProjectDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  deps.openDialogComponent('NewProject')
}

async function handleOpenQuickAddDocumentDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  if (!deps.S_FaActiveProject().hasActiveProject) {
    return
  }
  const allowSameKeyClose = deps.S_FaUserSettings().settings?.allowQuickPopupSameKeyClose === true
  if (allowSameKeyClose && deps.tryDismissFaComponentDialogIfOpen('QuickAddDocument')) {
    return
  }
  deps.openDialogComponent('QuickAddDocument')
}

async function handleOpenProjectMediaDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps,
  payload?: { initialPanel?: T_faProjectMediaPanel } | void
): Promise<void> {
  if (!deps.S_FaActiveProject().hasActiveProject) {
    return
  }
  const initialPanelRaw =
    payload !== undefined && payload !== null && typeof payload === 'object'
      ? payload.initialPanel
      : undefined
  const hasAnyMedia = await deps.hasAnyProjectMedia()
  const panel = resolveFaProjectMediaOpenPanel({
    hasAnyMedia,
    initialPanelRaw
  })
  deps.setProjectMediaRequestedPanel(panel)
  deps.openDialogComponent('ProjectMedia')
}

async function handleOpenQuickSearchDocumentDialog (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): Promise<void> {
  if (!deps.S_FaActiveProject().hasActiveProject) {
    return
  }
  const allowSameKeyClose = deps.S_FaUserSettings().settings?.allowQuickPopupSameKeyClose === true
  if (allowSameKeyClose && deps.tryDismissFaComponentDialogIfOpen('QuickSearchDocument')) {
    return
  }
  deps.openDialogComponent('QuickSearchDocument')
}

export function buildFaActionDefinitionHandlersDialogsOpens (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): {
    handleOpenKeybindSettingsDialog: () => Promise<void>
    handleOpenAppSettingsDialog: () => Promise<void>
    handleOpenProjectSettingsDialog: (
      payload?: { initialTab?: string } | void
    ) => Promise<void>
    handleOpenAppStylingWindow: () => Promise<void>
    handleOpenProjectStylingWindow: () => Promise<void>
    handleOpenAdvancedSearchGuideDialog: () => Promise<void>
    handleOpenChangelogDialog: () => Promise<void>
    handleOpenLicenseDialog: () => Promise<void>
    handleOpenAboutFantasiaArchiveDialog: () => Promise<void>
    handleOpenTipsTricksTriviaDialog: () => Promise<void>
    handleOpenActionMonitorDialog: () => Promise<void>
    handleOpenImportExportAppConfigDialog: () => Promise<void>
    handleOpenNewProjectDialog: () => Promise<void>
    handleOpenQuickAddDocumentDialog: () => Promise<void>
    handleOpenProjectMediaDialog: (
      payload?: { initialPanel?: T_faProjectMediaPanel } | void
    ) => Promise<void>
    handleOpenQuickSearchDocumentDialog: () => Promise<void>
  } {
  const handleOpenAboutFantasiaArchiveDialogBound = (): Promise<void> => {
    return handleOpenAboutFantasiaArchiveDialog(deps)
  }
  const handleOpenActionMonitorDialogBound = (): Promise<void> => {
    return handleOpenActionMonitorDialog(deps)
  }
  const handleOpenAdvancedSearchGuideDialogBound = (): Promise<void> => {
    return handleOpenAdvancedSearchGuideDialog(deps)
  }
  const handleOpenAppSettingsDialogBound = (): Promise<void> => {
    return handleOpenAppSettingsDialog(deps)
  }
  const handleOpenAppStylingWindowBound = (): Promise<void> => {
    return handleOpenAppStylingWindow(deps)
  }
  const handleOpenChangelogDialogBound = (): Promise<void> => {
    return handleOpenChangelogDialog(deps)
  }
  const handleOpenImportExportAppConfigDialogBound = (): Promise<void> => {
    return handleOpenImportExportAppConfigDialog(deps)
  }
  const handleOpenKeybindSettingsDialogBound = (): Promise<void> => {
    return handleOpenKeybindSettingsDialog(deps)
  }
  const handleOpenLicenseDialogBound = (): Promise<void> => {
    return handleOpenLicenseDialog(deps)
  }
  const handleOpenNewProjectDialogBound = (): Promise<void> => {
    return handleOpenNewProjectDialog(deps)
  }
  const handleOpenProjectMediaDialogBound = (
    payload?: { initialPanel?: T_faProjectMediaPanel } | void
  ): Promise<void> => {
    return handleOpenProjectMediaDialog(deps, payload)
  }
  const handleOpenProjectSettingsDialogBound = (
    payload?: { initialTab?: string } | void
  ): Promise<void> => {
    return handleOpenProjectSettingsDialog(deps, payload)
  }
  const handleOpenProjectStylingWindowBound = (): Promise<void> => {
    return handleOpenProjectStylingWindow(deps)
  }
  const handleOpenQuickAddDocumentDialogBound = (): Promise<void> => {
    return handleOpenQuickAddDocumentDialog(deps)
  }
  const handleOpenQuickSearchDocumentDialogBound = (): Promise<void> => {
    return handleOpenQuickSearchDocumentDialog(deps)
  }
  const handleOpenTipsTricksTriviaDialogBound = (): Promise<void> => {
    return handleOpenTipsTricksTriviaDialog(deps)
  }

  return {
    handleOpenAboutFantasiaArchiveDialog: handleOpenAboutFantasiaArchiveDialogBound,
    handleOpenActionMonitorDialog: handleOpenActionMonitorDialogBound,
    handleOpenAdvancedSearchGuideDialog: handleOpenAdvancedSearchGuideDialogBound,
    handleOpenAppSettingsDialog: handleOpenAppSettingsDialogBound,
    handleOpenAppStylingWindow: handleOpenAppStylingWindowBound,
    handleOpenChangelogDialog: handleOpenChangelogDialogBound,
    handleOpenImportExportAppConfigDialog: handleOpenImportExportAppConfigDialogBound,
    handleOpenKeybindSettingsDialog: handleOpenKeybindSettingsDialogBound,
    handleOpenLicenseDialog: handleOpenLicenseDialogBound,
    handleOpenNewProjectDialog: handleOpenNewProjectDialogBound,
    handleOpenProjectMediaDialog: handleOpenProjectMediaDialogBound,
    handleOpenProjectSettingsDialog: handleOpenProjectSettingsDialogBound,
    handleOpenProjectStylingWindow: handleOpenProjectStylingWindowBound,
    handleOpenQuickAddDocumentDialog: handleOpenQuickAddDocumentDialogBound,
    handleOpenQuickSearchDocumentDialog: handleOpenQuickSearchDocumentDialogBound,
    handleOpenTipsTricksTriviaDialog: handleOpenTipsTricksTriviaDialogBound
  }
}
