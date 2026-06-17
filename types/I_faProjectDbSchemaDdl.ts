/** Minimal Database.exec surface for level-1 schema DDL (better-sqlite3 compatible). */
export interface I_faProjectDbExec {
  exec: (sql: string) => void
}

/** Exec plus pragma for migrations that bump user_version (better-sqlite3 compatible). */
export interface I_faProjectDbExecWithPragma extends I_faProjectDbExec {
  pragma: (pragma: string, options?: { simple?: boolean }) => unknown
}

/** Prepared statement surface used by schema migrations that copy rows. */
export interface I_faProjectDbMigrationPrepareStatement {
  all: (...args: unknown[]) => unknown[]
  get: (...args: unknown[]) => unknown
  run: (...args: unknown[]) => unknown
}

/** Database surface for migrations that read and insert rows via prepare. */
export interface I_faProjectDbMigrationExec extends I_faProjectDbExecWithPragma {
  prepare: (sql: string) => I_faProjectDbMigrationPrepareStatement
}
