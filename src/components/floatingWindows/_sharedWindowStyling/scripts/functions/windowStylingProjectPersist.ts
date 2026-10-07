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

type T_windowProjectStylingCssPersistDeps = {
  ResultAsync: {
    fromPromise: <T, E>(
      promise: Promise<T>,
      onError: (error: unknown) => E
    ) => {
      match: <A>(ok: (value: T) => A, err: (error: E) => A) => A | Promise<A>
    }
  }
  createDebounced: <T extends (...args: never[]) => void>(
    fn: T,
    waitMs: number
  ) => T & { cancel: () => void, flush: () => void }
  getFaProjectStylingStore: () => I_faProjectStylingStylingWindowStore
  isProjectReplacementInFlight?: () => boolean
  readProjectContentEpoch?: () => number
  registerBeforeProjectReplacement: (flush: () => Promise<void>) => void
  runFaAction: <Id extends T_faActionId>(id: Id, payload: I_faActionPayloadMap[Id]) => void
  watch: T_vueWatch
}

function projectStylingCssScheduledPersistSkipped (input: {
  cssEpochAtSchedule: number | undefined
  ignoreReplacementFlight: boolean
  isProjectReplacementInFlight: (() => boolean) | undefined
  readProjectContentEpoch: (() => number) | undefined
}): boolean {
  if (!input.ignoreReplacementFlight && input.isProjectReplacementInFlight?.() === true) {
    return true
  }
  if (
    input.ignoreReplacementFlight ||
    input.cssEpochAtSchedule === undefined ||
    input.readProjectContentEpoch === undefined
  ) {
    return false
  }
  return input.readProjectContentEpoch() !== input.cssEpochAtSchedule
}

export function createWindowProjectStylingCssPersist (
  deps: T_windowProjectStylingCssPersistDeps
): (opts: { css: Ref<string>; windowModel: Ref<boolean> }) => void {
  return function useWindowProjectStylingCssPersist (opts: {
    css: Ref<string>
    windowModel: Ref<boolean>
  }): void {
    const styling = deps.getFaProjectStylingStore()
    let cssPersistInFlight: Promise<void> | null = null
    let cssEpochAtSchedule: number | undefined

    async function runPersistCss (): Promise<void> {
      const saved = await deps.ResultAsync.fromPromise(
        styling.persistProjectStylingPartialSilent({ css: opts.css.value }),
        (error: unknown) => error
      )
      const message = await saved.match(
        () => null,
        (error) => error instanceof Error ? error.message : String(error)
      )
      if (message !== null) {
        void deps.runFaAction('reportProjectStylingSaveFailure', { message })
      }
    }

    async function persistCssNow (options?: {
      ignoreReplacementFlight?: boolean
    }): Promise<void> {
      const pendingPersist = cssPersistInFlight
      if (pendingPersist !== null) {
        await pendingPersist
      }
      if (!opts.windowModel.value) {
        return
      }
      const ignoreReplacementFlight = options?.ignoreReplacementFlight === true
      const cssPersistSkipped = projectStylingCssScheduledPersistSkipped({
        cssEpochAtSchedule,
        ignoreReplacementFlight,
        isProjectReplacementInFlight: deps.isProjectReplacementInFlight,
        readProjectContentEpoch: deps.readProjectContentEpoch
      })
      if (cssPersistSkipped) {
        return
      }
      const write = runPersistCss()
      cssPersistInFlight = write
      try {
        await write
      } finally {
        if (cssPersistInFlight === write) {
          cssPersistInFlight = null
        }
      }
    }

    const schedulePersist = deps.createDebounced(() => {
      void persistCssNow()
    }, 380)

    function scheduleCssPersist (): void {
      const readEpoch = deps.readProjectContentEpoch
      if (readEpoch !== undefined) {
        cssEpochAtSchedule = readEpoch()
      }
      schedulePersist()
    }

    deps.registerBeforeProjectReplacement(async () => {
      schedulePersist.cancel()
      await persistCssNow({
        ignoreReplacementFlight: true
      })
    })

    deps.watch(
      opts.css,
      () => {
        if (!opts.windowModel.value) {
          return
        }
        scheduleCssPersist()
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
