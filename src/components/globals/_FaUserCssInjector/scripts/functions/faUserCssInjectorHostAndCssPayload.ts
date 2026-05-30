/**
 * Mirrors app styling precedence: ephemeral preview replaces persisted sheet text until cleared.
 */
export function resolveFaUserCssInjectorEffectiveCssPayload (
  livePreview: string | null,
  persistedCss: string
): string {
  const useLiveBand = livePreview !== null
  if (useLiveBand) {
    return livePreview
  }
  return persistedCss
}

/**
 * Picks DOM 'document' from a host-shaped global (Electron renderer + jsdom expose it; SSR mocks omit).
 */
export function resolveFaUserCssInjectorHostDocument (
  host: { readonly document?: Document | undefined }
): Document | undefined {
  const probe = host.document
  const documentMissingBinding = typeof probe === 'undefined'
  if (documentMissingBinding) {
    return undefined
  }
  return probe
}
