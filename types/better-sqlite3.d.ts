/**
 * Minimal BetterSqlite3 typings for main-process project database code.
 */

declare module 'better-sqlite3' {
  export interface RunResult {
    changes: number
    lastInsertRowid: number | bigint
  }

  export interface Statement {
    get (...params: unknown[]): unknown
    run (...params: unknown[]): RunResult
  }

  class BetterSqlite3Database {
    constructor (filename: string, options?: unknown)

    close (): void

    exec (sql: string): this

    pragma (source: string, options?: { simple?: boolean }): unknown

    prepare (source: string): Statement

    transaction<F extends (...args: never[]) => void> (fn: F): F
  }

  export default BetterSqlite3Database
}
