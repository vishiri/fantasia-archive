import { i18n } from 'app/i18n/externalFileLoader'
import type { I_socialContactButtonSet } from 'app/types/I_socialContactButtons'

import { buildSocialContactButtonList } from './buildSocialContactButtonList'

/**
 * Storybook and harness snapshots: resolve labels for whatever locale is active on the shared i18n instance.
 */
export function getSocialContactButtonListForCurrentLocale (): I_socialContactButtonSet {
  return buildSocialContactButtonList((messageKey) => i18n.global.t(messageKey))
}
