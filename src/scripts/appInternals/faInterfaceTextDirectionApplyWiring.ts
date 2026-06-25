import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

import { resolveFaInterfaceTextDirectionFromLanguageCode } from './functions/faInterfaceTextDirection'

/**
 * Applies resolved direction to the root HTML element for app-wide layout.
 */
export function applyFaInterfaceTextDirectionFromLanguageCode (
  code: T_faUserSettingsLanguageCode
): void {
  if (typeof document === 'undefined') {
    return
  }

  const direction = resolveFaInterfaceTextDirectionFromLanguageCode(code)
  document.documentElement.dir = direction
  document.documentElement.style.direction = direction
}
