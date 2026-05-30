import type {
  I_faKeybindsRoot,
  T_faKeybindCommandId
} from 'app/types/I_faKeybindsDomain'
import type { I_faAppNoteboardRoot } from 'app/types/I_faAppNoteboardDomain'
import type { I_faAppStylingRoot } from 'app/types/I_faAppStylingDomain'
import type { I_faElectronStoreHandle } from 'app/types/I_faElectronStoreHandle'
import type { I_faFloatingWindowPersistedRect } from 'app/types/I_faFloatingWindowPersistedRect'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'

export interface I_faAppNoteboardStoreApiDeps {
  ElectronStore: new (options: {
    defaults: I_faAppNoteboardRoot
    name: string
  }) => I_faElectronStoreHandle<I_faAppNoteboardRoot>
  buildCleanFaAppNoteboardRoot: (
    raw: Partial<I_faAppNoteboardRoot> & Record<string, unknown>,
    normalizePersistedRectForStorage: (frame: unknown) => I_faFloatingWindowPersistedRect | null,
    persistedFloatingWindowFramesAreEquivalent: (
      a: unknown,
      b: I_faFloatingWindowPersistedRect | null
    ) => boolean
  ) => {
    next: I_faAppNoteboardRoot
    shouldRewrite: boolean
  }
  createLazySingleton: <T>(factory: () => T) => () => T
  defaults: I_faAppNoteboardRoot
  normalizePersistedRectForStorage: (frame: unknown) => I_faFloatingWindowPersistedRect | null
  persistedFloatingWindowFramesAreEquivalent: (
    a: unknown,
    b: I_faFloatingWindowPersistedRect | null
  ) => boolean
  storeName: string
}

export interface I_faAppStylingStoreApiDeps {
  ElectronStore: new (options: {
    defaults: I_faAppStylingRoot
    name: string
  }) => I_faElectronStoreHandle<I_faAppStylingRoot>
  buildCleanFaAppStylingRoot: (
    raw: Partial<I_faAppStylingRoot> & Record<string, unknown>,
    normalizePersistedRectForStorage: (frame: unknown) => I_faFloatingWindowPersistedRect | null,
    persistedFloatingWindowFramesAreEquivalent: (
      a: unknown,
      b: I_faFloatingWindowPersistedRect | null
    ) => boolean
  ) => {
    next: I_faAppStylingRoot
    shouldRewrite: boolean
  }
  createLazySingleton: <T>(factory: () => T) => () => T
  defaults: I_faAppStylingRoot
  normalizePersistedRectForStorage: (frame: unknown) => I_faFloatingWindowPersistedRect | null
  persistedFloatingWindowFramesAreEquivalent: (
    a: unknown,
    b: I_faFloatingWindowPersistedRect | null
  ) => boolean
  storeName: string
}

export interface I_faKeybindsStoreApiDeps {
  ElectronStore: new (options: {
    defaults: I_faKeybindsRoot
    name: string
  }) => I_faElectronStoreHandle<I_faKeybindsRoot>
  buildCleanFaKeybindsRoot: (
    raw: Partial<I_faKeybindsRoot> & Record<string, unknown>,
    commandIds: readonly T_faKeybindCommandId[],
    isFaKeybindCommandId: (key: string) => key is T_faKeybindCommandId
  ) => {
    next: I_faKeybindsRoot
    shouldRewrite: boolean
  }
  commandIds: readonly T_faKeybindCommandId[]
  createLazySingleton: <T>(factory: () => T) => () => T
  defaults: I_faKeybindsRoot
  isFaKeybindCommandId: (key: string) => key is T_faKeybindCommandId
  storeName: string
}

export interface I_faUserSettingsStoreApiDeps {
  ElectronStore: new (options: {
    defaults: I_faUserSettings
    name: string
  }) => I_faElectronStoreHandle<I_faUserSettings>
  buildSanitizedFaUserSettings: (
    currentSettings: Partial<I_faUserSettings>,
    defaults: I_faUserSettings
  ) => {
    hasUnexpectedKeys: boolean
    sanitized: I_faUserSettings
  }
  createLazySingleton: <T>(factory: () => T) => () => T
  defaults: I_faUserSettings
  storeName: string
}

export interface I_appIdentityElectronApiDeps {
  app: {
    getPath: (name: 'appData') => string
    setName: (name: string) => void
    setPath: (name: 'userData', path: string) => void
  }
  determineAppNameFromEnv: (debugging: string | undefined, packageName: string) => string
  getDebugging: () => string | undefined
  getTestEnv: () => string | undefined
  isPlaywrightTestEnv: (testEnv: string | undefined) => boolean
  packageName: string
  pathJoin: (...segments: string[]) => string
  playwrightIsolatedUserDataDirName: string
  resolveUserDataRootFolderName: (
    testEnv: string | undefined,
    packageName: string,
    appName: string
  ) => string
}

export interface I_windowsDevToolsExtensionsFixDeps {
  devToolsExtensionsFolderExists: (userDataPath: string) => boolean
  getNativeThemeShouldUseDarkColors: () => boolean
  getUserDataPath: () => string
  joinPath: (...segments: string[]) => string
  unlinkDevToolsExtensionsFolder: (userDataPath: string) => void
}

export interface I_nativeShellTweaksDeps {
  getPlatform: () => string
  osPlatform: () => string
  setApplicationMenu: (menu: null) => void
}

export interface I_resolveFaElectronMainJsPathApiDeps {
  argv: string[]
  fileURLToPath: (url: string | URL) => string
  importMetaUrl: string
  pickElectronMainScriptFromArgv: (argv: string[]) => string | null
}
