/** Minimal Database.exec surface for level-1 schema DDL (better-sqlite3 compatible). */
export interface I_faProjectDbExec {
  exec: (sql: string) => void
}
