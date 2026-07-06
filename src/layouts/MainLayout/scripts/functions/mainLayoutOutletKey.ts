export function resolveMainLayoutOutletKey (
  childRouteKey: string | undefined
): string {
  if (typeof childRouteKey === 'string' && childRouteKey.length > 0) {
    return childRouteKey
  }

  return 'app-shell-outlet'
}
