import type { Result, ResultAsync } from 'neverthrow'

/** Injected neverthrow Result namespace (managers pass typeof Result). */
export type T_injectedResult = typeof Result

/** Injected neverthrow ResultAsync namespace (managers pass typeof ResultAsync). */
export type T_injectedResultAsync = typeof ResultAsync

/** Injected Result.fromThrowable (managers pass Result.fromThrowable). */
export type T_injectedResultFromThrowable = typeof Result.fromThrowable
