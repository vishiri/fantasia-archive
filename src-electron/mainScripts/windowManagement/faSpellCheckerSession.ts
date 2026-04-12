import type { Session } from 'electron'

import { resolveFaSpellCheckerLanguageTag } from 'app/src-electron/shared/resolveFaSpellCheckerLanguageTag'
import type { T_faUserSettingsLanguageCode } from 'app/types/T_faUserSettingsLanguageCode'

/**
 * Disables spellcheck, clears the previous dictionary list (needed so English does not stay active
 * when switching away from en-US), applies the resolved tag, then re-enables.
 */
function applyResolvedSpellCheckerLanguage (session: Session, tag: string): void {
  session.setSpellCheckerEnabled(false)
  session.setSpellCheckerLanguages([])
  session.setSpellCheckerLanguages([tag])
  session.setSpellCheckerEnabled(true)
}

/**
 * Aligns Chromium hunspell languages with the persisted UI language code.
 */
export function applyFaSpellCheckerLanguagesToSession (
  session: Session,
  languageCode: T_faUserSettingsLanguageCode
): void {
  const available = session.availableSpellCheckerLanguages
  if (available.length === 0) {
    return
  }
  let tag = resolveFaSpellCheckerLanguageTag(languageCode, available)
  if (tag === null && languageCode !== 'en-US') {
    tag = languageCode
  }
  if (tag === null) {
    return
  }
  try {
    applyResolvedSpellCheckerLanguage(session, tag)
  } catch {
    // Chromium rejected the tag (for example bare fr/de before dictionaries are listed).
  }
}
