import type { FA_APP_CONFIG_INNER } from 'app/src-electron/shared/faAppConfigConstants'

/**
 * App configuration export/import (.faconfig) — renderer bridge contracts (main does real work).
 */

export type T_faAppConfigImportPartStatus = 'ok' | 'absent'

/** Basename keys allowed inside a '.faconfig' ZIP archive. */
export type T_faAppConfigInnerKey = keyof typeof FA_APP_CONFIG_INNER

/**
 * Part flags returned after a successful prepare step (no file body payload).
 */
export interface I_faAppConfigImportPartsUi {
  keybinds: T_faAppConfigImportPartStatus
  appNoteboard: T_faAppConfigImportPartStatus
  appSettings: T_faAppConfigImportPartStatus
  appStyling: T_faAppConfigImportPartStatus
}

export type T_faAppConfigExportOutcome = 'saved' | 'canceled' | 'error'

export interface I_faAppConfigExportResult {
  outcome: T_faAppConfigExportOutcome
  filePath?: string
  errorName?: string
  errorMessage?: string
}

export type T_faAppConfigPrepareOutcome = 'ready' | 'canceled' | 'error'

export interface I_faAppConfigPrepareResult {
  outcome: T_faAppConfigPrepareOutcome
  sessionId?: string
  parts?: I_faAppConfigImportPartsUi
  errorName?: string
  errorMessage?: string
}

export interface I_faAppConfigExportOptions {
  includeKeybinds: boolean
  includeAppNoteboard: boolean
  includeAppSettings: boolean
  includeAppStyling: boolean
}

export interface I_faAppConfigApplyInput {
  applyKeybinds: boolean
  applyAppNoteboard: boolean
  applyAppSettings: boolean
  applyAppStyling: boolean
  sessionId: string
}

export type T_faAppConfigApplyPart = 'keybinds' | 'appNoteboard' | 'appSettings' | 'appStyling'

export interface I_faAppConfigApplyResult {
  appliedParts: T_faAppConfigApplyPart[]
}

/**
 * Preload API for .faconfig import/export.
 */
export interface I_faAppConfigAPI {
  exportToFile: (options: I_faAppConfigExportOptions) => Promise<I_faAppConfigExportResult>
  prepareImport: () => Promise<I_faAppConfigPrepareResult>
  applyImport: (input: I_faAppConfigApplyInput) => Promise<I_faAppConfigApplyResult>
  disposeImportSession: (sessionId: string) => Promise<void>
  /** Playwright E2E only: stages the next export path so main skips the native save dialog. */
  stageE2eNextExportPath: (filePath: string) => Promise<boolean>
  /** Playwright E2E only: stages the next import path so main skips the native open dialog. */
  stageE2eNextImportPath: (filePath: string) => Promise<boolean>
}
