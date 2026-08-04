import type { Session } from 'electron'
import { Result } from 'neverthrow'

import { resolveFaSpellCheckerLanguageTag } from 'app/src-electron/shared/resolveFaSpellCheckerLanguageTag'
import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

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
 * Turns Chromium spellcheck off and clears dictionaries without resolving a language tag.
 */
function disableSpellCheckerOnSession (session: Session): void {
  session.setSpellCheckerEnabled(false)
  session.setSpellCheckerLanguages([])
}

/**
 * Aligns Chromium hunspell languages with the persisted UI language code.
 * When spellCheckEnabled is false, leaves spellcheck off (live App Settings toggle).
 */
export function applyFaSpellCheckerLanguagesToSession (
  session: Session,
  languageCode: T_faUserSettingsLanguageCode,
  spellCheckEnabled = true
): void {
  if (!spellCheckEnabled) {
    void Result.fromThrowable(
      (): void => {
        disableSpellCheckerOnSession(session)
      },
      (): undefined => undefined
    )()
    return
  }
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
  const resolvedTag = tag
  void Result.fromThrowable(
    (): void => {
      applyResolvedSpellCheckerLanguage(session, resolvedTag)
    },
    (): undefined => undefined
  )()
}
