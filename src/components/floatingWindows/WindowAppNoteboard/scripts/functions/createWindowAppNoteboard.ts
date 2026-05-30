/* eslint-disable max-lines-per-function -- monolithic create factory; decompose when extracting concerns */
import type { I_faKeybindsSnapshot, T_faKeybindCommandId } from 'app/types/I_faKeybindsDomain'
import type { T_faActionId } from 'app/types/I_faActionManagerDomain'
import type { T_useFaFloatingWindowFrameInjected } from 'app/types/I_useFaFloatingWindowFrameInjected'
import type { T_dialogName } from 'app/types/T_appDialogsAndDocuments'
import type { ComputedRef, Ref } from 'app/types/I_vueCompositionRefs'
import type { I_faWindowNoteboardComposable } from 'app/types/I_faWindowAppNoteboardComposable'
import type { StoreGeneric, T_piniaStoreToRefs } from 'app/types/I_vuePiniaInjected'

export function createWindowAppNoteboard (deps: {
  FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: Record<string, string | boolean>
  FA_FLOATING_WINDOW_POP_TRANSITION_MS: number
  computed: <T>(getter: () => T) => ComputedRef<T>
  formatFaKeybindCommandLabelFromSnapshot: (input: {
    commandId: T_faKeybindCommandId | undefined
    snapshot: I_faKeybindsSnapshot | null
  }) => string | null
  getFaAppNoteboardStore: () => StoreGeneric
  getFaKeybindsStore: () => { snapshot: I_faKeybindsSnapshot | null }
  onMounted: (hook: () => void) => void
  storeToRefs: T_piniaStoreToRefs
  useFaFloatingWindowFrame: T_useFaFloatingWindowFrameInjected
  useFaFloatingWindowFramePersist: (opts: {
    debounceMs?: number
    failureActionId: T_faActionId
    h: Ref<number>
    persistFrame: () => Promise<void>
    w: Ref<number>
    windowModel: Ref<boolean>
    x: Ref<number>
    y: Ref<number>
  }) => void
  useFaFloatingWindowTextPersist: (opts: {
    debounceMs?: number
    failureActionId: T_faActionId
    persistText: () => Promise<void>
    text: Ref<string>
    windowModel: Ref<boolean>
  }) => void
  watch: (
    source: () => unknown,
    effect: () => void,
    options?: Record<string, unknown>
  ) => void
}): {
    wireWindowAppNoteboardDirectInput: (props: { directInput?: T_dialogName }) => void
    useWindowAppNoteboardFramePersist: (opts: {
      h: Ref<number>
      windowModel: Ref<boolean>
      w: Ref<number>
      x: Ref<number>
      y: Ref<number>
    }) => void
    useWindowAppNoteboardTextPersist: (opts: {
      text: Ref<string>
      windowModel: Ref<boolean>
    }) => void
    useWindowAppNoteboard: (props: { directInput?: T_dialogName }) => I_faWindowNoteboardComposable
  } {
  function wireWindowAppNoteboardDirectInput (props: {
    directInput?: T_dialogName
  }): void {
    const store = deps.getFaAppNoteboardStore()

    function maybeOpenFromProp (): void {
      if (props.directInput === 'WindowAppNoteboard') {
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

  function useWindowAppNoteboardFramePersist (opts: {
    h: Ref<number>
    windowModel: Ref<boolean>
    w: Ref<number>
    x: Ref<number>
    y: Ref<number>
  }): void {
    const noteboard = deps.getFaAppNoteboardStore()

    deps.useFaFloatingWindowFramePersist({
      failureActionId: 'reportAppNoteboardSaveFailure',
      h: opts.h,
      persistFrame: async () => {
        await noteboard.persistNoteboardPartialSilent({
          frame: {
            height: opts.h.value,
            width: opts.w.value,
            x: opts.x.value,
            y: opts.y.value
          }
        })
      },
      w: opts.w,
      windowModel: opts.windowModel,
      x: opts.x,
      y: opts.y
    })
  }

  function useWindowAppNoteboardTextPersist (opts: {
    text: Ref<string>
    windowModel: Ref<boolean>
  }): void {
    const noteboard = deps.getFaAppNoteboardStore()

    deps.useFaFloatingWindowTextPersist({
      failureActionId: 'reportAppNoteboardSaveFailure',
      persistText: () => noteboard.persistCurrentTextSilent(),
      text: opts.text,
      windowModel: opts.windowModel
    })
  }

  function useWindowAppNoteboard (props: { directInput?: T_dialogName }) {
    const noteboardStore = deps.getFaAppNoteboardStore()
    const faKeybindsStore = deps.getFaKeybindsStore()

    const noteboardToggleKeybindLabel = deps.computed((): string | null => {
      return deps.formatFaKeybindCommandLabelFromSnapshot({
        commandId: 'toggleAppNoteboard',
        snapshot: faKeybindsStore.snapshot
      })
    })

    const {
      isWindowOpen: windowModel,
      root: noteboardRoot,
      text
    } = deps.storeToRefs(noteboardStore)

    const documentNameClass = 'WindowAppNoteboard'

    const persistedNoteboardFrame = deps.computed(() => noteboardRoot.value?.frame ?? null)

    const frame = deps.useFaFloatingWindowFrame(windowModel, undefined, {
      floatingWindowZLayer: 'noteboard',
      persistedFrame: persistedNoteboardFrame
    })

    useWindowAppNoteboardFramePersist({
      h: frame.h,
      w: frame.w,
      windowModel,
      x: frame.x,
      y: frame.y
    })

    useWindowAppNoteboardTextPersist({
      text,
      windowModel
    })

    wireWindowAppNoteboardDirectInput(props)

    const frameStyleWithDialogTransition = deps.computed((): Record<string, string> => ({
      ...(frame.frameStyle.value as Record<string, string>),
      '--q-transition-duration': `${deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS}ms`
    }))

    function onClose (): void {
      noteboardStore.setWindowOpen(false)
    }

    return {
      FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_BINDINGS,
      FA_FLOATING_WINDOW_POP_TRANSITION_MS: deps.FA_FLOATING_WINDOW_POP_TRANSITION_MS,
      documentNameClass,
      frameRef: frame.frameRef,
      frameStyleWithDialogTransition,
      h: frame.h,
      noteboardToggleKeybindLabel,
      onClose,
      onFramePointerDown: frame.onFramePointerDown,
      onResizePointerDown: frame.onResizePointerDown,
      onTitlePointerDown: frame.onTitlePointerDown,
      text,
      titleShortFrameClass: frame.titleShortFrameClass,
      w: frame.w,
      windowModel,
      x: frame.x,
      y: frame.y
    }
  }

  return {
    wireWindowAppNoteboardDirectInput,
    useWindowAppNoteboardFramePersist,
    useWindowAppNoteboardTextPersist,
    useWindowAppNoteboard
  }
}
