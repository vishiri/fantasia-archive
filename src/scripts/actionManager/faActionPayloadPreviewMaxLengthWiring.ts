import { Result } from 'neverthrow'

import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH } from './functions/faActionPayloadPreviewLimits'
import { resolveFaActionPayloadPreviewMaxLengthForLogging } from './functions/resolveFaActionPayloadPreviewMaxLengthForLogging'

/**
 * Action Monitor history preview cap unless Fantasia Archive Settings enables full payload logging.
 * Error and warning rows ignore the setting and always use an unlimited preview length.
 */
export function resolveFaActionPayloadPreviewMaxLength (isErrorOrWarning = false): number {
  const settingsResult = Result.fromThrowable(
    () => S_FaUserSettings().settings,
    (): undefined => undefined
  )()
  if (settingsResult.isErr()) {
    return FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH
  }
  return resolveFaActionPayloadPreviewMaxLengthForLogging(
    settingsResult.value?.logFullActivityPayload === true,
    isErrorOrWarning,
    FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH
  )
}
