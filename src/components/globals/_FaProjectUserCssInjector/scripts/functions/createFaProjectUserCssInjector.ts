export function createFaProjectUserCssInjector (deps: {
  ensureProjectUserCssStyleElementInHead: (hostDocument: Document) => HTMLStyleElement | null
  getProjectStylingStore: () => { css: string; cssLivePreview: string | null }
  onBeforeUnmount: (hook: () => void) => void
  onMounted: (hook: () => void) => void
  resolveFaUserCssInjectorEffectiveCssPayload: (
    cssLivePreview: string | null,
    css: string
  ) => string
  resolveFaUserCssInjectorHostDocument: (
    host: { readonly document?: Document | undefined }
  ) => Document | undefined
  watch: (
    sources: Array<() => unknown>,
    effect: () => void
  ) => void
}): () => void {
  return function useFaProjectUserCssInjector (): void {
    const projectStylingStore = deps.getProjectStylingStore()
    let managedStyleEl: HTMLStyleElement | null = null

    function effectiveProjectCss (): string {
      return deps.resolveFaUserCssInjectorEffectiveCssPayload(
        projectStylingStore.cssLivePreview,
        projectStylingStore.css
      )
    }

    function syncProjectCssStyle (): void {
      const hostDocument = deps.resolveFaUserCssInjectorHostDocument(globalThis)
      if (hostDocument === undefined) {
        return
      }
      const payload = effectiveProjectCss()
      const payloadEmptyTrimmed = payload.trim().length === 0

      if (payloadEmptyTrimmed === true && managedStyleEl !== null) {
        const detachParent = managedStyleEl.parentNode
        if (detachParent !== null) {
          detachParent.removeChild(managedStyleEl)
        }
        managedStyleEl = null
      }

      const shouldEnsureAndWriteCss = payloadEmptyTrimmed !== true

      if (!shouldEnsureAndWriteCss) {
        return
      }

      const ensuredEl = deps.ensureProjectUserCssStyleElementInHead(hostDocument)

      const ensuredMissing = ensuredEl === null
      if (ensuredMissing) {
        return
      }

      managedStyleEl = ensuredEl

      if (managedStyleEl.textContent !== payload) {
        managedStyleEl.textContent = payload
      }
    }

    deps.onMounted(() => {
      syncProjectCssStyle()
    })

    deps.watch(
      [() => projectStylingStore.cssLivePreview, () => projectStylingStore.css],
      () => {
        syncProjectCssStyle()
      }
    )

    deps.onBeforeUnmount(() => {
      if (managedStyleEl !== null && managedStyleEl.parentNode !== null) {
        managedStyleEl.parentNode.removeChild(managedStyleEl)
      }
      managedStyleEl = null
    })
  }
}
