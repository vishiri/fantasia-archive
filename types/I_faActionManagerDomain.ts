import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type {
  I_faAppConfigApplyInput
} from 'app/types/I_faAppConfigDomain'
import type { I_faUserSettings, T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

/**
 * Canonical list of every action id understood by the renderer-side faActionManager.
 * Order is irrelevant; uniqueness is required.
 */
export const FA_ACTION_IDS = [
  'toggleAppNoteboardWindow',
  'toggleProjectNoteboardWindow',
  'toggleDeveloperTools',
  'openKeybindSettingsDialog',
  'saveKeybindSettings',
  'openAppSettingsDialog',
  'saveAppSettings',
  'openAppStylingWindow',
  'openProjectStylingDialog',
  'openProjectSettingsDialog',
  'showProjectDashboard',
  'saveProjectSettings',
  'saveAppStyling',
  'saveProjectStyling',
  'openAdvancedSearchGuideDialog',
  'openChangelogDialog',
  'openLicenseDialog',
  'openAboutFantasiaArchiveDialog',
  'openTipsTricksTriviaDialog',
  'closeApp',
  'minimizeApp',
  'resizeApp',
  'languageSwitch',
  'refreshWebContentsAfterLanguage',
  'reportAppNoteboardSaveFailure',
  'reportProjectNoteboardSaveFailure',
  'reportAppStylingPersistFailure',
  'reportProjectStylingSaveFailure',
  'reportBridgeLoadFailure',
  'openActionMonitorDialog',
  'showStartupTipsNotification',
  'openImportExportAppConfigDialog',
  'exportAppConfigPackage',
  'exportAppConfigSaveResult',
  'importAppConfigStageResult',
  'importAppConfigApply',
  'createNewProject',
  'openNewProjectDialog',
  'loadExistingProject',
  'editActiveDocument',
  'saveOpenedDocumentDisplayName',
  'focusPreviousOpenedDocumentTab',
  'focusNextOpenedDocumentTab',
  'moveActiveOpenedDocumentTabLeft',
  'moveActiveOpenedDocumentTabRight'
] as const

/**
 * Discriminated union of supported action ids.
 */
export type T_faActionId = typeof FA_ACTION_IDS[number]

/**
 * Execution kind for an action:
 * - 'sync'  is appended to a single FIFO queue and processed one-at-a-time.
 * - 'async' is dispatched immediately and runs in parallel with anything else.
 */
export type T_faActionKind = 'sync' | 'async'

/**
 * Load existing project: omit filePath for the native picker; pass filePath to open a known path (recent list).
 * resumeActiveSession: true for **Resume Current Project** (404) or splash **Resume Latest Project** primary segment — navigates without the already-active warning toast on idempotent reopen.
 */
export interface I_faLoadExistingProjectPayload {
  filePath?: string | undefined
  resumeActiveSession?: boolean | undefined
}

/**
 * Per-action payload contract. Actions with no inputs map to 'void'.
 * Edit this map (and 'I_faActionDefinition' handlers) when adding a new action.
 */
export interface I_faActionPayloadMap {
  toggleDeveloperTools: void
  toggleAppNoteboardWindow: void
  toggleProjectNoteboardWindow: void
  openKeybindSettingsDialog: void
  saveKeybindSettings: { overrides: I_faKeybindsRoot['overrides'] }
  openAppSettingsDialog: void
  saveAppSettings: { settings: I_faUserSettings }
  openAppStylingWindow: void
  openProjectStylingDialog: void
  openProjectSettingsDialog: void
  showProjectDashboard: void
  saveProjectSettings: {
    documentTemplates?: import('app/types/I_faProjectDocumentTemplateDomain').I_faProjectDocumentTemplateSnapshotItem[] | undefined
    settings: import('app/types/I_faProjectSettingsDomain').I_faProjectSettingsPatch
    worlds?: import('app/types/I_faProjectWorldDomain').I_faProjectWorldSnapshotItem[] | undefined
  }
  saveAppStyling: { css: string }
  saveProjectStyling: { css: string }
  openAdvancedSearchGuideDialog: void
  openChangelogDialog: void
  openLicenseDialog: void
  openAboutFantasiaArchiveDialog: void
  openTipsTricksTriviaDialog: void
  closeApp: void
  minimizeApp: void
  resizeApp: void
  languageSwitch: { code: T_faUserSettingsLanguageCode, priorCode: T_faUserSettingsLanguageCode }
  refreshWebContentsAfterLanguage: void
  reportAppNoteboardSaveFailure: { message: string }
  reportProjectNoteboardSaveFailure: { message: string }
  reportAppStylingPersistFailure: { message: string }
  reportProjectStylingSaveFailure: { message: string }
  reportBridgeLoadFailure: { message: string }
  openActionMonitorDialog: void
  showStartupTipsNotification: void
  openImportExportAppConfigDialog: void
  openNewProjectDialog: void
  loadExistingProject: I_faLoadExistingProjectPayload
  createNewProject: { projectName: string }
  exportAppConfigPackage: {
    includeKeybinds: boolean
    includeAppNoteboard: boolean
    includeAppSettings: boolean
    includeAppStyling: boolean
  }
  exportAppConfigSaveResult: {
    errorMessage?: string | undefined
    errorName?: string | undefined
    filePath?: string | undefined
    status: 'canceled' | 'error' | 'saved'
  }
  importAppConfigStageResult: {
    errorCode?: string | undefined
    errorMessage?: string | undefined
    sessionId?: string | undefined
    status: 'canceled' | 'fail' | 'pass'
  }
  importAppConfigApply: I_faAppConfigApplyInput
  editActiveDocument: void
  saveOpenedDocumentDisplayName: { documentId: string, keepEditMode: boolean }
  focusPreviousOpenedDocumentTab: void
  focusNextOpenedDocumentTab: void
  moveActiveOpenedDocumentTabLeft: void
  moveActiveOpenedDocumentTabRight: void
}

/**
 * Optional async handler return: terminal payload preview for the action monitor.
 */
export type T_faActionHandlerContinuation = { payloadPreview: string }

export type T_faActionHandlerResult = void | T_faActionHandlerContinuation

export type T_faActionHandlerReturn = T_faActionHandlerResult | Promise<T_faActionHandlerResult>

/**
 * Static metadata for one action: kind, handler, and optional dedup hint.
 * The handler may return void, an optional payload preview for history, or a Promise of either; failures are routed to the error reporter.
 */
export interface I_faActionDefinition<Id extends T_faActionId> {
  id: Id
  kind: T_faActionKind
  handler: (payload: I_faActionPayloadMap[Id]) => T_faActionHandlerReturn
  /**
   * When 'true', repeated sync enqueues for this action while another instance is already pending or running are silently dropped.
   * Async actions ignore this flag.
   */
  dedup?: boolean | undefined
}

/**
 * One in-flight or queued action's runtime data, keyed by 'uid'.
 * Manager modules push these into the Pinia store and update them in place as state transitions.
 */
export interface I_faActionQueueEntry {
  uid: string
  id: T_faActionId
  kind: T_faActionKind
  payload: unknown
  enqueuedAt: number
}

/**
 * Last-failure record kept on the Pinia store for debugging and the action monitor.
 */
export interface I_faActionFailureLog {
  uid: string
  id: T_faActionId
  kind: T_faActionKind
  payloadPreview: string
  errorName: string
  errorMessage: string
  failedAt: number
}

/**
 * Lifecycle status tracked per history entry.
 */
export type T_faActionHistoryStatus = 'queued' | 'running' | 'success' | 'failed'

/**
 * One row in the session-only action history (capped ring buffer in 'S_FaActionManager').
 * The same 'uid' is mutated across transitions, so the table never shows duplicate rows for one logical run.
 */
export interface I_faActionHistoryEntry {
  uid: string
  id: T_faActionId
  kind: T_faActionKind
  status: T_faActionHistoryStatus
  payloadPreview?: string | undefined
  enqueuedAt: number
  startedAt?: number | undefined
  finishedAt?: number | undefined
  errorMessage?: string | undefined
}

/** Partial status fields applied to an existing action history row. */
export interface I_faActionHistoryEntryStatusPatch {
  errorMessage?: string | undefined
  finishedAt?: number | undefined
  payloadPreview?: string | undefined
  startedAt?: number | undefined
  status?: T_faActionHistoryStatus | undefined
}

/** Terminal outcome recorded when an action history row completes. */
export type T_faActionHistoryOutcome =
  | { kind: 'success' }
  | { kind: 'failed', errorMessage: string }
