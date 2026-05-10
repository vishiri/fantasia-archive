import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

import {
  handleCloseApp,
  handleCreateNewProject,
  handleExportAppConfigPackage,
  handleExportAppConfigSaveResult,
  handleImportAppConfigApply,
  handleImportAppConfigStageResult,
  handleLanguageSwitch,
  handleLoadExistingProject,
  handleMinimizeApp,
  handleOpenActionMonitorDialog,
  handleOpenImportExportAppConfigDialog,
  handleOpenNewProjectDialog,
  handleRefreshWebContents,
  handleResizeApp,
  handleShowStartupTipsNotification
} from './faActionDefinitionHandlers'

export const FA_ACTION_DEFINITIONS_TAIL: ReadonlyArray<I_faActionDefinition<T_faActionId>> = [
  {
    dedup: true,
    handler: handleCloseApp,
    id: 'closeApp',
    kind: 'sync'
  },
  {
    handler: handleMinimizeApp,
    id: 'minimizeApp',
    kind: 'async'
  },
  {
    handler: handleResizeApp,
    id: 'resizeApp',
    kind: 'async'
  },
  {
    handler: handleLanguageSwitch as I_faActionDefinition<T_faActionId>['handler'],
    id: 'languageSwitch',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleRefreshWebContents,
    id: 'refreshWebContentsAfterLanguage',
    kind: 'sync'
  },
  {
    dedup: true,
    handler: handleOpenActionMonitorDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openActionMonitorDialog',
    kind: 'async'
  },
  {
    handler: handleShowStartupTipsNotification as I_faActionDefinition<T_faActionId>['handler'],
    id: 'showStartupTipsNotification',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenImportExportAppConfigDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openImportExportAppConfigDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenNewProjectDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openNewProjectDialog',
    kind: 'async'
  },
  {
    handler: handleExportAppConfigPackage as I_faActionDefinition<T_faActionId>['handler'],
    id: 'exportAppConfigPackage',
    kind: 'async'
  },
  {
    handler: handleExportAppConfigSaveResult as I_faActionDefinition<T_faActionId>['handler'],
    id: 'exportAppConfigSaveResult',
    kind: 'async'
  },
  {
    handler: handleImportAppConfigStageResult as I_faActionDefinition<T_faActionId>['handler'],
    id: 'importAppConfigStageResult',
    kind: 'async'
  },
  {
    handler: handleImportAppConfigApply as I_faActionDefinition<T_faActionId>['handler'],
    id: 'importAppConfigApply',
    kind: 'async'
  },
  {
    handler: handleCreateNewProject as I_faActionDefinition<T_faActionId>['handler'],
    id: 'createNewProject',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleLoadExistingProject as I_faActionDefinition<T_faActionId>['handler'],
    id: 'loadExistingProject',
    kind: 'async'
  }
]
