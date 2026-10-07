import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

type T_faGithubLatestVersionResult = {
  error: Error
  isErr: () => boolean
  value: string
}

/**
 * Fetches the latest GitHub release tag and returns a stripped semver string.
 */
export function createFetchLatestGithubReleaseVersion (deps: {
  ResultAsync: T_injectedResultAsync
  fetchLatestReleaseJson: (url: string) => Promise<unknown>
  latestApiUrl: string
  releaseErrorMessages: {
    emptyAfterStrip: () => string
    missingTagName: () => string
    responseNotObject: () => string
  }
  stripFaSemverVersion: (raw: string) => string
}): {
    fetchLatestGithubReleaseVersion: () => Promise<T_faGithubLatestVersionResult>
  } {
  const fetchLatestGithubReleaseVersion = async (): Promise<T_faGithubLatestVersionResult> => {
    const result = await deps.ResultAsync.fromPromise(
      deps.fetchLatestReleaseJson(deps.latestApiUrl).then((body) => {
        if (body === null || typeof body !== 'object') {
          throw new Error(deps.releaseErrorMessages.responseNotObject())
        }
        const tagName = (body as { tag_name?: unknown }).tag_name
        if (typeof tagName !== 'string' || tagName.trim().length === 0) {
          throw new Error(deps.releaseErrorMessages.missingTagName())
        }
        const stripped = deps.stripFaSemverVersion(tagName)
        if (stripped.length === 0) {
          throw new Error(deps.releaseErrorMessages.emptyAfterStrip())
        }
        return stripped
      }),
      (cause: unknown) => {
        if (cause instanceof Error) {
          return cause
        }
        return new Error(String(cause))
      }
    )
    if (result.isErr()) {
      const error = result.error
      const isErr = (): boolean => {
        return true
      }
      const value = ''

      return {
        error,
        isErr,
        value
      }
    }
    const error = new Error('unused')
    const isErr = (): boolean => {
      return false
    }
    const value = result.value

    return {
      error,
      isErr,
      value
    }
  }

  return {
    fetchLatestGithubReleaseVersion
  }
}
