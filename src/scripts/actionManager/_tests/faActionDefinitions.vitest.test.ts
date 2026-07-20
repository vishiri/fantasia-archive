/** @vitest-environment jsdom */
import { Notify } from 'quasar'
import { ResultAsync } from 'neverthrow'
import { beforeEach, expect, test, vi } from 'vitest'

import type { I_faAppConfigApplyResult } from 'app/types/I_faAppConfigDomain'
import { FA_ACTION_IDS, type T_faActionId } from 'app/types/I_faActionManagerDomain'

const userSettingsFixture = vi.hoisted(() => ({
  hideHierarchyTree: false
}))

const faActiveProjectFixture = vi.hoisted(() => ({
  activeProject: {
    filePath: 'C:\\fixture.faproject',
    id: 'fixture-id',
    name: 'Fixture Realm'
  }
}))

const canOpenFloatingWindowWhileNoModalMock = vi.hoisted(() => {
  return vi.fn((): boolean => true)
})

const {
  applyLanguageMock,
  applyImportMock,
  checkWindowMaximizedMock,
  closeWindowMock,
  createProjectFromUserInputMock,
  minimizeWindowMock,
  openDialogComponentMock,
  openDialogMarkdownDocumentMock,
  openProjectFromKnownPathMock,
  openProjectFromUserDialogMock,
  refreshKeybindsMock,
  refreshSettingsMock,
  refreshRecentProjectsMock,
  refreshAppStylingMock,
  refreshNoteboardMock,
  refreshProjectNoteboardMock,
  refreshProjectSidebarMock,
  refreshProjectStylingMock,
  refreshWebContentsMock,
  resizeWindowMock,
  savePersistedCssFromEditorMock,
  tipsNotificationMock,
  toggleDevToolsMock,
  updateKeybindsMock,
  updateAppStylingMock,
  updateSettingsMock,
  patchSettingsSilentlyMock,
  navigateToWorkspaceHomeRouteMock
} = vi.hoisted(() => ({
  applyImportMock: vi.fn(
    async (): Promise<I_faAppConfigApplyResult> => ({ appliedParts: [] })
  ),
  applyLanguageMock: vi.fn(async () => true),
  checkWindowMaximizedMock: vi.fn(),
  closeWindowMock: vi.fn(),
  createProjectFromUserInputMock: vi.fn(),
  minimizeWindowMock: vi.fn(),
  openDialogComponentMock: vi.fn(),
  openDialogMarkdownDocumentMock: vi.fn(),
  openProjectFromKnownPathMock: vi.fn(),
  openProjectFromUserDialogMock: vi.fn(),
  refreshKeybindsMock: vi.fn(async () => undefined),
  refreshAppStylingMock: vi.fn(async () => undefined),
  refreshNoteboardMock: vi.fn(async () => undefined),
  refreshProjectNoteboardMock: vi.fn(async () => undefined),
  refreshProjectSidebarMock: vi.fn(async () => undefined),
  refreshProjectStylingMock: vi.fn(async () => undefined),
  refreshRecentProjectsMock: vi.fn(async () => undefined),
  refreshSettingsMock: vi.fn(async () => undefined),
  refreshWebContentsMock: vi.fn(async () => true),
  resizeWindowMock: vi.fn(),
  savePersistedCssFromEditorMock: vi.fn(async (): Promise<boolean> => true),
  tipsNotificationMock: vi.fn(),
  toggleDevToolsMock: vi.fn(),
  updateKeybindsMock: vi.fn(async () => true),
  updateAppStylingMock: vi.fn(async () => true),
  updateSettingsMock: vi.fn(async () => undefined),
  patchSettingsSilentlyMock: vi.fn(async () => undefined),
  navigateToWorkspaceHomeRouteMock: vi.fn(async () => undefined)
}))

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() },
  copyToClipboard: vi.fn(async () => undefined)
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: {
    global: {
      t: (key: string, params?: Record<string, unknown>) => {
        const projectName = params?.projectName
        if (typeof projectName === 'string') {
          return `${key}|${projectName}`
        }
        return key
      }
    }
  }
}))

vi.mock('app/src/stores/S_FaActiveProject', () => ({
  S_FaActiveProject: () => ({
    get activeProject () {
      return faActiveProjectFixture.activeProject
    },
    get hasActiveProject () {
      return faActiveProjectFixture.activeProject !== null
    },
    createProjectFromUserInput: createProjectFromUserInputMock,
    openProjectFromKnownPath: openProjectFromKnownPathMock,
    openProjectFromUserDialog: openProjectFromUserDialogMock
  })
}))

vi.mock('app/src/scripts/appNoteboard/appNoteboard_manager', () => ({
  canOpenFloatingWindowWhileNoModal: (): boolean => canOpenFloatingWindowWhileNoModalMock()
}))

vi.mock('app/src/stores/S_FaRecentProjects', () => ({
  S_FaRecentProjects: () => ({
    refreshRecentProjects: refreshRecentProjectsMock
  })
}))

vi.mock('app/src/stores/S_FaKeybinds', () => ({
  S_FaKeybinds: () => ({
    refreshKeybinds: refreshKeybindsMock,
    updateKeybinds: updateKeybindsMock
  })
}))

