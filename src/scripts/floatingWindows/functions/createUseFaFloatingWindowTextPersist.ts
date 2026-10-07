import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectContentEpochPersistGuards } from 'app/types/I_faProjectContentEpochPersistGuards'
import type { T_injectedResultAsync } from 'app/types/I_injectedNeverthrow'
import type { I_ref } from 'app/types/I_vueCompositionShims'

type T_faFloatingWindowTextPersistDeps = {
  ResultAsync: T_injectedResultAsync
  debounce: <T extends (...args: never[]) => void>(
    fn: T,
    wait: number
  ) => T & { cancel: () => void, flush: () => void }
  registerBeforeProjectReplacement: (flush: () => Promise<void>) => void
  runFaAction: (id: T_faActionId, payload: { message: string }) => void
  watch: (
    source: I_ref<string> | (() => boolean),
    effect: (open?: boolean, wasOpen?: boolean) => void,
    options?: { immediate?: boolean }
  ) => void
}

type T_faFloatingWindowTextPersistOpts = {
  debounceMs?: number | undefined
  failureActionId: T_faActionId
  persistText: () => Promise<void>
  text: I_ref<string>
  windowModel: I_ref<boolean>
} & I_faProjectContentEpochPersistGuards

function floatingWindowTextScheduledPersistSkipped (input: {
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

function bindFaFloatingWindowTextPersist (
  deps: T_faFloatingWindowTextPersistDeps,
  opts: T_faFloatingWindowTextPersistOpts
): void {
  const debounceMs = opts.debounceMs ?? 380
  let textPersistInFlight: Promise<void> | null = null
  let textEpochAtSchedule: number | undefined

  async function runPersistText (): Promise<void> {
    const result = await deps.ResultAsync.fromPromise(
      opts.persistText(),
      (error): unknown => error
    )
    if (result.isErr()) {
      const error = result.error
      const message = error instanceof Error ? error.message : String(error)
      void deps.runFaAction(opts.failureActionId, { message })
    }
  }

  async function persistTextNow (options?: {
    ignoreReplacementFlight?: boolean
  }): Promise<void> {
    const pendingPersist = textPersistInFlight
    if (pendingPersist !== null) {
      await pendingPersist
    }
    if (!opts.windowModel.value) {
      return
    }
    const ignoreReplacementFlight = options?.ignoreReplacementFlight === true
    const textPersistSkipped = floatingWindowTextScheduledPersistSkipped({
      epochAtSchedule: textEpochAtSchedule,
      ignoreReplacementFlight,
      isProjectReplacementInFlight: opts.isProjectReplacementInFlight,
      readProjectContentEpoch: opts.readProjectContentEpoch
    })
    if (textPersistSkipped) {
      return
    }
    const write = runPersistText()
    textPersistInFlight = write
    try {
      await write
    } finally {
      if (textPersistInFlight === write) {
        textPersistInFlight = null
      }
    }
  }

  const schedulePersist = deps.debounce(() => {
    void persistTextNow()
  }, debounceMs)

  function scheduleTextPersist (): void {
    const readEpoch = opts.readProjectContentEpoch
    if (readEpoch !== undefined) {
      textEpochAtSchedule = readEpoch()
    }
    schedulePersist()
  }

  deps.registerBeforeProjectReplacement(async () => {
    schedulePersist.cancel()
    await persistTextNow({
      ignoreReplacementFlight: true
    })
  })

  deps.watch(
    opts.text,
    () => {
      if (!opts.windowModel.value) {
        return
      }
      scheduleTextPersist()
    }
  )

  deps.watch(
    () => opts.windowModel.value,
    (open, wasOpen) => {
      if (!open && wasOpen) {
        schedulePersist.flush()
        void persistTextNow()
      }
    },
    { immediate: true }
  )
}

export function createUseFaFloatingWindowTextPersist (
  deps: T_faFloatingWindowTextPersistDeps
): (opts: T_faFloatingWindowTextPersistOpts) => void {
  return function useFaFloatingWindowTextPersist (opts) {
    bindFaFloatingWindowTextPersist(deps, opts)
  }
}
