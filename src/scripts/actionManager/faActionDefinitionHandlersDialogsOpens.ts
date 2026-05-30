import type { I_createFaActionDefinitionHandlersDialogsDeps } from 'app/types/I_createFaActionDefinitionHandlersDialogsDeps'

export function buildFaActionDefinitionHandlersDialogsOpens (
  deps: I_createFaActionDefinitionHandlersDialogsDeps
): {
    handleOpenKeybindSettingsDialog: () => Promise<void>
    handleOpenAppSettingsDialog: () => Promise<void>
    handleOpenProjectSettingsDialog: () => Promise<void>
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
  } {
  async function handleOpenKeybindSettingsDialog (): Promise<void> {
    deps.openDialogComponent('KeybindSettings')
  }

  async function handleOpenAppSettingsDialog (): Promise<void> {
    deps.openDialogComponent('AppSettings')
  }

  async function handleOpenProjectSettingsDialog (): Promise<void> {
    if (!deps.S_FaActiveProject().hasActiveProject) {
      return
    }
    deps.openDialogComponent('ProjectSettings')
  }

  async function handleOpenAppStylingWindow (): Promise<void> {
    deps.openDialogComponent('WindowAppStyling')
  }

  async function handleOpenProjectStylingWindow (): Promise<void> {
    if (!deps.S_FaActiveProject().hasActiveProject) {
      return
    }
    if (!deps.canOpenFloatingWindowWhileNoModal()) {
      return
    }
    deps.openDialogComponent('WindowProjectStyling')
  }

  async function handleOpenAdvancedSearchGuideDialog (): Promise<void> {
    deps.openDialogMarkdownDocument('advancedSearchGuide')
  }

  async function handleOpenChangelogDialog (): Promise<void> {
    deps.openDialogMarkdownDocument('changeLog')
  }

  async function handleOpenLicenseDialog (): Promise<void> {
    deps.openDialogMarkdownDocument('license')
  }

  async function handleOpenAboutFantasiaArchiveDialog (): Promise<void> {
    deps.openDialogComponent('AboutFantasiaArchive')
  }

  async function handleOpenTipsTricksTriviaDialog (): Promise<void> {
    deps.openDialogMarkdownDocument('tipsTricksTrivia')
  }

  async function handleOpenActionMonitorDialog (): Promise<void> {
    deps.openDialogComponent('ActionMonitor')
  }

  async function handleOpenImportExportAppConfigDialog (): Promise<void> {
    deps.openDialogComponent('ImportExportAppConfig')
  }

  async function handleOpenNewProjectDialog (): Promise<void> {
    deps.openDialogComponent('NewProject')
  }

  return {
    handleOpenKeybindSettingsDialog,
    handleOpenAppSettingsDialog,
    handleOpenProjectSettingsDialog,
    handleOpenAppStylingWindow,
    handleOpenProjectStylingWindow,
    handleOpenAdvancedSearchGuideDialog,
    handleOpenChangelogDialog,
    handleOpenLicenseDialog,
    handleOpenAboutFantasiaArchiveDialog,
    handleOpenTipsTricksTriviaDialog,
    handleOpenActionMonitorDialog,
    handleOpenImportExportAppConfigDialog,
    handleOpenNewProjectDialog
  }
}
