import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { afterEach, beforeEach, vi } from 'vitest'

import { FA_KEYBINDS_STORE_DEFAULTS } from 'app/src-electron/mainScripts/keybinds/keybinds_managerDefaults'
import { FA_APP_NOTEBOARD_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appNoteboard/appNoteboard_managerDefaults'
import { FA_APP_STYLING_STORE_DEFAULTS } from 'app/src-electron/mainScripts/appStyling/appStyling_managerDefaults'
import { FA_USER_SETTINGS_DEFAULTS } from 'app/src-electron/mainScripts/userSettings/faUserSettingsDefaults'
import { createFaProjectContentBridgeHarnessStub } from 'app/helpers/faProjectContentBridgeHarnessStub'
import type { I_extraEnvVariablesAPI } from 'app/types/I_faElectronRendererBridgeAPIs'
import { ensureVitestCoverageTmpDir } from './vitest.ensureCoverageTmp'

const originalConsoleWarn = console.warn.bind(console)

ensureVitestCoverageTmpDir()

const i18nLocaleRef = ref('en-US')

const FANTASIA_STORYBOOK_CANVAS_KEY = '__fantasiaStorybookCanvas'

/**
 * Mirrors 'setFantasiaStorybookCanvasFlag' from 'app/src/scripts/appInternals/appInternals_manager'.
 * Defined here so this setup file does not import that module (it pulls 'i18n' before the hoisted 'vi.mock' for externalFileLoader is safe).
 */
function setFantasiaStorybookCanvasFlag (value: boolean): void {
  if (value) {
    (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY] = true
  } else {
    delete (globalThis as Record<string, unknown>)[FANTASIA_STORYBOOK_CANVAS_KEY]
  }
}

config.global.config = {
  compilerOptions: {
    isCustomElement: (tag: string) => {
      return /^q-/i.test(tag)
    }
  }
}

/**
 * '_data' modules and dialogs import Pinia stores at module load; provide an active Pinia
 * before component Vitest files import those dependency chains.
 */
setActivePinia(createPinia())

if (typeof document.queryCommandSupported !== 'function') {
  document.queryCommandSupported = () => false
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor (callback: ResizeObserverCallback) {
      void callback
    }

    disconnect (): void {}

    observe (_target: Element, _options?: unknown): void {}

    unobserve (_target: Element): void {}
  } as unknown as typeof ResizeObserver
}

vi.mock('app/i18n/externalFileLoader', () => {
  return {
    i18n: {
      global: {
        locale: i18nLocaleRef,
        mergeLocaleMessage: vi.fn(),
        t: (key: string) => {
          return key
        },
        te: () => false
      }
    }
  }
})

vi.mock('@quasar/quasar-ui-qmarkdown/dist/index.css', () => ({}))

vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('quasar')>()
  return {
    ...actual,
    Notify: {
      ...actual.Notify,
      create: vi.fn(),
      setDefaults: vi.fn()
    }
  }
})

function forwardVueTestUtilsWarnUnlessFiltered (...args: unknown[]): void {
  const [firstArg] = args
  const message = typeof firstArg === 'string' ? firstArg : ''
  if (
    !message.includes('[Vue warn]: Failed to resolve component: q-') &&
    !message.includes('[Vue warn]: Failed to resolve directive: close-popup') &&
    !message.includes('[Vue warn]: injection "_q_" not found.')
  ) {
    originalConsoleWarn(...args)
  }
}

/**
 * Vitest-wrapped projectContent bridge stub for renderer component tests.
 */
