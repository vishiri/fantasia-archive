import type {
  I_faLocaleTranslationsInputComposableDeps,
  I_faLocaleTranslationsInputComposableOptions
} from 'app/types/I_faLocaleTranslationsInputComposable'
import type {
  I_computedRef,
  I_ref
} from 'app/types/I_vueCompositionShims'

export function createFaLocaleTranslationsInputMenuState (
  deps: I_faLocaleTranslationsInputComposableDeps,
  options: I_faLocaleTranslationsInputComposableOptions
): {
    clearLockedMenuPresentation: () => void
    isMenuPresentationLocked: I_computedRef<boolean>
    lockMenuPresentation: () => void
    lockedMenuContentStyle: I_ref<Record<string, string> | undefined>
    menuOffset: [number, number]
    menuTarget: I_ref<HTMLElement | undefined>
    onTranslationsMenuBeforeShow: () => void
    onTranslationsMenuHide: () => void
    onTranslationsMenuShow: () => void
    openTranslationsMenu: () => void
    syncMenuAnchorTarget: () => void
    translationsMenuOpen: I_ref<boolean>
  } {
  const translationsMenuOpen = deps.ref(false)
  const menuTarget = deps.ref<HTMLElement | undefined>(undefined)
  const lockedMenuContentStyle = deps.ref<Record<string, string> | undefined>(undefined)

  const isMenuPresentationLocked = deps.computed(() => lockedMenuContentStyle.value !== undefined)

  const menuOffset: [number, number] = [
    0,
    deps.FA_LOCALE_TRANSLATIONS_INPUT_MENU_OFFSET_Y_PX
  ]

  function syncMenuAnchorTarget (): void {
    const anchorElement = deps.resolveFaLocaleTranslationsMenuAnchorElement(
      options.readTriggerElement()
    )
    menuTarget.value = anchorElement ?? undefined
  }

  function lockMenuPresentation (): void {
    const anchorElement = menuTarget.value
    if (anchorElement === undefined) {
      lockedMenuContentStyle.value = undefined
      return
    }
    const presentation = deps.resolveFaLocaleTranslationsMenuPresentation({
      anchorRect: anchorElement.getBoundingClientRect(),
      maxHeightPx: deps.FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_HEIGHT_PX,
      maxWidthPx: deps.FA_LOCALE_TRANSLATIONS_INPUT_MENU_MAX_WIDTH_PX,
      minWidthPx: deps.FA_LOCALE_TRANSLATIONS_INPUT_MENU_MIN_WIDTH_PX,
      viewportHeightPx: window.innerHeight,
      viewportMarginPx: deps.FA_LOCALE_TRANSLATIONS_INPUT_MENU_VIEWPORT_MARGIN_PX,
      viewportWidthPx: window.innerWidth
    })
    lockedMenuContentStyle.value = deps.buildFaLocaleTranslationsMenuContentStyle(presentation)
  }

  function clearLockedMenuPresentation (): void {
    lockedMenuContentStyle.value = undefined
  }

  function openTranslationsMenu (): void {
    if (!translationsMenuOpen.value) {
      syncMenuAnchorTarget()
      lockMenuPresentation()
    }
    translationsMenuOpen.value = !translationsMenuOpen.value
  }

  function onTranslationsMenuBeforeShow (): void {
    syncMenuAnchorTarget()
    lockMenuPresentation()
  }

  function onTranslationsMenuHide (): void {
    clearLockedMenuPresentation()
  }

  function onTranslationsMenuShow (): void {
    deps.scheduleFaLocaleTranslationsMenuInputFocus({
      focusMenuInput: () => {
        const focusPreferredLanguageInput = options.readPreferredLanguageInputFocus()
        if (focusPreferredLanguageInput !== null) {
          focusPreferredLanguageInput()
        }
      },
      nextTick: deps.nextTick,
      requestAnimationFrame: options.requestAnimationFrame
    })
  }

  return {
    clearLockedMenuPresentation,
    isMenuPresentationLocked,
    lockMenuPresentation,
    lockedMenuContentStyle,
    menuOffset,
    menuTarget,
    onTranslationsMenuBeforeShow,
    onTranslationsMenuHide,
    onTranslationsMenuShow,
    openTranslationsMenu,
    syncMenuAnchorTarget,
    translationsMenuOpen
  }
}
