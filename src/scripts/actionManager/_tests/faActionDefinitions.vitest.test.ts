/** @vitest-environment jsdom */
import { beforeEach, expect, test, vi } from 'vitest'

import { FA_ACTION_IDS, type T_faActionId } from 'app/types/I_faActionManagerDomain'

const {
  applyLanguageMock,
  closeWindowMock,
  minimizeWindowMock,
  openDialogComponentMock,
  openDialogMarkdownDocumentMock,
  refreshWebContentsMock,
  resizeWindowMock,
  checkWindowMaximizedMock,
  tipsNotificationMock,
  toggleDevToolsMock,
  updateKeybindsMock,
  updateSettingsMock
} = vi.hoisted(() => ({
  applyLanguageMock: vi.fn(async () => true),
  checkWindowMaximizedMock: vi.fn(),
  closeWindowMock: vi.fn(),
  minimizeWindowMock: vi.fn(),
  openDialogComponentMock: vi.fn(),
  openDialogMarkdownDocumentMock: vi.fn(),
  refreshWebContentsMock: vi.fn(async () => true),
  resizeWindowMock: vi.fn(),
  tipsNotificationMock: vi.fn(),
  toggleDevToolsMock: vi.fn(),
  updateKeybindsMock: vi.fn(async () => true),
  updateSettingsMock: vi.fn(async () => undefined)
}))

vi.mock('quasar', () => ({
  Notify: { create: vi.fn() }
}))

vi.mock('app/i18n/externalFileLoader', () => ({
  i18n: { global: { t: (key: string) => key } }
}))

vi.mock('app/src/stores/S_FaKeybinds', () => ({
  S_FaKeybinds: () => ({ updateKeybinds: updateKeybindsMock })
}))

vi.mock('app/src/stores/S_FaUserSettings', () => ({
  S_FaUserSettings: () => ({ updateSettings: updateSettingsMock })
}))

vi.mock('app/src/scripts/appGlobalManagementUI/dialogManagement', () => ({
  openDialogComponent: openDialogComponentMock,
  openDialogMarkdownDocument: openDialogMarkdownDocumentMock
}))

vi.mock('app/src/scripts/appGlobalManagementUI/toggleDevTools', () => ({
  toggleDevTools: toggleDevToolsMock
}))

vi.mock('app/src/scripts/appGlobalManagementUI/tipsTricksTriviaNotification', () => ({
  tipsTricksTriviaNotification: tipsNotificationMock
}))

vi.mock('app/src/scripts/appInternals/rendererAppInternals', () => ({
  applyFaUserSettingsLanguageSelection: applyLanguageMock
}))

import { FA_ACTION_DEFINITIONS, findFaActionDefinition } from '../faActionDefinitions'

beforeEach(() => {
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
  updateKeybindsMock.mockReset()
  updateKeybindsMock.mockImplementation(async () => true)
  updateSettingsMock.mockReset()
  updateSettingsMock.mockImplementation(async () => undefined)
  Object.assign(window, {
    faContentBridgeAPIs: {
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

test('Test that openProgramSettingsDialog handler opens the ProgramSettings dialog', () => {
  definitionFor('openProgramSettingsDialog').handler(undefined)
  expect(openDialogComponentMock).toHaveBeenCalledWith('ProgramSettings')
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

test('Test that showStartupTipsNotification handler invokes the notification helper', () => {
  definitionFor('showStartupTipsNotification').handler(undefined)
  expect(tipsNotificationMock).toHaveBeenCalledWith(false)
})

/**
 * Handlers — saveKeybindSettings throws when the store reports failure.
 */
test('Test that saveKeybindSettings handler throws when updateKeybinds returns false', async () => {
  updateKeybindsMock.mockResolvedValueOnce(false)
  await expect(
    (definitionFor('saveKeybindSettings').handler({ overrides: [] }) as Promise<unknown>)
  ).rejects.toThrow(/Failed to save keybind settings/)
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
 * Handlers — saveProgramSettings forwards the payload to updateSettings.
 */
test('Test that saveProgramSettings handler forwards settings to updateSettings', async () => {
  await (definitionFor('saveProgramSettings').handler({ settings: { foo: 'bar' } }) as Promise<unknown>)
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
