import path from 'node:path'

import { FA_PROJECT_FILE_EXTENSION } from 'app/src-electron/shared/faProjectConstants'

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
