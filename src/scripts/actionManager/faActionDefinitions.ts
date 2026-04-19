import type {
  I_faActionDefinition,
  T_faActionId
} from 'app/types/I_faActionManagerDomain'
import { S_FaKeybinds } from 'app/src/stores/S_FaKeybinds'
import { S_FaUserSettings } from 'app/src/stores/S_FaUserSettings'
import {
  openDialogComponent,
  openDialogMarkdownDocument
} from 'app/src/scripts/appGlobalManagementUI/dialogManagement'
import { toggleDevTools } from 'app/src/scripts/appGlobalManagementUI/toggleDevTools'
import { tipsTricksTriviaNotification } from 'app/src/scripts/appGlobalManagementUI/tipsTricksTriviaNotification'
import { applyFaUserSettingsLanguageSelection } from 'app/src/scripts/appInternals/rendererAppInternals'

async function callBridge<T> (
  invoker: () => Promise<T> | T | undefined
): Promise<void> {
  const result = invoker()
  if (result instanceof Promise) {
    await result
  }
}

async function handleSaveKeybindSettings (payload: { overrides: import('app/types/I_faKeybindsDomain').I_faKeybindsRoot['overrides'] }): Promise<void> {
  const ok = await S_FaKeybinds().updateKeybinds({
    overrides: payload.overrides,
    replaceAllOverrides: true
  })
  if (!ok) {
    throw new Error('Failed to save keybind settings.')
  }
}

async function handleSaveProgramSettings (payload: { settings: import('app/types/I_faUserSettingsDomain').I_faUserSettings }): Promise<void> {
  await S_FaUserSettings().updateSettings(payload.settings)
}

async function handleLanguageSwitch (
  payload: import('app/types/I_faActionManagerDomain').I_faActionPayloadMap['languageSwitch']
): Promise<void> {
  const faUserSettingsStore = S_FaUserSettings()
  await applyFaUserSettingsLanguageSelection(
    faUserSettingsStore.updateSettings,
    payload.code,
    payload.priorCode
  )
}

async function handleResizeApp (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.resizeWindow())
  await callBridge(() => ctrl.checkWindowMaximized())
}

async function handleMinimizeApp (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.minimizeWindow())
}

async function handleCloseApp (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.closeWindow())
}

async function handleRefreshWebContents (): Promise<void> {
  const ctrl = window.faContentBridgeAPIs?.faWindowControl
  if (ctrl === undefined) {
    return
  }
  await callBridge(() => ctrl.refreshWebContents())
}

/**
 * Single source of truth for every renderer-side user-meaningful action.
 * To add a new action: extend 'FA_ACTION_IDS' / 'I_faActionPayloadMap' in 'types/I_faActionManagerDomain.ts',
 * then append the matching definition here so the compiler enforces both ends.
 */
export const FA_ACTION_DEFINITIONS: ReadonlyArray<I_faActionDefinition<T_faActionId>> = [
  {
    handler: () => {
      toggleDevTools()
    },
    id: 'toggleDeveloperTools',
    kind: 'async'
  },
  {
    dedup: true,
    handler: () => {
      openDialogComponent('KeybindSettings')
    },
    id: 'openKeybindSettingsDialog',
    kind: 'async'
  },
  {
    handler: handleSaveKeybindSettings as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveKeybindSettings',
    kind: 'async'
  },
  {
    dedup: true,
    handler: () => {
      openDialogComponent('ProgramSettings')
    },
    id: 'openProgramSettingsDialog',
    kind: 'async'
  },
  {
    handler: handleSaveProgramSettings as I_faActionDefinition<T_faActionId>['handler'],
    id: 'saveProgramSettings',
    kind: 'async'
  },
  {
    dedup: true,
    handler: () => {
      openDialogMarkdownDocument('advancedSearchGuide')
    },
    id: 'openAdvancedSearchGuideDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: () => {
      openDialogMarkdownDocument('changeLog')
    },
    id: 'openChangelogDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: () => {
      openDialogMarkdownDocument('license')
    },
    id: 'openLicenseDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: () => {
      openDialogComponent('AboutFantasiaArchive')
    },
    id: 'openAboutFantasiaArchiveDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: () => {
      openDialogMarkdownDocument('tipsTricksTrivia')
    },
    id: 'openTipsTricksTriviaDialog',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleCloseApp,
    id: 'closeApp',
    kind: 'sync'
  },
  {
    handler: handleMinimizeApp,
    id: 'minimizeApp',
    kind: 'async'
  },
  {
    handler: handleResizeApp,
    id: 'resizeApp',
    kind: 'async'
  },
  {
    handler: handleLanguageSwitch as I_faActionDefinition<T_faActionId>['handler'],
    id: 'languageSwitch',
    kind: 'async'
  },
  {
    dedup: true,
    handler: handleRefreshWebContents,
    id: 'refreshWebContentsAfterLanguage',
    kind: 'sync'
  },
  {
    dedup: true,
    handler: () => {
      openDialogComponent('ActionMonitor')
    },
    id: 'openActionMonitorDialog',
    kind: 'async'
  },
  {
    handler: () => {
      tipsTricksTriviaNotification(false)
    },
    id: 'showStartupTipsNotification',
    kind: 'async'
  }
]

const FA_ACTION_DEFINITION_LOOKUP: Map<T_faActionId, I_faActionDefinition<T_faActionId>> = new Map(
  FA_ACTION_DEFINITIONS.map((definition) => [definition.id, definition])
)

/**
 * Lookup helper used by 'faActionManagerRun' / 'faActionManagerSyncQueue'.
 * Returns 'undefined' for ids that are not registered (the manager treats this as a hard failure).
 */
export function findFaActionDefinition (id: T_faActionId): I_faActionDefinition<T_faActionId> | undefined {
  return FA_ACTION_DEFINITION_LOOKUP.get(id)
}
