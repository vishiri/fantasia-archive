import type { I_socialContactButtonSet } from 'app/types/I_socialContactButtons'
import type { I_computedRef } from 'app/types/I_vueCompositionShims'
import type { T_socialContactButtonStaticConfig } from 'app/types/I_socialContactButtons'

export function createSocialContactButtons (deps: {
  buildSocialContactButtonList: (
    t: (messageKey: string) => string,
    config: T_socialContactButtonStaticConfig
  ) => I_socialContactButtonSet
  computed: <T>(getter: () => T) => I_computedRef<T>
  getLocaleValue: () => unknown
  socialContactButtonStaticConfig: T_socialContactButtonStaticConfig
  t: (messageKey: string) => string
}): {
    getSocialContactButtonListForCurrentLocale: () => I_socialContactButtonSet
    useSocialContactButtons: () => {
      buttonList: I_computedRef<I_socialContactButtonSet>
      buttonListLength: I_computedRef<number>
    }
  } {
  const resolveButtonList = (): I_socialContactButtonSet => {
    return deps.buildSocialContactButtonList(
      (messageKey) => deps.t(messageKey),
      deps.socialContactButtonStaticConfig
    )
  }

  const getSocialContactButtonListForCurrentLocale = (): I_socialContactButtonSet => {
    return resolveButtonList()
  }

  const useSocialContactButtons = (): {
    buttonList: I_computedRef<I_socialContactButtonSet>
    buttonListLength: I_computedRef<number>
  } => {
    const buttonList = deps.computed(() => {
      void deps.getLocaleValue()
      return resolveButtonList()
    })

    const buttonListLength = deps.computed(() => Object.keys(buttonList.value).length)

    return {
      buttonList,
      buttonListLength
    }
  }

  return {
    getSocialContactButtonListForCurrentLocale,
    useSocialContactButtons
  }
}
