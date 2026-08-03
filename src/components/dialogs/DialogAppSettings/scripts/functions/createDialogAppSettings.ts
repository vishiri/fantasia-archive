/* eslint-disable max-lines, max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type { I_dialogAppSettingsProps } from 'app/types/I_dialogAppSettings'
import type { T_appSettingsFaUserSettingsStoreForSync } from 'app/types/I_dialogAppSettings'
import type { T_appSettingsRenderTree } from 'app/types/I_dialogAppSettings'
import type { T_appSettingsSettingUpdateValue } from 'app/types/I_dialogAppSettings'
import type { I_dialogComponentStoreLike } from 'app/types/I_dialogComponentStoreLike'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'

export function createDialogAppSettings (deps: {
  APP_SETTINGS_OPTIONS: Record<string, { category: string; subcategory: string }>
  S_DialogComponent: () => I_dialogComponentStoreLike
  S_FaUserSettings: () => T_appSettingsFaUserSettingsStoreForSync
  areFaJsonSnapshotsEqual: (left: unknown, right: unknown) => boolean
  buildAppSettingsRenderTree: (
    translate: { t: (key: string) => string; te: (key: string) => boolean },
    options: Record<string, { category: string; subcategory: string }>,
    settings: I_faUserSettings,
    appThemeValues: readonly string[]
  ) => T_appSettingsRenderTree
  appThemeValues: readonly string[]
  computed: <T>(getter: () => T) => ComputedRef<T>
  filterAppSettingsTreeForSearch: (
    tree: T_appSettingsRenderTree,
    query: string | null
  ) => T_appSettingsRenderTree
  i18n: { global: { t: (key: string) => string; te: (key: string) => boolean } }
  onMounted: (hook: () => void) => void
  ref: <T>(value: T) => Ref<T>
  registerComponentDialogStackGuard: (dialogModel: Ref<boolean>) => void
  Result: {
    fromThrowable: <T, E>(fn: () => T, onError: (error: unknown) => E) => () => {
      unwrapOr: (defaultValue: T) => T
    }
  }
  runFaActionAwait: (
    id: 'saveAppSettings',
    payload: { settings: I_faUserSettings }
  ) => Promise<boolean>
  toRaw: <T>(value: T) => T
  updateLocalAppSettingsField: (
    localSettings: I_faUserSettings,
    tree: T_appSettingsRenderTree,
    options: Record<string, { category: string; subcategory: string }>,
    settingKey: string,
    updatedValue: T_appSettingsSettingUpdateValue
  ) => void
  watch: (
    source: unknown,
    effect: (value: unknown, oldValue: unknown) => void,
    options?: Record<string, unknown>
  ) => void
}): {
    resolveDialogComponentStore: () => I_dialogComponentStoreLike | null
    syncLocalAppSettingsFromStore: (
      localSettings: Ref<I_faUserSettings | null>,
      appSettingsTree: Ref<T_appSettingsRenderTree>
    ) => Promise<void>
    registerDialogAppSettingsWatchers: (params: {
      openDialog: (input: T_dialogName) => void
      appSettingsTree: Ref<T_appSettingsRenderTree>
      props: I_dialogAppSettingsProps
      selectedCategoryTab: Ref<string>
    }) => void
    useDialogAppSettingsSearchComputed: (params: {
      appSettingsTree: Ref<T_appSettingsRenderTree>
      searchSettingsQuery: Ref<string | null>
    }) => {
      hasActiveSearchQuery: ComputedRef<boolean>
      hasSearchNoMatchingSettings: ComputedRef<boolean>
      searchFilteredAppSettingsTree: ComputedRef<T_appSettingsRenderTree>
    }
    createDialogAppSettingsDialogActions: (params: {
      baselineSettings: Ref<I_faUserSettings | null>
      dialogModel: Ref<boolean>
      documentName: Ref<string>
      localSettings: Ref<I_faUserSettings | null>
      appSettingsTree: Ref<T_appSettingsRenderTree>
      props: I_dialogAppSettingsProps
      searchSettingsQuery: Ref<string | null>
    }) => {
      openDialog: (input: T_dialogName) => void
      saveAndCloseDialog: () => Promise<void>
      updateLocalSetting: (settingKey: string, updatedValue: T_appSettingsSettingUpdateValue) => void
    }
    useDialogAppSettings: (props: I_dialogAppSettingsProps) => {
      dialogModel: Ref<boolean>
      documentName: Ref<string>
      hasActiveSearchQuery: ComputedRef<boolean>
      hasSearchNoMatchingSettings: ComputedRef<boolean>
      isDirty: ComputedRef<boolean>
      localSettings: Ref<I_faUserSettings | null>
      appSettingsTree: Ref<T_appSettingsRenderTree>
      saveAndCloseDialog: () => Promise<void>
      searchFilteredAppSettingsTree: ComputedRef<T_appSettingsRenderTree>
      searchSettingsQuery: Ref<string | null>
      selectedCategoryTab: Ref<string>
      updateLocalSetting: (settingKey: string, updatedValue: T_appSettingsSettingUpdateValue) => void
    }
  } {
  const dialogAppSettingsTranslate = {
    t: (key: string): string => deps.i18n.global.t(key),
    te: (key: string): boolean => deps.i18n.global.te(key)
  }

  function tryResolveFaUserSettingsStoreForSync (): T_appSettingsFaUserSettingsStoreForSync | null {
    try {
      return deps.S_FaUserSettings()
    } catch {
      return null
    }
  }

  function resolveDialogComponentStore (): I_dialogComponentStoreLike | null {
    try {
      return deps.S_DialogComponent()
    } catch {
      return null
    }
  }

  async function syncLocalAppSettingsFromStore (
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
      appSettingsTree.value = deps.buildAppSettingsRenderTree(
        dialogAppSettingsTranslate,
        deps.APP_SETTINGS_OPTIONS,
        localSettings.value,
        deps.appThemeValues
      )
    }
  }

  function syncSelectedTabToTreeKeys (
    tree: T_appSettingsRenderTree,
    selectedCategoryTab: Ref<string>
  ): void {
    const keys = Object.keys(tree)
    if (keys.length === 0) {
      selectedCategoryTab.value = ''
      return
    }
    if (selectedCategoryTab.value === '' || !keys.includes(selectedCategoryTab.value)) {
      selectedCategoryTab.value = keys[0] as string
    }
  }

  function registerDialogAppSettingsWatchers (params: {
    openDialog: (input: T_dialogName) => void
    appSettingsTree: Ref<T_appSettingsRenderTree>
    props: I_dialogAppSettingsProps
    selectedCategoryTab: Ref<string>
  }): void {
    const {
      openDialog,
      appSettingsTree,
      props,
      selectedCategoryTab
    } = params

    deps.watch(
      appSettingsTree,
      (tree) => {
        syncSelectedTabToTreeKeys(tree as T_appSettingsRenderTree, selectedCategoryTab)
      },
      {
        deep: true,
        immediate: true
      }
    )

    deps.watch(() => resolveDialogComponentStore()?.dialogUUID, () => {
      const dialogComponentStore = resolveDialogComponentStore()
      if (dialogComponentStore?.dialogToOpen === 'AppSettings') {
        openDialog(dialogComponentStore.dialogToOpen as T_dialogName)
      }
    })

    deps.watch(() => props.directInput, () => {
      if (props.directInput !== undefined && props.directInput !== '') {
        if (props.directInput === 'AppSettings') {
          openDialog(props.directInput)
        }
      }
    })

    deps.onMounted(() => {
      if (props.directInput === 'AppSettings') {
        openDialog(props.directInput)
      }
    })
  }

  function useDialogAppSettingsSearchComputed (params: {
    appSettingsTree: Ref<T_appSettingsRenderTree>
    searchSettingsQuery: Ref<string | null>
  }): {
      hasActiveSearchQuery: ComputedRef<boolean>
      hasSearchNoMatchingSettings: ComputedRef<boolean>
      searchFilteredAppSettingsTree: ComputedRef<T_appSettingsRenderTree>
    } {
    const {
      appSettingsTree,
      searchSettingsQuery
    } = params

    const hasActiveSearchQuery = deps.computed(
      () => (searchSettingsQuery.value ?? '').trim() !== ''
    )

    const searchFilteredAppSettingsTree = deps.computed((): T_appSettingsRenderTree => {
      if (!hasActiveSearchQuery.value) {
        return {}
      }

      return deps.filterAppSettingsTreeForSearch(appSettingsTree.value, searchSettingsQuery.value)
    })

    const hasSearchNoMatchingSettings = deps.computed(
      () =>
        hasActiveSearchQuery.value &&
        Object.keys(searchFilteredAppSettingsTree.value).length === 0
    )

    return {
      hasActiveSearchQuery,
      hasSearchNoMatchingSettings,
      searchFilteredAppSettingsTree
    }
  }

  function createDialogAppSettingsRefs (): {
    baselineSettings: Ref<I_faUserSettings | null>
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    localSettings: Ref<I_faUserSettings | null>
    appSettingsTree: Ref<T_appSettingsRenderTree>
    searchSettingsQuery: Ref<string | null>
    selectedCategoryTab: Ref<string>
  } {
    const dialogModel = deps.ref(false)
    const documentName = deps.ref('')
    const localSettings = deps.ref<I_faUserSettings | null>(null)
    const baselineSettings = deps.ref<I_faUserSettings | null>(null)
    const appSettingsTree = deps.ref<T_appSettingsRenderTree>({})
    const searchSettingsQuery = deps.ref<string | null>('')
    const selectedCategoryTab = deps.ref<string>('')
    return {
      baselineSettings,
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      searchSettingsQuery,
      selectedCategoryTab
    }
  }

  function createDialogAppSettingsDialogActions (params: {
    baselineSettings: Ref<I_faUserSettings | null>
    dialogModel: Ref<boolean>
    documentName: Ref<string>
    localSettings: Ref<I_faUserSettings | null>
    appSettingsTree: Ref<T_appSettingsRenderTree>
    props: I_dialogAppSettingsProps
    searchSettingsQuery: Ref<string | null>
  }): {
      openDialog: (input: T_dialogName) => void
      saveAndCloseDialog: () => Promise<void>
      updateLocalSetting: (settingKey: string, updatedValue: T_appSettingsSettingUpdateValue) => void
    } {
    const {
      baselineSettings,
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      props,
      searchSettingsQuery
    } = params

    function captureBaselineFromLocalSettings (): void {
      if (localSettings.value === null) {
        baselineSettings.value = null
        return
      }
      baselineSettings.value = JSON.parse(JSON.stringify(localSettings.value)) as I_faUserSettings
    }

    function openDialog (input: T_dialogName): void {
      documentName.value = input
      dialogModel.value = true
      searchSettingsQuery.value = ''
      const directSnapshot = props.directSettingsSnapshot
      if (directSnapshot !== undefined) {
        const nextSettings: I_faUserSettings = { ...directSnapshot }
        localSettings.value = nextSettings
        appSettingsTree.value = deps.buildAppSettingsRenderTree(
          dialogAppSettingsTranslate,
          deps.APP_SETTINGS_OPTIONS,
          nextSettings,
          deps.appThemeValues
        )
        captureBaselineFromLocalSettings()
        return
      }

      void syncLocalAppSettingsFromStore(localSettings, appSettingsTree).then(() => {
        captureBaselineFromLocalSettings()
      })
    }

    async function saveAndCloseDialog (): Promise<void> {
      if (localSettings.value !== null) {
        const plainSettingsSnapshot: I_faUserSettings = { ...deps.toRaw(localSettings.value) }
        await deps.runFaActionAwait('saveAppSettings', { settings: plainSettingsSnapshot })
        captureBaselineFromLocalSettings()
      }

      dialogModel.value = false
    }

    function updateLocalSetting (settingKey: string, updatedValue: T_appSettingsSettingUpdateValue): void {
      if (localSettings.value === null) {
        return
      }

      deps.updateLocalAppSettingsField(
        localSettings.value,
        appSettingsTree.value,
        deps.APP_SETTINGS_OPTIONS,
        settingKey,
        updatedValue
      )

      if (settingKey === 'hideTooltipsProject' && typeof updatedValue === 'boolean') {
        deps.S_FaUserSettings().setAppSettingsDialogPreview({
          hideTooltipsProject: updatedValue
        })
      }

      if (settingKey === 'hideTabCloseButton' && typeof updatedValue === 'boolean') {
        deps.S_FaUserSettings().setAppSettingsDialogPreview({
          hideTabCloseButton: updatedValue
        })
      }

      if (settingKey === 'showTabBarScrollButtons' && typeof updatedValue === 'boolean') {
        deps.S_FaUserSettings().setAppSettingsDialogPreview({
          showTabBarScrollButtons: updatedValue
        })
      }

      if (settingKey === 'hideDeadCrossThrough' && typeof updatedValue === 'boolean') {
        deps.S_FaUserSettings().setAppSettingsDialogPreview({
          hideDeadCrossThrough: updatedValue
        })
      }

      if (settingKey === 'appTheme' && typeof updatedValue === 'string') {
        deps.S_FaUserSettings().setAppSettingsDialogPreview({
          appTheme: updatedValue as I_faUserSettings['appTheme']
        })
      }
    }

    return {
      openDialog,
      saveAndCloseDialog,
      updateLocalSetting
    }
  }

  function useDialogAppSettings (props: I_dialogAppSettingsProps) {
    const refs = createDialogAppSettingsRefs()
    deps.registerComponentDialogStackGuard(refs.dialogModel)
    const {
      baselineSettings,
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      searchSettingsQuery,
      selectedCategoryTab
    } = refs
    const searchComputed = useDialogAppSettingsSearchComputed({
      appSettingsTree,
      searchSettingsQuery
    })
    const actions = createDialogAppSettingsDialogActions({
      baselineSettings,
      dialogModel,
      documentName,
      localSettings,
      appSettingsTree,
      props,
      searchSettingsQuery
    })
    registerDialogAppSettingsWatchers({
      openDialog: actions.openDialog,
      appSettingsTree,
      props,
      selectedCategoryTab
    })
    deps.watch(dialogModel, (isOpen) => {
      if (!isOpen) {
        deps.S_FaUserSettings().clearAppSettingsDialogPreview()
      }
    })
    const isDirty = deps.computed((): boolean => {
      if (localSettings.value === null || baselineSettings.value === null) {
        return false
      }
      return !deps.areFaJsonSnapshotsEqual(localSettings.value, baselineSettings.value)
    })
    return {
      dialogModel,
      documentName,
      hasActiveSearchQuery: searchComputed.hasActiveSearchQuery,
      hasSearchNoMatchingSettings: searchComputed.hasSearchNoMatchingSettings,
      isDirty,
      localSettings,
      appSettingsTree,
      saveAndCloseDialog: actions.saveAndCloseDialog,
      searchFilteredAppSettingsTree: searchComputed.searchFilteredAppSettingsTree,
      searchSettingsQuery,
      selectedCategoryTab,
      updateLocalSetting: actions.updateLocalSetting
    }
  }

  return {
    resolveDialogComponentStore,
    syncLocalAppSettingsFromStore,
    registerDialogAppSettingsWatchers,
    useDialogAppSettingsSearchComputed,
    createDialogAppSettingsDialogActions,
    useDialogAppSettings
  }
}
