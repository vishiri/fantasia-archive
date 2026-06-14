import type { I_faProjectSettingsRoot } from 'app/types/I_faProjectSettingsDomain'
import type { I_dialogProjectSettingsWorldDraft } from 'app/types/I_dialogProjectSettingsWorlds'
import type { I_dialogProjectSettingsProps } from 'app/types/I_dialogProjectSettings'
import type { I_faProjectWorldSnapshotItem } from 'app/types/I_faProjectWorldDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'

import {
  addDialogProjectSettingsWorldDraftRow,
  removeDialogProjectSettingsWorldDraftRow,
  updateDialogProjectSettingsWorldDraftColor,
  updateDialogProjectSettingsWorldDraftColorPallete,
  updateDialogProjectSettingsWorldDraftDisplayName
} from './dialogProjectSettingsWorldRowMutationsWiring'
import {
  isDialogProjectSettingsDialogSaveDisabled,
  mapDialogProjectSettingsWorldsToSnapshot
} from './functions/dialogProjectSettingsWorldsDraft'

async function hydrateDialogProjectSettingsDrafts (deps: {
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  faProjectWorldsFetchFreshForDialog: () => Promise<I_dialogProjectSettingsWorldDraft[]>
}, params: {
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  props: I_dialogProjectSettingsProps
}): Promise<void> {
  const { localSettings, localWorlds, props } = params
  if (props.directSettingsSnapshot !== undefined) {
    localSettings.value = { ...props.directSettingsSnapshot }
  } else {
    const snapshot = await deps.faProjectSettingsFetchFreshForDialog()
    localSettings.value = { ...snapshot }
  }
  if (props.directWorldsSnapshot !== undefined) {
    localWorlds.value = props.directWorldsSnapshot.map((world) => ({ ...world }))
  } else {
    const worlds = await deps.faProjectWorldsFetchFreshForDialog()
    localWorlds.value = worlds.map((world) => ({ ...world }))
  }
}

export function createDialogProjectSettingsDialogActions (deps: {
  FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB: string
  faProjectSettingsFetchFreshForDialog: () => Promise<I_faProjectSettingsRoot>
  faProjectWorldsFetchFreshForDialog: () => Promise<I_dialogProjectSettingsWorldDraft[]>
  newWorldDefaultDisplayName: string
  runFaActionAwait: (
    id: 'saveProjectSettings',
    payload: {
      settings: { projectName: string }
      worlds?: I_faProjectWorldSnapshotItem[]
    }
  ) => Promise<boolean>
}, params: {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faProjectSettingsRoot | null>
  localWorlds: Ref<I_dialogProjectSettingsWorldDraft[] | null>
  props: I_dialogProjectSettingsProps
  selectedCategoryTab: Ref<string>
}): {
    addWorld: () => void
    openDialog: (input: T_dialogName) => void
    removeWorld: (id: string) => void
    saveAndCloseDialog: () => Promise<void>
    updateWorldColor: (id: string, color: string) => void
    updateWorldColorPallete: (id: string, colorPallete: string) => void
    updateWorldDisplayName: (id: string, displayName: string) => void
  } {
  const {
    dialogModel,
    documentName,
    localSettings,
    localWorlds,
    props,
    selectedCategoryTab
  } = params

  function openDialog (input: T_dialogName): void {
    documentName.value = input
    dialogModel.value = true
    selectedCategoryTab.value = deps.FA_DIALOG_PROJECT_SETTINGS_GENERAL_TAB
    void hydrateDialogProjectSettingsDrafts(deps, {
      localSettings,
      localWorlds,
      props
    })
  }

  async function saveAndCloseDialog (): Promise<void> {
    if (localSettings.value === null || localWorlds.value === null) {
      return
    }
    const trimmedName = localSettings.value.projectName.trim()
    if (isDialogProjectSettingsDialogSaveDisabled(trimmedName, localWorlds.value)) {
      return
    }
    const worldsSnapshot = mapDialogProjectSettingsWorldsToSnapshot(localWorlds.value)
    const saved = await deps.runFaActionAwait('saveProjectSettings', {
      settings: {
        projectName: trimmedName
      },
      worlds: worldsSnapshot
    })
    if (!saved) {
      return
    }
    dialogModel.value = false
  }

  return {
    addWorld: () => {
      addDialogProjectSettingsWorldDraftRow(localWorlds, deps.newWorldDefaultDisplayName)
    },
    openDialog,
    removeWorld: (id) => {
      removeDialogProjectSettingsWorldDraftRow(localWorlds, id)
    },
    saveAndCloseDialog,
    updateWorldColor: (id, color) => {
      updateDialogProjectSettingsWorldDraftColor(localWorlds, id, color)
    },
    updateWorldColorPallete: (id, colorPallete) => {
      updateDialogProjectSettingsWorldDraftColorPallete(localWorlds, id, colorPallete)
    },
    updateWorldDisplayName: (id, displayName) => {
      updateDialogProjectSettingsWorldDraftDisplayName(localWorlds, id, displayName)
    }
  }
}
