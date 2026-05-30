import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'

import type { I_socialContactButton } from 'app/types/I_socialContactButtons'

export function createUseSocialContactSingleButton (deps: {
  computed: <T>(getter: () => T) => I_computedRef<T>
  resolveVitePublicAssetPath: (pathFromPublicRoot: string) => string
  socialContactSingleButtonData: (input: I_socialContactButton) => I_socialContactButton
  socialContactSingleButtonIconRelativePath: (iconFileName: string) => string
  socialContactSingleButtonImageAlt: (label: string, title: string) => string
  socialContactSingleButtonShowLabel: (label: string) => boolean
  toRef: <T extends object, K extends keyof T>(
    object: T,
    key: K
  ) => I_ref<T[K]>
}): {
    useSocialContactSingleButton: (props: {
      dataInput: I_socialContactButton
    }) => {
      buttonData: I_computedRef<I_socialContactButton>
      iconSrc: I_computedRef<string>
      imageAltText: I_computedRef<string>
      showButtonLabel: I_computedRef<boolean>
    }
  } {
  function useSocialContactSingleButton (props: {
    dataInput: I_socialContactButton
  }): {
      buttonData: I_computedRef<I_socialContactButton>
      iconSrc: I_computedRef<string>
      imageAltText: I_computedRef<string>
      showButtonLabel: I_computedRef<boolean>
    } {
    const dataInput = deps.toRef(props, 'dataInput')

    const buttonData = deps.computed(() => deps.socialContactSingleButtonData(dataInput.value))

    const showButtonLabel = deps.computed(() => {
      return deps.socialContactSingleButtonShowLabel(dataInput.value.label)
    })

    const imageAltText = deps.computed(() => {
      return deps.socialContactSingleButtonImageAlt(
        dataInput.value.label,
        dataInput.value.title
      )
    })

    const iconSrc = deps.computed(() => {
      return deps.resolveVitePublicAssetPath(
        deps.socialContactSingleButtonIconRelativePath(dataInput.value.icon)
      )
    })

    return {
      buttonData,
      iconSrc,
      imageAltText,
      showButtonLabel
    }
  }

  return {
    useSocialContactSingleButton
  }
}
