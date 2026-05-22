/**
 * Recently opened Fantasia Archive project files (.faproject) — persisted MRU list in main.
 */

/**
 * One row in the recent-project list (display name + absolute file path).
 */
export interface I_faRecentProjectEntry {
  filePath: string
  name: string
}

/**
 * Main-process result when resolving the MRU head for welcome auto-load (does not fall through to the next recent row).
 */
export type I_faRecentProjectMruHeadResolve =
  | {
    outcome: 'empty'
  }
  | {
    attemptedEntry: I_faRecentProjectEntry
    outcome: 'missing'
  }
  | {
    entry: I_faRecentProjectEntry
    outcome: 'ready'
  }
