export {
  dedupeFaProjectPathsLastWins,
  ensureFaProjectExtension,
  extractFaProjectPathsFromArgv,
  faDisplayNameFallbackFromProjectPath,
  faProjectSlugFromDisplayName,
  pathLooksLikeFaProjectFile,
  pickLastFaProjectPathForOsOpen,
  resolveOsOpenFaProjectPathFromArgv
} from './projectManagementSharedPathWiring'

export {
  installFaProjectManagementE2ePathOverrideGlobals,
  takeNextE2eProjectCreatePath,
  takeNextE2eProjectOpenPath
} from './projectManagementSharedE2ePathWiring'

export {
  closeFaProjectActiveDatabase,
  closeFaProjectActiveDatabaseHandleOnly,
  openFaProjectDatabase,
  unlinkFaProjectFileIfExists
} from './faProjectActiveDatabaseWiring'

export {
  readMirroredActiveProjectFilePathSync,
  runWithFaProjectDatabaseForIpcAsync,
  runWithFaProjectDatabaseSync
} from './faProjectDatabaseEnsureConnectedWiring'

export { reconnectFaProjectDatabaseAtKnownPathSync } from './faProjectReconnectAtKnownPathWiring'

export { runFaProjectCreateFromIpc } from './faProjectCreateRunWiring'

export { runFaProjectOpenFromIpc } from './faProjectOpenRunWiring'

export { resolveFaProjectOpenTargetPath } from './faProjectOpenResolveTargetPathWiring'

export {
  buildFaProjectIdempotentOpenResult,
  FaProjectOpenRejectedAlreadyActiveError
} from './faProjectOpenAlreadyActiveWiring'

export { applyFaProjectMigrations } from './faProjectDbMigrateWiring'
export {
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredDisplayName,
  readFaProjectStoredProjectUuid
} from './faProjectDbMigrateMetaWiring'

export {
  deleteFaProjectNoteboardFrameKv,
  readFaProjectNoteboardRoot,
  upsertFaProjectNoteboardKv
} from './faProjectNoteboardPersistWiring'

export {
  deleteFaProjectStylingFrameKv,
  readFaProjectStylingRoot,
  upsertFaProjectStylingKv
} from './faProjectStylingPersistWiring'

export {
  readFaProjectSidebarRoot,
  upsertFaProjectSidebarKv
} from './faProjectSidebarPersistWiring'

export {
  readFaProjectHierarchyTreeUiState,
  upsertFaProjectHierarchyTreeUiStateKv
} from './faProjectHierarchyTreeUiStatePersistWiring'

export {
  clearFaProjectOpenedDocumentsSnapshot,
  readFaProjectOpenedDocumentsSnapshot,
  upsertFaProjectOpenedDocumentsSnapshot
} from './faOpenedDocumentsPersistWiring'

export {
  readFaProjectSettingsRoot,
  readFaProjectSettingsProjectNameRaw,
  upsertFaProjectSettingsKv
} from './faProjectSettingsPersistWiring'

export { upsertFaProjectDataKv, readFaProjectDataKv } from './faProjectDataKvWiring'

export {
  faProjectSaveDialogDefaultDirectory,
  getFaProjectSaveDefaultPath
} from './faProjectFileDialogDefaultPathsWiring'

export { faProjectCreateMapParseFailure } from './faProjectCreateIpcParseFailureWiring'

export {
  enqueueFaProjectOsOpenPath,
  installFaProjectOsOpenListeners,
  isFaProjectOsOpenRendererReadySender,
  onFaProjectOsOpenRendererReady,
  registerFaProjectOsOpenMainWindow
} from './faProjectOsOpenDeliveryWiring'

export {
  getFaRecentProjectListStore,
  getRecentProjectsSnapshot,
  recordRecentProjectEntry,
  removeRecentProjectEntryByPath,
  resolveRecentProjectMruHeadForOpen
} from './faRecentProjectListRuntimeWiring'

export {
  faRecentProjectsListsEqual,
  faRecentProjectsSanitizeForPersistence,
  faRecentProjectsSanitizeStructural
} from './faRecentProjectListSanitizeWiring'
