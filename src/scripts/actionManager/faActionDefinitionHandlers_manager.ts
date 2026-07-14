import { i18n } from 'app/i18n/externalFileLoader'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaAppNoteboard } from 'app/src/stores/S_FaAppNoteboard'
import { S_FaProjectNoteboard } from 'app/src/stores/S_FaProjectNoteboard'
import { S_FaActiveProject } from 'app/src/stores/S_FaActiveProject'
import { S_FaAppStyling } from 'app/src/stores/S_FaAppStyling'
import { S_FaProjectStyling } from 'app/src/stores/S_FaProjectStyling'
import { S_FaProjectSettings } from 'app/src/stores/S_FaProjectSettings'
import { S_FaProjectWorkspaceWorlds } from 'app/src/stores/S_FaProjectWorkspaceWorlds'
import { S_FaProjectHierarchyTree } from 'app/src/stores/S_FaProjectHierarchyTree'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import { canOpenFloatingWindowWhileNoModal } from 'app/src/scripts/appNoteboard/appNoteboard_manager'
import { toggleDevTools } from 'app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager'
import { applyFaUserSettingsLanguageSelection } from 'app/src/scripts/appInternals/faAppInternalsLocale_manager'
import { faProjectDocumentTemplatesPersistSnapshotFromDialog } from 'app/src/stores/scripts/sFaProjectDocumentTemplatesBridge'
import { faProjectWorldsPersistSnapshotFromDialog } from 'app/src/stores/scripts/sFaProjectWorldsBridge'
import { navigateToWorkspaceHomeRoute, resolveFaAppRouterCurrentPath } from 'app/src/scripts/appInternals/faAppRouterSession_manager'
import { resolveFaDocumentWorkspaceRouteDocumentId } from 'app/src/scripts/appRouting/functions/faDocumentWorkspacePageTransition'
import { resolveAdjacentOpenedDocumentTabId } from 'app/src/scripts/openedDocuments/functions/openedDocumentTabDomain'
import {
  resolveCanEditActiveDocumentViaKeybind
} from 'app/src/scripts/openedDocuments/functions/openedDocumentWorkspaceKeybindGuards'
import {
  resolveShowProjectDocumentControlBarEditButton
} from 'app/src/components/projectUI/ProjectDocumentControlBar/functions/projectDocumentControlBarEditMode'
import {
  resolveDocumentTabLabelFromOpenedTab
} from 'app/src/components/projectUI/ProjectDocumentControlBar/functions/projectDocumentControlBarVisibility'
import { S_FaOpenedDocuments } from 'app/src/stores/S_FaOpenedDocuments'
import { copyToClipboard } from 'quasar'

import { createFaActionDefinitionHandlers } from './functions/createFaActionDefinitionHandlers'
import { createFaActionDefinitionHandlersDocumentWorkspace } from './functions/createFaActionDefinitionHandlersDocumentWorkspace'
import { createFaActionDefinitionHandlersOpenedDocumentTabClipboard } from './faActionDefinitionHandlersOpenedDocumentTabClipboard'
import { createFaActionDefinitionHandlersShowProjectDashboard } from './functions/createFaActionDefinitionHandlersShowProjectDashboard'
import { buildFaActionDefinitionHandlersWindowChrome } from './faActionDefinitionHandlersWindowChrome'
import { notifyCreateForFaActionDefinitionHandlers } from './faActionDefinitionHandlersNotifyWiring'
import {
  handleCreateNewProject as handleCreateNewProjectExport,
  handleExportAppConfigPackage as handleExportAppConfigPackageExport,
  handleExportAppConfigSaveResult as handleExportAppConfigSaveResultExport,
  handleImportAppConfigApply as handleImportAppConfigApplyExport,
  handleImportAppConfigStageResult as handleImportAppConfigStageResultExport,
  handleLoadExistingProject as handleLoadExistingProjectExport,
  handleOpenAboutFantasiaArchiveDialog as handleOpenAboutFantasiaArchiveDialogExport,
  handleOpenActionMonitorDialog as handleOpenActionMonitorDialogExport,
  handleOpenAdvancedSearchGuideDialog as handleOpenAdvancedSearchGuideDialogExport,
  handleOpenAppSettingsDialog as handleOpenAppSettingsDialogExport,
  handleOpenAppStylingWindow as handleOpenAppStylingWindowExport,
  handleOpenChangelogDialog as handleOpenChangelogDialogExport,
  handleOpenImportExportAppConfigDialog as handleOpenImportExportAppConfigDialogExport,
  handleOpenKeybindSettingsDialog as handleOpenKeybindSettingsDialogExport,
  handleOpenLicenseDialog as handleOpenLicenseDialogExport,
  handleOpenNewProjectDialog as handleOpenNewProjectDialogExport,
  handleOpenProjectSettingsDialog as handleOpenProjectSettingsDialogExport,
  handleOpenProjectStylingWindow as handleOpenProjectStylingWindowExport,
  handleOpenTipsTricksTriviaDialog as handleOpenTipsTricksTriviaDialogExport,
  handleShowStartupTipsNotification as handleShowStartupTipsNotificationExport
} from './faActionDefinitionHandlersDialogs_manager'

