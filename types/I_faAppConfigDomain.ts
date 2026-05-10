/**
 * App configuration export/import (.faconfig) — renderer bridge contracts (main does real work).
 */

export type T_faAppConfigImportPartStatus = 'ok' | 'absent'

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
}