function buildVitestProjectContentApiMock (): ReturnType<typeof createFaProjectContentBridgeHarnessStub> {
  const stub = createFaProjectContentBridgeHarnessStub()
  return {
    createDocument: vi.fn(stub.createDocument),
    createDocumentTemplate: vi.fn(stub.createDocumentTemplate),
    createMedia: vi.fn(stub.createMedia),
    createWorld: vi.fn(stub.createWorld),
    deleteDocument: vi.fn(stub.deleteDocument),
    deleteDocumentTemplate: vi.fn(stub.deleteDocumentTemplate),
    deleteMedia: vi.fn(stub.deleteMedia),
    deleteWorld: vi.fn(stub.deleteWorld),
    getDocumentById: vi.fn(stub.getDocumentById),
    getDocumentTemplateById: vi.fn(stub.getDocumentTemplateById),
    getMediaById: vi.fn(stub.getMediaById),
    getWorldById: vi.fn(stub.getWorldById),
    linkDocumentMedia: vi.fn(stub.linkDocumentMedia),
    listDocumentMedia: vi.fn(stub.listDocumentMedia),
    listDocumentTemplates: vi.fn(stub.listDocumentTemplates),
    listDocumentTemplatesForProjectSettings: vi.fn(stub.listDocumentTemplatesForProjectSettings),
    listDocuments: vi.fn(stub.listDocuments),
    listMedia: vi.fn(stub.listMedia),
    listWorlds: vi.fn(stub.listWorlds),
    listWorldsForProjectSettings: vi.fn(stub.listWorldsForProjectSettings),
    listWorkspaceHierarchyLayout: vi.fn(stub.listWorkspaceHierarchyLayout),
    listPlacementDocumentChildren: vi.fn(stub.listPlacementDocumentChildren),
    reindexDocumentSiblingsInHierarchy: vi.fn(stub.reindexDocumentSiblingsInHierarchy),
    moveDocumentInHierarchy: vi.fn(stub.moveDocumentInHierarchy),
    searchProjectHierarchy: vi.fn(stub.searchProjectHierarchy),
    saveDocumentTemplatesSnapshot: vi.fn(stub.saveDocumentTemplatesSnapshot),
    saveWorldsSnapshot: vi.fn(stub.saveWorldsSnapshot),
    setDocumentTemplate: vi.fn(stub.setDocumentTemplate),
    setDocumentWorld: vi.fn(stub.setDocumentWorld),
    unlinkDocumentMedia: vi.fn(stub.unlinkDocumentMedia),
    updateDocument: vi.fn(stub.updateDocument),
    updateDocumentTemplate: vi.fn(stub.updateDocumentTemplate),
    updateMedia: vi.fn(stub.updateMedia),
    updateWorld: vi.fn(stub.updateWorld)
  }
}

function buildVitestProjectManagementApiMock (): NonNullable<
  typeof window.faContentBridgeAPIs
>['projectManagement'] {
  return {
    createProject: vi.fn(async () => ({ outcome: 'canceled' as const })),
    getProjectNoteboard: vi.fn(async () => ({
      frame: null,
      schemaVersion: 1 as const,
      text: ''
    })),
    getProjectSettings: vi.fn(async () => ({
      projectName: '',
      schemaVersion: 1 as const
    })),
    getProjectSidebar: vi.fn(async () => ({
      schemaVersion: 1 as const,
      widthPx: 375
    })),
    getHierarchyTreeUiState: vi.fn(async () => ({
      schemaVersion: 1 as const,
      expandedNodeIds: [],
      scrollTopPx: 0
    })),
    getOpenedDocumentsSnapshot: vi.fn(async () => ({
      schemaVersion: 1 as const,
      activeDocumentId: null,
      tabs: []
    })),
    getProjectStyling: vi.fn(async () => ({
      css: '',
      frame: null,
      schemaVersion: 1 as const
    })),
    getRecentProjects: vi.fn(async () => []),
    resolveRecentProjectMruHeadForOpen: vi.fn(async () => ({ outcome: 'empty' as const })),
    openProject: vi.fn(async () => ({ outcome: 'canceled' as const })),
    setProjectNoteboard: vi.fn(async (): Promise<boolean> => true),
    setProjectSettings: vi.fn(async (): Promise<boolean> => true),
    setProjectSidebar: vi.fn(async (): Promise<boolean> => true),
    setHierarchyTreeUiState: vi.fn(async (): Promise<boolean> => true),
    saveOpenedDocumentsSnapshot: vi.fn(async (): Promise<boolean> => true),
    setProjectStyling: vi.fn(async (): Promise<boolean> => true),
    stageE2eNextCreatePath: vi.fn(async () => false),
    stageE2eNextOpenPath: vi.fn(async () => false)
  }
}

