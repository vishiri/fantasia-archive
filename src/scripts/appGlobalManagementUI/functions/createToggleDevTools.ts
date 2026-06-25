type T_createToggleDevToolsDeps = {
  toggleDevToolsAsync: () => void | Promise<void>
}

/**
 * Returns a fire-and-forget DevTools toggle wired to the content bridge.
 */
export function createToggleDevTools (deps: T_createToggleDevToolsDeps): () => void {
  function toggleDevTools (): void {
    void deps.toggleDevToolsAsync()
  }

  return toggleDevTools
}
