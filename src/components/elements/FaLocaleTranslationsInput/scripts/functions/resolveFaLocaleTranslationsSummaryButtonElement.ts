/**
 * Resolves the DOM button element backing a Quasar QBtn component ref.
 */
export function resolveFaLocaleTranslationsSummaryButtonElement (
  buttonComponent: { $el: unknown } | null
): HTMLElement | null {
  if (buttonComponent === null) {
    return null
  }
  const buttonElement = buttonComponent.$el
  if (buttonElement instanceof HTMLElement) {
    return buttonElement
  }
  return null
}
