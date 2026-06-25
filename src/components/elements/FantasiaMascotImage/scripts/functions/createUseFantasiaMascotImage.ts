import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

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
    width: I_ref<string>
  } {
  return function useFantasiaMascotImage (props) {
    const fantasiaImage = deps.toRef(props, 'fantasiaImage')
    const height = deps.toRef(props, 'height')
    const width = deps.toRef(props, 'width')

    const isRandom = deps.fantasiaMascotImageIsRandom(props.fantasiaImage)
    const mascotVariantName = deps.computed(() => {
      return deps.fantasiaMascotVariantName(props.fantasiaImage)
    })
    const currentMascotImage = deps.determineCurrentImage(
      deps.fantasiaImageList,
      isRandom,
      props.fantasiaImage
    )

    return {
      currentMascotImage,
      fantasiaImage,
      height,
      isRandom,
      mascotVariantName,
      width
    }
  }
}
