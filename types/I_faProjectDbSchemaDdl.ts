/** Minimal Database.exec surface for level-1 schema DDL (better-sqlite3 compatible). */
export interface I_faProjectDbExec {
  exec: (sql: string) => void
}

/** Exec plus pragma for migrations that bump user_version (better-sqlite3 compatible). */
export interface I_faProjectDbExecWithPragma extends I_faProjectDbExec {
  pragma: (pragma: string, options?: { simple?: boolean }) => unknown
}