vi.mock('app/src/stores/S_FaAppStyling', () => ({
  S_FaAppStyling: () => ({
    refreshAppStyling: refreshAppStylingMock,
    updateAppStyling: updateAppStylingMock
  })
}))

vi.mock('app/src/stores/S_FaAppNoteboard', () => ({
  S_FaAppNoteboard: () => ({
    refreshNoteboard: refreshNoteboardMock
  })
}))

vi.mock('app/src/stores/S_FaProjectNoteboard', () => ({
  S_FaProjectNoteboard: () => ({
    refreshProjectNoteboard: refreshProjectNoteboardMock
  })
}))

vi.mock('app/src/stores/S_FaProjectSidebar', () => ({
  S_FaProjectSidebar: () => ({
    refreshProjectSidebar: refreshProjectSidebarMock
  })
}))

vi.mock('app/src/stores/S_FaProjectStyling', () => ({
  S_FaProjectStyling: () => ({
    refreshProjectStyling: refreshProjectStylingMock,
    savePersistedCssFromEditor: savePersistedCssFromEditorMock
  })
}))

vi.mock('app/src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: () => ({
    get settings () {
      return userSettingsFixture
    },
    patchSettingsSilently: patchSettingsSilentlyMock,
    refreshSettings: refreshSettingsMock,
    updateSettings: updateSettingsMock
  })
}))

vi.mock('app/src/scripts/appGlobalManagementUI/appGlobalManagementUI_manager', () => ({
  openDialogComponent: openDialogComponentMock,
  openDialogMarkdownDocument: openDialogMarkdownDocumentMock,
  toggleDevTools: toggleDevToolsMock,
  tipsTricksTriviaNotification: tipsNotificationMock
}))

vi.mock('app/src/scripts/appInternals/faAppInternalsLocale_manager', () => ({
  applyFaI18nLocaleFromLanguageCode: vi.fn(),
  applyFaUserSettingsLanguageSelection: applyLanguageMock
}))

vi.mock('app/src/scripts/appInternals/faAppRouterSession_manager', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('app/src/scripts/appInternals/faAppRouterSession_manager')>()
  return {
    ...actual,
    navigateToWorkspaceHomeRoute: navigateToWorkspaceHomeRouteMock
  }
})

import { FA_ACTION_DEFINITIONS, findFaActionDefinition } from '../faActionDefinitions_manager'
import { buildFaActionPayloadPreview } from '../faActionManagerErrorReporting_manager'
import { FaActionUserCanceledError } from '../functions/faActionUserCanceledError'

beforeEach(() => {
  vi.mocked(Notify.create).mockClear()
  applyLanguageMock.mockReset()
  applyLanguageMock.mockImplementation(async () => true)
  checkWindowMaximizedMock.mockReset()
  closeWindowMock.mockReset()
  minimizeWindowMock.mockReset()
  openDialogComponentMock.mockReset()
  openDialogMarkdownDocumentMock.mockReset()
  refreshWebContentsMock.mockReset()
  refreshWebContentsMock.mockImplementation(async () => true)
  resizeWindowMock.mockReset()
  tipsNotificationMock.mockReset()
  toggleDevToolsMock.mockReset()
  applyImportMock.mockReset()
  applyImportMock.mockImplementation(async () => ({ appliedParts: ['appSettings' as const] }))
  updateKeybindsMock.mockReset()
  updateKeybindsMock.mockImplementation(async () => true)
  updateAppStylingMock.mockReset()
  updateAppStylingMock.mockImplementation(async () => true)
  updateSettingsMock.mockReset()
  updateSettingsMock.mockImplementation(async () => undefined)
  patchSettingsSilentlyMock.mockReset()
  patchSettingsSilentlyMock.mockImplementation(async () => undefined)
  userSettingsFixture.hideHierarchyTree = false
  refreshKeybindsMock.mockReset()
  refreshKeybindsMock.mockImplementation(async () => undefined)
  refreshAppStylingMock.mockReset()
  refreshAppStylingMock.mockImplementation(async () => undefined)
  refreshNoteboardMock.mockReset()
  refreshNoteboardMock.mockImplementation(async () => undefined)
  refreshProjectNoteboardMock.mockReset()
  refreshProjectNoteboardMock.mockImplementation(async () => undefined)
  refreshProjectSidebarMock.mockReset()
  refreshProjectSidebarMock.mockImplementation(async () => undefined)
  refreshProjectStylingMock.mockReset()
  refreshProjectStylingMock.mockImplementation(async () => undefined)
  savePersistedCssFromEditorMock.mockReset()
  savePersistedCssFromEditorMock.mockImplementation(async (): Promise<boolean> => true)
  refreshSettingsMock.mockReset()
  refreshSettingsMock.mockImplementation(async () => undefined)
  createProjectFromUserInputMock.mockReset()
  createProjectFromUserInputMock.mockImplementation(async () => 'created')
  openProjectFromKnownPathMock.mockReset()
  openProjectFromKnownPathMock.mockImplementation(async () => 'opened')
  openProjectFromUserDialogMock.mockReset()
  openProjectFromUserDialogMock.mockImplementation(async () => 'opened')
  refreshRecentProjectsMock.mockReset()
  refreshRecentProjectsMock.mockImplementation(async () => undefined)
  canOpenFloatingWindowWhileNoModalMock.mockReset()
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(true)
  navigateToWorkspaceHomeRouteMock.mockClear()
  Object.assign(window, {
    faContentBridgeAPIs: {
      faAppConfig: {
        applyImport: applyImportMock
      },
      faWindowControl: {
        checkWindowMaximized: checkWindowMaximizedMock,
        closeWindow: closeWindowMock,
        minimizeWindow: minimizeWindowMock,
        refreshWebContents: refreshWebContentsMock,
        resizeWindow: resizeWindowMock
      }
    }
  })
})

