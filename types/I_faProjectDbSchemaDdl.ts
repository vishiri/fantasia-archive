/** Minimal Database surface for level-1 schema DDL and idempotent patches (better-sqlite3 compatible). */
export interface I_faProjectDbExec {
  exec: (sql: string) => void
  pragma: (name: string, options?: { simple?: boolean }) => unknown
}
