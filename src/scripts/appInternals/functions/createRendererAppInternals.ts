import type { I_appStartupRouter } from 'app/types/I_appStartupRouter'
import type { I_faUserSettings, T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

const FANTASIA_STORYBOOK_CANVAS_KEY = '__fantasiaStorybookCanvas'

function hasStorybookCanvasRoot (): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  return document.getElementById('storybook-root') !== null
}

function isFantasiaStorybookCanvas (): boolean {
  if ((globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] === true) {
    return true
  }
  return hasStorybookCanvasRoot()
}

function setFantasiaStorybookCanvasFlag (value: boolean): void {
  if (value) {
    (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] = true
  } else {
    delete (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY]
  }
}

function resolveVitePublicAssetPath (pathFromPublicRoot: string): string {
  const rawBase = import.meta.env.BASE_URL
  const base =
    rawBase === '' || rawBase === undefined || rawBase === '/'
      ? './'
      : rawBase
  const baseWithSlash = base.endsWith('/') ? base : `${base}/`
  const trimmed = pathFromPublicRoot.replace(/^\//, '')

  return `${baseWithSlash}${trimmed}`
}

function determineTestingComponentName (
  testingType: string | false | undefined,
  testingComponentName: string | false | undefined
): string | false {
  return (testingType === 'components' && Boolean(testingComponentName))
    ? testingComponentName as string
    : false
}

export function createRendererAppInternals (deps: {
  applyFaI18nLocaleFromLanguageCode: (code: T_faUserSettingsLanguageCode) => void
  applyFaUserSettingsLanguageSelection: (
    updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>,
    languageCode: T_faUserSettingsLanguageCode,
    currentLanguageCode: T_faUserSettingsLanguageCode
  ) => Promise<void>
  markWelcomeScreenAutoLoadBootAttempted: () => void
  runFaAction: (id: 'showStartupTipsNotification', payload: undefined) => void
  tryRunSkipWelcomeScreenOnLaunch: () => Promise<boolean>
  waitForSkipWelcomeScreenBridgeWhenElectron: () => Promise<void>
  refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch: () => Promise<void>
  markWelcomeScreenAutoLoadBootCompletion: () => void
}): {
    applyFaI18nLocaleFromLanguageCode: (code: T_faUserSettingsLanguageCode) => void
    applyFaUserSettingsLanguageSelection: (
      updateSettings: (patch: Partial<I_faUserSettings>) => Promise<void>,
      languageCode: T_faUserSettingsLanguageCode,
      currentLanguageCode: T_faUserSettingsLanguageCode
    ) => Promise<void>
    determineTestingComponentName: typeof determineTestingComponentName
    isFantasiaStorybookCanvas: typeof isFantasiaStorybookCanvas
    resolveVitePublicAssetPath: typeof resolveVitePublicAssetPath
    runAppStartupRouting: (
      router: I_appStartupRouter,
      testingType: string | false | undefined,
      testingComponentName: string | false | undefined
    ) => Promise<void>
    setFantasiaStorybookCanvasFlag: typeof setFantasiaStorybookCanvasFlag
  } {
  async function runAppStartupRouting (
    router: I_appStartupRouter,
    testingType: string | false | undefined,
    testingComponentName: string | false | undefined
  ): Promise<void> {
    const componentNameOrFalse = determineTestingComponentName(testingType, testingComponentName)

    if (componentNameOrFalse) {
      await router.push({
        path: `/componentTesting/${componentNameOrFalse}`
      })
      return
    }

    deps.markWelcomeScreenAutoLoadBootAttempted()

    // Mount the welcome shell before project open IPC so Quasar boot can finish and Playwright
    // readiness can see mainLayout while skip-welcome auto-load runs.
    await router.push({
      path: '/'
    })

    void (async () => {
      try {
        await deps.waitForSkipWelcomeScreenBridgeWhenElectron()
        await deps.refreshUserSettingsBeforeSkipWelcomeScreenOnLaunch()
        const skippedWelcomeScreen = await deps.tryRunSkipWelcomeScreenOnLaunch()
        if (skippedWelcomeScreen) {
          return
        }
        deps.runFaAction('showStartupTipsNotification', undefined)
      } finally {
        deps.markWelcomeScreenAutoLoadBootCompletion()
      }
    })()
  }

  return {
    applyFaI18nLocaleFromLanguageCode: deps.applyFaI18nLocaleFromLanguageCode,
    applyFaUserSettingsLanguageSelection: deps.applyFaUserSettingsLanguageSelection,
    determineTestingComponentName,
    isFantasiaStorybookCanvas,
    resolveVitePublicAssetPath,
    runAppStartupRouting,
    setFantasiaStorybookCanvasFlag
  }
}
