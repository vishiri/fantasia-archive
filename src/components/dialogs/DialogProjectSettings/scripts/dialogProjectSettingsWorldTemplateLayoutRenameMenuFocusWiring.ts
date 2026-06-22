import { scheduleFaLocaleTranslationsMenuInputFocus } from 'app/src/scripts/localeTranslations/functions/scheduleFaLocaleTranslationsMenuInputFocus'

/**
 * Focus rename menu input after Quasar menu content mounts (nextTick + rAF retry).
 */
export function scheduleDialogProjectSettingsWorldTemplateLayoutRenameMenuInputFocus (deps: {
  focusRenameInput: () => void
  nextTick: () => Promise<void>
  requestAnimationFrame: (callback: () => void) => number
}): void {
  scheduleFaLocaleTranslationsMenuInputFocus({
    focusMenuInput: deps.focusRenameInput,
    nextTick: deps.nextTick,
    requestAnimationFrame: deps.requestAnimationFrame
  })
}
