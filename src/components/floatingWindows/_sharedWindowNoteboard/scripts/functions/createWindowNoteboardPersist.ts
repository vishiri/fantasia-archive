import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { I_faProjectContentEpochPersistGuards } from 'app/types/I_faProjectContentEpochPersistGuards'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { Ref } from 'app/types/I_vueCompositionRefs'
import type { StoreGeneric } from 'app/types/I_vuePiniaInjected'

function definedProjectEpochGuards (deps: {
  isProjectReplacementInFlight: (() => boolean) | undefined
  readProjectContentEpoch: (() => number) | undefined
}): I_faProjectContentEpochPersistGuards {
  const guards: I_faProjectContentEpochPersistGuards = {}
  if (deps.isProjectReplacementInFlight !== undefined) {
    guards.isProjectReplacementInFlight = deps.isProjectReplacementInFlight
  }
  if (deps.readProjectContentEpoch !== undefined) {
    guards.readProjectContentEpoch = deps.readProjectContentEpoch
  }
  return guards
}

export function createWireWindowNoteboardDirectInput (deps: {
  directInputDialogName: T_dialogName
  getNoteboardStore: () => StoreGeneric
  onMounted: (hook: () => void) => void
  watch: (
    source: () => unknown,
    effect: () => void,
    options?: Record<string, unknown>
  ) => void
}): (props: { directInput?: T_dialogName | undefined }) => void {
  return function wireWindowNoteboardDirectInput (props: {
    directInput?: T_dialogName | undefined
  }): void {
    const store = deps.getNoteboardStore()

    function maybeOpenFromProp (): void {
      if (props.directInput === deps.directInputDialogName) {
        store.setWindowOpen(true)
      }
    }

    deps.watch(
      () => props.directInput,
      () => {
        maybeOpenFromProp()
      },
      { immediate: true }
    )

    deps.onMounted(() => {
      maybeOpenFromProp()
    })
  }
}

export function createWindowNoteboardFramePersist (deps: {
  getNoteboardStore: () => StoreGeneric
  isProjectReplacementInFlight: (() => boolean) | undefined
  persistFrameSilent: (frame: {
    height: number
    width: number
    x: number
    y: number
  }) => Promise<void>
  readProjectContentEpoch: (() => number) | undefined
  saveFailureActionId: T_faActionId
  useFaFloatingWindowFramePersist: (opts: {
    debounceMs?: number
    failureActionId: T_faActionId
    h: Ref<number>
    persistFrame: () => Promise<void>
    w: Ref<number>
    windowModel: Ref<boolean>
    x: Ref<number>
    y: Ref<number>
  } & I_faProjectContentEpochPersistGuards) => void
}): (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }) => void {
  return function useWindowNoteboardFramePersist (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }): void {
    const epochGuards = definedProjectEpochGuards(deps)
    deps.useFaFloatingWindowFramePersist({
      ...epochGuards,
      failureActionId: deps.saveFailureActionId,
      h: opts.h,
      persistFrame: async () => {
        await deps.persistFrameSilent({
          height: opts.h.value,
          width: opts.w.value,
          x: opts.x.value,
          y: opts.y.value
        })
      },
      w: opts.w,
      windowModel: opts.windowModel,
      x: opts.x,
      y: opts.y
    })
  }
}

export function createWindowNoteboardTextPersist (deps: {
  getNoteboardStore: () => StoreGeneric
  isProjectReplacementInFlight: (() => boolean) | undefined
  readProjectContentEpoch: (() => number) | undefined
  saveFailureActionId: T_faActionId
  useFaFloatingWindowTextPersist: (opts: {
    debounceMs?: number
    failureActionId: T_faActionId
    persistText: () => Promise<void>
    text: Ref<string>
    windowModel: Ref<boolean>
  } & I_faProjectContentEpochPersistGuards) => void
}): (opts: {
    text: Ref<string>
    windowModel: Ref<boolean>
  }) => void {
  return function useWindowNoteboardTextPersist (opts: {
    text: Ref<string>
    windowModel: Ref<boolean>
  }): void {
    const noteboard = deps.getNoteboardStore()

    const epochGuards = definedProjectEpochGuards(deps)
    deps.useFaFloatingWindowTextPersist({
      ...epochGuards,
      failureActionId: deps.saveFailureActionId,
      persistText: () => noteboard.persistCurrentTextSilent(),
      text: opts.text,
      windowModel: opts.windowModel
    })
  }
}
