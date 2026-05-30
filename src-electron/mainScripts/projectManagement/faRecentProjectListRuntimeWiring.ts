import ElectronStore from 'electron-store'

import { faRecentProjectPathKey } from 'app/src-electron/shared/faRecentProjectPathKey'
import type {
  I_faRecentProjectEntry,
  I_faRecentProjectMruHeadResolve
} from 'app/types/I_faRecentProjectsDomain'

import {
  faRecentProjectsListsEqual,
  faRecentProjectsSanitizeForPersistence,
  faRecentProjectsSanitizeStructural
} from './faRecentProjectListSanitizeWiring'

type I_faRecentProjectListFile = {
  recentProjects: I_faRecentProjectEntry[]
}

/** Electron-store persistence for MRU list; file name 'faRecentProjectList.json' in userData. */
let faRecentProjectListStore: ElectronStore<I_faRecentProjectListFile> | null = null

const FA_RECENT_PROJECT_LIST_DEFAULTS: I_faRecentProjectListFile = {
  recentProjects: []
}

export function getFaRecentProjectListStore (): ElectronStore<I_faRecentProjectListFile> {
  if (faRecentProjectListStore === null) {
    faRecentProjectListStore = new ElectronStore<I_faRecentProjectListFile>({
      defaults: { ...FA_RECENT_PROJECT_LIST_DEFAULTS },
      name: 'faRecentProjectList'
    })
  }
  return faRecentProjectListStore
}

function persistSanitizedIfChanged (sanitized: I_faRecentProjectEntry[]): boolean {
  const store = getFaRecentProjectListStore()
  const prior = store.get('recentProjects') as I_faRecentProjectEntry[]
  if (faRecentProjectsListsEqual(prior, sanitized)) {
    return false
  }
  store.set('recentProjects', sanitized)
  return true
}

/**
 * Reads MRU from disk, repairs store when stale, returns sanitized newest-first list.
 */
export function getRecentProjectsSnapshot (): I_faRecentProjectEntry[] {
  const store = getFaRecentProjectListStore()
  const blob = { recentProjects: store.get('recentProjects') as unknown }
  const sanitized = faRecentProjectsSanitizeForPersistence(blob)
  persistSanitizedIfChanged(sanitized)
  return sanitized
}

function recentProjectHeadRowExistsOnDisk (row: I_faRecentProjectEntry): boolean {
  const living = faRecentProjectsSanitizeForPersistence({
    recentProjects: [row]
  })
  return living.length === 1
}

/**
 * Resolves only the MRU head for welcome skip/resume auto-load; does not substitute the next recent row when the head file is missing.
 */
export function resolveRecentProjectMruHeadForOpen (): I_faRecentProjectMruHeadResolve {
  const store = getFaRecentProjectListStore()
  const structural = faRecentProjectsSanitizeStructural({
    recentProjects: store.get('recentProjects') as unknown
  })
  const head = structural[0]
  if (head === undefined) {
    return { outcome: 'empty' }
  }
  if (!recentProjectHeadRowExistsOnDisk(head)) {
    removeRecentProjectEntryByPath(head.filePath)
    return {
      attemptedEntry: head,
      outcome: 'missing'
    }
  }
  return {
    entry: head,
    outcome: 'ready'
  }
}

/**
 * Prepends one opened project (MRU); dedupes by path key, cap 10, drops dead files.
 */
export function recordRecentProjectEntry (entry: I_faRecentProjectEntry): void {
  const store = getFaRecentProjectListStore()
  const current = faRecentProjectsSanitizeForPersistence({
    recentProjects: store.get('recentProjects') as unknown
  })
  const prepended: I_faRecentProjectEntry[] = [entry, ...current]
  const sanitized = faRecentProjectsSanitizeForPersistence({
    recentProjects: prepended
  })
  store.set('recentProjects', sanitized)
}

/**
 * Removes one path from MRU (if present), then re-sanitizes.
 */
export function removeRecentProjectEntryByPath (filePath: string): void {
  const store = getFaRecentProjectListStore()
  const key = faRecentProjectPathKey(filePath.trim())
  const current = store.get('recentProjects') as I_faRecentProjectEntry[]
  const filtered: I_faRecentProjectEntry[] = []
  for (const row of current) {
    if (faRecentProjectPathKey(row.filePath.trim()) !== key) {
      filtered.push(row)
    }
  }
  const sanitized = faRecentProjectsSanitizeForPersistence({ recentProjects: filtered })
  store.set('recentProjects', sanitized)
}
