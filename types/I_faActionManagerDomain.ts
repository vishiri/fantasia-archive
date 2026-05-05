import type { I_faKeybindsRoot } from 'app/types/I_faKeybindsDomain'
import type {
  I_faProgramConfigApplyInput
} from 'app/types/I_faProgramConfigDomain'
import type { I_faUserSettings, T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

/**
 * Canonical list of every action id understood by the renderer-side faActionManager.
 * Order is irrelevant; uniqueness is required.
 */
export const FA_ACTION_IDS = [
  'toggleDeveloperTools',
  'openKeybindSettingsDialog',
  'saveKeybindSettings',
  'openProgramSettingsDialog',
  'saveProgramSettings',
  'openProgramStylingWindow',
  'saveProgramStyling',
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
  'openActionMonitorDialog',
  'showStartupTipsNotification',
  'openImportExportProgramConfigDialog',
  'exportProgramConfigPackage',
  'exportProgramConfigSaveResult',
  'importProgramConfigStageResult',
  'importProgramConfigApply',
  'createNewProject',
  'openNewProjectSettingsDialog'
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
 * Per-action payload contract. Actions with no inputs map to 'void'.
 * Edit this map (and 'I_faActionDefinition' handlers) when adding a new action.
 */
export interface I_faActionPayloadMap {
  toggleDeveloperTools: void
  openKeybindSettingsDialog: void
  saveKeybindSettings: { overrides: I_faKeybindsRoot['overrides'] }
  openProgramSettingsDialog: void
  saveProgramSettings: { settings: I_faUserSettings }
  openProgramStylingWindow: void
  saveProgramStyling: { css: string }
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
  openActionMonitorDialog: void
  showStartupTipsNotification: void
  openImportExportProgramConfigDialog: void
  openNewProjectSettingsDialog: void
  createNewProject: { projectName: string }
  exportProgramConfigPackage: {
    includeKeybinds: boolean
    includeProgramSettings: boolean
    includeProgramStyling: boolean
  }
  exportProgramConfigSaveResult: {
    errorMessage?: string
    errorName?: string
    filePath?: string
    status: 'canceled' | 'error' | 'saved'
  }
  importProgramConfigStageResult: {
    errorCode?: string
    errorMessage?: string
    sessionId?: string
    status: 'canceled' | 'fail' | 'pass'
  }
  importProgramConfigApply: I_faProgramConfigApplyInput
}

/**
 * Static metadata for one action: kind, handler, and optional dedup hint.
 * The handler may return either void or Promise<void>; failures (thrown or rejected) are routed to the manager's error reporter.
 */
export interface I_faActionDefinition<Id extends T_faActionId> {
  id: Id
  kind: T_faActionKind
  handler: (payload: I_faActionPayloadMap[Id]) => void | Promise<void>
  /**
   * When 'true', repeated sync enqueues for this action while another instance is already pending or running are silently dropped.
   * Async actions ignore this flag.
   */
  dedup?: boolean
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
  payloadPreview?: string
  enqueuedAt: number
  startedAt?: number
  finishedAt?: number
  errorMessage?: string
}
