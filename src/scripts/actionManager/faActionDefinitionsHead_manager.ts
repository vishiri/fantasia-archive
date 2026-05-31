import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

import {
  handleOpenAboutFantasiaArchiveDialog,
  handleOpenAdvancedSearchGuideDialog,
  handleOpenChangelogDialog,
  handleOpenKeybindSettingsDialog,
  handleOpenLicenseDialog,
  handleOpenAppSettingsDialog,
  handleOpenProjectSettingsDialog,
  handleShowProjectDashboard,
  handleOpenAppStylingWindow,
  handleOpenProjectStylingWindow,
  handleOpenTipsTricksTriviaDialog,
  handleReportAppNoteboardSaveFailure,
  handleReportAppStylingPersistFailure,
  handleReportProjectStylingSaveFailure,
  handleReportBridgeLoadFailure,
  handleSaveKeybindSettings,
  handleSaveAppSettings,
  handleSaveProjectSettings,
  handleSaveAppStyling,
  handleSaveProjectStyling,
  handleToggleDeveloperTools,
  handleToggleAppNoteboardWindow,
  handleToggleProjectNoteboardWindow,
  handleReportProjectNoteboardSaveFailure
} from './faActionDefinitionHandlers_manager'

export const FA_ACTION_DEFINITIONS_HEAD: ReadonlyArray<I_faActionDefinition<T_faActionId>> = [
  {
    dedup: true,
    handler: handleToggleAppNoteboardWindow as I_faActionDefinition<T_faActionId>['handler'],
    id: 'toggleAppNoteboardWindow',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleToggleProjectNoteboardWindow as I_faActionDefinition<T_faActionId>['handler'],
    id: 'toggleProjectNoteboardWindow',
    kind: 'async'
  },
  {
    handler: handleToggleDeveloperTools as I_faActionDefinition<T_faActionId>['handler'],
    id: 'toggleDeveloperTools',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenKeybindSettingsDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openKeybindSettingsDialog',
    kind: 'async'
  },
  {
    handler: handleSaveKeybindSettings as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveKeybindSettings',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenAppSettingsDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openAppSettingsDialog',
    kind: 'async'
  },
  {
    handler: handleSaveAppSettings as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveAppSettings',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenProjectSettingsDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openProjectSettingsDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleShowProjectDashboard as I_faActionDefinition<T_faActionId>['handler'],
    id: 'showProjectDashboard',
    kind: 'async'
  },
  {
    handler: handleSaveProjectSettings as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveProjectSettings',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenAppStylingWindow as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openAppStylingWindow',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenProjectStylingWindow as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openProjectStylingDialog',
    kind: 'async'
  },
  {
    handler: handleSaveAppStyling as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveAppStyling',
    kind: 'async'
  },
  {
    handler: handleSaveProjectStyling as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveProjectStyling',
    kind: 'async'
  },
  {
    handler: handleReportAppNoteboardSaveFailure as I_faActionDefinition<T_faActionId>['handler'],
    id: 'reportAppNoteboardSaveFailure',
    kind: 'async'
  },
  {
    handler: handleReportProjectNoteboardSaveFailure as I_faActionDefinition<T_faActionId>['handler'],
    id: 'reportProjectNoteboardSaveFailure',
    kind: 'async'
  },
  {
    handler: handleReportAppStylingPersistFailure as I_faActionDefinition<T_faActionId>['handler'],
    id: 'reportAppStylingPersistFailure',
    kind: 'async'
  },
  {
    handler: handleReportProjectStylingSaveFailure as I_faActionDefinition<T_faActionId>['handler'],
    id: 'reportProjectStylingSaveFailure',
    kind: 'async'
  },
  {
    handler: handleReportBridgeLoadFailure as I_faActionDefinition<T_faActionId>['handler'],
    id: 'reportBridgeLoadFailure',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenAdvancedSearchGuideDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openAdvancedSearchGuideDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenChangelogDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openChangelogDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenLicenseDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openLicenseDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenAboutFantasiaArchiveDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openAboutFantasiaArchiveDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenTipsTricksTriviaDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openTipsTricksTriviaDialog',
    kind: 'async'
  }
]
