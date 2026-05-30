/**
 * Finds or allocates the injected user '<style>' in 'document.head'.
 * Caller passes explicit 'undefined' when 'document' is unavailable (SSR or offline tests).
 */
export function ensureFaUserCssStyleElementInHead (
  documentRoot: Pick<Document, 'createElement' | 'getElementById'> & { head: HTMLElement } | undefined,
  elementId: string
): HTMLStyleElement | null {
  if (documentRoot === undefined) {
    return null
  }
  const existing = documentRoot.getElementById(elementId)
  if (existing instanceof HTMLStyleElement) {
    return existing
  }
  const created = documentRoot.createElement('style')
  created.id = elementId
  created.setAttribute('type', 'text/css')
  created.setAttribute('data-fa-user-css', 'true')
  documentRoot.head.appendChild(created)
  return created
}

/**
 * Writes normalized CSS unless the node matches or wiring is disconnected.
 */
export function applyFaUserCssToStyleElementIfNeeded (
  styleElement: HTMLStyleElement | null,
  css: string
): void {
  if (styleElement === null) {
    return
  }
  if (styleElement.textContent !== css) {
    styleElement.textContent = css
  }
}