function definitionFor (id: T_faActionId): { handler: (payload: unknown) => unknown } {
  const def = findFaActionDefinition(id)
  if (def === undefined) {
    throw new Error(`No definition found for ${String(id)}`)
  }
  return def as unknown as { handler: (payload: unknown) => unknown }
}

/**
 * FA_ACTION_DEFINITIONS
 * Every action id in the canonical list has a registered definition.
 */
test('Test that every action id from FA_ACTION_IDS has a registered definition', () => {
  for (const id of FA_ACTION_IDS) {
    expect(findFaActionDefinition(id)).toBeDefined()
  }
})

test('Test that every registered definition exposes a callable handler', () => {
  for (const definition of FA_ACTION_DEFINITIONS) {
    expect(typeof definition.handler, `handler for ${definition.id}`).toBe('function')
  }
})

/**
 * FA_ACTION_DEFINITIONS
 * Every registered definition exposes a kind that is sync or async.
 */
test('Test that every registered definition uses a sync or async kind', () => {
  for (const definition of FA_ACTION_DEFINITIONS) {
    expect(['sync', 'async']).toContain(definition.kind)
  }
})

/**
 * findFaActionDefinition
 * Returns undefined for ids that are not in the registry.
 */
test('Test that findFaActionDefinition returns undefined for unknown ids', () => {
  expect(findFaActionDefinition('not-a-real-action' as unknown as T_faActionId)).toBeUndefined()
})

/**
 * FA_ACTION_DEFINITIONS
 * The registry contains exactly one definition per id (no duplicates).
 */
test('Test that FA_ACTION_DEFINITIONS contains no duplicate ids', () => {
  const ids = FA_ACTION_DEFINITIONS.map((definition) => definition.id)
  expect(new Set(ids).size).toBe(ids.length)
})

/**
 * Handlers — UI dialog and dev-tools wrappers delegate to the right helper.
 */
test('Test that toggleDeveloperTools handler delegates to toggleDevTools', () => {
  definitionFor('toggleDeveloperTools').handler(undefined)
  expect(toggleDevToolsMock).toHaveBeenCalledOnce()
})

