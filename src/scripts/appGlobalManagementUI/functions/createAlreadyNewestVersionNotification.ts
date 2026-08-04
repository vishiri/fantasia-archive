/**
 * Builds the menu-only success Notify when the app is already on the newest version.
 */
export function createAlreadyNewestVersionNotification (deps: {
  createNotify: (opts: { message: string; type: string }) => void
  t: (key: string) => string
}): {
    showAlreadyNewestVersionNotification: () => void
  } {
  const showAlreadyNewestVersionNotification = (): void => {
    deps.createNotify({
      message: deps.t('globalFunctionality.appUpdateCheck.alreadyNewest'),
      type: 'positive'
    })
  }

  return {
    showAlreadyNewestVersionNotification
  }
}
