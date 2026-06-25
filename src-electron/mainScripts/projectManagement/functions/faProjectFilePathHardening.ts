type T_createResolveHardenedFaProjectFilePathDeps = {
  pathLooksLikeFaProjectFile: (path: string) => boolean
  realpathSync: (path: string) => string
  statSync: (path: string) => { isFile: () => boolean }
}

/**
 * Factory for symlink-resolved '.faproject' path validation before open/reconnect.
 */
export function createResolveHardenedFaProjectFilePath (
  deps: T_createResolveHardenedFaProjectFilePathDeps
): {
    resolveHardenedFaProjectFilePath: (rawPath: string) => string | null
  } {
  function resolveHardenedFaProjectFilePath (rawPath: string): string | null {
    const trimmed = rawPath.trim()

    if (!deps.pathLooksLikeFaProjectFile(trimmed)) {
      return null
    }

    try {
      const realPath = deps.realpathSync(trimmed)
      const stat = deps.statSync(realPath)

      if (!stat.isFile()) {
        return null
      }

      if (!deps.pathLooksLikeFaProjectFile(realPath)) {
        return null
      }

      return realPath
    } catch {
      return null
    }
  }

  return {
    resolveHardenedFaProjectFilePath
  }
}
