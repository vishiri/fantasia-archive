import {
  FA_PROJECT_FILE_EXTENSION,
  FA_PROJECT_NAME_MAX_LEN
} from 'app/src-electron/shared/faProjectConstants'
import { faRecentProjectPathKey } from 'app/src-electron/shared/faRecentProjectPathKey'

import * as osOpenArgvFns from './functions/faProjectOsOpenArgv'
import * as pathValidationFns from './functions/faProjectPathValidation'
import { faProjectSlugFromDisplayName as faProjectSlugFromDisplayNameFn } from './functions/faProjectSlugFromDisplayName'

import type {
  I_faProjectPathApi,
  I_projectManagementManagerSurfaceDeps
} from 'app/types/I_faProjectManagementElectronMain'

export function createProjectManagementManagerSurface (
  deps: I_projectManagementManagerSurfaceDeps
): {
    dedupeFaProjectPathsLastWins: (paths: string[]) => string[]
    ensureFaProjectExtension: (filePath: string) => string
    extractFaProjectPathsFromArgv: (argv: string[]) => string[]
    faDisplayNameFallbackFromProjectPath: (filePath: string) => string
    faProjectSlugFromDisplayName: (displayName: string) => string
    pathLooksLikeFaProjectFile: (filePath: string) => boolean
    pickLastFaProjectPathForOsOpen: (paths: string[]) => string | null
    resolveOsOpenFaProjectPathFromArgv: (argv: string[]) => string | null
  } {
  const pathApi: I_faProjectPathApi = {
    basename: deps.path.basename.bind(deps.path),
    isAbsolute: deps.path.isAbsolute.bind(deps.path),
    sep: deps.path.sep,
    win32: deps.path.win32
  }

  const pathLooksLikeFaProjectFile = (filePath: string): boolean => {
    return pathValidationFns.pathLooksLikeFaProjectFile(
      filePath,
      pathApi,
      FA_PROJECT_FILE_EXTENSION
    )
  }

  const ensureFaProjectExtension = (filePath: string): string => {
    return pathValidationFns.ensureFaProjectExtension(filePath, FA_PROJECT_FILE_EXTENSION)
  }

  const faDisplayNameFallbackFromProjectPath = (filePath: string): string => {
    return pathValidationFns.faDisplayNameFallbackFromProjectPath(
      filePath,
      pathApi,
      FA_PROJECT_FILE_EXTENSION
    )
  }

  const faProjectSlugFromDisplayName = (displayName: string): string => {
    return faProjectSlugFromDisplayNameFn(displayName, FA_PROJECT_NAME_MAX_LEN)
  }

  const basenameForOsOpen = (filePath: string): string => {
    return deps.path.basename(filePath.replaceAll('\\', '/'))
  }

  const extractFaProjectPathsFromArgv = (argv: string[]): string[] => {
    return osOpenArgvFns.extractFaProjectPathsFromArgv(
      argv,
      pathLooksLikeFaProjectFile,
      basenameForOsOpen
    )
  }

  const dedupeFaProjectPathsLastWins = (paths: string[]): string[] => {
    return osOpenArgvFns.dedupeFaProjectPathsLastWins(paths, faRecentProjectPathKey)
  }

  const pickLastFaProjectPathForOsOpen = (paths: string[]): string | null => {
    return osOpenArgvFns.pickLastFaProjectPathForOsOpen(paths)
  }

  const resolveOsOpenFaProjectPathFromArgv = (argv: string[]): string | null => {
    return osOpenArgvFns.resolveOsOpenFaProjectPathFromArgv(
      argv,
      pathLooksLikeFaProjectFile,
      basenameForOsOpen
    )
  }

  return {
    dedupeFaProjectPathsLastWins,
    ensureFaProjectExtension,
    extractFaProjectPathsFromArgv,
    faDisplayNameFallbackFromProjectPath,
    faProjectSlugFromDisplayName,
    pathLooksLikeFaProjectFile,
    pickLastFaProjectPathForOsOpen,
    resolveOsOpenFaProjectPathFromArgv
  }
}
