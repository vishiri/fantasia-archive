/**
 * Program configuration export/import (.faconfig) — renderer bridge contracts (main does real work).
 */

export type T_faProgramConfigImportPartStatus = 'ok' | 'absent'

/**
 * Part flags returned after a successful prepare step (no file body payload).
 */
export interface I_faProgramConfigImportPartsUi {
  programSettings: T_faProgramConfigImportPartStatus
  keybinds: T_faProgramConfigImportPartStatus
  programStyling: T_faProgramConfigImportPartStatus
}

export type T_faProgramConfigExportOutcome = 'saved' | 'canceled' | 'error'

export interface I_faProgramConfigExportResult {
  outcome: T_faProgramConfigExportOutcome
  filePath?: string
  errorName?: string
  errorMessage?: string
}

export type T_faProgramConfigPrepareOutcome = 'ready' | 'canceled' | 'error'

export interface I_faProgramConfigPrepareResult {
  outcome: T_faProgramConfigPrepareOutcome
  sessionId?: string
  parts?: I_faProgramConfigImportPartsUi
  errorName?: string
  errorMessage?: string
}

export interface I_faProgramConfigExportOptions {
  includeProgramSettings: boolean
  includeKeybinds: boolean
  includeProgramStyling: boolean
}

export interface I_faProgramConfigApplyInput {
  sessionId: string
  applyProgramSettings: boolean
  applyKeybinds: boolean
  applyProgramStyling: boolean
}

export type T_faProgramConfigApplyPart = 'programSettings' | 'keybinds' | 'programStyling'

export interface I_faProgramConfigApplyResult {
  appliedParts: T_faProgramConfigApplyPart[]
}

/**
 * Preload API for .faconfig import/export.
 */
export interface I_faProgramConfigAPI {
  exportToFile: (options: I_faProgramConfigExportOptions) => Promise<I_faProgramConfigExportResult>
  prepareImport: () => Promise<I_faProgramConfigPrepareResult>
  applyImport: (input: I_faProgramConfigApplyInput) => Promise<I_faProgramConfigApplyResult>
  disposeImportSession: (sessionId: string) => Promise<void>
}
