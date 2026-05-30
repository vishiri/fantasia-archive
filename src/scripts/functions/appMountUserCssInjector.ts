/**
 * Whether App.vue should mount user CSS injectors (Electron renderer only; not Storybook canvas).
 */
export function resolveMountUserCssInjector (
  isStorybookCanvas: boolean,
  mode: string | undefined
): boolean {
  if (isStorybookCanvas) {
    return false
  }

  return mode === 'electron'
}
