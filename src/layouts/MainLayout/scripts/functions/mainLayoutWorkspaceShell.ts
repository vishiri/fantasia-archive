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

export function resolveMainLayoutActiveProjectLabel (
  projectName: string | undefined
): string | null {
  if (typeof projectName !== 'string' || projectName.length === 0) {
    return null
  }

  return projectName
}
