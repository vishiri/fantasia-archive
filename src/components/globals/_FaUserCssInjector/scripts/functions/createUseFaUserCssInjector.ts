export function createUseFaUserCssInjector (deps: {
  FA_USER_CSS_STYLE_ELEMENT_ID: string
  applyFaUserCssToStyleElementIfNeeded: (
    styleElement: HTMLStyleElement | null,
    css: string
  ) => void
  resolveFaUserCssInjectorEffectiveCssPayload: (
    cssLivePreview: string | null,
    css: string
  ) => string
  ensureFaUserCssStyleElementInHead: (
    hostDocument: Pick<Document, 'createElement' | 'getElementById'> & { head: HTMLElement } | undefined,
    elementId: string
  ) => HTMLStyleElement | null
  getAppStylingStore: () => {
    css: string
    cssLivePreview: string | null
  }
  onBeforeUnmount: (hook: () => void) => void
  onMounted: (hook: () => void) => void
  resolveFaUserCssInjectorHostDocument: (
    host: { readonly document?: Document | undefined }
  ) => Document | undefined
  watch: (
    sources: Array<() => unknown>,
    effect: () => void
  ) => void
}): () => void {
  return function useFaUserCssInjector (): void {
    const appStylingStore = deps.getAppStylingStore()
    let styleElement: HTMLStyleElement | null = null

    function effectiveUserCss (): string {
      return deps.resolveFaUserCssInjectorEffectiveCssPayload(
        appStylingStore.cssLivePreview,
        appStylingStore.css
      )
    }

    deps.onMounted(() => {
      styleElement = deps.ensureFaUserCssStyleElementInHead(
        deps.resolveFaUserCssInjectorHostDocument(globalThis),
        deps.FA_USER_CSS_STYLE_ELEMENT_ID
      )
      deps.applyFaUserCssToStyleElementIfNeeded(styleElement, effectiveUserCss())
    })

    deps.watch(
      [() => appStylingStore.cssLivePreview, () => appStylingStore.css],
      () => {
        deps.applyFaUserCssToStyleElementIfNeeded(styleElement, effectiveUserCss())
      }
    )

    deps.onBeforeUnmount(() => {
      if (styleElement !== null && styleElement.parentNode !== null) {
        styleElement.parentNode.removeChild(styleElement)
      }
      styleElement = null
    })
  }
}
