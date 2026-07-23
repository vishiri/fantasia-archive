import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { I_faUserSettings } from 'app/types/I_faUserSettingsDomain'
import type {
  StoreGeneric,
  T_piniaStoreToRefs
} from 'app/types/I_vuePiniaInjected'

export function createUseFantasiaMascotImage (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  determineCurrentImage: (
    imageList: { [key: string]: string },
    isRandom: boolean,
    fantasiaImage: string
  ) => string | undefined
  fantasiaImageList: { [key: string]: string }
  fantasiaMascotImageIsRandom: (fantasiaImage: string) => boolean
  fantasiaMascotVariantName: (fantasiaImage: string) => string
  resolveHideFantasiaMascot: (
    settings: I_faUserSettings | null,
    preview: Partial<I_faUserSettings> | null
  ) => boolean
  storeToRefs: T_piniaStoreToRefs
  S_FaUserSettings: () => StoreGeneric
  toRef: <T extends object, K extends keyof T>(
    object: T,
    key: K
  ) => I_ref<T[K]>
}): (props: {
    fantasiaImage: string
    height: string
    width: string
  }) => {
    currentMascotImage: string | undefined
    fantasiaImage: I_ref<string>
    height: I_ref<string>
    isRandom: boolean
    mascotVariantName: I_computedRef<string>
    showMascot: I_computedRef<boolean>
    width: I_ref<string>
  } {
  return function useFantasiaMascotImage (props) {
    const fantasiaImage = deps.toRef(props, 'fantasiaImage')
    const height = deps.toRef(props, 'height')
    const width = deps.toRef(props, 'width')

    const { appSettingsDialogPreview, settings } = deps.storeToRefs(deps.S_FaUserSettings())!

    const isRandom = deps.fantasiaMascotImageIsRandom(props.fantasiaImage)
    const mascotVariantName = deps.computed(() => {
      return deps.fantasiaMascotVariantName(props.fantasiaImage)
    })
    const currentMascotImage = deps.determineCurrentImage(
      deps.fantasiaImageList,
      isRandom,
      props.fantasiaImage
    )
    const showMascot = deps.computed(() => {
      return !deps.resolveHideFantasiaMascot(
        settings!.value as I_faUserSettings | null,
        appSettingsDialogPreview!.value as Partial<I_faUserSettings> | null
      )
    })

    return {
      currentMascotImage,
      fantasiaImage,
      height,
      isRandom,
      mascotVariantName,
      showMascot,
      width
    }
  }
}
