import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

/**
 * Effective hide Fantasia mascot flag: App Settings dialog preview wins over persisted settings.
 */
export function resolveHideFantasiaMascot (
  settings: I_faUserSettings | null,
  preview: Partial<I_faUserSettings> | null
): boolean {
  const previewValue = preview?.hidePlushes
  if (previewValue !== undefined) {
    return previewValue === true
  }

  return settings?.hidePlushes === true
}