const faActionDefinitionHandlersApi = {
  ...createFaActionDefinitionHandlers({
    i18n,
    notifyCreate: notifyCreateForFaActionDefinitionHandlers,
    S_FaKeybinds,
    S_FaAppNoteboard,
    S_FaProjectNoteboard,
    S_FaActiveProject,
    S_FaAppStyling,
    S_FaProjectStyling,
    S_FaProjectSettings,
    S_FaProjectWorkspaceWorlds,
    S_FaProjectHierarchyTree,
    S_FaUserSettings,
    canOpenFloatingWindowWhileNoModal,
    applyFaUserSettingsLanguageSelection,
    faProjectWorldsPersistSnapshotFromDialog,
    faProjectDocumentTemplatesPersistSnapshotFromDialog
  }),
  ...buildFaActionDefinitionHandlersWindowChrome({
    toggleDevTools
  }),
  ...createFaActionDefinitionHandlersShowProjectDashboard({
    S_FaActiveProject,
    navigateToWorkspaceHomeRoute
  }),
  ...createFaActionDefinitionHandlersDocumentWorkspace({
    S_FaOpenedDocuments,
    getCurrentRoutePath: resolveFaAppRouterCurrentPath,
    i18n,
    notifyCreate: notifyCreateForFaActionDefinitionHandlers,
    resolveAdjacentOpenedDocumentTabId,
    resolveCanEditActiveDocumentViaKeybind,
    resolveFaDocumentWorkspaceRouteDocumentId,
    resolveShowProjectDocumentControlBarEditButton
  }),
  ...createFaActionDefinitionHandlersOpenedDocumentTabClipboard({
    S_FaOpenedDocuments,
    copyToClipboard,
    i18n,
    notifyCreate: notifyCreateForFaActionDefinitionHandlers,
    resolveDocumentTabLabelFromOpenedTab
  })
}

export const handleReportAppNoteboardSaveFailure =
  faActionDefinitionHandlersApi.handleReportAppNoteboardSaveFailure

export const handleToggleAppNoteboardWindow =
  faActionDefinitionHandlersApi.handleToggleAppNoteboardWindow

export const handleReportProjectNoteboardSaveFailure =
  faActionDefinitionHandlersApi.handleReportProjectNoteboardSaveFailure

export const handleToggleProjectNoteboardWindow =
  faActionDefinitionHandlersApi.handleToggleProjectNoteboardWindow

export const handleReportAppStylingPersistFailure =
  faActionDefinitionHandlersApi.handleReportAppStylingPersistFailure

export const handleReportProjectStylingSaveFailure =
  faActionDefinitionHandlersApi.handleReportProjectStylingSaveFailure

export const handleReportBridgeLoadFailure =
  faActionDefinitionHandlersApi.handleReportBridgeLoadFailure

export const handleSaveKeybindSettings =
  faActionDefinitionHandlersApi.handleSaveKeybindSettings

export const handleSaveAppSettings = faActionDefinitionHandlersApi.handleSaveAppSettings

