const faProjectReplacementPersistHooks = new Set<() => Promise<void>>()

export function registerFaProjectReplacementPersistHook (
  hook: () => Promise<void>
): void {
  faProjectReplacementPersistHooks.add(hook)
}

export async function runFaProjectReplacementPersistHooks (): Promise<void> {
  for (const hook of faProjectReplacementPersistHooks) {
    await hook()
  }
}
