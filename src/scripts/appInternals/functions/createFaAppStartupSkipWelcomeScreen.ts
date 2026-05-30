export function createFaAppStartupSkipWelcomeScreen (deps: {
  getFaUserSettingsStore: () => {
    settings: { skipWelcomeScreen?: boolean } | null
  }
  getProjectManagementBridge: () => unknown | undefined
  getUserSettingsBridge: () => {
    getSettings?: () => Promise<{ skipWelcomeScreen?: boolean }>
  } | undefined
  openWelcomeScreenAutoLoadProject: (args: { invocation: 'automatic' }) => Promise<boolean>
}): {
    runSkipWelcomeScreenRedirect: () => Promise<boolean>
    tryRunSkipWelcomeScreenOnLaunch: () => Promise<boolean>
  } {
  async function readSkipWelcomeScreenEnabled (): Promise<boolean> {
    const storeSnapshot = deps.getFaUserSettingsStore().settings
    if (storeSnapshot !== null) {
      return storeSnapshot.skipWelcomeScreen === true
    }

    const userSettingsBridge = deps.getUserSettingsBridge()
    if (userSettingsBridge?.getSettings === undefined) {
      return false
    }

    const persistedSettings = await userSettingsBridge.getSettings()
    return persistedSettings.skipWelcomeScreen === true
  }

  async function runSkipWelcomeScreenRedirect (): Promise<boolean> {
    if (!(await readSkipWelcomeScreenEnabled())) {
      return false
    }

    const projectManagementBridge = deps.getProjectManagementBridge()
    if (projectManagementBridge === undefined) {
      return false
    }

    return await deps.openWelcomeScreenAutoLoadProject({
      invocation: 'automatic'
    })
  }

  async function tryRunSkipWelcomeScreenOnLaunch (): Promise<boolean> {
    return await runSkipWelcomeScreenRedirect()
  }

  return {
    runSkipWelcomeScreenRedirect,
    tryRunSkipWelcomeScreenOnLaunch
  }
}
