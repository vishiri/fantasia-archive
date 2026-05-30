export function createRefreshUserSettingsBeforeSkipWelcomeScreenOnLaunch (deps: {
  refreshUserSettings: () => Promise<void>
}): () => Promise<void> {
  const refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch = async (): Promise<void> => {
    await deps.refreshUserSettings()
  }

  return refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch
}
