/**
 * Resolves a URL for a file under Vite public/ (for img src, etc.) using import.meta.env.BASE_URL.
 * Quasar Electron maps an empty Vite base to '/' on import.meta.env.BASE_URL; root-relative paths
 * such as /countryFlags/... fail under file:// in packaged builds, so normalize to a relative base.
 *
 * @param pathFromPublicRoot Path beginning at the public root, with or without a leading slash (e.g. 'countryFlags/us.svg' or '/images/x.png').
 */
export function resolveVitePublicAssetPath (pathFromPublicRoot: string): string {
  const rawBase = import.meta.env.BASE_URL
  const base =
    rawBase === '' || rawBase === undefined || rawBase === '/'
      ? './'
      : rawBase
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`
  const trimmed = pathFromPublicRoot.replace(/^\//, '')

  return `${baseWithSlash}${trimmed}`
}
