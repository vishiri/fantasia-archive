import path from 'node:path'

import { faRecentProjectPathKey } from 'app/src-electron/shared/faRecentProjectPathKey'

import { pathLooksLikeFaProjectFile } from './faProjectPathValidation'

/**
 * Strips one layer of surrounding single or double quotes that Windows / shells sometimes retain.
 */
function stripSurroundingQuotes (raw: string): string {
  const t = raw.trim()
  if (t.length >= 2) {
    const first = t[0]
    const last = t[t.length - 1]
    if (
      (first === '"' && last === '"') ||
      (first === "'" && last === "'")
    ) {
      return t.slice(1, -1).trim()
    }
  }
  return t
}

function looksLikeUrlScheme (s: string): boolean {
  return /^\w+:/u.test(s) && /:\/\//u.test(s)
}

function shouldSkipArgvCandidate (trimmed: string): boolean {
  if (trimmed.length === 0) {
    return true
  }
  if (trimmed.startsWith('-')) {
    return true
  }
  if (looksLikeUrlScheme(trimmed)) {
    return true
  }
  const base = path.basename(trimmed.replaceAll('\\', '/'))
  const lowerBase = base.toLowerCase()
  if (lowerBase === 'electron' || lowerBase === 'electron.exe') {
    return true
  }
  if (lowerBase.endsWith('.asar') && !lowerBase.endsWith('.faproject')) {
    return true
  }
  if (
    lowerBase.includes('electron-main') &&
    lowerBase.endsWith('.js')
  ) {
    return true
  }
  return false
}

/**
 * Collects argv entries that look like absolute '.faproject' paths (OS-open and second-instance).
 * Skips Electron executable, dev flags, dev server URLs, and main bundle paths.
 * Order is preserved; use {@link pickLastFaProjectPathForOsOpen} when only one path should open.
 */
export function extractFaProjectPathsFromArgv (argv: string[]): string[] {
  const out: string[] = []
  for (const raw of argv) {
    const stripped = stripSurroundingQuotes(raw)
    if (shouldSkipArgvCandidate(stripped)) {
      continue
    }
    if (!pathLooksLikeFaProjectFile(stripped)) {
      continue
    }
    out.push(stripped)
  }
  return out
}

/**
 * Deduplicates by {@link faRecentProjectPathKey}, keeping the last occurrence of each logical path.
 */
export function dedupeFaProjectPathsLastWins (paths: string[]): string[] {
  const seen = new Set<string>()
  const reversed: string[] = []
  for (let i = paths.length - 1; i >= 0; i--) {
    const p = paths[i]
    if (p === undefined) {
      continue
    }
    const key = faRecentProjectPathKey(p)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    reversed.push(p)
  }
  return reversed.reverse()
}

/**
 * When the OS passes several candidates, the last extracted argv token wins (typical appended file path).
 */
export function pickLastFaProjectPathForOsOpen (paths: string[]): string | null {
  if (paths.length === 0) {
    return null
  }
  return paths[paths.length - 1] ?? null
}

/**
 * Single path from argv suitable for OS-open, or null.
 */
export function resolveOsOpenFaProjectPathFromArgv (argv: string[]): string | null {
  return pickLastFaProjectPathForOsOpen(extractFaProjectPathsFromArgv(argv))
}