test('Test that openKeybindSettingsDialog handler opens the KeybindSettings dialog', () => {
  definitionFor('openKeybindSettingsDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('KeybindSettings')
})

test('Test that openAppSettingsDialog handler opens the AppSettings dialog', () => {
  definitionFor('openAppSettingsDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('AppSettings')
})

test('Test that openAppStylingWindow handler opens the WindowAppStyling surface', () => {
  definitionFor('openAppStylingWindow').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowAppStyling')
})

test('Test that openProjectStylingDialog handler opens WindowProjectStyling when a project is active', () => {
  definitionFor('openProjectStylingDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('WindowProjectStyling')
})

test('Test that openProjectStylingDialog handler skips when modal chrome blocks floating windows', () => {
  canOpenFloatingWindowWhileNoModalMock.mockReturnValue(false)
  definitionFor('openProjectStylingDialog').handler(undefined)
  expect(openDialogComponentMock).not.toHaveBeenCalled()
})

test('Test that openProjectStylingDialog handler skips without an active project', () => {
  const prior = faActiveProjectFixture.activeProject
  faActiveProjectFixture.activeProject = null as never
  try {
    definitionFor('openProjectStylingDialog').handler(undefined)
    expect(openDialogComponentMock).not.toHaveBeenCalled()
  } finally {
    faActiveProjectFixture.activeProject = prior
  }
})

test('Test that showProjectDashboard handler navigates to workspace home when a project is active', async () => {
  await (definitionFor('showProjectDashboard').handler(undefined) as Promise<unknown>)
  expect(navigateToWorkspaceHomeRouteMock).toHaveBeenCalledOnce()
})

test('Test that showProjectDashboard handler skips navigation without an active project', async () => {
  const prior = faActiveProjectFixture.activeProject
  faActiveProjectFixture.activeProject = null as never
  try {
    await (definitionFor('showProjectDashboard').handler(undefined) as Promise<unknown>)
    expect(navigateToWorkspaceHomeRouteMock).not.toHaveBeenCalled()
  } finally {
    faActiveProjectFixture.activeProject = prior
  }
})

test('Test that saveProjectStyling handler throws saveNoActiveProject without calling the store when no project is open', async () => {
  const prior = faActiveProjectFixture.activeProject
  faActiveProjectFixture.activeProject = null as never
  try {
    await expect(
      (definitionFor('saveProjectStyling').handler({ css: 'x' }) as Promise<unknown>)
    ).rejects.toThrow(/globalFunctionality\.faProjectStyling\.saveNoActiveProject/)
    expect(savePersistedCssFromEditorMock).not.toHaveBeenCalled()
  } finally {
    faActiveProjectFixture.activeProject = prior
  }
})

test('Test that saveProjectStyling handler throws saveNoActiveProject without calling the store when no project is open', async () => {
  const prior = faActiveProjectFixture.activeProject
  faActiveProjectFixture.activeProject = null as never
  try {
    await expect(
      (definitionFor('saveProjectStyling').handler({ css: 'x' }) as Promise<unknown>)
    ).rejects.toThrow(/globalFunctionality\.faProjectStyling\.saveNoActiveProject/)
    expect(savePersistedCssFromEditorMock).not.toHaveBeenCalled()
  } finally {
    faActiveProjectFixture.activeProject = prior
  }
})

test('Test that saveProjectStyling handler forwards css to savePersistedCssFromEditor on success', async () => {
  await (definitionFor('saveProjectStyling').handler({ css: ':root{}' }) as Promise<unknown>)
  expect(savePersistedCssFromEditorMock).toHaveBeenCalledWith(':root{}')
})

test('Test that saveProjectStyling handler throws when savePersistedCssFromEditor returns false', async () => {
  savePersistedCssFromEditorMock.mockResolvedValueOnce(false)
  await expect(
    (definitionFor('saveProjectStyling').handler({ css: 'x' }) as Promise<unknown>)
  ).rejects.toThrow(/globalFunctionality\.faProjectStyling\.saveRejected/)
})

/**
 * Handlers — reportProjectStylingSaveFailure throws so the action manager surfaces one failure toast.
 */
test('Test that reportProjectStylingSaveFailure handler throws the payload message', async () => {
  await expect(
    (definitionFor('reportProjectStylingSaveFailure').handler({ message: 'css fail' }) as Promise<unknown>)
  ).rejects.toThrow('css fail')
})

test('Test that saveAppStyling handler forwards css to updateAppStyling on success', async () => {
  await (definitionFor('saveAppStyling').handler({ css: '.theme { color: black; }' }) as Promise<unknown>)
  expect(updateAppStylingMock).toHaveBeenCalledWith({ css: '.theme { color: black; }' })
})

/**
 * Handlers — saveAppStyling throws when the store reports a non-truthy result so the action manager surfaces it.
 */
test('Test that saveAppStyling handler throws when updateAppStyling returns false', async () => {
  updateAppStylingMock.mockResolvedValueOnce(false)
  await expect(
    (definitionFor('saveAppStyling').handler({ css: 'broken' }) as Promise<unknown>)
  ).rejects.toThrow(/globalFunctionality\.faAppStyling\.saveError/)
})

/**
 * Handlers — reportAppStylingPersistFailure throws so the action manager surfaces one failure toast.
 */
test('Test that reportAppStylingPersistFailure handler throws the payload message', async () => {
  await expect(
    (definitionFor('reportAppStylingPersistFailure').handler({ message: 'persist failed' }) as Promise<unknown>)
  ).rejects.toThrow('persist failed')
})

test('Test that toggleHierarchicalTree handler flips hideHierarchyTree silently', async () => {
  userSettingsFixture.hideHierarchyTree = false
  await definitionFor('toggleHierarchicalTree').handler(undefined)
  expect(patchSettingsSilentlyMock).toHaveBeenCalledWith({ hideHierarchyTree: true })

  userSettingsFixture.hideHierarchyTree = true
  await definitionFor('toggleHierarchicalTree').handler(undefined)
  expect(patchSettingsSilentlyMock).toHaveBeenCalledWith({ hideHierarchyTree: false })
})

test('Test that openAdvancedSearchGuideDialog handler opens the advancedSearchGuide markdown document', () => {
  definitionFor('openAdvancedSearchGuideDialog').handler(undefined)
  expect(openDialogMarkdownDocumentMock).toHaveBeenCalledWith('advancedSearchGuide')
})

test('Test that openChangelogDialog handler opens the changeLog markdown document', () => {
  definitionFor('openChangelogDialog').handler(undefined)
  expect(openDialogMarkdownDocumentMock).toHaveBeenCalledWith('changeLog')
})

test('Test that openLicenseDialog handler opens the license markdown document', () => {
  definitionFor('openLicenseDialog').handler(undefined)
  expect(openDialogMarkdownDocumentMock).toHaveBeenCalledWith('license')
})

test('Test that openAboutFantasiaArchiveDialog handler opens the AboutFantasiaArchive dialog', () => {
  definitionFor('openAboutFantasiaArchiveDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('AboutFantasiaArchive')
})

test('Test that openTipsTricksTriviaDialog handler opens the tipsTricksTrivia markdown document', () => {
  definitionFor('openTipsTricksTriviaDialog').handler(undefined)
  expect(openDialogMarkdownDocumentMock).toHaveBeenCalledWith('tipsTricksTrivia')
})

test('Test that openActionMonitorDialog handler opens the ActionMonitor dialog', () => {
  definitionFor('openActionMonitorDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('ActionMonitor')
})

test('Test that openImportExportAppConfigDialog handler opens the ImportExportAppConfig dialog', () => {
  definitionFor('openImportExportAppConfigDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('ImportExportAppConfig')
})

test('Test that openNewProjectDialog handler opens the NewProject dialog', () => {
  definitionFor('openNewProjectDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('NewProject')
})

test('Test that createNewProject handler delegates to S_FaActiveProject when creation succeeds', async () => {
  await (definitionFor('createNewProject').handler({ projectName: 'Realm' }) as Promise<unknown>)
  expect(createProjectFromUserInputMock).toHaveBeenCalledWith('Realm')
  expect(refreshRecentProjectsMock).toHaveBeenCalledOnce()
  expect(refreshProjectNoteboardMock).toHaveBeenCalledOnce()
  expect(refreshProjectSidebarMock).toHaveBeenCalledOnce()
  expect(refreshProjectStylingMock).toHaveBeenCalledOnce()
  expect(Notify.create).toHaveBeenCalledWith({
    message:
      'globalFunctionality.faProjectSession.notifyProjectCreated|Fixture Realm',
    type: 'positive'
  })
})

test('Test that createNewProject handler throws FaActionUserCanceledError when creation is canceled', async () => {
  createProjectFromUserInputMock.mockResolvedValueOnce('canceled')
  await expect(
    definitionFor('createNewProject').handler({ projectName: 'x' }) as Promise<unknown>
  ).rejects.toBeInstanceOf(FaActionUserCanceledError)
  expect(Notify.create).not.toHaveBeenCalled()
})

test('Test that loadExistingProject handler delegates to openProjectFromUserDialog and notifies', async () => {
  const result = await (definitionFor('loadExistingProject').handler({}) as Promise<{
    payloadPreview: string
  }>)
  expect(openProjectFromUserDialogMock).toHaveBeenCalledOnce()
  expect(openProjectFromKnownPathMock).not.toHaveBeenCalled()
  expect(refreshRecentProjectsMock).toHaveBeenCalledOnce()
  expect(refreshProjectNoteboardMock).toHaveBeenCalledOnce()
  expect(refreshProjectSidebarMock).toHaveBeenCalledOnce()
  expect(refreshProjectStylingMock).toHaveBeenCalledOnce()
  expect(Notify.create).toHaveBeenCalledWith({
    message:
      'globalFunctionality.faProjectSession.notifyProjectLoaded|Fixture Realm',
    type: 'positive'
  })
  const expectedPreview = buildFaActionPayloadPreview({
    filePath: faActiveProjectFixture.activeProject.filePath,
    projectName: faActiveProjectFixture.activeProject.name
  })
  expect(result).toEqual({
    payloadPreview: expectedPreview
  })
})

test('Test that loadExistingProject handler delegates to openProjectFromKnownPath when filePath is set', async () => {
  await (definitionFor('loadExistingProject').handler({
    filePath: 'C:\\r\\recent.faproject'
  }) as Promise<unknown>)
  expect(openProjectFromKnownPathMock).toHaveBeenCalledWith('C:\\r\\recent.faproject')
  expect(openProjectFromUserDialogMock).not.toHaveBeenCalled()
  expect(refreshRecentProjectsMock).toHaveBeenCalledOnce()
  expect(refreshProjectNoteboardMock).toHaveBeenCalledOnce()
  expect(refreshProjectSidebarMock).toHaveBeenCalledOnce()
  expect(refreshProjectStylingMock).toHaveBeenCalledOnce()
})

test('Test that loadExistingProject handler throws when open succeeds but active project is missing', async () => {
  const prior = faActiveProjectFixture.activeProject
  faActiveProjectFixture.activeProject = null as never
  try {
    await expect(
      definitionFor('loadExistingProject').handler({}) as Promise<unknown>
    ).rejects.toThrow(/no active project snapshot/)
    expect(refreshRecentProjectsMock).toHaveBeenCalled()
  } finally {
    faActiveProjectFixture.activeProject = prior
  }
})

test('Test that loadExistingProject handler throws FaActionUserCanceledError when load is canceled', async () => {
  openProjectFromUserDialogMock.mockResolvedValueOnce('canceled')
  await expect(
    definitionFor('loadExistingProject').handler({}) as Promise<unknown>
  ).rejects.toBeInstanceOf(FaActionUserCanceledError)
  expect(Notify.create).not.toHaveBeenCalled()
  expect(refreshRecentProjectsMock).toHaveBeenCalled()
})

test('Test that loadExistingProject handler shows warning notify when open flow reuses active project', async () => {
  openProjectFromKnownPathMock.mockResolvedValueOnce('reused')
  await (definitionFor('loadExistingProject').handler({
    filePath: 'C:\\r\\recent.faproject'
  }) as Promise<unknown>)
  expect(Notify.create).toHaveBeenCalledWith({
    message: expect.stringMatching(
      /globalFunctionality\.faProjectSession\.openRejectedAlreadyActive/
    ),
    type: 'warning'
  })
  expect(refreshProjectNoteboardMock).not.toHaveBeenCalled()
  expect(refreshProjectSidebarMock).not.toHaveBeenCalled()
  expect(refreshProjectStylingMock).not.toHaveBeenCalled()
  expect(refreshRecentProjectsMock).toHaveBeenCalledOnce()
})

test('Test that loadExistingProject handler shows warning when user dialog flow reuses active project', async () => {
  openProjectFromUserDialogMock.mockResolvedValueOnce('reused')
  await (definitionFor('loadExistingProject').handler({}) as Promise<unknown>)
  expect(openProjectFromUserDialogMock).toHaveBeenCalledOnce()
  expect(Notify.create).toHaveBeenCalledWith({
    message: expect.stringMatching(
      /globalFunctionality\.faProjectSession\.openRejectedAlreadyActive/
    ),
    type: 'warning'
  })
  expect(refreshProjectNoteboardMock).not.toHaveBeenCalled()
  expect(refreshProjectSidebarMock).not.toHaveBeenCalled()
  expect(refreshProjectStylingMock).not.toHaveBeenCalled()
})

test('Test that loadExistingProject handler skips warning when resumeActiveSession is true on reuse', async () => {
  openProjectFromKnownPathMock.mockResolvedValueOnce('reused')
  await (definitionFor('loadExistingProject').handler({
    filePath: 'C:\\r\\recent.faproject',
    resumeActiveSession: true
  }) as Promise<unknown>)
  expect(Notify.create).not.toHaveBeenCalled()
  expect(refreshRecentProjectsMock).toHaveBeenCalledOnce()
})

test('Test that importAppConfigApply handler calls applyImport and refreshes stores', async () => {
  await (definitionFor('importAppConfigApply').handler({
    applyKeybinds: true,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: 'sid-1'
  }) as Promise<unknown>)
  expect(applyImportMock).toHaveBeenCalledWith({
    applyKeybinds: true,
    applyAppNoteboard: false,
    applyAppSettings: true,
    applyAppStyling: false,
    sessionId: 'sid-1'
  })
  expect(refreshSettingsMock).toHaveBeenCalledOnce()
  expect(refreshKeybindsMock).toHaveBeenCalledOnce()
  expect(refreshAppStylingMock).toHaveBeenCalledOnce()
  expect(refreshNoteboardMock).toHaveBeenCalledOnce()
  expect(refreshProjectNoteboardMock).toHaveBeenCalledOnce()
  expect(refreshProjectSidebarMock).toHaveBeenCalledOnce()
  expect(refreshProjectStylingMock).toHaveBeenCalledOnce()
})

test('Test that importAppConfigApply throws when the app config bridge is missing', async () => {
  const prev = window.faContentBridgeAPIs
  const body = await ResultAsync.fromPromise(
    (async (): Promise<void> => {
      Object.assign(window, {
        faContentBridgeAPIs: {
          ...window.faContentBridgeAPIs,
          faAppConfig: undefined
        }
      })
      await expect(
        (definitionFor('importAppConfigApply').handler({
          applyKeybinds: true,
          applyAppNoteboard: true,
          applyAppSettings: true,
          applyAppStyling: true,
          sessionId: 's'
        }) as Promise<unknown>)
      ).rejects.toThrow(/dialogs\.importExportAppConfig\.errors\.desktopOnly/)
    })(),
    (e): unknown => e
  )
  Object.assign(window, { faContentBridgeAPIs: prev })
  if (body.isErr()) {
    throw body.error
  }
})

test('Test that exportAppConfigSaveResult throws on error status and resolves otherwise', async () => {
  await expect(
    (definitionFor('exportAppConfigSaveResult').handler({
      status: 'error',
      errorMessage: 'e1'
    }) as Promise<unknown>)
  ).rejects.toThrow('e1')
  await expect(
    (definitionFor('exportAppConfigSaveResult').handler({
      errorName: 'Ename',
      status: 'error'
    }) as Promise<unknown>)
  ).rejects.toThrow('Ename')
  await expect(
    (definitionFor('exportAppConfigSaveResult').handler({ status: 'error' }) as Promise<unknown>)
  ).rejects.toThrow('dialogs.importExportAppConfig.errors.exportToFileFailed')
  await expect(
    (definitionFor('exportAppConfigSaveResult').handler({ status: 'saved' }) as Promise<unknown>)
  ).resolves.toBeUndefined()
  await expect(
    (definitionFor('exportAppConfigSaveResult').handler({ status: 'canceled' }) as Promise<unknown>)
  ).resolves.toBeUndefined()
})

test('Test that importAppConfigStageResult throws on fail and resolves on pass', async () => {
  await expect(
    (definitionFor('importAppConfigStageResult').handler({
      status: 'fail',
      errorMessage: 'bad'
    }) as Promise<unknown>)
  ).rejects.toThrow('bad')
  await expect(
    (definitionFor('importAppConfigStageResult').handler({ status: 'fail' }) as Promise<unknown>)
  ).rejects.toThrow('dialogs.importExportAppConfig.errors.importValidationFailed')
  await expect(
    (definitionFor('importAppConfigStageResult').handler({ status: 'pass' }) as Promise<unknown>)
  ).resolves.toBeUndefined()
})

test('Test that exportAppConfigPackage handler exports through the bridge', async () => {
  const exportToFileMock = vi.fn(async () => ({
    filePath: 'C:\\a.faconfig',
    outcome: 'saved' as const
  }))
  const runFaActionForward = await import('../faActionManagerRunForward_manager')
  const runFaActionSpy = vi
    .spyOn(runFaActionForward, 'runFaActionThroughForward')
    .mockImplementation(() => undefined)
  const prev = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faAppConfig: {
        exportToFile: exportToFileMock
      }
    }
  })
  await expect(
    (definitionFor('exportAppConfigPackage').handler({
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: false,
      includeAppStyling: true
    }) as Promise<unknown>)
  ).resolves.toBeUndefined()
  expect(exportToFileMock).toHaveBeenCalledOnce()
  expect(runFaActionSpy).toHaveBeenCalledWith('exportAppConfigSaveResult', {
    filePath: 'C:\\a.faconfig',
    status: 'saved'
  })
  runFaActionSpy.mockRestore()
  window.faContentBridgeAPIs = prev
})

test('Test that exportAppConfigPackage handler throws when the bridge is missing', async () => {
  const prev = window.faContentBridgeAPIs
  window.faContentBridgeAPIs = {
    ...window.faContentBridgeAPIs,
    faAppConfig: undefined
  } as unknown as typeof window.faContentBridgeAPIs
  await expect(
    (definitionFor('exportAppConfigPackage').handler({
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: false,
      includeAppStyling: true
    }) as Promise<unknown>)
  ).rejects.toThrow('dialogs.importExportAppConfig.errors.desktopOnly')
  window.faContentBridgeAPIs = prev
})

test('Test that exportAppConfigPackage handler throws FaActionUserCanceledError on cancel', async () => {
  const exportToFileMock = vi.fn(async () => ({ outcome: 'canceled' as const }))
  const prev = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faAppConfig: { exportToFile: exportToFileMock }
    }
  })
  await expect(
    (definitionFor('exportAppConfigPackage').handler({
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: false,
      includeAppStyling: true
    }) as Promise<unknown>)
  ).rejects.toBeInstanceOf(FaActionUserCanceledError)
  window.faContentBridgeAPIs = prev
})

test('Test that exportAppConfigPackage handler throws on export error outcome', async () => {
  const exportToFileMock = vi.fn(async () => ({
    errorMessage: 'disk full',
    errorName: 'Error',
    outcome: 'error' as const
  }))
  const prev = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faAppConfig: { exportToFile: exportToFileMock }
    }
  })
  await expect(
    (definitionFor('exportAppConfigPackage').handler({
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: false,
      includeAppStyling: true
    }) as Promise<unknown>)
  ).rejects.toThrow('disk full')
  window.faContentBridgeAPIs = prev
})

