/** Second injected user stylesheet: must sort after '#faUserCss' in 'document.head' for cascade precedence. */
export const FA_PROJECT_USER_CSS_ELEMENT_ID = 'faProjectUserCss'

/**
 * Mirrors `repositionProjectStyleAfterAppCss` guarding when the pseudo-document head is unreachable.
 *
 * Exported for Vitest parity with production cascade ordering rules.
 */
export function faProjectUserCssHeadIsUnset (documentRoot: {
  head?: HTMLHeadElement | null
}): boolean {
  const headMaybe = documentRoot.head
  return typeof headMaybe === 'undefined' || headMaybe === null
}

export function repositionProjectStyleAfterAppCss (
  doc: Pick<Document, 'getElementById' | 'head'>,
  el: HTMLElement
): void {
  const anchor = doc.getElementById('faUserCss')

  if (faProjectUserCssHeadIsUnset(doc)) {
    return
  }

  if (anchor instanceof HTMLElement && anchor.parentNode === doc.head) {
    anchor.after(el)
  }
}

export function ensureProjectUserCssStyleElementInHead (
  documentRoot: Pick<Document, 'createElement' | 'getElementById'> & {
    head: HTMLElement
  } | undefined
): HTMLStyleElement | null {
  if (documentRoot === undefined) {
    return null
  }
  const existing = documentRoot.getElementById(FA_PROJECT_USER_CSS_ELEMENT_ID)
  if (existing instanceof HTMLStyleElement) {
    repositionProjectStyleAfterAppCss(documentRoot, existing)
    return existing
  }
  const created = documentRoot.createElement('style')
  created.id = FA_PROJECT_USER_CSS_ELEMENT_ID
  created.setAttribute('type', 'text/css')
  created.setAttribute('data-fa-project-user-css', 'true')
  documentRoot.head.appendChild(created)
  repositionProjectStyleAfterAppCss(documentRoot, created)
  return created
}
