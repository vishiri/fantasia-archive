import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type {
  StoreGeneric,
  T_piniaStoreToRefs
} from 'app/types/I_vuePiniaInjected'

export function createUseProjectOverview (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  onMounted: (hook: () => void) => void
  pickRandomTipCaption: () => string
  ref: <T>(value: T) => I_ref<T>
  resolveHideFantasiaMascot: (
    settings: I_faUserSettings | null,
    preview: Partial<I_faUserSettings> | null
  ) => boolean
  storeToRefs: T_piniaStoreToRefs
  S_FaActiveProject: () => StoreGeneric
  S_FaUserSettings: () => StoreGeneric
  t: (key: string) => string
}): () => {
    projectDisplayName: I_computedRef<string>
    randomTipCaption: I_ref<string>
    showMascotInTipCard: I_computedRef<boolean>
    showTipCard: I_computedRef<boolean>
  } {
  return function useProjectOverview () {
    const randomTipCaption = deps.ref('')

    const { activeProject } = deps.storeToRefs(deps.S_FaActiveProject())!
    const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

    const projectDisplayName = deps.computed(() => {
      const name = activeProject!.value?.name?.trim()

      if (name) {
        return name
      }

      return deps.t('projectUI.projectOverview.noActiveProjectName')
    })

    const showTipCard = deps.computed(() => {
      const previewHideTooltipsProject =
        appSettingsDialogPreview!.value?.hideTooltipsProject
      const hideTooltipsProject = previewHideTooltipsProject !== undefined
        ? previewHideTooltipsProject
        : settings!.value?.hideTooltipsProject

      return hideTooltipsProject !== true
    })

    const showMascotInTipCard = deps.computed(() => {
      return !deps.resolveHideFantasiaMascot(
        settings!.value as I_faUserSettings | null,
        appSettingsDialogPreview!.value as Partial<I_faUserSettings> | null
      )
    })

    deps.onMounted(() => {
      randomTipCaption.value = deps.pickRandomTipCaption()
    })

    return {
      projectDisplayName,
      randomTipCaption,
      showMascotInTipCard,
      showTipCard
    }
  }
}
