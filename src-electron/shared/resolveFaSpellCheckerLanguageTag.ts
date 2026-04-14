import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

const CANDIDATES_BY_CODE: Record<T_faUserSettingsLanguageCode, readonly string[]> = {
  de: ['de', 'de-DE'],
  fr: ['fr', 'fr-FR'],
  'en-US': ['en-US', 'en-GB', 'en']
}

function buildAvailableLowerToCanonical (available: readonly string[]): Map<string, string> {
  const map = new Map<string, string>()
  for (const tag of available) {
    if (typeof tag !== 'string') {
      continue
    }
    map.set(tag.toLowerCase(), tag)
  }
  return map
}

function pickFirstAvailable (
  candidates: readonly string[],
  byLower: Map<string, string>
): string | null {
  for (const candidate of candidates) {
    const hit = byLower.get(candidate.toLowerCase())
    if (hit !== undefined) {
      return hit
    }
  }
  return null
}

/**
 * Matches fr / fr-* or de / de-* tags in Chromium order when exact candidate keys are absent.
 */
function pickFirstLanguageFamilyMatch (
  available: readonly string[],
  family: 'fr' | 'de'
): string | null {
  const fam = family.toLowerCase()
  for (const tag of available) {
    if (typeof tag !== 'string') {
      continue
    }
    const t = tag.toLowerCase()
    if (t === fam || t.startsWith(`${fam}-`)) {
      return tag
    }
  }
  return null
}

/**
 * Picks a Chromium spellchecker BCP-47 tag for the app's UI language.
 * fr / de UI never falls back to English when English is only what Chromium lists first; that mismatch
 * kept spellcheck on en-US after leaving English. en-US UI tries English variant candidates first,
 * then the first string entry in the list when none match.
 */
export function resolveFaSpellCheckerLanguageTag (
  languageCode: T_faUserSettingsLanguageCode,
  available: readonly string[]
): string | null {
  if (available.length === 0) {
    return null
  }

  const byLower = buildAvailableLowerToCanonical(available)

  const preferred = pickFirstAvailable(CANDIDATES_BY_CODE[languageCode], byLower)
  if (preferred !== null) {
    return preferred
  }

  if (languageCode === 'fr' || languageCode === 'de') {
    return pickFirstLanguageFamilyMatch(available, languageCode)
  }

  const firstString = available.find((tag) => {
    return typeof tag === 'string'
  })
  return firstString ?? null
}
