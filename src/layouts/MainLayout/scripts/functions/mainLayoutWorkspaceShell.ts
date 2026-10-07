/**
 * Workspace drawer is shown on /home and nested workspace routes (e.g. document tabs).
 */
export function resolveMainLayoutShowWorkspaceDrawer (routePath: string): boolean {
  return routePath === '/home' || routePath.startsWith('/home/')
}

export function resolveMainLayoutRouteClass (
  showWorkspaceDrawer: boolean
): Record<string, boolean> {
  const welcome = !showWorkspaceDrawer
  const workspace = showWorkspaceDrawer
  return {
    'appShellLayout--welcome': welcome,
    'appShellLayout--workspace': workspace
  }
}
