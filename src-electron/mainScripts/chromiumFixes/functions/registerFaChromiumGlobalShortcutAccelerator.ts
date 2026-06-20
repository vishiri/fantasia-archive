/**
 * Registers a global shortcut, retrying with literal Control+ when CommandOrControl+ is unavailable.
 * Returns the accelerator string that was actually registered (the primary or the Control+ fallback),
 * or null when neither variant could be claimed. Callers track the returned string so the exact
 * accelerator can later be released on blur or teardown.
 */
export function registerFaChromiumGlobalShortcutAccelerator (
  deps: {
    isRegistered: (accelerator: string) => boolean
    register: (accelerator: string, onPressed: () => void) => boolean
    unregister: (accelerator: string) => void
  },
  accelerator: string,
  onPressed: () => void
): string | null {
  if (deps.isRegistered(accelerator)) {
    deps.unregister(accelerator)
  }
  if (deps.register(accelerator, onPressed)) {
    return accelerator
  }
  if (!accelerator.startsWith('CommandOrControl+')) {
    return null
  }
  const controlAccelerator = accelerator.replace('CommandOrControl+', 'Control+')
  if (deps.isRegistered(controlAccelerator)) {
    deps.unregister(controlAccelerator)
  }
  if (deps.register(controlAccelerator, onPressed)) {
    return controlAccelerator
  }
  return null
}
