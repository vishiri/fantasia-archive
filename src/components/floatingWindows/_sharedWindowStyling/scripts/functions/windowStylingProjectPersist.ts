import type { I_faActionPayloadMap, T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectStylingStylingWindowStore } from 'app/types/I_faStylingWindowStoreFacade'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { T_vueWatch } from 'app/types/I_vueWatchInjected'

export function createRefreshPersistedProjectStylingAndCloseWindow (deps: {
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
}): (windowModel: Ref<boolean>) => Promise<void> {
  return async function refreshPersistedProjectStylingAndCloseWindow (
    windowModel: Ref<boolean>
  ): Promise<void> {
    const st = deps.getFaProjectStylingStore()
    await st.refreshProjectStyling()
    st.clearCssLivePreview()
    windowModel.value = false
  }
}

export function createClearProjectStylingLivePreviewAndRefreshFromKv (deps: {
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
}): (windowModel: Ref<boolean>) => void {
  return function clearProjectStylingLivePreviewAndRefreshFromKv (windowModel: Ref<boolean>): void {
    const st = deps.getFaProjectStylingStore()
    if (!windowModel.value && st.cssLivePreview === null) {
      return
    }
    st.clearCssLivePreview()
    void st.refreshProjectStyling()
  }
}

export function createWindowProjectStylingCssPersist (deps: {
  createDebounced: <T extends (...args: never[]) => void>(
    fn: T,
    waitMs: number
  ) => T & { flush: () => void }
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  watch: T_vueWatch
}): (opts: { css: Ref<string>; windowModel: Ref<boolean> }) => void {
  return function useWindowProjectStylingCssPersist (opts: {
    css: Ref<string>
    windowModel: Ref<boolean>
  }): void {
    const styling = deps.getFaProjectStylingStore()

    async function persistCssNow (): Promise<void> {
      if (!opts.windowModel.value) {
        return
      }
      try {
        await styling.persistProjectStylingPartialSilent({ css: opts.css.value })
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        void deps.runFaAction('reportProjectStylingSaveFailure', { message })
      }
    }

    const schedulePersist = deps.createDebounced(() => {
      void persistCssNow()
    }, 380)

    deps.watch(
      opts.css,
      () => {
        if (!opts.windowModel.value) {
          return
        }
        schedulePersist()
      }
    )

    deps.watch(
      () => opts.windowModel.value,
      (open, wasOpen) => {
        if (open !== true && wasOpen === true) {
          schedulePersist.flush()
          void persistCssNow()
        }
      },
      { immediate: true }
    )
  }
}

export function createRegisterProjectStylingActiveProjectWatch (deps: {
  getFaActiveProjectStore: () => { activeProject?: { id?: string } | null }
  refreshPersistedProjectStylingAndCloseWindow: (windowModel: Ref<boolean>) => Promise<void>
  watch: T_vueWatch
}): (windowModel: Ref<boolean>) => void {
  return function registerProjectStylingActiveProjectWatch (windowModel: Ref<boolean>): void {
    deps.watch(
      () => deps.getFaActiveProjectStore().activeProject?.id ?? '',
      async (_nextId: string, prevId: string | undefined): Promise<void> => {
        if (!windowModel.value) {
          return
        }
        const hadPrior = typeof prevId === 'string' && prevId.length > 0
        const switchedAway = prevId !== _nextId
        if (hadPrior && switchedAway) {
          await deps.refreshPersistedProjectStylingAndCloseWindow(windowModel)
        }
      }
    )
  }
}
