import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'

import { FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH } from './functions/faActionPayloadPreviewLimits'

export { FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH } from './functions/faActionPayloadPreviewLimits'

/**
 * Action Monitor history preview cap unless Fantasia Archive Settings enables full payload logging.
 */
export function resolveFaActionPayloadPreviewMaxLength (): number {
  try {
    const settings = S_FaUserSettings().settings
    if (settings?.logFullActivityPayload === true) {
      return Number.POSITIVE_INFINITY
    }
  } catch {
    return FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH
  }
  return FA_ACTION_PAYLOAD_PREVIEW_MAX_LENGTH
}
