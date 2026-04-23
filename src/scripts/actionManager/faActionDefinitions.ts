import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'

import {
  handleCloseApp,
  handleLanguageSwitch,
  handleMinimizeApp,
  handleOpenAboutFantasiaArchiveDialog,
  handleOpenActionMonitorDialog,
  handleOpenAdvancedSearchGuideDialog,
  handleOpenChangelogDialog,
  handleImportProgramConfigApply,
  handleImportProgramConfigStageResult,
  handleExportProgramConfigPackage,
  handleExportProgramConfigSaveResult,
  handleOpenImportExportProgramConfigDialog,
  handleOpenKeybindSettingsDialog,
  handleOpenLicenseDialog,
  handleOpenProgramSettingsDialog,
  handleOpenProgramStylingWindow,
  handleOpenTipsTricksTriviaDialog,
  handleRefreshWebContents,
  handleResizeApp,
  handleSaveKeybindSettings,
  handleSaveProgramSettings,
  handleSaveProgramStyling,
  handleShowStartupTipsNotification,
  handleToggleDeveloperTools
} from './faActionDefinitionHandlers'

/**
 * Single source of truth for every renderer-side user-meaningful action.
 * To add a new action: extend 'FA_ACTION_IDS' / 'I_faActionPayloadMap' in 'types/I_faActionManagerDomain.ts',
 * then append the matching definition here so the compiler enforces both ends.
 */
export const FA_ACTION_DEFINITIONS: ReadonlyArray<I_faActionDefinition<T_faActionId>> = [
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
    handler: handleOpenProgramSettingsDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openProgramSettingsDialog',
    kind: 'async'
  },
  {
    handler: handleSaveProgramSettings as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveProgramSettings',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleOpenProgramStylingWindow as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openProgramStylingWindow',
    kind: 'async'
  },
  {
    handler: handleSaveProgramStyling as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveProgramStyling',
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
  },
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
    handler: handleOpenImportExportProgramConfigDialog as I_faActionDefinition<T_faActionId>['handler'],
    id: 'openImportExportProgramConfigDialog',
    kind: 'async'
  },
  {
    handler: handleExportProgramConfigPackage as I_faActionDefinition<T_faActionId>['handler'],
    id: 'exportProgramConfigPackage',
    kind: 'async'
  },
  {
    handler: handleExportProgramConfigSaveResult as I_faActionDefinition<T_faActionId>['handler'],
    id: 'exportProgramConfigSaveResult',
    kind: 'async'
  },
  {
    handler: handleImportProgramConfigStageResult as I_faActionDefinition<T_faActionId>['handler'],
    id: 'importProgramConfigStageResult',
    kind: 'async'
  },
  {
    handler: handleImportProgramConfigApply as I_faActionDefinition<T_faActionId>['handler'],
    id: 'importProgramConfigApply',
    kind: 'async'
  }
]

const FA_ACTION_DEFINITION_LOOKUP: Map<T_faActionId, I_faActionDefinition<T_faActionId>> = new Map(
  FA_ACTION_DEFINITIONS.map((definition) => [definition.id, definition])
)

/**
 * Lookup helper used by 'faActionManagerRun' / 'faActionManagerSyncQueue'.
 * Returns 'undefined' for ids that are not registered (the manager treats this as a hard failure).
 */
export function findFaActionDefinition (id: T_faActionId): I_faActionDefinition<T_faActionId> | undefined {
  return FA_ACTION_DEFINITION_LOOKUP.get(id)
}
