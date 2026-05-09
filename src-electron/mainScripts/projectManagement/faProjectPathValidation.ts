import path from 'node:path'

import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'

/**
 * Basename for project display when filePath strings may retain Windows separators while Node's
 * default path API is posix (Linux CI hosts).
 */
function faProjectPathBasenameForStem (filePath: string): string {
  const looksLikeWindowsParsing =
    filePath.includes('\\') ||
    /^[A-Za-z]:[\\/]/.test(filePath)
  if (looksLikeWindowsParsing) {
    return path.win32.basename(filePath)
  }
  return path.basename(filePath)
}

/**
 * True when path is non-empty, looks like an absolute path on the current OS or like a Windows
 * absolute path (drive letter or UNC), and ends with .faproject (case-insensitive).
 */
export function pathLooksLikeFaProjectFile (filePath: string): boolean {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return false
  }
  const nativeNormalized = filePath.replaceAll('/', path.sep)
  const looksAbsolute =
    path.isAbsolute(nativeNormalized) ||
    path.win32.isAbsolute(filePath)
  if (!looksAbsolute) {
    return false
  }
  const forSuffixCheck = filePath.replaceAll('\\', '/')
  return forSuffixCheck.toLowerCase().endsWith(`.${FA_PROJECT_FILE_EXTENSION}`)
}

/**
 * Ensures basename ends with .faproject; does not validate absolute path.
 */
export function ensureFaProjectExtension (filePath: string): string {
  const lower = filePath.toLowerCase()
  const suffix = `.${FA_PROJECT_FILE_EXTENSION}`
  if (lower.endsWith(suffix)) {
    return filePath
  }
  return `${filePath}${suffix}`
}

/**
 * Stem of '.faproject' basename for migration bootstrap when user_version is zero; falls back to 'Project'.
 */
export function faDisplayNameFallbackFromProjectPath (filePath: string): string {
  const base = faProjectPathBasenameForStem(filePath)
  const suffix = `.${FA_PROJECT_FILE_EXTENSION}`
  const lowerBase = base.toLowerCase()
  const stem = lowerBase.endsWith(suffix)
    ? base.slice(0, base.length - suffix.length)
    : base
  const trimmed = stem.trim()
  if (trimmed.length === 0 || trimmed === '.' || trimmed === '..') {
    return 'Project'
  }
  return trimmed
}
