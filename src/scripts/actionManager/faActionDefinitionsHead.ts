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
  handleOpenAppStylingWindow,
  handleOpenTipsTricksTriviaDialog,
  handleReportAppNoteboardSaveFailure,
  handleReportAppStylingPersistFailure,
  handleSaveKeybindSettings,
  handleSaveAppSettings,
  handleSaveAppStyling,
  handleToggleDeveloperTools,
  handleToggleAppNoteboardWindow
} from './faActionDefinitionHandlers'

export const FA_ACTION_DEFINITIONS_HEAD: ReadonlyArray<I_faActionDefinition<T_faActionId>> = [
  {
    dedup: true,
    handler: handleToggleAppNoteboardWindow as I_faActionDefinition<T_faActionId>['handler'],
    id: 'toggleAppNoteboardWindow',
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
    handler: handleOpenAppStylingWindow as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openAppStylingWindow',
    kind: 'async'
  },
  {
    handler: handleSaveAppStyling as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveAppStyling',
    kind: 'async'
  },
  {
    handler: handleReportAppNoteboardSaveFailure as I_faActionDefinition<T_faActionId>['handler'],
    id: 'reportAppNoteboardSaveFailure',
    kind: 'async'
  },
  {
    handler: handleReportAppStylingPersistFailure as I_faActionDefinition<T_faActionId>['handler'],
    id: 'reportAppStylingPersistFailure',
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
