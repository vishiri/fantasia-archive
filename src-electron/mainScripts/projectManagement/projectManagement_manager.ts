import path from 'node:path'

import { createProjectManagementE2ePathRuntime } from './projectManagementE2ePathRuntime'
import { createProjectManagementManagerSurface } from './projectManagementManagerSurface'

const projectManagementSurface = createProjectManagementManagerSurface({
  path
})

const projectManagementE2ePathRuntime = createProjectManagementE2ePathRuntime({
  getTestEnv: () => process.env.TEST_ENV
})

export const pathLooksLikeFaProjectFile = projectManagementSurface.pathLooksLikeFaProjectFile

export const ensureFaProjectExtension = projectManagementSurface.ensureFaProjectExtension

export const faDisplayNameFallbackFromProjectPath =
  projectManagementSurface.faDisplayNameFallbackFromProjectPath

export const faProjectSlugFromDisplayName = projectManagementSurface.faProjectSlugFromDisplayName

export const extractFaProjectPathsFromArgv = projectManagementSurface.extractFaProjectPathsFromArgv

export const dedupeFaProjectPathsLastWins = projectManagementSurface.dedupeFaProjectPathsLastWins

export const pickLastFaProjectPathForOsOpen = projectManagementSurface.pickLastFaProjectPathForOsOpen

export const resolveOsOpenFaProjectPathFromArgv =
  projectManagementSurface.resolveOsOpenFaProjectPathFromArgv

export const takeNextE2eProjectCreatePath =
  projectManagementE2ePathRuntime.takeNextE2eProjectCreatePath

export const takeNextE2eProjectOpenPath = projectManagementE2ePathRuntime.takeNextE2eProjectOpenPath

export const installFaProjectManagementE2ePathOverrideGlobals =
  projectManagementE2ePathRuntime.installFaProjectManagementE2ePathOverrideGlobals

export {
  closeFaProjectActiveDatabase,
  closeFaProjectActiveDatabaseHandleOnly,
  getFaProjectActiveDatabase,
  getFaProjectLastKnownActiveProjectFilePath,
  openFaProjectDatabase,
  replaceFaProjectActiveDatabase,
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

export {
  applyFaProjectMigrations,
  assertFaProjectDatabaseQuickCheck,
  readFaProjectStoredDisplayName,
  readFaProjectStoredProjectUuid
} from './faProjectDbMigrateWiring'

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