test('Test that exportAppConfigPackage handler falls back to errorName when errorMessage is missing', async () => {
  const exportToFileMock = vi.fn(async () => ({
    errorName: 'ExportFailed',
    outcome: 'error' as const
  }))
  const prev = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faAppConfig: { exportToFile: exportToFileMock }
    }
  })
  await expect(
    (definitionFor('exportAppConfigPackage').handler({
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: false,
      includeAppStyling: true
    }) as Promise<unknown>)
  ).rejects.toThrow('ExportFailed')
  window.faContentBridgeAPIs = prev
})

test('Test that exportAppConfigPackage handler uses default export failure message', async () => {
  const exportToFileMock = vi.fn(async () => ({
    outcome: 'error' as const
  }))
  const prev = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...window.faContentBridgeAPIs,
      faAppConfig: { exportToFile: exportToFileMock }
    }
  })
  await expect(
    (definitionFor('exportAppConfigPackage').handler({
      includeKeybinds: true,
      includeAppNoteboard: false,
      includeAppSettings: false,
      includeAppStyling: true
    }) as Promise<unknown>)
  ).rejects.toThrow('dialogs.importExportAppConfig.errors.exportToFileFailed')
  window.faContentBridgeAPIs = prev
})

test('Test that reportBridgeLoadFailure handler throws the payload message', async () => {
  await expect(
    (definitionFor('reportBridgeLoadFailure').handler({ message: 'load failed' }) as Promise<unknown>)
  ).rejects.toThrow('load failed')
})

