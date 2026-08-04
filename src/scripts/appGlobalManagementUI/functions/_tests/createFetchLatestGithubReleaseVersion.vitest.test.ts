import { expect, test, vi } from 'vitest'

import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

import { createFetchLatestGithubReleaseVersion } from '../createFetchLatestGithubReleaseVersion'

const ResultAsyncStub = {
  fromPromise: <T>(promise: Promise<T>, mapError: (cause: unknown) => Error) => {
    return promise.then(
      (value) => {
        return {
          error: new Error('unused'),
          isErr: () => false,
          value
        }
      },
      (cause: unknown) => {
        return {
          error: mapError(cause),
          isErr: () => true,
          value: undefined as never
        }
      }
    )
  }
} as unknown as T_injectedResultAsync

/**
 * createFetchLatestGithubReleaseVersion
 * Returns stripped tag_name from a successful GitHub JSON body.
 */
test('Test that createFetchLatestGithubReleaseVersion strips tag_name from JSON', async () => {
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson: async () => ({ tag_name: 'v2.5.0' }),
    latestApiUrl: 'https://example.test/latest',
    stripFaSemverVersion: (raw) => raw.replace(/^v/i, '')
  })

  const result = await api.fetchLatestGithubReleaseVersion()
  expect(result.isErr()).toBe(false)
  expect(result.value).toBe('2.5.0')
})

/**
 * createFetchLatestGithubReleaseVersion
 * Fails when tag_name is missing.
 */
test('Test that createFetchLatestGithubReleaseVersion errors without tag_name', async () => {
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson: async () => ({}),
    latestApiUrl: 'https://example.test/latest',
    stripFaSemverVersion: (raw) => raw
  })

  const result = await api.fetchLatestGithubReleaseVersion()
  expect(result.isErr()).toBe(true)
})

/**
 * createFetchLatestGithubReleaseVersion
 * Fails when tag_name is not a string.
 */
test('Test that createFetchLatestGithubReleaseVersion errors on non-string tag_name', async () => {
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson: async () => ({ tag_name: 42 }),
    latestApiUrl: 'https://example.test/latest',
    stripFaSemverVersion: (raw) => raw
  })

  const result = await api.fetchLatestGithubReleaseVersion()
  expect(result.isErr()).toBe(true)
  expect(result.error.message).toContain('missing tag_name')
})

/**
 * createFetchLatestGithubReleaseVersion
 * Propagates fetch failures.
 */
test('Test that createFetchLatestGithubReleaseVersion maps fetch failures to err', async () => {
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson: async () => {
      throw new Error('network down')
    },
    latestApiUrl: 'https://example.test/latest',
    stripFaSemverVersion: (raw) => raw
  })

  const result = await api.fetchLatestGithubReleaseVersion()
  expect(result.isErr()).toBe(true)
  expect(result.error.message).toBe('network down')
})

/**
 * createFetchLatestGithubReleaseVersion
 * Calls the injected URL.
 */
test('Test that createFetchLatestGithubReleaseVersion requests the configured URL', async () => {
  const fetchLatestReleaseJson = vi.fn(async () => ({ tag_name: '1.0.0' }))
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson,
    latestApiUrl: 'https://example.test/configured',
    stripFaSemverVersion: (raw) => raw
  })

  await api.fetchLatestGithubReleaseVersion()
  expect(fetchLatestReleaseJson).toHaveBeenCalledWith('https://example.test/configured')
})

/**
 * createFetchLatestGithubReleaseVersion
 * Fails when JSON body is not an object.
 */
test('Test that createFetchLatestGithubReleaseVersion errors on non-object body', async () => {
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson: async () => 'nope',
    latestApiUrl: 'https://example.test/latest',
    stripFaSemverVersion: (raw) => raw
  })

  const result = await api.fetchLatestGithubReleaseVersion()
  expect(result.isErr()).toBe(true)
  expect(result.error.message).toContain('not an object')
})

/**
 * createFetchLatestGithubReleaseVersion
 * Fails when strip leaves an empty tag.
 */
test('Test that createFetchLatestGithubReleaseVersion errors when strip empties tag', async () => {
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson: async () => ({ tag_name: 'v' }),
    latestApiUrl: 'https://example.test/latest',
    stripFaSemverVersion: () => ''
  })

  const result = await api.fetchLatestGithubReleaseVersion()
  expect(result.isErr()).toBe(true)
  expect(result.error.message).toContain('empty after strip')
})

/**
 * createFetchLatestGithubReleaseVersion
 * Maps non-Error throw causes through String().
 */
test('Test that createFetchLatestGithubReleaseVersion maps non-Error causes', async () => {
  const api = createFetchLatestGithubReleaseVersion({
    ResultAsync: ResultAsyncStub,
    fetchLatestReleaseJson: async () => {
      return await Promise.reject('plain-string-fail')
    },
    latestApiUrl: 'https://example.test/latest',
    stripFaSemverVersion: (raw) => raw
  })

  const result = await api.fetchLatestGithubReleaseVersion()
  expect(result.isErr()).toBe(true)
  expect(result.error.message).toBe('plain-string-fail')
})
