import type { IpcMainInvokeEvent } from 'electron'
import type Database from 'better-sqlite3'

import {
  closeFaProjectActiveDatabaseHandleOnly,
  getFaProjectActiveDatabase,
  getFaProjectLastKnownActiveProjectFilePath
} from 'app/src-electron/mainScripts/projectManagement/faProjectActiveDatabase'
import { reconnectFaProjectDatabaseAtKnownPathSync } from 'app/src-electron/mainScripts/projectManagement/faProjectReconnectAtKnownPath'
import { pathLooksLikeFaProjectFile } from 'app/src-electron/mainScripts/projectManagement/projectManagement_manager'
import { requestRendererActiveProjectPathForFailsafe } from 'app/src-electron/mainScripts/ipcManagement/faProjectFailsafePathFromRenderer'

function ensureActiveDatabaseAttachedSync (): boolean {
  if (getFaProjectActiveDatabase() !== null) {
    return true
  }
  const p = getFaProjectLastKnownActiveProjectFilePath()
  if (p === null || !pathLooksLikeFaProjectFile(p)) {
    return false
  }
  return reconnectFaProjectDatabaseAtKnownPathSync(p)
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
    if (p === null || !pathLooksLikeFaProjectFile(p) || !reconnectFaProjectDatabaseAtKnownPathSync(p)) {
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
  if (
    fromRenderer === null ||
    !pathLooksLikeFaProjectFile(fromRenderer) ||
    !reconnectFaProjectDatabaseAtKnownPathSync(fromRenderer)
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
