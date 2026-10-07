import type { I_ref } from 'app/types/I_vueCompositionShims'

import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectContentEpochPersistGuards } from 'app/types/I_faProjectContentEpochPersistGuards'
import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'

type T_faFloatingWindowFramePersistDeps = {
  ResultAsync: T_injectedResultAsync
  debounce: <T extends (...args: never[]) => void>(
    fn: T,
    wait: number
  ) => T & { cancel: () => void, flush: () => void }
  registerBeforeProjectReplacement: (flush: () => Promise<void>) => void
  runFaAction: (id: T_faActionId, payload: { message: string }) => void
  watch: (
    source: I_ref<number>[] | (() => boolean),
    effect: (open?: boolean, wasOpen?: boolean) => void,
    options?: { immediate?: boolean }
  ) => void
}

type T_faFloatingWindowFramePersistOpts = {
  debounceMs?: number | undefined
  failureActionId: T_faActionId
  h: I_ref<number>
  persistFrame: () => Promise<void>
  w: I_ref<number>
  windowModel: I_ref<boolean>
  x: I_ref<number>
  y: I_ref<number>
} & I_faProjectContentEpochPersistGuards

function floatingWindowFrameScheduledPersistSkipped (input: {
  epochAtSchedule: number | undefined
  ignoreReplacementFlight: boolean
  isProjectReplacementInFlight: (() => boolean) | undefined
  readProjectContentEpoch: (() => number) | undefined
}): boolean {
  if (!input.ignoreReplacementFlight && input.isProjectReplacementInFlight?.() === true) {
    return true
  }
  if (
    input.ignoreReplacementFlight ||
    input.epochAtSchedule === undefined ||
    input.readProjectContentEpoch === undefined
  ) {
    return false
  }
  return input.readProjectContentEpoch() !== input.epochAtSchedule
}

function bindFaFloatingWindowFramePersist (
  deps: T_faFloatingWindowFramePersistDeps,
  opts: T_faFloatingWindowFramePersistOpts
): void {
  const debounceMs = opts.debounceMs ?? 280
  let framePersistInFlight: Promise<void> | null = null
  let frameEpochAtSchedule: number | undefined

  async function runPersistFrame (): Promise<void> {
    const result = await deps.ResultAsync.fromPromise(
      opts.persistFrame(),
      (error): unknown => error
    )
    if (result.isErr()) {
      const error = result.error
      const message = error instanceof Error ? error.message : String(error)
      void deps.runFaAction(opts.failureActionId, { message })
    }
  }

  async function persistFrameNow (options?: {
    ignoreReplacementFlight?: boolean
  }): Promise<void> {
    const pendingPersist = framePersistInFlight
    if (pendingPersist !== null) {
      await pendingPersist
    }
    if (!opts.windowModel.value) {
      return
    }
    const ignoreReplacementFlight = options?.ignoreReplacementFlight === true
    const framePersistSkipped = floatingWindowFrameScheduledPersistSkipped({
      epochAtSchedule: frameEpochAtSchedule,
      ignoreReplacementFlight,
      isProjectReplacementInFlight: opts.isProjectReplacementInFlight,
      readProjectContentEpoch: opts.readProjectContentEpoch
    })
    if (framePersistSkipped) {
      return
    }
    const write = runPersistFrame()
    framePersistInFlight = write
    try {
      await write
    } finally {
      if (framePersistInFlight === write) {
        framePersistInFlight = null
      }
    }
  }

  const schedulePersist = deps.debounce(() => {
    void persistFrameNow()
  }, debounceMs)

  function scheduleFramePersist (): void {
    const readEpoch = opts.readProjectContentEpoch
    if (readEpoch !== undefined) {
      frameEpochAtSchedule = readEpoch()
    }
    schedulePersist()
  }

  deps.registerBeforeProjectReplacement(async () => {
    schedulePersist.cancel()
    await persistFrameNow({
      ignoreReplacementFlight: true
    })
  })

  deps.watch(
    [
      opts.x,
      opts.y,
      opts.w,
      opts.h
    ],
    () => {
      if (!opts.windowModel.value) {
        return
      }
      scheduleFramePersist()
    }
  )

  deps.watch(
    () => opts.windowModel.value,
    (open, wasOpen) => {
      if (!open && wasOpen) {
        schedulePersist.flush()
        void persistFrameNow()
      }
    },
    { immediate: true }
  )
}

export function createUseFaFloatingWindowFramePersist (
  deps: T_faFloatingWindowFramePersistDeps
): (opts: T_faFloatingWindowFramePersistOpts) => void {
  return function useFaFloatingWindowFramePersist (opts) {
    bindFaFloatingWindowFramePersist(deps, opts)
  }
}
