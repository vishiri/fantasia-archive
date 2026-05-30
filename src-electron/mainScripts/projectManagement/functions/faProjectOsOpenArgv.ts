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

function shouldSkipArgvCandidate (
  trimmed: string,
  pathBasename: (filePath: string) => string
): boolean {
  if (trimmed.length === 0) {
    return true
  }
  if (trimmed.startsWith('-')) {
    return true
  }
  if (looksLikeUrlScheme(trimmed)) {
    return true
  }
  const base = pathBasename(trimmed.replaceAll('\\', '/'))
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
 */
export function extractFaProjectPathsFromArgv (
  argv: string[],
  pathLooksLikeFaProjectFile: (filePath: string) => boolean,
  pathBasename: (filePath: string) => string
): string[] {
  const out: string[] = []
  for (const raw of argv) {
    const stripped = stripSurroundingQuotes(raw)
    if (shouldSkipArgvCandidate(stripped, pathBasename)) {
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
 * Deduplicates by recent-project path key, keeping the last occurrence of each logical path.
 */
export function dedupeFaProjectPathsLastWins (
  paths: string[],
  recentProjectPathKey: (filePath: string) => string
): string[] {
  const seen = new Set<string>()
  const reversed: string[] = []
  for (let i = paths.length - 1; i >= 0; i--) {
    const p = paths[i]
    if (p === undefined) {
      continue
    }
    const key = recentProjectPathKey(p)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    reversed.push(p)
  }
  return reversed.reverse()
}

export function pickLastFaProjectPathForOsOpen (paths: string[]): string | null {
  if (paths.length === 0) {
    return null
  }
  return paths[paths.length - 1] ?? null
}

export function resolveOsOpenFaProjectPathFromArgv (
  argv: string[],
  pathLooksLikeFaProjectFile: (filePath: string) => boolean,
  pathBasename: (filePath: string) => string
): string | null {
  return pickLastFaProjectPathForOsOpen(
    extractFaProjectPathsFromArgv(argv, pathLooksLikeFaProjectFile, pathBasename)
  )
}
