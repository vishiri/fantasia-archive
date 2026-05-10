import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import { APP_SETTINGS_OPTIONS } from 'app/src/components/dialogs/DialogAppSettings/_data/appSettingsOptions'
import { buildAppSettingsRenderTree } from 'app/src/components/dialogs/DialogAppSettings/scripts/dialogAppSettingsTree'
import { runFaActionAwait } from 'app/src/scripts/actionManager/faActionManagerRun'
import { S_FaUserSettings } from 'src/stores/S_FaUserSettings'
import { toRaw, type Ref } from 'vue'
import { Result } from 'neverthrow'

import type { I_dialogAppSettingsProps } from 'app/types/I_dialogAppSettings'

/**
 * Pinia store surface used when hydrating the dialog from persisted settings.
 */
export type T_appSettingsFaUserSettingsStoreForSync = {
  settings: I_faUserSettings | null
  refreshSettings: () => Promise<void>
}

function tryResolveFaUserSettingsStoreForSync (): T_appSettingsFaUserSettingsStoreForSync | null {
  return Result.fromThrowable(
    (): T_appSettingsFaUserSettingsStoreForSync => S_FaUserSettings(),
    (): null => null
  )().unwrapOr(null)
}

/**
 * Updates the in-memory settings snapshot and the matching toggle in the render tree.
 */
export function updateLocalAppSettingsField (
  localSettings: Ref<I_faUserSettings | null>,
  appSettingsTree: Ref<T_appSettingsRenderTree>,
  settingKey: string,
  updatedValue: boolean
): void {
  if (localSettings.value === null) {
    return
  }

  if (!Object.hasOwn(APP_SETTINGS_OPTIONS, settingKey)) {
    return
  }

  const normalizedSettingKey = settingKey as keyof typeof APP_SETTINGS_OPTIONS
  localSettings.value[normalizedSettingKey] = updatedValue

  const settingMetadata = APP_SETTINGS_OPTIONS[normalizedSettingKey]
  const categoryEntry = appSettingsTree.value[settingMetadata.category]
  if (categoryEntry === undefined) {
    return
  }

  const subCategoryEntry = categoryEntry.subCategories[settingMetadata.subcategory]
  if (subCategoryEntry === undefined || subCategoryEntry.settingsList[settingKey] === undefined) {
    return
  }

  subCategoryEntry.settingsList[settingKey].value = updatedValue
}

/**
 * Pulls the latest settings from the store into the local editable copy.
 */
export async function syncLocalAppSettingsFromStore (
  localSettings: Ref<I_faUserSettings | null>,
  appSettingsTree: Ref<T_appSettingsRenderTree>
): Promise<void> {
  const faUserSettingsStore = tryResolveFaUserSettingsStoreForSync()
  if (faUserSettingsStore === null) {
    return
  }

  if (faUserSettingsStore.settings === null) {
    await faUserSettingsStore.refreshSettings()
  }

  if (faUserSettingsStore.settings !== null) {
    localSettings.value = { ...faUserSettingsStore.settings }
    appSettingsTree.value = buildAppSettingsRenderTree(localSettings.value)
  }
}

export function createDialogAppSettingsDialogActions (params: {
  dialogModel: Ref<boolean>
  documentName: Ref<string>
  localSettings: Ref<I_faUserSettings | null>
  appSettingsTree: Ref<T_appSettingsRenderTree>
  props: I_dialogAppSettingsProps
  searchSettingsQuery: Ref<string | null>
}): {
    openDialog: (input: T_dialogName) => void
    saveAndCloseDialog: () => Promise<void>
    updateLocalSetting: (settingKey: string, updatedValue: boolean) => void
  } {
  const {
    dialogModel,
    documentName,
    localSettings,
    appSettingsTree,
    props,
    searchSettingsQuery
  } = params

  function openDialog (input: T_dialogName): void {
    documentName.value = input
    dialogModel.value = true
    searchSettingsQuery.value = ''
    const directSnapshot = props.directSettingsSnapshot
    if (directSnapshot !== undefined) {
      const nextSettings: I_faUserSettings = { ...directSnapshot }
      localSettings.value = nextSettings
      appSettingsTree.value = buildAppSettingsRenderTree(nextSettings)
      return
    }

    void syncLocalAppSettingsFromStore(localSettings, appSettingsTree)
  }

  async function saveAndCloseDialog (): Promise<void> {
    if (localSettings.value !== null) {
      const plainSettingsSnapshot: I_faUserSettings = { ...toRaw(localSettings.value) }
      await runFaActionAwait('saveAppSettings', { settings: plainSettingsSnapshot })
    }

    dialogModel.value = false
  }

  function updateLocalSetting (settingKey: string, updatedValue: boolean): void {
    updateLocalAppSettingsField(localSettings, appSettingsTree, settingKey, updatedValue)
  }

  return {
    openDialog,
    saveAndCloseDialog,
    updateLocalSetting
  }
}
