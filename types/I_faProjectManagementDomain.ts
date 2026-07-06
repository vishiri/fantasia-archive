import type {
  I_faProjectNoteboardPatch,
  I_faProjectNoteboardRoot
} from 'app/types/I_faProjectNoteboardDomain'
import type {
  I_faProjectHierarchyTreeUiState,
  I_faProjectHierarchyTreeUiStatePatch
} from 'app/types/I_faProjectHierarchyTreeDomain'
import type { I_faOpenedDocumentsSnapshot } from 'app/types/I_faOpenedDocumentsDomain'
import type {
  I_faProjectSidebarPatch,
  I_faProjectSidebarRoot
} from 'app/types/I_faProjectSidebarDomain'
import type {
  I_faProjectStylingPatch,
  I_faProjectStylingRoot
} from 'app/types/I_faProjectStylingDomain'
import type {
  I_faProjectSettingsPatch,
  I_faProjectSettingsRoot
} from 'app/types/I_faProjectSettingsDomain'
import type {
  I_faRecentProjectEntry,
  I_faRecentProjectMruHeadResolve
} from 'app/types/I_faRecentProjectsDomain'

/**
 * Fantasia Archive project files (.faproject) — renderer↔main bridge contracts.
 * Main process owns SQLite, paths, and native save dialogs.
 */

/**
 * `I_faProjectOpenResult.errorName` when the selected file is the same logical project as the one already active (matching SQLite `project_uuid`).
 */
export const FA_PROJECT_OPEN_ERROR_NAME_ALREADY_ACTIVE = 'ProjectAlreadyOpen' as const

export type T_faProjectCreateOutcome = 'created' | 'canceled' | 'error'

export type T_faProjectOpenOutcome = 'opened' | 'canceled' | 'error'

/** Payload accepted by preload when creating a new project file (display name only). */
export interface I_faProjectCreateInput {
  projectName: string
}

/** Optional absolute path for open; omit or empty object uses the native file picker. */
export interface I_faProjectOpenInput {
  filePath?: string
}

/** Snapshot returned when a project file is opened and initialized in main. */
export interface I_faProjectManagementActiveSnapshot {
  filePath: string
  id: string
  name: string
}

export interface I_faProjectCreateResult {
  errorMessage?: string
  errorName?: string
  outcome: T_faProjectCreateOutcome
  project?: I_faProjectManagementActiveSnapshot
}

export interface I_faProjectOpenResult {
  /**
   * When outcome is 'error' after a concrete file was chosen, the absolute path that failed to open.
   */
  attemptedFilePath?: string
  errorMessage?: string
  errorName?: string
  /**
   * When true with outcome 'opened', main left the active database unchanged and the renderer should navigate only (no load toast).
   */
  idempotentReuse?: boolean
  outcome: T_faProjectOpenOutcome
  project?: I_faProjectManagementActiveSnapshot
}

/**
 * Preload API for project database lifecycle (narrow surface; main validates all inputs).
 */
export interface I_faProjectManagementAPI {
  createProject: (input: I_faProjectCreateInput) => Promise<I_faProjectCreateResult>
  getProjectNoteboard: () => Promise<I_faProjectNoteboardRoot>
  getProjectSettings: () => Promise<I_faProjectSettingsRoot>
  getProjectSidebar: () => Promise<I_faProjectSidebarRoot>
  getHierarchyTreeUiState: () => Promise<I_faProjectHierarchyTreeUiState>
  getOpenedDocumentsSnapshot: () => Promise<I_faOpenedDocumentsSnapshot>
  getProjectStyling: () => Promise<I_faProjectStylingRoot>
  getRecentProjects: () => Promise<I_faRecentProjectEntry[]>
  /**
   * Newest MRU row for auto-open on the welcome screen; reports missing when that file alone is gone (no next-row fallback).
   */
  resolveRecentProjectMruHeadForOpen: () => Promise<I_faRecentProjectMruHeadResolve>
  openProject: (input?: I_faProjectOpenInput) => Promise<I_faProjectOpenResult>
  /**
   * Resolves **true** when the patch wrote into the active project's SQLite KV.
   * Resolves **false** when there is no active project database (for example immediately after main cleared the handle during a renderer reload).
   */
  setProjectNoteboard: (patch: I_faProjectNoteboardPatch) => Promise<boolean>
  setProjectSettings: (patch: I_faProjectSettingsPatch) => Promise<boolean>
  setProjectSidebar: (patch: I_faProjectSidebarPatch) => Promise<boolean>
  setHierarchyTreeUiState: (patch: I_faProjectHierarchyTreeUiStatePatch) => Promise<boolean>
  saveOpenedDocumentsSnapshot: (snapshot: I_faOpenedDocumentsSnapshot) => Promise<boolean>
  setProjectStyling: (patch: I_faProjectStylingPatch) => Promise<boolean>
  /**
   * Playwright E2E only: stages the absolute path for the next create flow so main skips the native save dialog.
   */
  stageE2eNextCreatePath: (filePath: string) => Promise<boolean>
  /**
   * Playwright E2E only: stages the absolute path for the next open flow so main skips the native open dialog.
   */
  stageE2eNextOpenPath: (filePath: string) => Promise<boolean>
}
