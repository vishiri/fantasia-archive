import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaRecentProjects } from 'app/src/stores/S_FaRecentProjects'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import type { I_faActionPayloadMap } from 'app/types/I_faActionManagerDomain'
import {
  openDialogComponent,
  openDialogMarkdownDocument
} from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { canOpenAppNoteboardFloatingWindow } from 'app/src/scripts/appNoteboard/faAppNoteboardCanOpen'
import { FaActionUserCanceledError } from 'app/src/scripts/actionManager/faActionUserCanceledError'
import { buildFaActionPayloadPreview } from 'app/src/scripts/actionManager/faActionManagerErrorReporting'
import {
  notifyFaProjectCreatedPositive,
  notifyFaProjectLoadedPositive
} from 'app/src/scripts/actionManager/faProjectSessionNotify'
import { tipsTricksTriviaNotification } from 'app/src/scripts/appGlobalManagementUI/tipsTricksTriviaNotification'

export async function handleOpenKeybindSettingsDialog (): Promise<void> {
  openDialogComponent('KeybindSettings')
}

export async function handleOpenAppSettingsDialog (): Promise<void> {
  openDialogComponent('AppSettings')
}

export async function handleOpenAppStylingWindow (): Promise<void> {
  openDialogComponent('WindowAppStyling')
}

export async function handleOpenProjectStylingWindow (): Promise<void> {
  if (!S_FaActiveProject().hasActiveProject) {
    return
  }
  if (!canOpenAppNoteboardFloatingWindow()) {
    return
  }
  openDialogComponent('WindowProjectStyling')
}

export async function handleOpenAdvancedSearchGuideDialog (): Promise<void> {
  openDialogMarkdownDocument('advancedSearchGuide')
}

export async function handleOpenChangelogDialog (): Promise<void> {
  openDialogMarkdownDocument('changeLog')
}

export async function handleOpenLicenseDialog (): Promise<void> {
  openDialogMarkdownDocument('license')
}

export async function handleOpenAboutFantasiaArchiveDialog (): Promise<void> {
  openDialogComponent('AboutFantasiaArchive')
}

export async function handleOpenTipsTricksTriviaDialog (): Promise<void> {
  openDialogMarkdownDocument('tipsTricksTrivia')
}

export async function handleOpenActionMonitorDialog (): Promise<void> {
  openDialogComponent('ActionMonitor')
}

export async function handleOpenImportExportAppConfigDialog (): Promise<void> {
  openDialogComponent('ImportExportAppConfig')
}

export async function handleExportAppConfigPackage (
  _payload: I_faActionPayloadMap['exportAppConfigPackage']
): Promise<void> {
}

export async function handleExportAppConfigSaveResult (
  payload: I_faActionPayloadMap['exportAppConfigSaveResult']
): Promise<void> {
  if (payload.status === 'error') {
    throw new Error(payload.errorMessage ?? payload.errorName ?? 'Export to file failed')
  }
}

export async function handleImportAppConfigStageResult (
  payload: I_faActionPayloadMap['importAppConfigStageResult']
): Promise<void> {
  if (payload.status === 'fail') {
    throw new Error(payload.errorMessage ?? 'Import validation failed')
  }
}

export async function handleImportAppConfigApply (
  payload: I_faActionPayloadMap['importAppConfigApply']
): Promise<void> {
  const api = window.faContentBridgeAPIs?.faAppConfig
  if (api === undefined) {
    throw new Error('App configuration is only available in the desktop app.')
  }
  await api.applyImport(payload)
  await Promise.all([
    S_FaKeybinds().refreshKeybinds(),
    S_FaAppNoteboard().refreshNoteboard(),
    S_FaProjectNoteboard().refreshProjectNoteboard(),
    S_FaProjectStyling().refreshProjectStyling(),
    S_FaAppStyling().refreshAppStyling(),
    S_FaUserSettings().refreshSettings()
  ])
}

export async function handleOpenNewProjectDialog (): Promise<void> {
  openDialogComponent('NewProject')
}

export async function handleCreateNewProject (
  payload: I_faActionPayloadMap['createNewProject']
): Promise<void> {
  try {
    const outcome = await S_FaActiveProject().createProjectFromUserInput(payload.projectName)
    if (outcome === 'canceled') {
      throw new FaActionUserCanceledError()
    }
    notifyFaProjectCreatedPositive()
    await S_FaProjectNoteboard().refreshProjectNoteboard()
    await S_FaProjectStyling().refreshProjectStyling()
  } finally {
    await S_FaRecentProjects().refreshRecentProjects()
  }
}

export async function handleLoadExistingProject (
  payload: I_faActionPayloadMap['loadExistingProject']
): Promise<{ payloadPreview: string } | void> {
  try {
    const pathArg = payload.filePath
    const outcome =
      pathArg !== undefined && pathArg.length > 0
        ? await S_FaActiveProject().openProjectFromKnownPath(pathArg)
        : await S_FaActiveProject().openProjectFromUserDialog()
    if (outcome === 'canceled') {
      throw new FaActionUserCanceledError()
    }
    notifyFaProjectLoadedPositive()
    await S_FaProjectNoteboard().refreshProjectNoteboard()
    await S_FaProjectStyling().refreshProjectStyling()
    const snap = S_FaActiveProject().activeProject
    if (snap === null) {
      throw new Error('Project open returned no active project snapshot.')
    }
    const payloadPreview = buildFaActionPayloadPreview({
      filePath: snap.filePath,
      projectName: snap.name
    })
    return { payloadPreview }
  } finally {
    await S_FaRecentProjects().refreshRecentProjects()
  }
}

export async function handleShowStartupTipsNotification (): Promise<void> {
  tipsTricksTriviaNotification(false)
}
