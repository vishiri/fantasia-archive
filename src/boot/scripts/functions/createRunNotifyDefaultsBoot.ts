export function createRunNotifyDefaultsBoot (deps: {
  Notify: {
    setDefaults: (options: unknown) => void
  }
  installFaNotifyConsoleLogging: (notify: {
    setDefaults: (options: unknown) => void
  }) => void
}): () => void {
  return function runNotifyDefaultsBoot (): void {
    deps.installFaNotifyConsoleLogging(deps.Notify)

    deps.Notify.setDefaults({
      position: 'bottom-right',
      progress: true,
      timeout: 4000
    })
  }
}