test('Test that showStartupTipsNotification handler invokes the notification helper', async () => {
  await (definitionFor('showStartupTipsNotification').handler(undefined) as Promise<unknown>)
  expect(tipsNotificationMock).toHaveBeenCalledWith(false)
})

test('Test that showStartupTipsNotification handler shows notify when hideTooltipsStart is false in persisted settings', async () => {
  tipsNotificationMock.mockClear()
  const prev = window.faContentBridgeAPIs
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...prev,
      faUserSettings: {
        getSettings: vi.fn(async () => ({
          hideTooltipsStart: false
        })),
        setSettings: vi.fn()
      }
    }
  })

  await (definitionFor('showStartupTipsNotification').handler(undefined) as Promise<unknown>)

  expect(tipsNotificationMock).toHaveBeenCalledWith(false)
  Object.assign(window, { faContentBridgeAPIs: prev })
})

test('Test that showStartupTipsNotification handler skips notify when hideTooltipsStart is enabled', async () => {
  const prev = window.faContentBridgeAPIs
  const getSettingsMock = vi.fn(async () => ({
    hideTooltipsStart: true
  }))
  Object.assign(window, {
    faContentBridgeAPIs: {
      ...prev,
      faUserSettings: {
        getSettings: getSettingsMock,
        setSettings: vi.fn()
      }
    }
  })

  await (definitionFor('showStartupTipsNotification').handler(undefined) as Promise<unknown>)

  expect(getSettingsMock).toHaveBeenCalledOnce()
  expect(tipsNotificationMock).not.toHaveBeenCalled()
  Object.assign(window, { faContentBridgeAPIs: prev })
})

