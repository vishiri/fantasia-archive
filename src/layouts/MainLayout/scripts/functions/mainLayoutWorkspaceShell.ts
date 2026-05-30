/**
 * Workspace drawer is shown only on the /home shell route.
 */
export function resolveMainLayoutShowWorkspaceDrawer (routePath: string): boolean {
  return routePath === '/home'
}

export function resolveMainLayoutRouteClass (
  showWorkspaceDrawer: boolean
): Record<string, boolean> {
  return {
    'appShellLayout--welcome': !showWorkspaceDrawer,
    'appShellLayout--workspace': showWorkspaceDrawer
  }
}