/**
 * Minimal 'window.faContentBridgeAPIs' for Vitest runs that mount '.vue' components.
 */
function resetFaVitestRendererHarness (): void {
  setActivePinia(createPinia())
  i18nLocaleRef.value = 'en-US'

  window.faContentBridgeAPIs = {
    faWindowControl: {
      checkWindowMaximized: vi.fn(async () => false),
      closeWindow: vi.fn(async () => undefined),
      maximizeWindow: vi.fn(async () => undefined),
      minimizeWindow: vi.fn(async () => undefined),
      refreshWebContents: vi.fn(async () => undefined),
      resizeWindow: vi.fn(async () => undefined)
    },
    faDevToolsControl: {
      checkDevToolsStatus: vi.fn(async () => false),
      toggleDevTools: vi.fn(async () => undefined),
      openDevTools: vi.fn(async () => undefined),
      closeDevTools: vi.fn(async () => undefined)
    },
    faExternalLinksManager: {
      checkIfExternal: vi.fn(() => false),
      openExternal: vi.fn()
    },
    extraEnvVariables: {
      getCachedSnapshot: vi.fn(() => null),
      getSnapshot: vi.fn(async (): Promise<I_extraEnvVariablesAPI> => ({
        ELECTRON_MAIN_FILEPATH: '/fake/electron-main.js',
        FA_FRONTEND_RENDER_TIMER: 0
      }))
    },
    appDetails: {
      getProjectVersion: vi.fn(async () => '0.0.0-unit-test')
    },
    faUserSettings: {
      getSettings: vi.fn(async () => ({ ...FA_USER_SETTINGS_DEFAULTS })),
      setSettings: vi.fn(async () => {})
    },
    faKeybinds: {
      getKeybinds: vi.fn(async () => ({
        platform: 'win32' as const,
        store: { ...FA_KEYBINDS_STORE_DEFAULTS }
      })),
      setKeybinds: vi.fn(async () => undefined)
    },
    faAppNoteboard: {
      getNoteboard: vi.fn(async () => ({ ...FA_APP_NOTEBOARD_STORE_DEFAULTS })),
      setNoteboard: vi.fn(async () => undefined)
    },
    faAppStyling: {
      getAppStyling: vi.fn(async () => ({ ...FA_APP_STYLING_STORE_DEFAULTS })),
      setAppStyling: vi.fn(async () => undefined)
    },
    faAppConfig: {
      applyImport: vi.fn(async () => ({ appliedParts: [] })),
      disposeImportSession: vi.fn(async () => undefined),
      exportToFile: vi.fn(async () => ({ outcome: 'canceled' as const })),
      prepareImport: vi.fn(async () => ({ outcome: 'canceled' as const })),
      stageE2eNextExportPath: vi.fn(async () => false),
      stageE2eNextImportPath: vi.fn(async () => false)
    },
    faChromiumCtrlShiftShortcut: {
      installForwardedKeyChordListener: vi.fn()
    },
    faProjectFailsafe: {
      installActiveProjectPathReply: vi.fn()
    },
    faProjectOsOpen: {
      installOsOpenListener: vi.fn(),
      sendRendererReady: vi.fn()
    },
    projectContent: buildVitestProjectContentApiMock(),
    projectManagement: buildVitestProjectManagementApiMock()
  }
}

beforeEach(() => {
  ensureVitestCoverageTmpDir()
  vi.spyOn(console, 'warn').mockImplementation(forwardVueTestUtilsWarnUnlessFiltered)
  setFantasiaStorybookCanvasFlag(false)
  resetFaVitestRendererHarness()
})

afterEach(() => {
  vi.restoreAllMocks()
})