/**
 * Handlers — saveKeybindSettings throws when the store reports failure.
 */
test('Test that saveKeybindSettings handler throws when updateKeybinds returns false', async () => {
  updateKeybindsMock.mockResolvedValueOnce(false)
  await expect(
    (definitionFor('saveKeybindSettings').handler({ overrides: [] }) as Promise<unknown>)
  ).rejects.toThrow(/globalFunctionality\.faKeybinds\.saveError/)
})

test('Test that saveKeybindSettings handler resolves when updateKeybinds succeeds', async () => {
  await expect(
    (definitionFor('saveKeybindSettings').handler({ overrides: [] }) as Promise<unknown>)
  ).resolves.toBeUndefined()
  expect(updateKeybindsMock).toHaveBeenCalledWith({
    overrides: [],
    replaceAllOverrides: true
  })
})

/**
 * Handlers — saveAppSettings forwards the payload to updateSettings.
 */
test('Test that saveAppSettings handler forwards settings to updateSettings', async () => {
  await (definitionFor('saveAppSettings').handler({ settings: { foo: 'bar' } }) as Promise<unknown>)
  expect(updateSettingsMock).toHaveBeenCalledWith({ foo: 'bar' })
})

/**
 * Handlers — languageSwitch delegates to applyFaUserSettingsLanguageSelection with the payload codes.
 */
