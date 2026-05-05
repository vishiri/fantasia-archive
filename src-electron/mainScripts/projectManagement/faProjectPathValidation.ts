import path from 'node:path'

import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'

/**
 * True when path is non-empty, looks like an absolute path, and ends with .faproject (case-insensitive).
 */
export function pathLooksLikeFaProjectFile (filePath: string): boolean {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return false
  }
  const normalized = filePath.replaceAll('/', path.sep)
  if (!path.isAbsolute(normalized)) {
    return false
  }
  return normalized.toLowerCase().endsWith(`.${FA_PROJECT_FILE_EXTENSION}`)
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
