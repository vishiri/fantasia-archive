import type { IpcMainInvokeEvent } from 'electron'
import type Database from 'better-sqlite3'

import {
  closeFaProjectActiveDatabaseHandleOnly,
  getFaProjectActiveDatabase,
  getFaProjectLastKnownActiveProjectFilePath
} from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabaseWiring'
import { reconnectFaProjectDatabaseAtKnownPathSync } from 'app/src-electron/mainScripts/projectManagement/faProjectReconnectAtKnownPathWiring'
import { resolveHardenedFaProjectFilePath } from 'app/src-electron/mainScripts/projectManagement/faProjectFilePathHardeningWiring'
import { requestRendererActiveProjectPathForFailsafe } from 'app/src-electron/mainScripts/ipcManagement/faProjectFailsafePathFromRendererWiring'

function ensureActiveDatabaseAttachedSync (): boolean {
  if (getFaProjectActiveDatabase() !== null) {
    return true
  }
  const p = getFaProjectLastKnownActiveProjectFilePath()
  if (p === null) {
    return false
  }
  const hardened = resolveHardenedFaProjectFilePath(p)
  if (hardened === null) {
    return false
  }
  return reconnectFaProjectDatabaseAtKnownPathSync(hardened)
}

function isLikelyRecoverableProjectSqliteError (e: unknown): boolean {
  if (!(e instanceof Error)) {
    return false
  }
  const extended = e as Error & { code?: string }
  const code = extended.code
  if (typeof code === 'string') {
    if (code === 'SQLITE_CORRUPT' || code === 'SQLITE_NOTFOUND') {
      return false
    }
    if (code.startsWith('SQLITE')) {
      return true
    }
  }
  const msg = e.message.toLowerCase()
  if (msg.includes('database disk image is malformed')) {
    return false
  }
  return msg.includes('sqlite') || msg.includes('database is locked')
}

/**
 * Runs synchronous project DB work with one reconnect-from-known-path attempt and one retry after a recoverable SQLite error.
 */
export function runWithFaProjectDatabaseSync<T> (work: (db: Database) => T): { ok: true, value: T } | { ok: false } {
  if (!ensureActiveDatabaseAttachedSync()) {
    return { ok: false }
  }
  const db0 = getFaProjectActiveDatabase()
  if (db0 === null) {
    return { ok: false }
  }
  try {
    return {
      ok: true,
      value: work(db0)
    }
  } catch (firstErr) {
    if (!isLikelyRecoverableProjectSqliteError(firstErr)) {
      throw firstErr
    }
    closeFaProjectActiveDatabaseHandleOnly()
    const p = getFaProjectLastKnownActiveProjectFilePath()
    const hardened = p === null ? null : resolveHardenedFaProjectFilePath(p)
    if (hardened === null || !reconnectFaProjectDatabaseAtKnownPathSync(hardened)) {
      throw firstErr
    }
    const db1 = getFaProjectActiveDatabase()
    if (db1 === null) {
      throw firstErr
    }
    return {
      ok: true,
      value: work(db1)
    }
  }
}

/**
 * Same as runWithFaProjectDatabaseSync, then if still no DB asks the renderer for the active path (when event is set), reconnects once, and runs work again.
 */
export async function runWithFaProjectDatabaseForIpcAsync<T> (
  event: IpcMainInvokeEvent,
  work: (db: Database) => T
): Promise<{ ok: true, value: T } | { ok: false }> {
  const first = runWithFaProjectDatabaseSync(work)
  if (first.ok) {
    return first
  }
  const fromRenderer = await requestRendererActiveProjectPathForFailsafe(event.sender)
  const hardened = fromRenderer === null ? null : resolveHardenedFaProjectFilePath(fromRenderer)
  if (
    hardened === null ||
    !reconnectFaProjectDatabaseAtKnownPathSync(hardened)
  ) {
    return { ok: false }
  }
  return runWithFaProjectDatabaseSync(work)
}

/**
 * Returns the mirrored absolute '.faproject' path when main still knows the active session file.
 */
export function readMirroredActiveProjectFilePathSync (): string | null {
  return getFaProjectLastKnownActiveProjectFilePath()
}
