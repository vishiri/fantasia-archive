/**
 * Registers a global shortcut, retrying with literal Control+ when CommandOrControl+ is unavailable.
 */
export function registerFaChromiumGlobalShortcutAccelerator (
  deps: {
    isRegistered: (accelerator: string) => boolean
    register: (accelerator: string, onPressed: () => void) => boolean
    unregister: (accelerator: string) => void
  },
  accelerator: string,
  onPressed: () => void
): boolean {
  if (deps.isRegistered(accelerator)) {
    deps.unregister(accelerator)
  }
  if (deps.register(accelerator, onPressed)) {
    return true
  }
  if (!accelerator.startsWith('CommandOrControl+')) {
    return false
  }
  const controlAccelerator = accelerator.replace('CommandOrControl+', 'Control+')
  if (deps.isRegistered(controlAccelerator)) {
    deps.unregister(controlAccelerator)
  }
  return deps.register(controlAccelerator, onPressed)
}
