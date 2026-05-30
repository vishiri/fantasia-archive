import type { T_faProjectOpenFailedNotifyType } from 'app/types/T_faProjectOpenFailedError'

/**
 * Thrown when an existing '.faproject' was selected but main could not open or initialize it.
 * Carries optional path metadata for action monitor payloads.
 */
export class FaProjectOpenFailedError extends Error {
  readonly attemptedFilePath: string | undefined
  readonly notifyType: T_faProjectOpenFailedNotifyType

  constructor (
    message: string,
    attemptedFilePath?: string,
    notifyType: T_faProjectOpenFailedNotifyType = 'negative'
  ) {
    super(message)
    this.name = 'FaProjectOpenFailedError'
    this.attemptedFilePath = attemptedFilePath
    this.notifyType = notifyType
  }
}
