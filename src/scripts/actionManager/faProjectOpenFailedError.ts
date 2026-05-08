/**
 * Thrown when an existing '.faproject' was selected but main could not open or initialize it.
 * Carries optional path metadata for action monitor payloads.
 */
export class FaProjectOpenFailedError extends Error {
  readonly attemptedFilePath: string | undefined

  constructor (
    message: string,
    attemptedFilePath?: string
  ) {
    super(message)
    this.name = 'FaProjectOpenFailedError'
    this.attemptedFilePath = attemptedFilePath
  }
}
