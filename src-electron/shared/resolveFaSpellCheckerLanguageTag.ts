import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

import {
  FA_SPELL_CHECKER_CANDIDATES_BY_LANGUAGE_CODE,
  resolveFaSpellCheckerLanguageFamilyPrefix
} from 'app/types/faUserSettingsLanguageRegistry'

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
 * Matches family / family-* tags in Chromium order when exact candidate keys are absent.
 */
function pickFirstLanguageFamilyMatch (
  available: readonly string[],
  family: string
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
 * Non-English UI never falls back to English when English is only what Chromium lists first; that mismatch
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

  const preferred = pickFirstAvailable(
    FA_SPELL_CHECKER_CANDIDATES_BY_LANGUAGE_CODE[languageCode],
    byLower
  )
  if (preferred !== null) {
    return preferred
  }

  const familyPrefix = resolveFaSpellCheckerLanguageFamilyPrefix(languageCode)
  if (familyPrefix !== null) {
    const familyMatch = pickFirstLanguageFamilyMatch(available, familyPrefix)
    if (familyMatch !== null) {
      return familyMatch
    }
  }

  if (languageCode === 'en-US') {
    const firstString = available.find((tag) => {
      return typeof tag === 'string'
    })
    return firstString ?? null
  }

  return null
}
