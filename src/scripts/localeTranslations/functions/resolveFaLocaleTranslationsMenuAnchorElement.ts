/**
 * Resolves the q-field host for a locale translations menu from the translate trigger.
 */
export function resolveFaLocaleTranslationsMenuAnchorElement (
  triggerElement: HTMLElement | null
): HTMLElement | null {
  if (triggerElement === null) {
    return null
  }
  const fieldElement = triggerElement.closest('.q-field')
  if (fieldElement !== null) {
    return fieldElement as HTMLElement
  }
  return triggerElement
}
