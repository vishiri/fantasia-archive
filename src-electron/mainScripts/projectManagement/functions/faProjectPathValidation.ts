import type { I_faProjectPathApi } from 'app/types/I_faProjectManagementElectronMain'

function faProjectPathBasenameForStem (
  filePath: string,
  pathApi: I_faProjectPathApi
): string {
  const looksLikeWindowsParsing =
    filePath.includes('\\') ||
    /^[A-Za-z]:[\\/]/.test(filePath)
  if (looksLikeWindowsParsing) {
    return pathApi.win32.basename(filePath)
  }
  return pathApi.basename(filePath)
}

/**
 * True when path is non-empty, looks like an absolute path on the current OS or like a Windows
 * absolute path (drive letter or UNC), and ends with .faproject (case-insensitive).
 */
export function pathLooksLikeFaProjectFile (
  filePath: string,
  pathApi: I_faProjectPathApi,
  projectFileExtension: string
): boolean {
  if (typeof filePath !== 'string' || filePath.length === 0) {
    return false
  }
  const nativeNormalized = filePath.replaceAll('/', pathApi.sep)
  const looksAbsolute =
    pathApi.isAbsolute(nativeNormalized) ||
    pathApi.win32.isAbsolute(filePath)
  if (!looksAbsolute) {
    return false
  }
  const forSuffixCheck = filePath.replaceAll('\\', '/')
  return forSuffixCheck.toLowerCase().endsWith(`.${projectFileExtension}`)
}

/**
 * Ensures basename ends with .faproject; does not validate absolute path.
 */
export function ensureFaProjectExtension (
  filePath: string,
  projectFileExtension: string
): string {
  const lower = filePath.toLowerCase()
  const suffix = `.${projectFileExtension}`
  if (lower.endsWith(suffix)) {
    return filePath
  }
  return `${filePath}${suffix}`
}

/**
 * Stem of '.faproject' basename for migration bootstrap when user_version is zero; falls back to 'Project'.
 */
export function faDisplayNameFallbackFromProjectPath (
  filePath: string,
  pathApi: I_faProjectPathApi,
  projectFileExtension: string
): string {
  const base = faProjectPathBasenameForStem(filePath, pathApi)
  const suffix = `.${projectFileExtension}`
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
