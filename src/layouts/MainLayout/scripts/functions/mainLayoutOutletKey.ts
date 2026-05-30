/**
 * Stable router-view key for the app shell outlet (fallback when nested route is not ready).
 */
export function resolveMainLayoutOutletKey (
  childRoutePath: string | undefined
): string {
  if (typeof childRoutePath === 'string' && childRoutePath.length > 0) {
    return childRoutePath
  }

  return 'app-shell-outlet'
}