test('Test that languageSwitch handler forwards code and priorCode to the language helper', async () => {
  await (definitionFor('languageSwitch').handler({
    code: 'en-US',
    priorCode: 'fr'
  }) as Promise<unknown>)
  expect(applyLanguageMock).toHaveBeenCalledWith(
    expect.any(Function),
    'en-US',
    'fr'
  )
})

/**
 * Handlers — window control wrappers call the bridge when present and no-op when missing.
 */
test('Test that resizeApp handler calls resizeWindow and checkWindowMaximized via the bridge', async () => {
  await (definitionFor('resizeApp').handler(undefined) as Promise<unknown>)
  expect(resizeWindowMock).toHaveBeenCalledOnce()
  expect(checkWindowMaximizedMock).toHaveBeenCalledOnce()
})

test('Test that minimizeApp handler calls minimizeWindow via the bridge', async () => {
  await (definitionFor('minimizeApp').handler(undefined) as Promise<unknown>)
  expect(minimizeWindowMock).toHaveBeenCalledOnce()
})

test('Test that closeApp handler calls closeWindow via the bridge', async () => {
  await (definitionFor('closeApp').handler(undefined) as Promise<unknown>)
  expect(closeWindowMock).toHaveBeenCalledOnce()
})

test('Test that refreshWebContentsAfterLanguage handler calls refreshWebContents via the bridge', async () => {
  await (definitionFor('refreshWebContentsAfterLanguage').handler(undefined) as Promise<unknown>)
  expect(refreshWebContentsMock).toHaveBeenCalledOnce()
})

test('Test that window-control handlers no-op when the bridge is absent', async () => {
  Object.assign(window, { faContentBridgeAPIs: undefined })
  await (definitionFor('resizeApp').handler(undefined) as Promise<unknown>)
  await (definitionFor('minimizeApp').handler(undefined) as Promise<unknown>)
  await (definitionFor('closeApp').handler(undefined) as Promise<unknown>)
  await (definitionFor('refreshWebContentsAfterLanguage').handler(undefined) as Promise<unknown>)
  expect(resizeWindowMock).not.toHaveBeenCalled()
  expect(minimizeWindowMock).not.toHaveBeenCalled()
  expect(closeWindowMock).not.toHaveBeenCalled()
  expect(refreshWebContentsMock).not.toHaveBeenCalled()
})

/**
 * Handlers — bridge wrappers tolerate synchronous returns (no Promise) from window control APIs.
 */
test('Test that bridge wrapper handles synchronous bridge returns without awaiting', async () => {
  resizeWindowMock.mockReturnValueOnce(undefined)
  checkWindowMaximizedMock.mockReturnValueOnce(undefined)
  await (definitionFor('resizeApp').handler(undefined) as Promise<unknown>)
  expect(resizeWindowMock).toHaveBeenCalledOnce()
})
