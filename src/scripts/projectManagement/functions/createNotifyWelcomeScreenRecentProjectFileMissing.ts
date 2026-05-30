export function createNotifyWelcomeScreenRecentProjectFileMissing (deps: {
  createNotify: (opts: { message: string; timeout: number; type: string }) => void
  t: (key: string, params: { projectName: string }) => string
}): {
    notifyWelcomeScreenRecentProjectFileMissing: (projectName: string) => void
  } {
  const notifyWelcomeScreenRecentProjectFileMissing = (projectName: string): void => {
    const message = deps.t(
      'globalFunctionality.faProjectSession.notifyRecentProjectFileMissing',
      { projectName }
    )
    deps.createNotify({
      message,
      timeout: 10_000,
      type: 'negative'
    })
  }

  return {
    notifyWelcomeScreenRecentProjectFileMissing
  }
}