export const handleSaveProjectSettings = faActionDefinitionHandlersApi.handleSaveProjectSettings

export const handleSaveAppStyling = faActionDefinitionHandlersApi.handleSaveAppStyling

export const handleSaveProjectStyling = faActionDefinitionHandlersApi.handleSaveProjectStyling

export const handleLanguageSwitch = faActionDefinitionHandlersApi.handleLanguageSwitch

export const handleResizeApp = faActionDefinitionHandlersApi.handleResizeApp

export const handleMinimizeApp = faActionDefinitionHandlersApi.handleMinimizeApp

export const handleCloseApp = faActionDefinitionHandlersApi.handleCloseApp

export const handleRefreshWebContents = faActionDefinitionHandlersApi.handleRefreshWebContents

export const handleToggleDeveloperTools = faActionDefinitionHandlersApi.handleToggleDeveloperTools

export const handleCreateNewProject = handleCreateNewProjectExport

export const handleExportAppConfigPackage = handleExportAppConfigPackageExport

export const handleExportAppConfigSaveResult = handleExportAppConfigSaveResultExport

export const handleImportAppConfigApply = handleImportAppConfigApplyExport

export const handleImportAppConfigStageResult = handleImportAppConfigStageResultExport

export const handleLoadExistingProject = handleLoadExistingProjectExport

export const handleOpenAboutFantasiaArchiveDialog = handleOpenAboutFantasiaArchiveDialogExport

export const handleOpenActionMonitorDialog = handleOpenActionMonitorDialogExport

export const handleOpenAdvancedSearchGuideDialog = handleOpenAdvancedSearchGuideDialogExport

export const handleOpenAppSettingsDialog = handleOpenAppSettingsDialogExport

export const handleOpenAppStylingWindow = handleOpenAppStylingWindowExport

export const handleOpenChangelogDialog = handleOpenChangelogDialogExport

export const handleOpenImportExportAppConfigDialog = handleOpenImportExportAppConfigDialogExport

export const handleOpenKeybindSettingsDialog = handleOpenKeybindSettingsDialogExport

export const handleOpenLicenseDialog = handleOpenLicenseDialogExport

export const handleOpenNewProjectDialog = handleOpenNewProjectDialogExport

export const handleOpenProjectSettingsDialog = handleOpenProjectSettingsDialogExport

export const handleShowProjectDashboard =
  faActionDefinitionHandlersApi.handleShowProjectDashboard

export const handleOpenProjectStylingWindow = handleOpenProjectStylingWindowExport

export const handleOpenTipsTricksTriviaDialog = handleOpenTipsTricksTriviaDialogExport

export const handleShowStartupTipsNotification = handleShowStartupTipsNotificationExport

export const handleCreateTemporaryOpenedDocument =
  faActionDefinitionHandlersApi.handleCreateTemporaryOpenedDocument

export const handleEditActiveDocument =
  faActionDefinitionHandlersApi.handleEditActiveDocument

export const handleSaveOpenedDocumentDisplayName =
  faActionDefinitionHandlersApi.handleSaveOpenedDocumentDisplayName

export const handleCopyOpenedDocumentTabName =
  faActionDefinitionHandlersApi.handleCopyOpenedDocumentTabName

export const handleCopyOpenedDocumentTabTextColor =
  faActionDefinitionHandlersApi.handleCopyOpenedDocumentTabTextColor

export const handleCopyOpenedDocumentTabBackgroundColor =
  faActionDefinitionHandlersApi.handleCopyOpenedDocumentTabBackgroundColor

export const handleFocusPreviousOpenedDocumentTab =
  faActionDefinitionHandlersApi.handleFocusPreviousOpenedDocumentTab

export const handleFocusNextOpenedDocumentTab =
  faActionDefinitionHandlersApi.handleFocusNextOpenedDocumentTab

export const handleMoveActiveOpenedDocumentTabLeft =
  faActionDefinitionHandlersApi.handleMoveActiveOpenedDocumentTabLeft

export const handleMoveActiveOpenedDocumentTabRight =
  faActionDefinitionHandlersApi.handleMoveActiveOpenedDocumentTabRight
