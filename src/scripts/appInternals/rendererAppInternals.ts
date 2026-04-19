import { i18n } from 'app/i18n/externalFileLoader'
import { runFaAction } from 'app/src/scripts/actionManager/faActionManagerRun'
import type { I_appStartupRouter } from 'app/types/I_appStartupRouter'
import type { I_faUserSettings, T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

/**
 * Cross-cutting renderer helpers for boot, layouts, and stores.
 * Grouped in one module under the line cap; import from app/src/scripts/appInternals/rendererAppInternals.
 * Vitest component harness does not import this file; see vitest/vitest.setup.ts for the duplicated Storybook flag helper (avoids pulling i18n before mocks).
 */

const FANTASIA_STORYBOOK_CANVAS_KEY = '__fantasiaStorybookCanvas'

function hasStorybookCanvasRoot (): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  return document.getElementById('storybook-root') !== null
}

/**
 * True in the Storybook preview iframe (has '#storybook-root') or when tests set the explicit flag.
 * Layout and menu code use this to skip surfaces that need a full Electron renderer.
 */
export function isFantasiaStorybookCanvas (): boolean {
  if ((globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] === true) {
    return true
  }
  return hasStorybookCanvasRoot()
}

/**
 * Vitest and similar harnesses call this to force a non-Storybook view when '#storybook-root' is absent.
 */
export function setFantasiaStorybookCanvasFlag (value: boolean): void {
  if (value) {
    (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] = true
  } else {
    delete (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY]
  }
}

/**
 * Resolves a URL for a file under Vite public/ (for img src, etc.) using import.meta.env.BASE_URL.
 * Quasar Electron maps an empty Vite base to '/' on import.meta.env.BASE_URL; root-relative paths
 * such as /countryFlags/... fail under file:// in packaged builds, so normalize to a relative base.
 *
 * @param pathFromPublicRoot Path beginning at the public root, with or without a leading slash (e.g. 'countryFlags/us.svg' or '/images/x.png').
 */
export function resolveVitePublicAssetPath (pathFromPublicRoot: string): string {
  const rawBase = import.meta.env.BASE_URL
  const base =
    rawBase === '' || rawBase === undefined || rawBase === '/'
      ? './'
      : rawBase
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`
  const trimmed = pathFromPublicRoot.replace(/^\//, '')

  return `${baseWithSlash}${trimmed}`
}

export function isFaUserSettingsLanguageCode (value: string): value is T_faUserSettingsLanguageCode {
  return value === 'en-US' || value === 'fr' || value === 'de'
}

/**
 * Switches the shared vue-i18n instance (also registered on the Quasar app in boot) to the given locale.
 */
export function applyFaI18nLocaleFromLanguageCode (code: T_faUserSettingsLanguageCode): void {
  i18n.global.locale.value = code
}

/**
 * Persists a new interface language via the user-settings store.
 * On success, the store switches vue-i18n before the save notification so the toast uses the new locale.
 * No-op when the requested code already matches the current selection.
 */
export async function applyFaUserSettingsLanguageSelection (
  updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>,
  languageCode: T_faUserSettingsLanguageCode,
  currentLanguageCode: T_faUserSettingsLanguageCode
): Promise<void> {
  if (languageCode === currentLanguageCode) {
    return
  }

  await updateSettings({
    languageCode
  })
}

/**
 * Determines if component testing route should be used.
 */
export const determineTestingComponentName = (
  testingType: string | false | undefined,
  testingComponentName: string | false | undefined
): string | false => {
  return (testingType === 'components' && Boolean(testingComponentName))
    ? testingComponentName as string
    : false
}

/**
 * Handles startup routing and tip notification side effects.
 */
export const runAppStartupRouting = async (
  router: I_appStartupRouter,
  testingType: string | false | undefined,
  testingComponentName: string | false | undefined
): Promise<void> => {
  const componentNameOrFalse = determineTestingComponentName(testingType, testingComponentName)

  if (componentNameOrFalse) {
    await router.push({ path: `/componentTesting/${componentNameOrFalse}` })
    return
  }

  await router.push({ path: '/' })
  runFaAction('showStartupTipsNotification', undefined)
}
