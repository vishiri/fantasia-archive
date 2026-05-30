/* eslint-disable max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_computedRef, I_ref } from 'app/types/I_vueCompositionShims'
import type { T_faUserSettingsLanguageCode } from 'app/types/I_faUserSettingsDomain'

export function createGlobalLanguageSelector (deps: {
  GLOBAL_LANGUAGE_SELECTOR_LOCALES: Array<{
    code: T_faUserSettingsLanguageCode
    flagSrc: string
  }>
  computed: <T>(getter: () => T) => I_computedRef<T>
  getFaUserSettingsStore: () => { settings?: { languageCode?: T_faUserSettingsLanguageCode } | null }
  i18n: { global: { locale: { value: string } } }
  ref: <T>(value: T) => I_ref<T>
  resolveGlobalLanguageSelectorAppliedPair: (
    next: T_faUserSettingsLanguageCode | undefined,
    prior: T_faUserSettingsLanguageCode | undefined
  ) => readonly [T_faUserSettingsLanguageCode, T_faUserSettingsLanguageCode] | null
  resolveVitePublicAssetPath: (pathFromPublicRoot: string) => string
  runFaActionAwait: (
    id: 'languageSwitch',
    payload: { code: T_faUserSettingsLanguageCode; priorCode: T_faUserSettingsLanguageCode }
  ) => Promise<boolean>
  useGlobalLanguageSelectorSpellcheckRefresh: () => {
    noteLanguageApplied: (
      priorCode: T_faUserSettingsLanguageCode,
      nextCode: T_faUserSettingsLanguageCode
    ) => void
    refreshWebContentsAndHide: () => Promise<void>
    showSpellcheckRefresh: I_ref<boolean>
  }
  watch: (
    source: () => unknown,
    effect: (next: unknown, prior: unknown) => void
  ) => void
}): {
    GLOBAL_LANGUAGE_SELECTOR_INNER_SIZE_PX: number
    useGlobalLanguageSelector: () => {
      activeI18nLocale: I_computedRef<string>
      currentCode: I_computedRef<T_faUserSettingsLanguageCode>
      currentFlagSrc: I_computedRef<string>
      globalLanguageSelectorInnerSize: number
      isLanguageMenuOpen: I_ref<boolean>
      onLanguageMenuHide: () => void
      onLanguageMenuShow: () => void
      onLanguageTriggerClickCapture: () => void
      pickLanguage: (code: T_faUserSettingsLanguageCode) => Promise<void>
      refreshWebContentsAndHide: () => Promise<void>
      resolveVitePublicAssetPath: (pathFromPublicRoot: string) => string
      showSelector: I_computedRef<boolean>
      showSpellcheckRefresh: I_ref<boolean>
    }
  } {
  const GLOBAL_LANGUAGE_SELECTOR_INNER_SIZE_PX = 21

  function useGlobalLanguageSelector () {
    const isLanguageMenuOpen = deps.ref(false)

    const {
      noteLanguageApplied,
      refreshWebContentsAndHide,
      showSpellcheckRefresh
    } = deps.useGlobalLanguageSelectorSpellcheckRefresh()

    const faUserSettingsStore = deps.getFaUserSettingsStore()

    const showSelector = deps.computed((): boolean => {
      return (
        process.env.MODE === 'electron' &&
        window.faContentBridgeAPIs?.faUserSettings !== undefined
      )
    })

    const currentCode = deps.computed((): T_faUserSettingsLanguageCode => {
      return faUserSettingsStore.settings?.languageCode ?? 'en-US'
    })

    const currentFlagSrc = deps.computed((): string => {
      const row = deps.GLOBAL_LANGUAGE_SELECTOR_LOCALES.find((r) => {
        return r.code === currentCode.value
      })

      return row?.flagSrc ?? '/countryFlags/us.svg'
    })

    const activeI18nLocale = deps.computed((): string => {
      void currentCode.value
      return String(deps.i18n.global.locale.value)
    })

    deps.watch(
      () => faUserSettingsStore.settings?.languageCode,
      (next, prior) => {
        const appliedPair = deps.resolveGlobalLanguageSelectorAppliedPair(
          next as T_faUserSettingsLanguageCode | undefined,
          prior as T_faUserSettingsLanguageCode | undefined
        )
        if (appliedPair === null) {
          return
        }
        const priorCode = appliedPair[0]
        const nextCode = appliedPair[1]
        noteLanguageApplied(priorCode, nextCode)
      }
    )

    function onLanguageTriggerClickCapture (): void {
      isLanguageMenuOpen.value = true
    }

    function onLanguageMenuShow (): void {
      isLanguageMenuOpen.value = true
    }

    function onLanguageMenuHide (): void {
      isLanguageMenuOpen.value = false
    }

    async function pickLanguage (code: T_faUserSettingsLanguageCode): Promise<void> {
      await deps.runFaActionAwait('languageSwitch', {
        code,
        priorCode: currentCode.value
      })
    }

    return {
      activeI18nLocale,
      currentCode,
      currentFlagSrc,
      globalLanguageSelectorInnerSize: GLOBAL_LANGUAGE_SELECTOR_INNER_SIZE_PX,
      isLanguageMenuOpen,
      onLanguageMenuHide,
      onLanguageMenuShow,
      onLanguageTriggerClickCapture,
      pickLanguage,
      refreshWebContentsAndHide,
      resolveVitePublicAssetPath: deps.resolveVitePublicAssetPath,
      showSelector,
      showSpellcheckRefresh
    }
  }

  return {
    GLOBAL_LANGUAGE_SELECTOR_INNER_SIZE_PX,
    useGlobalLanguageSelector
  }
}
